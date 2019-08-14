/**
 * Dealer Iventory Service consists methods such as: get inventory details
 * to get accessories available and vehicles, variants etc,. stocks left and to
 * update the stock
 */

// import dependencies
const lodash = require('lodash');

// import files
const loopback = require('../server.js');
const BaseService = require('../services/base_service');
const InstabikeError = require('../error/instabike_error');
const ErrorConstants = require('../utils/constants/error_constants');

const app = loopback.dataSources.postgres.models;

/**
 * @author Jagajeevan
 */
module.exports = class DealerInventoryService extends BaseService {
  constructor(dealerId) {
    super();
    this.dealerId = dealerId;
  }

  /**
   * To get the inventory details based on the dealer id.
   *
   * @param  {function} callback  callback
   * @param  {object}   dealerManagerUser   current user data
   * @return {object} custom dealer inventory object
   * @author Jagajeevan
   */
  async getInventoryDetails(dealerManagerUser, callback) {
    try {
      const dealerObj = await app.Dealer.findById(this.dealerId, {
        fields: ['id', 'manufacturer_id'],
      });
      if (!dealerObj) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.DEALER.NOT_FOUND));
      }
      if (dealerObj.id !== dealerManagerUser.user_type_id) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.USER.TRY_AGAIN));
      }
      const params = [
        this.dealerId,
        dealerObj.manufacturer_id,
      ];
      const query = `SELECT v.id, v.name, var.id as variant_id, var.name as variant_name,
        inventory.stock_available, dv.incentive_amount, dv.offer, dv.test_ride_vehicle,
        dv.slots_per_vechile, vp.price, v.image_url FROM vehicles AS v
        LEFT JOIN (select id, name, vehicle_id FROM variants ) AS var ON var.vehicle_id = v.id
        LEFT JOIN (select variant_id, SUM(stock_available) AS stock_available FROM dealer_inventories
        WHERE dealer_id = $1 GROUP BY variant_id) AS inventory ON inventory.variant_id = var.id
        LEFT JOIN (SELECT vehicle_id, incentive_amount, offer, test_ride_vehicle, slots_per_vechile
        FROM dealer_vehicles WHERE dealer_id = $1) AS dv ON dv.vehicle_id = v.id
        LEFT JOIN (select variant_id, MIN(onroad_price) AS price FROM vehicle_prices
        WHERE dealer_id = $1 GROUP BY variant_id) AS vp ON vp.variant_id = var.id
        where manufacturer_id = $2 order by v.name asc`;
      loopback.dataSources.postgres.connector.query(query, params, null, (err, resultObjects) => {
        if (err) return callback(new InstabikeError(err));
        return callback(null, resultObjects);
      });
      return null;
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * To get the inventory details based on the dealer id.
   * @param  {string}   vehicleId  id of the vehicle
   * @param  {object}   dealerManagerUser  object of the currentUser
   * @param  {function} callback  callback
   * @return {object} custom object containing the vehicle and dealer vehicle
   * @author Jagajeevan
   */
  async getVehicleInventoryDetails(vehicleId, dealerManagerUser, callback) {
    try {
      if (this.dealerId !== dealerManagerUser.user_type_id) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.USER.TRY_AGAIN));
      }
      const incentiveOffer = await app.Vehicle.find({
        include: {
          relation: 'dealer_vehicles',
          scope: {
            where: { dealer_id: this.dealerId },
          },
        },
        where: { id: vehicleId },
      });
      return callback(null, incentiveOffer);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * Get the vehicle stocks by variant, dealer and vehicle id.
   *
   * @param {string} variantId                         variant id
   * @param {Function} callback                        callback
   * @author Ajaykkumar Rajendran
   */
  async getStocks(variantId, callback) {
    try {
      const dealerInventoryObj = await app.VariantColour.find({
        include: {
          relation: 'dealer_inventories',
          scope: {
            where: { dealer_id: this.dealerId },
          },
        },
        fields: ['id', 'vehicle_id', 'color'],
        where: { variant_id: variantId },
      });
      return callback(null, dealerInventoryObj);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * Update the vehicle stocks by variant, dealer and vehicle id.
   *
   * @param {string} data                              data
   * @param {Function} callback                        callback
   * @author Ajaykkumar Rajendran
   */
  async updateStocks(data, callback) {
    this.data = data;
    try {
      const dealerInventories = [];
      await Promise.all(this.data.map(async (stock) => {
        const dealerInventory = await app.DealerInventory.upsertWithWhere({
          vehicle_id: stock.vehicle_id,
          variant_id: stock.variant_id,
          variant_colours_id: stock.variant_colours_id,
          dealer_id: stock.dealer_id,
        }, stock);
        dealerInventories.push(dealerInventory);
      }));
      return callback(null, dealerInventories);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * To get the inventory details based on the dealer id.
   * @param  {object}   dealerManagerUser  object of the currentUser
   * @param  {string}   vehicleId  id of the vehicle
   * @param  {string}   variantId  id of the variant
   * @param  {function} callback  callback
   * @return {object} custom object containing the vehicle and dealer vehicle
   * @author Jagajeevan
   */
  async getVariantInventoryDetail(dealerManagerUser, vehicleId, variantId, callback) {
    try {
      if (this.dealerId !== dealerManagerUser.user_type_id) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.USER.TRY_AGAIN));
      }
      const variantInventoryDetail = await app.Vehicle.findOne({
        include: [{
          relation: 'dealerInventory',
          scope: {
            fields: ['id', 'stock_available'],
            where: { dealer_id: this.dealerId, variant_id: variantId },
          },
        },
        {
          relation: 'prices',
          scope: {
            fields: ['onroad_price'],
            where: { dealer_id: this.dealerId, variant_id: variantId },
          },
        }],
        fields: ['id'],
        where: { id: vehicleId },
      });
      const variantInventoryDetailObj = variantInventoryDetail.toJSON();
      const inventoryData = variantInventoryDetailObj.dealerInventory;
      const totalCount = lodash.sumBy(inventoryData, (variantObj) => {
        const totalStock = variantObj.stock_available;
        return totalStock;
      });
      variantInventoryDetailObj.dealerInventory = { stock_available: totalCount };
      return callback(null, variantInventoryDetailObj);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }
};
