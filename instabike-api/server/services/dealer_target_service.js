/**
 * Dealer target Service consists methods such as: get target details,
 * get target names, get target completion graph data, and update the dealer-target
 */

// import files
const loopback = require('../server.js');
const BaseService = require('../services/base_service');
const DealerTargetQueries = require('../utils/constants/dealer_target_queries');
const InstabikeError = require('../error/instabike_error');
const DateUtils = require('../utils/date_utils');
const StringUtils = require('../utils/string_utils');

const ds = loopback.dataSources.postgres;
const app = loopback.dataSources.postgres.models;

/**
 * @author Ramanavel Selvaraju
 */
module.exports = class DealerTargetService extends BaseService {
  constructor(dealerId, currentUser) {
    super(currentUser);
    this.dealerId = dealerId;
    this.registerChild(this);
  }

  async getTargetDetails(dateParams, callback) {
    try {
      const dealerUserIds = await this.getDealerUserIds();
      if (!dealerUserIds.length) {
        return callback();
      }
      const dates = DateUtils.getCurrentMonthDates(new Date());
      let params = [
        dates.from_date,
        dates.to_date,
        this.dealerId,
      ];
      params = params.concat(dealerUserIds);
      const builder = StringUtils.generateInClause(4, dealerUserIds);
      const queryParams = {
        dealerUserIds: builder,
      };
      const query = DealerTargetQueries.targetDetail(queryParams);
      return ds.connector.query(query, params, callback);
    } catch (e) {
      return callback(e);
    }
  }

  /**
   * To get dealer targets based on dealer id.
   *
   * @param  {Function} callback                    callback
   * @return {Function} callback                    callback
   * @author Ajaykkumar Rajendran
   */
  async getNames(callback) {
    try {
      const date = DateUtils.getPreviousYearDates(new Date());
      const params = [
        this.dealerId,
        date.from_date,
        date.to_date,
      ];
      const query = `select distinct(target_name), target_from_date, target_to_date from
        manufacturer_targets where dealer_id = $1 and target_from_date::date >= $2 and
        target_to_date::date <= $3 order by target_from_date desc`;
      const dealerTargets = await new Promise((resolve, reject) => {
        ds.connector.query(query, params, (err, dealerTarget) => {
          if (err) reject(new InstabikeError(err));
          resolve(dealerTarget);
        });
      });
      return callback(null, dealerTargets);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * To get dealer targets completion and average based on dealer id.
   *
   * @param  {Function} callback                    callback
   * @return {Function} callback                    callback
   * @author Ajaykkumar Rajendran
   */
  async getTargetCompletion(callback) {
    try {
      const dealerUserIds = await this.getDealerUserIds('Target');
      if (!dealerUserIds.length) {
        return callback();
      }
      if (dealerUserIds.length !== 0) {
        const currentMonth = DateUtils.getCurrentMonthDates(new Date());
        const lastMonth = DateUtils.getLastMonthDates(new Date());
        let params = [
          this.dealerId,
          new Date(currentMonth.from_date).toISOString(),
          new Date(currentMonth.to_date).toISOString(),
          lastMonth.from_date,
          lastMonth.to_date,
        ];
        params = params.concat(dealerUserIds);
        const builder = StringUtils.generateInClause(6, dealerUserIds);
        const queryParams = {
          dealerUserIds: builder,
        };
        const query = DealerTargetQueries.targetCompletion(queryParams);
        const targets = await new Promise((resolve, reject) => {
          ds.connector.query(query, params, (err, dealerTarget) => {
            if (err) reject(new InstabikeError(err));
            resolve(dealerTarget);
          });
        });
        return callback(null, targets);
      }
      return callback();
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * To update dealer member's target based on the id.
   *
   * @param {String} dealerSalesId                  dealer sales id
   * @param {Array} data                            data to updated
   * @param  {Function} callback                    callback
   * @return {Function} callback                    callback
   * @author Ajaykkumar Rajendran
   */
  async updateDealerTarget(dealerSalesId, data, callback) {
    this.data = data;
    try {
      let dealerTarget;
      const dealer = await app.Dealer.findOne({
        where: { id: this.dealerId },
      });
      await Promise.all(this.data.map(async (target) => {
        dealerTarget = await app.DealerTarget.upsertWithWhere({
          and: [
            { from_date: target.fromDate },
            { to_date: target.toDate },
            { dealer_sales_id: dealerSalesId },
            { vehicle_type: target.type },
            { manufacturer_id: dealer.manufacturer_id },
          ],
        }, {
          name: target.name,
          from_date: target.fromDate,
          to_date: target.toDate,
          dealer_sales_id: dealerSalesId,
          vehicle_type: target.type,
          dealer_id: this.dealerId,
          target_value: target.value,
          manufacturer_id: dealer.manufacturer_id,
        });
      }));
      return callback(null, dealerTarget);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }
};
