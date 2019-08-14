'use strict';

const FilterUtils = require('../../server/utils/filter_utils.js');
const chai = require('chai');
const assert = chai.assert;
const factory = require('../factory.js');

describe('FilterUtils', () => {
  describe('validateZoneIdIsPresent', () => {
    it('retuns zone id as object if zone id is present', async() => {
      const zone = await factory.create('Zone');
      const searchFilter = {zone_id: zone.id};
      FilterUtils.validateZoneId(searchFilter, (err, returnData) => {
        assert.equal(returnData.length, 1, 'Zone id present');
        done();
      });
    });

    it('retuns null if zone id is not present', () => {
      const searchFilter = {};
      FilterUtils.validateZoneId(searchFilter, (err, returnData) => {
        assert.equal(returnData, null, 'Zone id not present');
        done();
      });
    });
  });

  describe('validateStateIdIsPresent', () => {
    it('retuns state id as object if zone id and state id is present', async() => {
      const zone = await factory.create('Zone');
      const state = await factory.create('State');
      const searchFilter = {zone_id: zone.id, state_id: state.id};
      FilterUtils.validateZoneId(searchFilter, (err, returnData) => {
        assert.equal(returnData.length, 1, 'State id present');
        done();
      });
    });

    it('retuns null if zone id is not present (although state id is available)', async() => {
      const state = await factory.create('State');
      const searchFilter = {state_id: state.id};
      FilterUtils.validateZoneId(searchFilter, (err, returnData) => {
        assert.equal(returnData, null, 'Zone id not present');
        done();
      });
    });
  });

  describe('validateCityIdIsPresent', () => {
    it('retuns city id as object if state id and city id is present', async() => {
      const state = await factory.create('State');
      const city = await factory.create('City');
      const searchFilter = {state_id: state.id, city_id: city.id};
      FilterUtils.validateZoneId(searchFilter, (err, returnData) => {
        assert.equal(returnData.length, 1, 'City id present');
        done();
      });
    });

    it('retuns null if state id is not present (although city id is available)', async() => {
      const city = await factory.create('City');
      const searchFilter = {city_id: city.id};
      FilterUtils.validateZoneId(searchFilter, (err, returnData) => {
        assert.equal(returnData, null, 'State id not present');
        done();
      });
    });
  });

});
