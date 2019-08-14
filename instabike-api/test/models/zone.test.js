const app = require('../../server/server.js');
const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
const factory = require('../factory.js');
const faker = require('faker/locale/en_IND');

describe('Zone', () => {
  let manufacturer = {};
  let zone = {};
  let state = {};
  let city = {};

  describe('GET /api/Zones', () => {
    it('Get Zones', async () => {
      manufacturer = await factory.create('Manufacturer');
      zone = await factory.create('Zone', { manufacturer_id: manufacturer.id });
      request(app)
        .get('/api/Zones')
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          expect(res.body.length).to.not.equal(0);
        });
    });
  });

  describe('GET /api/Zones/{zone_id}/states', () => {
    it('Get States by Zone ID', async () => {
        state = await factory.create('State', { zone_id: zone.id, country_id: zone.country_id });
        request(app)
          .get('/api/Zones/' + zone.id + '/states')
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            expect(res.body.length).to.equal(1);
          });
    });
  });

  describe('POST /api/Zones/states', () => {
    it('Get States by List of Zone IDs', async () => {
        const filter = {zoneIds: [zone.id], countryId: zone.country_id};
        request(app)
          .post('/api/Zones/states')
          .send(filter)
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            expect(res.body.length).to.equal(1);
          });
    });
  });

  describe('POST /api/Zones/cities', () => {
    it('Get Cities by List of Zone IDs and State IDs', async () => {
        city = await factory.create('City', { zone_id: zone.id, state_id: state.id,
          country_id: zone.country_id });
        const filter = { zoneIds: [zone.id], stateIds: [state.id], countryId: zone.country_id };
        request(app)
          .post('/api/Zones/cities')
          .send(filter)
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            expect(res.body.length).to.equal(1);
          });
    });
  });

});
