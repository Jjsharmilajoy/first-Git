const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
const factory = require('../factory.js');
const TestRideService = require('../../server/services/test_ride_service.js');
const ErrorConstants = require('../../server/utils/constants/error_constants');

describe('TestRideService', () => {
  describe('getTestRideVehicles', () => {
    it('1.get list of test ride vechicles based on dealerId', async() => {
      const manufacture = await factory.create('Manufacturer');
      const dealer = await factory.create('Dealer');
      const vehicle = await factory.create('Vehicle');
      const testRideVehicles = await factory.create('TestRideVehicle', { dealer_id: dealer.id, vehicle_id: vehicle.id });
      const testRideService = new TestRideService(dealer.id);
      testRideService.getVehicles((err,result) => {
        assert.equal(result[0].id, vehicle.id,'Test ride vehicles found');
      });
    });
    it('2.No test ride vehicles found based on dealerId', async() => {
      const manufacture = await factory.create('Manufacturer');
      const dealer = await factory.create('Dealer');
      const testRideVehicles = await factory.create('TestRideVehicle', {dealer_id:dealer.id});
      const testRideService = new TestRideService(dealer.id);
      testRideService.getVehicles((err,result) => {
        assert.equal(result.length, 0, 'No test ride vehicles found');
      });
    });
  });
})
