const loopback = require('../../server/server.js');
const chai = require('chai');
const assert = chai.assert;
const factory = require('../factory.js');
const FinancierTeamService = require('../../server/services/financier_team_service.js');
const DateUtils = require('../../server/utils/date_utils');

const app = loopback.dataSources.postgres.models;

describe('FinancierTeamService', () => {

  describe('getTeamDetail', () => {
    it('returns team detail along with active dealers associated', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
      const teamHeadUser = await factory.create('User', {
        user_type_id: financier.id,
        user_type_name: 'Financier',
        manager_id: cityHeadUser.id,
        city_id: city.id
      });
      const financierTeam =  await factory.create('FinancierTeam', { financier_id: financier.id, owned_by: teamHeadUser.id });
      const financierDealer =  await factory.create('FinancierDealer',
        { financier_id: financier.id,  financier_team_id: financierTeam.id, from_date: new Date(), user_id: null });
      const financierTeamService = new FinancierTeamService(financierTeam.id, cityHeadUser);
      financierTeamService.getTeamDetail( (err, result) => {
        assert.notEqual(result.financierTeam, null, 'Team detail along with active dealers associated fetched successfully');
      });
    });
  });

  describe('getDealersUnassignedToSales', () => {
    it('returns dealers associated to a team and unassociated to any sales-user', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
      const teamHeadUser = await factory.create('User', {
        user_type_id: financier.id,
        user_type_name: 'Financier',
        manager_id: cityHeadUser.id,
        city_id: city.id
      });
      const financierTeam =  await factory.create('FinancierTeam', { financier_id: financier.id, owned_by: teamHeadUser.id });
      const financierDealer =  await factory.create('FinancierDealer',
        { financier_id: financier.id,  financier_team_id: financierTeam.id, from_date: new Date(), user_id: null });
      const financierTeamService = new FinancierTeamService(financierTeam.id, null);
      financierTeamService.getDealersUnassignedToSales((err, result) => {
        assert.notEqual(result.length, 0, 'Dealers associated to a team and unassociated to any sales-user fetched successfully');
      });
    });
  });

  describe('getDealershipLeadEffectiveness', () => {
    it('returns dealership lead-effectiveness by team-id ', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
      const teamHeadUser = await factory.create('User', {
        user_type_id: financier.id,
        user_type_name: 'Financier',
        manager_id: cityHeadUser.id,
        city_id: city.id
      });
      const financierTeam =  await factory.create('FinancierTeam',
        { financier_id: financier.id, owned_by: teamHeadUser.id, city_id: city.id });
      const dealer = await factory.create('Dealer', { city_id: cityHeadUser.city_id });
      const dealerFinancier = await factory.create('DealerFinancier', {
        dealer_id : dealer.id, financier_id: financier.id,
      });
      const financierDealer = await factory.create('FinancierDealer', {
        dealer_id : dealer.id, financier_team_id: financierTeam.id, from_date: new Date(),
        to_date: null, financier_id: financier.id,
      });
      await factory.create('FinancierDealer', {
        dealer_id : dealer.id, financier_team_id: financierTeam.id, from_date: new Date(),
        to_date: null, financier_id: financier.id, user_id: teamHeadUser.id
      });
      const financierLead = await factory.create('FinancierLead', {
        fianancier_id: financier.id, assigned_to: teamHeadUser.id, dealer_id: dealer.id,
        financier_team_id: financierTeam.id, status: 500, city_id: city.id
      });
      const financialYearDate = DateUtils.getFinancialYearDates(new Date());
      const filter = { fromDate: financialYearDate.from_date, toDate: financialYearDate.to_date,
        dealerIds: [dealer.id], financierTeamIds: [] };
      const financierTeamService = new FinancierTeamService(financierTeam.id);
      financierTeamService.getDealershipLeadEffectiveness(filter, (err, result) => {
        assert.notEqual(result.length, 0, ' Dealership lead-effectiveness by team-id fetched successfully');
      });
    });
    it('returns team not-found error ', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
      const teamHeadUser = await factory.create('User', {
        user_type_id: financier.id,
        user_type_name: 'Financier',
        manager_id: cityHeadUser.id,
        city_id: city.id
      });
      const financierTeam =  await factory.create('FinancierTeam',
        { financier_id: financier.id, owned_by: teamHeadUser.id, city_id: city.id });
      const dealer = await factory.create('Dealer', { city_id: cityHeadUser.city_id });
      const dealerFinancier = await factory.create('DealerFinancier', {
        dealer_id : dealer.id, financier_id: financier.id,
      });
      const financierDealer = await factory.create('FinancierDealer', {
        dealer_id : dealer.id, financier_team_id: financierTeam.id, from_date: new Date(),
        to_date: null, financier_id: financier.id,
      });
      await factory.create('FinancierDealer', {
        dealer_id : dealer.id, financier_team_id: financierTeam.id, from_date: new Date(),
        to_date: null, financier_id: financier.id, user_id: teamHeadUser.id
      });
      const financierLead = await factory.create('FinancierLead', {
        fianancier_id: financier.id, assigned_to: teamHeadUser.id, dealer_id: dealer.id,
        financier_team_id: financierTeam.id, status: 500, city_id: city.id
      });
      const financialYearDate = DateUtils.getFinancialYearDates(new Date());
      const filter = { fromDate: financialYearDate.from_date, toDate: financialYearDate.to_date,
        dealerIds: [dealer.id], financierTeamIds: [] };
      const financierTeamService = new FinancierTeamService(financierTeam.city_id);
      financierTeamService.getDealershipLeadEffectiveness(filter, (err, result) => {
        assert.notEqual(err, null, 'Team not-found error');
      });
    });
  });

  describe('changeDealershipUser', () => {
    it('update and return the new dealership-user', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
      const teamHeadUser = await factory.create('User', {
        user_type_id: financier.id,
        user_type_name: 'Financier',
        manager_id: cityHeadUser.id,
        city_id: city.id
      });
      const salesUser = await factory.create('User', {
        user_type_id: financier.id, user_type_name: 'Financier',
        manager_id: teamHeadUser.id, city_id: city.id
      });
      const financierTeam =  await factory.create('FinancierTeam', {
        financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
      });
      const financierTeamMember =  await factory.create('FinancierTeamMember', {
        financier_id: financier.id, city_id: city.id, user_id: salesUser.id,
        financier_team_id: financierTeam.id
      });
      const dealer = await factory.create('Dealer', { city_id: cityHeadUser.city_id });
      const dealerFinancier = await factory.create('DealerFinancier', {
        dealer_id : dealer.id, financier_id: financier.id,
      });
      const financierDealer = await factory.create('FinancierDealer', {
        dealer_id : dealer.id, financier_team_id: financierTeam.id, from_date: new Date(),
        to_date: null, financier_id: financier.id,
      });
      await factory.create('FinancierDealer', {
        dealer_id : dealer.id, financier_team_id: financierTeam.id, from_date: new Date(),
        to_date: null, financier_id: financier.id, user_id: teamHeadUser.id,
      });
      const financierLead = await factory.create('FinancierLead', {
        fianancier_id: financier.id, assigned_to: teamHeadUser.id, dealer_id: dealer.id,
        financier_team_id: financierTeam.id, status: 500, city_id: city.id
      });
      const newUser = {id: salesUser.id};
      const financierTeamService = new FinancierTeamService(financierTeam.id);
      financierTeamService.changeDealershipUser(dealer.id, newUser, (err, result) => {
        assert.notEqual(result, null, 'Dealership-member updated successfully');
      });
    });
    it('return team not-found error', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
      const teamHeadUser = await factory.create('User', {
        user_type_id: financier.id,
        user_type_name: 'Financier',
        manager_id: cityHeadUser.id,
        city_id: city.id
      });
      const financierTeam =  await factory.create('FinancierTeam', {
        financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
      });
      const dealer = await factory.create('Dealer', { city_id: cityHeadUser.city_id });
      const newUser = {id: teamHeadUser.id};
      const financierTeamService = new FinancierTeamService(financierTeam.city_id);
      financierTeamService.changeDealershipUser(dealer.id, newUser, (err, result) => {
        assert.notEqual(err, null, 'Team not-found error');
      });
    });
    it('return dealer not-found error', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
      const teamHeadUser = await factory.create('User', {
        user_type_id: financier.id,
        user_type_name: 'Financier',
        manager_id: cityHeadUser.id,
        city_id: city.id
      });
      const salesUser = await factory.create('User', {
        user_type_id: financier.id, user_type_name: 'Financier',
        manager_id: teamHeadUser.id, city_id: city.id
      });
      const financierTeam =  await factory.create('FinancierTeam', {
        financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
      });
      const financierTeamMember =  await factory.create('FinancierTeamMember', {
        financier_id: financier.id, city_id: city.id, user_id: salesUser.id,
        financier_team_id: financierTeam.id
      });
      const dealer = await factory.create('Dealer', { city_id: cityHeadUser.city_id });
      const newUser = {id: salesUser.id};
      const financierTeamService = new FinancierTeamService(financierTeam.id);
      financierTeamService.changeDealershipUser(dealer.city_id, newUser, (err, result) => {
        assert.notEqual(err, null, 'Dealer-not found error');
      });
    });
    it('return cannot assign error', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
      const teamHeadUser = await factory.create('User', {
        user_type_id: financier.id,
        user_type_name: 'Financier',
        manager_id: cityHeadUser.id,
        city_id: city.id
      });
      const salesUser = await factory.create('User', {
        user_type_id: financier.id, user_type_name: 'Financier',
        manager_id: teamHeadUser.id, city_id: city.id
      });
      const financierTeam =  await factory.create('FinancierTeam', {
        financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
      });
      const financierTeamMember =  await factory.create('FinancierTeamMember', {
        financier_id: financier.id, city_id: city.id, user_id: salesUser.id,
        financier_team_id: financierTeam.id, to_date: new Date()
      });
      const dealer = await factory.create('Dealer', { city_id: cityHeadUser.city_id });
      const dealerFinancier = await factory.create('DealerFinancier', {
        dealer_id : dealer.id, financier_id: financier.id,
      });
      const financierDealer = await factory.create('FinancierDealer', {
        dealer_id : dealer.id, financier_team_id: financierTeam.id, from_date: new Date(),
        to_date: null, financier_id: financier.id,
      });
      await factory.create('FinancierDealer', {
        dealer_id : dealer.id, financier_team_id: financierTeam.id, from_date: new Date(),
        to_date: null, financier_id: financier.id, user_id: teamHeadUser.id,
      });
      const financierLead = await factory.create('FinancierLead', {
        fianancier_id: financier.id, assigned_to: teamHeadUser.id, dealer_id: dealer.id,
        financier_team_id: financierTeam.id, status: 500, city_id: city.id
      });
      const financierTeamService = new FinancierTeamService(financierTeam.id);
      financierTeamService.changeDealershipUser(dealer.id, salesUser, (err, result) => {
        assert.notEqual(err, null, 'Cannot assign error');
      });
    });
  });

  describe('getDealershipMemberSummary', () => {
    it('returns team-member-based dealership lead-effectiveness by dealer-id', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
      const teamHeadUser = await factory.create('User', {
        user_type_id: financier.id,
        user_type_name: 'Financier',
        manager_id: cityHeadUser.id,
        city_id: city.id
      });
      const financierTeam =  await factory.create('FinancierTeam',
        { financier_id: financier.id, owned_by: teamHeadUser.id, city_id: city.id });
      const dealer = await factory.create('Dealer', { city_id: cityHeadUser.city_id });
      const dealerFinancier = await factory.create('DealerFinancier', {
        dealer_id : dealer.id, financier_id: financier.id,
      });
      const financierDealer = await factory.create('FinancierDealer', {
        dealer_id : dealer.id, financier_team_id: financierTeam.id, from_date: new Date(),
        to_date: null, financier_id: financier.id,
      });
      await factory.create('FinancierDealer', {
        dealer_id : dealer.id, financier_team_id: financierTeam.id, from_date: new Date(),
        to_date: null, financier_id: financier.id, user_id: teamHeadUser.id
      });
      const financierLead = await factory.create('FinancierLead', {
        fianancier_id: financier.id, assigned_to: teamHeadUser.id, dealer_id: dealer.id,
        financier_team_id: financierTeam.id, status: 500, city_id: city.id
      });
      const financialYearDate = DateUtils.getFinancialYearDates(new Date());
      const filter = { fromDate: financialYearDate.from_date, toDate: financialYearDate.to_date};
      const financierTeamService = new FinancierTeamService(financierTeam.id, cityHeadUser);
      financierTeamService.getDealershipMemberSummary(dealer.id, filter, (err, result) => {
        assert.notEqual(result.length, 0, 'Member-based lead-summary by dealer-id fetched successfully');
      });
    });
    it('return team not-found error', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
      const teamHeadUser = await factory.create('User', {
        user_type_id: financier.id,
        user_type_name: 'Financier',
        manager_id: cityHeadUser.id,
        city_id: city.id
      });
      const financierTeam =  await factory.create('FinancierTeam',
        { financier_id: financier.id, owned_by: teamHeadUser.id, city_id: city.id });
      const dealer = await factory.create('Dealer', { city_id: cityHeadUser.city_id });
      const dealerFinancier = await factory.create('DealerFinancier', {
        dealer_id : dealer.id, financier_id: financier.id,
      });
      const financierDealer = await factory.create('FinancierDealer', {
        dealer_id : dealer.id, financier_team_id: financierTeam.id, from_date: new Date(),
        to_date: null, financier_id: financier.id,
      });
      await factory.create('FinancierDealer', {
        dealer_id : dealer.id, financier_team_id: financierTeam.id, from_date: new Date(),
        to_date: null, financier_id: financier.id, user_id: teamHeadUser.id
      });
      const financierLead = await factory.create('FinancierLead', {
        fianancier_id: financier.id, assigned_to: teamHeadUser.id, dealer_id: dealer.id,
        financier_team_id: financierTeam.id, status: 500, city_id: city.id
      });
      const financialYearDate = DateUtils.getFinancialYearDates(new Date());
      const filter = { fromDate: financialYearDate.from_date, toDate: financialYearDate.to_date};
      const financierTeamService = new FinancierTeamService(financierTeam.city_id, cityHeadUser);
      financierTeamService.getDealershipMemberSummary(dealer.id, filter, (err, result) => {
        assert.notEqual(err, null, 'Team not-found error');
      });
    });
    it('return dealer not-found error', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
      const teamHeadUser = await factory.create('User', {
        user_type_id: financier.id,
        user_type_name: 'Financier',
        manager_id: cityHeadUser.id,
        city_id: city.id
      });
      const financierTeam =  await factory.create('FinancierTeam',
        { financier_id: financier.id, owned_by: teamHeadUser.id, city_id: city.id });
      const dealer = await factory.create('Dealer', { city_id: cityHeadUser.city_id });
      const dealerFinancier = await factory.create('DealerFinancier', {
        dealer_id : dealer.id, financier_id: financier.id,
      });
      const financierDealer = await factory.create('FinancierDealer', {
        dealer_id : dealer.id, financier_team_id: financierTeam.id, from_date: new Date(),
        to_date: null, financier_id: financier.id,
      });
      await factory.create('FinancierDealer', {
        dealer_id : dealer.id, financier_team_id: financierTeam.id, from_date: new Date(),
        to_date: null, financier_id: financier.id, user_id: teamHeadUser.id
      });
      const financierLead = await factory.create('FinancierLead', {
        fianancier_id: financier.id, assigned_to: teamHeadUser.id, dealer_id: dealer.id,
        financier_team_id: financierTeam.id, status: 500, city_id: city.id
      });
      const financialYearDate = DateUtils.getFinancialYearDates(new Date());
      const filter = { fromDate: financialYearDate.from_date, toDate: financialYearDate.to_date};
      const financierTeamService = new FinancierTeamService(financierTeam.id, cityHeadUser);
      financierTeamService.getDealershipMemberSummary(dealer.city_id, filter, (err, result) => {
        assert.notEqual(err, null, 'Dealer not-found error');
      });
    });
  });

  describe('deleteTeamMember', () => {
    it('returns active dealer-associated error', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
      const teamHeadUser = await factory.create('User', {
        user_type_id: financier.id,
        user_type_name: 'Financier',
        manager_id: cityHeadUser.id,
        city_id: city.id
      });
      const salesUser = await factory.create('User', {
        user_type_id: financier.id,
        user_type_name: 'Financier',
        manager_id: teamHeadUser.id,
        city_id: city.id
      });
      const financierTeam =  await factory.create('FinancierTeam',
        { financier_id: financier.id, owned_by: teamHeadUser.id, city_id: city.id });
      const dealer = await factory.create('Dealer', { city_id: cityHeadUser.city_id });
      const dealerFinancier = await factory.create('DealerFinancier', {
        dealer_id : dealer.id, financier_id: financier.id,
      });
      const financierDealer = await factory.create('FinancierDealer', {
        dealer_id : dealer.id, financier_team_id: financierTeam.id, from_date: new Date(),
        to_date: null, financier_id: financier.id,
      });
      await factory.create('FinancierDealer', {
        dealer_id : dealer.id, financier_team_id: financierTeam.id, from_date: new Date(),
        to_date: null, financier_id: financier.id, user_id: salesUser.id
      });
      await factory.create('FinancierTeamMember', {
        financier_team_id: financierTeam.id, from_date: new Date(),
        to_date: null, financier_id: financier.id, user_id: salesUser.id
      });
      const financierLead = await factory.create('FinancierLead', {
        fianancier_id: financier.id, assigned_to: salesUser.id, dealer_id: dealer.id,
        financier_team_id: financierTeam.id, status: 500, city_id: city.id
      });
      const financialYearDate = DateUtils.getFinancialYearDates(new Date());
      const filter = { fromDate: financialYearDate.from_date, toDate: financialYearDate.to_date};
      const financierTeamService = new FinancierTeamService(financierTeam.id, cityHeadUser);
      financierTeamService.deleteTeamMember(salesUser.id, (err, result) => {
        assert.equal(err.status, 400, 'Active dealer-associated error occurs');
      });
    });
    it('returns team after team-member deleted successfully', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
      const teamHeadUser = await factory.create('User', {
        user_type_id: financier.id,
        user_type_name: 'Financier',
        manager_id: cityHeadUser.id,
        city_id: city.id
      });
      const salesUser = await factory.create('User', {
        user_type_id: financier.id,
        user_type_name: 'Financier',
        manager_id: teamHeadUser.id,
        city_id: city.id
      });
      const financierTeam =  await factory.create('FinancierTeam',
        { financier_id: financier.id, owned_by: teamHeadUser.id, city_id: city.id });
      await factory.create('FinancierTeamMember', {
        financier_team_id: financierTeam.id, from_date: new Date(),
        to_date: null, financier_id: financier.id, user_id: salesUser.id
      });
      const financialYearDate = DateUtils.getFinancialYearDates(new Date());
      const filter = { fromDate: financialYearDate.from_date, toDate: financialYearDate.to_date};
      const financierTeamService = new FinancierTeamService(financierTeam.id, cityHeadUser);
      financierTeamService.deleteTeamMember(salesUser.id, (err, result) => {
        assert.notEqual(result, null, 'Team-member deleted successfully');
      });
    });
    it('returns team not-found error', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
      const teamHeadUser = await factory.create('User', {
        user_type_id: financier.id,
        user_type_name: 'Financier',
        manager_id: cityHeadUser.id,
        city_id: city.id
      });
      const salesUser = await factory.create('User', {
        user_type_id: financier.id,
        user_type_name: 'Financier',
        manager_id: teamHeadUser.id,
        city_id: city.id
      });
      const financierTeam =  await factory.create('FinancierTeam',
        { financier_id: financier.id, owned_by: teamHeadUser.id, city_id: city.id });
      await factory.create('FinancierTeamMember', {
        financier_team_id: financierTeam.id, from_date: new Date(),
        to_date: null, financier_id: financier.id, user_id: salesUser.id
      });
      const financialYearDate = DateUtils.getFinancialYearDates(new Date());
      const filter = { fromDate: financialYearDate.from_date, toDate: financialYearDate.to_date};
      const financierTeamService = new FinancierTeamService(financierTeam.city_id, cityHeadUser);
      financierTeamService.deleteTeamMember(salesUser.id, (err, result) => {
        assert.notEqual(err, null, 'Team not-found error');
      });
    });
  });

  describe('getDealershipMonthlyReport', () => {
    it('returns the dealer-based monthly lead-report for team ', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
      const teamHeadUser = await factory.create('User', {
        user_type_id: financier.id,
        user_type_name: 'Financier',
        manager_id: cityHeadUser.id,
        city_id: city.id
      });
      const monthNames = ["jan", "feb", "mar", "apr", "may", "jun","jul", "aug", "sep", "oct", "nov", "dec"];
      const currentMonth = DateUtils.getCurrentMonthDates(new Date());
      const financierTeam =  await factory.create('FinancierTeam',
        { financier_id: financier.id, owned_by: teamHeadUser.id, city_id: city.id });
      const dealer = await factory.create('Dealer', { city_id: cityHeadUser.city_id });
      const dealerFinancier = await factory.create('DealerFinancier', {
        dealer_id : dealer.id, financier_id: financier.id,
      });
      const financierDealer = await factory.create('FinancierDealer', {
        dealer_id : dealer.id, financier_team_id: financierTeam.id, from_date: new Date(),
        to_date: null, financier_id: financier.id,
      });
      const financierLead = await factory.create('FinancierLead', {
        fianancier_id: financier.id, assigned_to: teamHeadUser.id, dealer_id: dealer.id,
        financier_team_id: financierTeam.id, status: 500, city_id: city.id
      });
      const financialYearDate = DateUtils.getFinancialYearDates(new Date());
      const filter = { fromDate: financialYearDate.from_date, toDate: financialYearDate.to_date };
      const financierTeamService = new FinancierTeamService(financierTeam.id);
      financierTeamService.getDealershipMonthlyReport(dealer.id, filter, (err, result) => {
        assert.notEqual(result.length, 0, 'Dealer-based monthly lead-report of team fetched successfully');
      });
    });
    it('returns dealer not-found error', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
      const teamHeadUser = await factory.create('User', {
        user_type_id: financier.id,
        user_type_name: 'Financier',
        manager_id: cityHeadUser.id,
        city_id: city.id
      });
      const monthNames = ["jan", "feb", "mar", "apr", "may", "jun","jul", "aug", "sep", "oct", "nov", "dec"];
      const currentMonth = DateUtils.getCurrentMonthDates(new Date());
      const financierTeam =  await factory.create('FinancierTeam',
        { financier_id: financier.id, owned_by: teamHeadUser.id, city_id: city.id });
      const dealer = await factory.create('Dealer', { city_id: cityHeadUser.city_id });
      const dealerFinancier = await factory.create('DealerFinancier', {
        dealer_id : dealer.id, financier_id: financier.id,
      });
      const financierDealer = await factory.create('FinancierDealer', {
        dealer_id : dealer.id, financier_team_id: financierTeam.id, from_date: new Date(),
        to_date: null, financier_id: financier.id,
      });
      const financierLead = await factory.create('FinancierLead', {
        fianancier_id: financier.id, assigned_to: teamHeadUser.id, dealer_id: dealer.id,
        financier_team_id: financierTeam.id, status: 500, city_id: city.id
      });
      const financialYearDate = DateUtils.getFinancialYearDates(new Date());
      const filter = { fromDate: financialYearDate.from_date, toDate: financialYearDate.to_date };
      const financierTeamService = new FinancierTeamService(financierTeam.id);
      financierTeamService.getDealershipMonthlyReport(dealer.city_id, filter, (err, result) => {
        assert.notEqual(err, null, 'Dealer not-found error');
      });
    });
  });

  describe('getTeamMembersByTeamIds', () => {
    it('returns team-members for team-ids ', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
      const teamHeadUser = await factory.create('User', {
        user_type_id: financier.id,
        user_type_name: 'Financier',
        manager_id: cityHeadUser.id,
        city_id: city.id
      });
      const salesUser = await factory.create('User', {
        user_type_id: financier.id,
        user_type_name: 'Financier',
        manager_id: teamHeadUser.id,
        city_id: city.id
      });
      const monthNames = ["jan", "feb", "mar", "apr", "may", "jun","jul", "aug", "sep", "oct", "nov", "dec"];
      const currentMonth = DateUtils.getCurrentMonthDates(new Date());
      const financierTeam =  await factory.create('FinancierTeam',
        { financier_id: financier.id, owned_by: teamHeadUser.id, city_id: city.id });
      const financierTeamMember =  await factory.create('FinancierTeamMember', {
        financier_id: financier.id, city_id: city.id, user_id: salesUser.id,
        financier_team_id: financierTeam.id
      });
      const financierTeamService = new FinancierTeamService(financierTeam.id, cityHeadUser);
      financierTeamService.getTeamMembersByTeamIds({teamIds: [financierTeam.id]}, (err, result) => {
        assert.notEqual(result.teamMembers.length, 0, 'Team-members fetched successfully');
      });
    });
    it('returns user not exist error ', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'abc', city_id: city.id });
      const teamHeadUser = await factory.create('User', {
        user_type_id: financier.id,
        user_type_name: 'Financier',
        manager_id: cityHeadUser.id,
        city_id: city.id
      });
      const salesUser = await factory.create('User', {
        user_type_id: financier.id,
        user_type_name: 'Financier',
        manager_id: teamHeadUser.id,
        city_id: city.id
      });
      const monthNames = ["jan", "feb", "mar", "apr", "may", "jun","jul", "aug", "sep", "oct", "nov", "dec"];
      const currentMonth = DateUtils.getCurrentMonthDates(new Date());
      const financierTeam =  await factory.create('FinancierTeam',
        { financier_id: financier.id, owned_by: teamHeadUser.id, city_id: city.id });
      const financierTeamMember =  await factory.create('FinancierTeamMember', {
        financier_id: financier.id, city_id: city.id, user_id: salesUser.id,
        financier_team_id: financierTeam.id
      });
      const financierTeamService = new FinancierTeamService(financierTeam.id, cityHeadUser);
      financierTeamService.getTeamMembersByTeamIds({teamIds: [financierTeam.id]}, (err, result) => {
        assert.notEqual(err, null, 'returns err');
      });
    });
  });

  describe('getLeadSummaryBasedOnDealership', () => {
    it('returns dealership lead-summary for team', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
      const teamHeadUser = await factory.create('User', {
        user_type_id: financier.id,
        user_type_name: 'Financier',
        manager_id: cityHeadUser.id,
        city_id: city.id
      });
      const financierTeam =  await factory.create('FinancierTeam',
        { financier_id: financier.id, owned_by: teamHeadUser.id, city_id: city.id });
      const dealer = await factory.create('Dealer', { city_id: cityHeadUser.city_id });
      const dealerFinancier = await factory.create('DealerFinancier', {
        dealer_id : dealer.id, financier_id: financier.id,
      });
      const financierDealer = await factory.create('FinancierDealer', {
        dealer_id : dealer.id, financier_team_id: financierTeam.id, from_date: new Date(),
        to_date: null, financier_id: financier.id,
      });
      await factory.create('FinancierDealer', {
        dealer_id : dealer.id, financier_team_id: financierTeam.id, from_date: new Date(),
        to_date: null, financier_id: financier.id, user_id: teamHeadUser.id
      });
      const financierLead = await factory.create('FinancierLead', {
        fianancier_id: financier.id, assigned_to: teamHeadUser.id, dealer_id: dealer.id,
        financier_team_id: financierTeam.id, status: 500, city_id: city.id
      });
      const financialYearDate = DateUtils.getFinancialYearDates(new Date());
      const filter = { fromDate: financialYearDate.from_date, toDate: financialYearDate.to_date};
      const financierTeamService = new FinancierTeamService(financierTeam.id, cityHeadUser);
      financierTeamService.getLeadSummaryBasedOnDealership(dealer.id, filter, (err, result) => {
        assert.notEqual(result.length, 0, 'Dealership lead-summary for team fetched successfully');
      });
    });
  });
});
