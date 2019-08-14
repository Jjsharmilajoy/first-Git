const loopback = require('../../server/server.js');
const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
const factory = require('../factory.js');
const faker = require('faker/locale/en_IND');

const app = loopback.dataSources.postgres.models;

describe('DealerInventory', () => {
  let accessToken = {};

  before(async () => {
    const manufacturer = await factory.create('Manufacturer');
    const dealer = await factory.create('Dealer', { manufacturer_id: manufacturer.id });
    const user = await factory.create('User', { user_type_id: dealer.id });
    accessToken = await factory.create('AccessToken', { userId: user.id });
    const role = await app.Roles.findOne({ where: { name: 'DEALER_MANAGER' } });
    const userRole = await factory.create('UserRole', {
      user_id: accessToken.userId,
      principalId: accessToken.userId,
      role_id: role.id,
    });
    return accessToken;
  });

  describe('GET /api/DealerInventories/variants/{variantId}/dealer/{dealerId}/getStocks', () => {
    it('Get vehicle stocks', async () => {
      const variant = await factory.create('Variant');
      const dealer =  await factory.create('Dealer');
      const variantColor = await factory.create('VariantColor', { variant_id: variant.id, dealer_id: dealer.id });
      const dealerInventory = await factory.create('DealerInventory', { variant_colours_id: variantColor.id, variant_id: variant.id, dealer_id: dealer.id });
      request(loopback)
        .get('/api/DealerInventories/variants/'+ dealerInventory.variant_id+ '/dealer/'+ dealerInventory.dealer_id+'/getStocks')
        .set('Authorization', accessToken.id)
        .set('Content-Type', 'application/json')
        .expect(200)
        .end((err, res) => {
          expect(res.body[0].id).to.equal(variantColor.id);
        });
    });
  });

  describe('GET /api/DealerInventories/dealer/:dealerId/vehicle/:vehicleId/vehicleInventoryDetails', () => {
    it('Get vehicle stocks', async () => {
      const manufacturer = await factory.create('Manufacturer');
      const vehicle = await factory.create('Vehicle', {manufacturer_id: manufacturer.id});
      const dealer = await factory.create('Dealer', {manufacturer_id: manufacturer.id});
      const managerUser = await factory.create('User', { user_type_id: dealer.id });
      const managerRole = await factory.create('Role', { name: 'DEALER_MANAGER' });
      const managerUserRole = await factory.create('UserRole', { user_id: managerUser.id, role_id: managerRole.id });
      const dealerVehicle = await factory.create('DealerVehicle', {vehicle_id: vehicle.id, dealer_id: dealer.id});
      const user = await factory.create('User', { user_type_id: dealer.id });
      const accessToken = await factory.create('AccessToken', { userId: user.id });
      const role = await app.Roles.findOne({ where: { name: 'DEALER_MANAGER' } });
      const userRole = await factory.create('UserRole', {
        user_id: accessToken.userId,
        principalId: accessToken.userId,
        role_id: role.id,
      })
      request(loopback)
        .get('/api/DealerInventories/dealer/'+ dealer.id+ '/vehicle/'+ vehicle.id+'/vehicleInventoryDetails')
        .set('Authorization', accessToken.id)
        .set('Content-Type', 'application/json')
        .expect(200)
        .end((err, res) => {
          expect(res.body.length).to.not.equal(0);
        });
    });
  });
});
