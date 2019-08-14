const loopback = require('../../server/server.js');
const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
const factory = require('../factory.js');
const faker = require('faker/locale/en_IND');
const DateUtils = require('../../server/utils/date_utils');

const app = loopback.dataSources.postgres.models;

describe('DealerTarget', () => {
  describe('GET /api/DealerTargets', () => {
    it('returns the dealer targets based', async () => {
      const monthNames = ["jan", "feb", "mar", "apr", "may", "jun","jul", "aug", "sep", "oct", "nov", "dec"];
      const date = DateUtils.getFinancialYearDates(new Date());
      const dealer = await factory.create('Dealer');
      const user = await factory.create('User', { user_type_id: dealer.id });
      const accessToken = await factory.create('AccessToken', { userId: user.id });
      const role = await app.Roles.findOne({ where: { name: 'DEALER_MANAGER' } });
      const userRole = await factory.create('UserRole', {
        user_id: accessToken.userId,
        principalId: accessToken.userId,
        role_id: role.id,
      });
      const dealerTarget = await factory.create('DealerTarget',
        {name:monthNames[new Date().getMonth()], from_date:date.from_date,
        to_date:date.from_date, dealer_id: dealer.id});
      request(loopback)
        .get('/api/DealerTargets')
        .set('Accept', 'application/json')
        .set('Authorization', accessToken.id)
        .expect(200)
        .end((err, res) => {
          expect(res.body.length).to.equal(1);
        });
    });
  });

  describe('GET /api/DealerTargets/dealers/{dealerid}/target', () => {
    it('returns the target completion for current month', async () => {
      const monthNames = ["jan", "feb", "mar", "apr", "may", "jun","jul", "aug", "sep", "oct", "nov", "dec"];
      const dealer = await factory.create('Dealer');
      const user = await factory.create('User', { user_type_id: dealer.id });
      const accessToken = await factory.create('AccessToken', { userId: user.id });
      const role = await app.Roles.findOne({ where: { name: 'DEALER_SALES' } });
      const userRole = await factory.create('UserRole', {
        user_id: accessToken.userId,
        principalId: accessToken.userId,
        role_id: role.id,
      });
      const currentMonth = DateUtils.getCurrentMonthDates(new Date());
      const lastMonth = DateUtils.getLastMonthDates(new Date());
      const currentMonthDealerTarget = await factory.create('DealerTarget',
        {name:monthNames[new Date().getMonth()], from_date:currentMonth.from_date, type: 0,
        to_date:currentMonth.from_date, dealer_id: dealer.id, dealer_sales_id: user.id});
      const lastMonthDealerTarget = await factory.create('DealerTarget',
        {name:monthNames[new Date().getMonth() - 1], from_date:lastMonth.from_date, type: 1,
        to_date:lastMonth.from_date, dealer_id: dealer.id, dealer_sales_id: user.id});
      request(loopback)
        .get('/api/DealerTargets/dealers/' + dealer.id + '/target')
        .set('Accept', 'application/json')
        .set('Authorization', accessToken.id)
        .expect(200)
        .end((err, res) => {
          expect(res.body.length).to.equal(1);
        });
    });
  });

  describe('POST /api/DealerTargets/dealerSales/{dealerSalesId}/updateTarget', () => {
    it('returns the updated target of the dealer sales member', async () => {
      const monthNames = ["jan", "feb", "mar", "apr", "may", "jun","jul", "aug", "sep", "oct", "nov", "dec"];
      const dealer = await factory.create('Dealer');
      const user = await factory.create('User', {user_type_id: dealer.id});
      const managerRole = await app.Roles.findOne({ where: { name: 'DEALER_MANAGER' } });
      const userRole = await factory.create('UserRole', {user_id: user.id,principalId: user.id,
        role_id: managerRole.id,});
      const accessToken = await factory.create('AccessToken', { userId: user.id });
      const dealerSalesUser = await factory.create('User', {user_type_id: dealer.id, manager_id: user.id});
      const currentMonth = DateUtils.getCurrentMonthDates(new Date());
      const currentMonthDealerTarget = await factory.create('DealerTarget',
        {name:monthNames[new Date().getMonth()], from_date:currentMonth.from_date, vehicle_type: 0,
        to_date:currentMonth.to_date, dealer_id: dealer.id, dealer_sales_id: dealerSalesUser.id});
      const data = [{fromDate: currentMonth.from_date, toDate:currentMonth.to_date, type: 0, value: 3500, name:monthNames[new Date().getMonth()]}]
      request(loopback)
        .post('/api/DealerTargets/dealerSales/' + dealerSalesUser.id + '/updateTarget')
        .set('Accept', 'application/json')
        .set('Authorization', accessToken.id)
        .send(data)
        .expect(200)
        .end((err, res) => {
          expect(res.body.count).to.not.equal(0);
        });
    });
  });

  describe('GET /api/DealerTargets/details', () => {
    it('returns the updated target of the dealer sales member', async () => {
      const monthNames = ["jan", "feb", "mar", "apr", "may", "jun","jul", "aug", "sep", "oct", "nov", "dec"];
      const dealer = await factory.create('Dealer');
      const user = await factory.create('User', {user_type_id: dealer.id});
      const managerRole = await app.Roles.findOne({ where: { name: 'DEALER_MANAGER' } });
      const userRole = await factory.create('UserRole', {user_id: user.id,principalId: user.id,
        role_id: managerRole.id,});
      const accessToken = await factory.create('AccessToken', { userId: user.id });
      const dealerSalesUser = await factory.create('User', {user_type_id: dealer.id, manager_id: user.id});
      const currentMonth = DateUtils.getCurrentMonthDates(new Date());
      const currentMonthDealerTarget = await factory.create('DealerTarget',
        {name:monthNames[new Date().getMonth()], from_date:currentMonth.from_date, vehicle_type: 0,
        to_date:currentMonth.to_date, dealer_id: dealer.id, dealer_sales_id: dealerSalesUser.id});
      request(loopback)
        .get('/api/DealerTargets/details')
        .set('Accept', 'application/json')
        .set('Authorization', accessToken.id)
        .expect(200)
        .end((err, res) => {
          expect(res.body.length).to.not.equal(0);
        });
    });
  });
});
