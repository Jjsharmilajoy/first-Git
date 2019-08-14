const loopback = require('../../server/server.js');
const app = require('../../server/server.js');
const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const should = chai.should();
const factory = require('../factory.js');
const faker = require('faker/locale/en_IND');

const model = loopback.dataSources.postgres.models;

describe('Vehicle', () => {
  let manufacturer = {};
  let dealer = {};
  let user = {};
  let accessToken = {};

  before(async () => {
    manufacturer = await factory.create('Manufacturer');
    dealer = await factory.create('Dealer', { manufacturer_id: manufacturer.id });
    user = await factory.create('User', { user_type_id: dealer.id });
    accessToken = await factory.create('AccessToken', { userId: user.id });
    const role = await model.Roles.findOne({ where: { name: 'DEALER_SALES' } });
    const userRole = await factory.create('UserRole', {
      user_id: accessToken.userId,
      principalId: accessToken.userId,
      role_id: role.id,
    });
    return accessToken;
  });

  describe('GET /api/Vehicles/{vehicleId}/variants/{variantId}/dealer/{dealerId}/price', () => {
    it('Get vehicle price', async () => {
      let vehiclePrice = await factory.create('VehiclePrice');
      request(app)
        .get('/api/Vehicles/'+vehiclePrice.vehicle_id+'/variants/'+vehiclePrice.variant_id+'/dealer/'+vehiclePrice.dealer_id+'/price')
        .set('Content-Type', 'application/json')
        .set('Authorization', accessToken.id)
        .expect(200)
        .end((err, res) => {
          expect(res.body.ex_showroom_price).to.not.equal('0');
        });
    });
  });

  describe('POST /api/Vehicles/similarVehicles', () => {
    it('Get similar vehicles', async () => {
      const vehicle1 = await factory.create('Vehicle', { manufacturer_id: manufacturer.id, dealer_id: dealer.id });
      const vehicle2 = await factory.create('Vehicle', { manufacturer_id: manufacturer.id, dealer_id: dealer.id });
      const vehicleIds = [vehicle1.id];
      request(app)
        .post('/api/Vehicles/similarVehicles')
        .set('Accept', 'application/json')
        .set('Authorization', accessToken.id)
        .send(vehicleIds)
        .expect(200)
        .end((err, res) => {
          expect(res.body).length.should.not.equal(0);
        });
    });
  });

  describe('get /api/Vehicles/{vehicleId}/threeSixtyDegree', () => {
    it('Get threeSixtyDegree', async () => {
      const vehicle = await factory.create('Vehicle');
      const variant = await factory.create('Variant', { id: vehicle.id});
      const variantColors = await factory.create('VariantColor', { vehicle_id: vehicle.id, variant_id: variant.id });
      const vehicleGallery = await factory.createMany('VehicleGallery', 15, {is_three_sixty: true, vehicle_id: vehicle.id, variant_id: variant.id, variant_colour_id: variantColors.id});

      request(app)
        .get('/api/Vehicles/' + vehicle.id + '/threeSixtyDegree')
        .set('Accept', 'application/json')
        .set('Authorization', accessToken.id)
        .expect(200)
        .end((err, res) => {
          expect(res.body).length.not.equal(0);
        });
    });
  })

  describe('get /api/Vehicles/{vehicleId}/detail', () => {
    it('Get vehicle detail', async () => {
      const dealer = await factory.create('Dealer');
      const vehicle = await factory.create('Vehicle', { dealer_id: dealer.id });
      const managerUser = await factory.create('User', { user_type_id: dealer.id });
      const managerRole = await factory.create('Role', { name: 'DEALER_MANAGER' });
      const managerUserRole = await factory.create('UserRole', { user_id: managerUser.id, role_id: managerRole.id });

      request(app)
        .get('/api/Vehicles/' + vehicle.id + '/detail')
        .set('Accept', 'application/json')
        .set('Authorization', accessToken.id)
        .expect(200)
        .end((err, res) => {
          expect(res.body.id).equal(vehicle.id);
        });
    });
  })

  describe('POST /api/Vehicles/manufacturer/{manufacturerId}/dealer/{dealerId}/searchVehicle', () => {
    it('Get vehicle by search', async () => {
      const manufacturer = await factory.create('Manufacturer');
      const vehicle = await factory.create('Vehicle', {manufacturer_id: manufacturer.id, type: 1});
      const variant = await factory.create('Variant', {vehicle_id: vehicle.id});
      const vehicleColor = await factory.create('VehiclePrice', {vehicle_id: vehicle.id, variant_id: variant.id});
      const dealer = await factory.create('Dealer', {manufacturer_id: manufacturer.id});
      const managerUser = await factory.create('User', { user_type_id: dealer.id });
      const managerRole = await factory.create('Role', { name: 'DEALER_MANAGER' });
      const managerUserRole = await factory.create('UserRole', { user_id: managerUser.id, role_id: managerRole.id });
      const dealerInventory = await factory.create('DealerInventory', {vehicle_id: vehicle.id, dealer_id: dealer.id});
      const dealerVehicle = await factory.create('DealerVehicle', {vehicle_id: vehicle.id, dealer_id: dealer.id});
      const searchOption = {"type": "1"};
      request(app)
        .post('/api/Vehicles/manufacturer/'+manufacturer.id+'/dealer/'+dealer.id+'/searchVehicle')
        .set('Accept', 'application/json')
        .set('Authorization', accessToken.id)
        .expect(200)
        .end((err, res) => {
          expect(res.body.length).not.equal(0);
        });
    });
  })
});
