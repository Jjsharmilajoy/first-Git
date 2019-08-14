/**
 * Target service: this service handles methods such as update target acheived count on
 * successful convertion of a lead.
 */

// import statements
const BaseService = require('../services/base_service');
const loopback = require('../server.js');
const InstabikeError = require('../error/instabike_error');
const DateUtils = require('../utils/date_utils');
const StringUtils = require('../utils/string_utils');

const app = loopback.dataSources.postgres.models;
const postgresDs = loopback.dataSources.postgres;

/**
 * @author Jaiyashree Subramanian
 */
module.exports = class CustomerService extends BaseService {
  constructor(manufacturerId, dealerId, dealerSalesId, vehicleId, assignedTo) {
    super();
    this.manufacturerId = manufacturerId;
    this.dealerId = dealerId;
    this.dealerSalesId = dealerSalesId;
    this.vehicleId = vehicleId;
    this.assignedTo = assignedTo;
  }

  /**
   * Increases the target acheieved counts for the manufacturer and
   * the dealer-sales.
   * @param  {Function} callback
   * @author Jaiyashree Subramanian
   */
  updateTargetAchieved(salesExecutive) {
    return new Promise(async (resolve, reject) => {
      try {
        const dateFilter = DateUtils.getCurrentMonthDates(new Date());
        const dealerUserIds = await this.getDealerReportingIds(this.dealerSalesId, this.dealerId, 'Dealer');
        if (!dealerUserIds.length) {
          resolve();
        }
        const vehicle = await app.Vehicle.findById(this.vehicleId);
        let params = [vehicle.type, this.manufacturerId, dateFilter.from_date, dateFilter.to_date,
          this.dealerId, salesExecutive];
        const updateDealerTargetQuery = `UPDATE dealer_targets set achieved_value = achieved_value
          + 1 WHERE manufacturer_id = $2 AND vehicle_type = $1
          AND from_date::date = $3::date AND to_date::date = $4::date
          AND dealer_id = $5 AND dealer_sales_id = $6`;
        postgresDs.connector.query(updateDealerTargetQuery, params, async (err) => {
          if (err) throw (new InstabikeError(err));
        });
        params = [vehicle.type, this.manufacturerId, dateFilter.from_date, dateFilter.to_date,
          this.dealerId];
        const updateManufacturerTargetQuery = `UPDATE manufacturer_targets set total_count = total_count + 1,
          month_target_count = month_target_count + 1 WHERE manufacturer_id = $2 AND vehicle_type = $1
          AND target_from_date::date = $3::date AND target_to_date::date = $4::date
          AND dealer_id = $5`;
        postgresDs.connector.query(updateManufacturerTargetQuery, params, (err) => {
          if (err) throw (new InstabikeError(err));
        });
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Increases the target acheieved counts for the new sales memeber and
   * reduce the count for the existing sales member.
   *
   * @param {String} newDealerSalesId
   * @param {Object} dateFilter
   * @param  {Function} callback
   * @author Ajaykkumar Rajendran
   */
  updateTargetAchievedForNewSales(newDealerSalesId, dateFilter) {
    return new Promise(async (resolve, reject) => {
      try {
        const vehicle = await app.Vehicle.findById(this.vehicleId);
        const dealerUserIdsForExistingSales =
          await this.getDealerReportingIds(this.dealerSalesId, this.dealerId, 'Dealer');
        let params = [
          vehicle.type,
          this.manufacturerId,
          dateFilter.from_date,
          dateFilter.to_date,
          this.dealerId,
        ];
        let builder = StringUtils.generateInClause(6, dealerUserIdsForExistingSales);
        params = params.concat(dealerUserIdsForExistingSales);
        const updateDealerTargetForExistingSalesQuery = `UPDATE dealer_targets set achieved_value = achieved_value
          - 1 WHERE manufacturer_id = $2 AND vehicle_type = $1
          AND from_date::date = $3 AND to_date::date = $4
          AND dealer_id = $5 AND dealer_sales_id IN (${builder})`;
        postgresDs.connector.query(updateDealerTargetForExistingSalesQuery, params, (err) => {
          if (err) throw (new InstabikeError(err));
        });
        params = [
          vehicle.type,
          this.manufacturerId,
          dateFilter.from_date,
          dateFilter.to_date,
          this.dealerId,
        ];
        const dealerUserIdsForNewSales =
            await this.getDealerReportingIds(newDealerSalesId, this.dealerId, 'Dealer');
        builder = StringUtils.generateInClause(6, dealerUserIdsForNewSales);
        params = params.concat(dealerUserIdsForNewSales);
        const updateDealerTargetForNewSalesQuery = `UPDATE dealer_targets set achieved_value = achieved_value
          + 1 WHERE manufacturer_id = $2 AND vehicle_type = $1
          AND from_date::date = $3 AND to_date::date = $4
          AND dealer_id = $5 AND dealer_sales_id IN (${builder})`;
        postgresDs.connector.query(updateDealerTargetForNewSalesQuery, params, (err) => {
          if (err) throw (new InstabikeError(err));
        });
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }
};
