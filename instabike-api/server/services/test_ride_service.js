/**
 * Test-ride service: this service handles methods such as get all vehicles available
 * for a test-ride
 */

// import statements
const loopback = require('../server.js');
const BaseService = require('../services/base_service');
const InstabikeError = require('../error/instabike_error');
const ErrorConstants = require('../utils/constants/error_constants');

const app = loopback.dataSources.postgres.models;

/**
 * @author shahul hameed b
 */
module.exports = class TestRideService extends BaseService {
  constructor(dealerId) {
    super();
    this.dealerId = dealerId;
  }
  /**
      * Get the list of vehicle  based on the
      * vehicle id available from test ride vehicles.
      * @param  {function} callback
      * @return {function} list of vehicle
      * @author shahul hameed b
      */
  async getVehicles(callback) {
    try {
      const dealer = await app.Dealer.findOne({ where: { id: this.dealerId } });
      if (!dealer || !dealer.is_active) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.DEALER.NOT_FOUND));
      }
      const testRideVehicles = await app.TestRideVehicle.find({
        where: {
          dealer_id: this.dealerId,
        },
        include: {
          relation: 'vehicle',
        },
      });
      const vehicles = [];
      await testRideVehicles.forEach((testRideVehicle) => {
        const vehicleObj = testRideVehicle.toJSON().vehicle;
        if (vehicleObj) { vehicles.push(vehicleObj); }
      });
      return callback(null, vehicles);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }
};
