const loopback = require('../../server/server.js');
const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
const factory = require('../factory.js');
const DealerTargetService = require('../../server/services/dealer_target_service.js');
const DateUtils = require('../../server/utils/date_utils');

const app = loopback.dataSources.postgres.models;

describe('DealerTargetService', () => {
  describe('getNames', () => {
    it('returns the dealer targets based', async () => {
      const monthNames = ["jan", "feb", "mar", "apr", "may", "jun","jul", "aug", "sep", "oct", "nov", "dec"];
      const date = DateUtils.getFinancialYearDates(new Date());
      const dealer = await factory.create('Dealer');
      const dealerTarget = await factory.create('DealerTarget',
        {name:monthNames[new Date().getMonth()], from_date:date.from_date,
        to_date:date.from_date, dealer_id: dealer.id});
      const dealerTargetService = new DealerTargetService(dealer.id);
      dealerTargetService.getNames((err, dealerTargets) => {
        assert.notEqual(dealerTargets.length, 0, 'Dealer targets created successfully');
      });
    });
  });

  describe('getTargetCompletion', () => {
    it('returns the target completion for current month', async () => {
      const monthNames = ["jan", "feb", "mar", "apr", "may", "jun","jul", "aug", "sep", "oct", "nov", "dec"];
      const dealer = await factory.create('Dealer');
      const executiveUser = await factory.create('User', { user_type_id: dealer.id });
      const currentMonth = DateUtils.getCurrentMonthDates(new Date());
      const lastMonth = DateUtils.getLastMonthDates(new Date());
      const currentMonthDealerTarget = await factory.create('DealerTarget',
        {name:monthNames[new Date().getMonth()], from_date:currentMonth.from_date, vehicle_type: 0,
        to_date:currentMonth.to_date, dealer_id: dealer.id, dealer_sales_id: executiveUser.id});
      const lastMonthDealerTarget = await factory.create('DealerTarget',
        {name:monthNames[new Date().getMonth() - 1], from_date:lastMonth.from_date, vehicle_type: 1,
        to_date:lastMonth.to_date, dealer_id: dealer.id, dealer_sales_id:executiveUser.id});
      const saleRole = await app.Roles.findOne({ where: { name: 'DEALER_SALES' } });
      const executiveUserRole = await factory.create('UserRole', { user_id: executiveUser.id, role_id: saleRole.id });
      const currentUser = await app.Users.findOne({ where: { id: executiveUser.id},
         include: { relation: "user_role", scope: { include: "role" }}});
      const dealerTargetService = new DealerTargetService(dealer.id, currentUser);
      dealerTargetService.getTargetCompletion((err, targets) => {
        assert.notEqual(targets.length, 0, 'Dealer sales created successfully');
      });
    });
  });

  describe('updateDealerTarget', () => {
    it('returns the updated target of the dealer sales member', async () => {
      const monthNames = ["jan", "feb", "mar", "apr", "may", "jun","jul", "aug", "sep", "oct", "nov", "dec"];
      const dealer = await factory.create('Dealer');
      const user = await factory.create('User', {user_type_id: dealer.id});
      const dealerSalesUser = await factory.create('User', {user_type_id: dealer.id, manager_id: user.id});
      const currentMonth = DateUtils.getCurrentMonthDates(new Date());
      const currentMonthDealerTarget = await factory.create('DealerTarget',
        {name:monthNames[new Date().getMonth()], from_date:currentMonth.from_date, vehicle_type: 0,
        to_date:currentMonth.to_date, dealer_id: dealer.id, dealer_sales_id: dealerSalesUser.id});
      const saleRole = await app.Roles.findOne({ where: { name: 'DEALER_MANAGER' } });
      const executiveUserRole = await factory.create('UserRole', { user_id: user.id, role_id: saleRole.id });
      const dealerTargetService = new DealerTargetService();
      const data = [{name:monthNames[new Date().getMonth()],fromDate: currentMonth.from_date, toDate:currentMonth.to_date, type: 0, value: 3500}]
      dealerTargetService.updateDealerTarget(dealerSalesUser.id, data, (err, targets) => {
        assert.notEqual(targets.count, 0, 'Dealer sales created successfully');
      });
    });
  });
});
