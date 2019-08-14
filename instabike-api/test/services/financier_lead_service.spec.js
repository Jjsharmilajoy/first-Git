const loopback = require('../../server/server.js');
const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
const factory = require('../factory.js');
const FinancierLeadService = require('../../server/services/financier_lead_service.js');
const constants = require('../../server/utils/constants/userConstants');
const DateUtils = require('../../server/utils/date_utils');

const app = loopback.dataSources.postgres.models;

describe('Financier Lead Service',() => {
  describe('fetchFinancierLeadsByStatus', () => {
    it('returns the list of leads that matches with the status', async () => {
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
      const salesRole = await app.Roles.findOne({ where: { name: 'FINANCIER_SALES' } });
      await factory.create('UserRole', {
        user_id: salesUser.id,
        role_id: salesRole.id,
        principalId: salesUser.id
      });
      const financierTeam =  await factory.create('FinancierTeam', {
        financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
      });
      const financierTeamMember =  await factory.create('FinancierTeamMember', {
        financier_id: financier.id, city_id: city.id, user_id: salesUser.id,
        financier_team_id: financierTeam.id
      });
      const lead = await factory.create('FinancierLead', {status: 500, financier_id: financier.id, assigned_to: salesUser.id,
      financier_team_id: financierTeam.id});
      const currentUser = await app.Users.findOne({
         where: {
            id: salesUser.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });
      const finLeadService = new FinancierLeadService(null, null, currentUser);
      const currentMonth = DateUtils.getCurrentMonthDates(new Date());
      const filter = {
        "fromDate": currentMonth.from_date,
        "toDate": currentMonth.to_date,
        "dealer": [],
        "team": [],
        "members": []
      };
      finLeadService.fetchFinancierLeadsByStatus('active', filter, (fetchError, leads) => {
        assert.isNotNull(leads, 'Leads matched with the leadStatus');
      });
    });

    it('returns error, coz current user is not set', async () => {
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
      const salesRole = await app.Roles.findOne({ where: { name: 'FINANCIER_SALES' } });
      await factory.create('UserRole', {
        user_id: salesUser.id,
        role_id: salesRole.id,
        principalId: salesUser.id
      });
      const financierTeam =  await factory.create('FinancierTeam', {
        financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
      });
      const financierTeamMember =  await factory.create('FinancierTeamMember', {
        financier_id: financier.id, city_id: city.id, user_id: salesUser.id,
        financier_team_id: financierTeam.id
      });
      const lead = await factory.create('FinancierLead', {status: 500, financier_id: financier.id, assigned_to: salesUser.id,
      financier_team_id: financierTeam.id});
      const currentUser = await app.Users.findOne({
         where: {
            id: salesUser.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });
      const finLeadService = new FinancierLeadService(null, null);
      const currentMonth = DateUtils.getCurrentMonthDates(new Date());
      const filter = {
        "fromDate": currentMonth.from_date,
        "toDate": currentMonth.to_date,
        "dealer": [],
        "team": [],
        "members": []
      };
      finLeadService.fetchFinancierLeadsByStatus('active', filter, (fetchError, leads) => {
        assert.isNotNull(leads, 'Leads matched with the leadStatus');
      });
    });
  });

  describe('financierLeadCountByStatus', () => {
    it('returns the count of the leads', async () => {
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
      const salesRole = await app.Roles.findOne({ where: { name: 'FINANCIER_SALES' } });
      await factory.create('UserRole', {
        user_id: salesUser.id,
        role_id: salesRole.id,
        principalId: salesUser.id
      });
      const financierTeam =  await factory.create('FinancierTeam', {
        financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
      });
      const financierTeamMember =  await factory.create('FinancierTeamMember', {
        financier_id: financier.id, city_id: city.id, user_id: salesUser.id,
        financier_team_id: financierTeam.id
      });
      const lead = await factory.create('FinancierLead', {status: 500, financier_id: financier.id, assigned_to: salesUser.id,
      financier_team_id: financierTeam.id});
      const currentUser = await app.Users.findOne({
         where: {
            id: salesUser.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });
      const finLeadService = new FinancierLeadService(null, null, currentUser);
      const currentMonth = DateUtils.getCurrentMonthDates(new Date());
      const filter = {
        "fromDate": currentMonth.from_date,
        "toDate": currentMonth.to_date,
        "dealer": [],
        "team": [],
        "members": []
      };
      finLeadService.financierLeadCountByStatus(filter, (fetchError, leads) => {
        assert.isNotNull(leads, 'Leads count with the status');
      });
    });

    it('returns error, coz current user is not set', async () => {
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
      const salesRole = await app.Roles.findOne({ where: { name: 'FINANCIER_SALES' } });
      await factory.create('UserRole', {
        user_id: salesUser.id,
        role_id: salesRole.id,
        principalId: salesUser.id
      });
      const financierTeam =  await factory.create('FinancierTeam', {
        financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
      });
      const financierTeamMember =  await factory.create('FinancierTeamMember', {
        financier_id: financier.id, city_id: city.id, user_id: salesUser.id,
        financier_team_id: financierTeam.id
      });
      const lead = await factory.create('FinancierLead', {status: 500, financier_id: financier.id, assigned_to: salesUser.id,
      financier_team_id: financierTeam.id});
      const currentUser = await app.Users.findOne({
         where: {
            id: salesUser.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });
      const finLeadService = new FinancierLeadService(null, null, currentUser);
      const currentMonth = DateUtils.getCurrentMonthDates(new Date());
      const filter = {
        "fromDate": currentMonth.from_date,
        "toDate": currentMonth.to_date,
        "dealer": [],
        "members": []
      };
      finLeadService.financierLeadCountByStatus(filter, (fetchError, leads) => {
        assert.isNotNull(fetchError, 'Error');
      });
    });
  });

  describe('getLeadDetails', () => {
    it('get deals by Id', async () => {
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
      const salesRole = await app.Roles.findOne({ where: { name: 'FINANCIER_SALES' } });
      await factory.create('UserRole', {
        user_id: salesUser.id,
        role_id: salesRole.id,
        principalId: salesUser.id
      });
      const financierTeam =  await factory.create('FinancierTeam', {
        financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
      });
      const financierTeamMember =  await factory.create('FinancierTeamMember', {
        financier_id: financier.id, city_id: city.id, user_id: salesUser.id,
        financier_team_id: financierTeam.id
      });
      const lead = await factory.create('FinancierLead', {status: 500, financier_id: financier.id, assigned_to: salesUser.id,
      financier_team_id: financierTeam.id});
      const currentUser = await app.Users.findOne({
         where: {
            id: salesUser.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });
      const finLeadService = new FinancierLeadService(lead.id, null, currentUser);
      finLeadService.getFinancierLeadDetails((fetchError, leads) => {
        assert.isNotNull(leads, 'Leads data');
      });
    });

    it('returns error, coz lead id is not set', async () => {
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
      const salesRole = await app.Roles.findOne({ where: { name: 'FINANCIER_SALES' } });
      await factory.create('UserRole', {
        user_id: salesUser.id,
        role_id: salesRole.id,
        principalId: salesUser.id
      });
      const financierTeam =  await factory.create('FinancierTeam', {
        financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
      });
      const financierTeamMember =  await factory.create('FinancierTeamMember', {
        financier_id: financier.id, city_id: city.id, user_id: salesUser.id,
        financier_team_id: financierTeam.id
      });
      const lead = await factory.create('FinancierLead', {status: 500, financier_id: financier.id, assigned_to: salesUser.id,
      financier_team_id: financierTeam.id});
      const currentUser = await app.Users.findOne({
         where: {
            id: salesUser.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });
      const finLeadService = new FinancierLeadService(null, null, currentUser);
      finLeadService.getFinancierLeadDetails((fetchError, leads) => {
        assert.isNotNull(fetchError, 'Error');
      });
    });

    it('returns error, coz lead id is not set', async () => {
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
      const salesRole = await app.Roles.findOne({ where: { name: 'FINANCIER_SALES' } });
      await factory.create('UserRole', {
        user_id: salesUser.id,
        role_id: salesRole.id,
        principalId: salesUser.id
      });
      const financierTeam =  await factory.create('FinancierTeam', {
        financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
      });
      const financierTeamMember =  await factory.create('FinancierTeamMember', {
        financier_id: financier.id, city_id: city.id, user_id: salesUser.id,
        financier_team_id: financierTeam.id
      });
      const lead = await factory.create('FinancierLead', {status: 500, financier_id: financier.id, assigned_to: salesUser.id,
      financier_team_id: financierTeam.id});
      const currentUser = await app.Users.findOne({
         where: {
            id: salesUser.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });
      const finLeadService = new FinancierLeadService();
      finLeadService.getFinancierLeadDetails((fetchError, leads) => {
        assert.isNotNull(fetchError, 'Error');
      });
    });
  });

  describe('fetch FinancierLeads via search', () => {
    it('returns the list of leads that matches with the search', async () => {
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
      const salesRole = await app.Roles.findOne({ where: { name: 'FINANCIER_SALES' } });
      await factory.create('UserRole', {
        user_id: salesUser.id,
        role_id: salesRole.id,
        principalId: salesUser.id
      });
      const financierTeam =  await factory.create('FinancierTeam', {
        financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
      });
      const financierTeamMember =  await factory.create('FinancierTeamMember', {
        financier_id: financier.id, city_id: city.id, user_id: salesUser.id,
        financier_team_id: financierTeam.id
      });
      const lead = await factory.create('FinancierLead', {status: 500, financier_id: financier.id, assigned_to: salesUser.id,
      financier_team_id: financierTeam.id});
      const currentUser = await app.Users.findOne({
         where: {
            id: salesUser.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });
      const finLeadService = new FinancierLeadService(null, null, currentUser);
      const currentMonth = DateUtils.getCurrentMonthDates(new Date());
      const filter = {
        "fromDate": currentMonth.from_date,
        "toDate": currentMonth.to_date,
        "name": lead.name
      };
      const paging = {
        "limit": 5,
        "pageno": 1,
      };
      finLeadService.fetchLeadsByFilter(filter, paging, (fetchError, leads) => {
        assert.isNotNull(leads, 'Leads matched with the leadStatus');
      });
    });

    it('returns error, coz current user is not set', async () => {
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
      const salesRole = await app.Roles.findOne({ where: { name: 'FINANCIER_SALES' } });
      await factory.create('UserRole', {
        user_id: salesUser.id,
        role_id: salesRole.id,
        principalId: salesUser.id
      });
      const financierTeam =  await factory.create('FinancierTeam', {
        financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
      });
      const financierTeamMember =  await factory.create('FinancierTeamMember', {
        financier_id: financier.id, city_id: city.id, user_id: salesUser.id,
        financier_team_id: financierTeam.id
      });
      const lead = await factory.create('FinancierLead', {status: 500, financier_id: financier.id, assigned_to: salesUser.id,
      financier_team_id: financierTeam.id});
      const currentUser = await app.Users.findOne({
         where: {
            id: salesUser.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });
      const finLeadService = new FinancierLeadService(null, null);
      const currentMonth = DateUtils.getCurrentMonthDates(new Date());
      const filter = {
        "fromDate": currentMonth.from_date,
        "toDate": currentMonth.to_date,
        "name": lead.name
      };
      const paging = {
        "limit": 5,
        "pageno": 1,
      };
      finLeadService.fetchLeadsByFilter(filter, paging, (fetchError, leads) => {
        assert.isNotNull(leads, 'Leads matched with the leadStatus');
      });
    });
  });

  describe('Add comments for the lead', () => {
    it('add comments', async () => {
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
      const salesRole = await app.Roles.findOne({ where: { name: 'FINANCIER_SALES' } });
      await factory.create('UserRole', {
        user_id: salesUser.id,
        role_id: salesRole.id,
        principalId: salesUser.id
      });
      const financierTeam =  await factory.create('FinancierTeam', {
        financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
      });
      const financierTeamMember =  await factory.create('FinancierTeamMember', {
        financier_id: financier.id, city_id: city.id, user_id: salesUser.id,
        financier_team_id: financierTeam.id
      });
      const lead = await factory.create('FinancierLead', {status: 500, financier_id: financier.id, assigned_to: salesUser.id,
      financier_team_id: financierTeam.id});
      const currentUser = await app.Users.findOne({
         where: {
            id: salesUser.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });
      const finLeadService = new FinancierLeadService(lead.id, null, currentUser);
      const leadActivity = {
        "comment": 'Hello',
      };
      finLeadService.addCommentToLead(leadActivity, (fetchError, leads) => {
        assert.isNotNull(leads, 'Leads matched with the leadStatus');
      });
    });

    it('returns error, coz lead id is not set', async () => {
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
      const salesRole = await app.Roles.findOne({ where: { name: 'FINANCIER_SALES' } });
      await factory.create('UserRole', {
        user_id: salesUser.id,
        role_id: salesRole.id,
        principalId: salesUser.id
      });
      const financierTeam =  await factory.create('FinancierTeam', {
        financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
      });
      const financierTeamMember =  await factory.create('FinancierTeamMember', {
        financier_id: financier.id, city_id: city.id, user_id: salesUser.id,
        financier_team_id: financierTeam.id
      });
      const lead = await factory.create('FinancierLead', {status: 500, financier_id: financier.id, assigned_to: salesUser.id,
      financier_team_id: financierTeam.id});
      const currentUser = await app.Users.findOne({
         where: {
            id: salesUser.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });
      const finLeadService = new FinancierLeadService(salesUser.id, null, currentUser);
      const leadActivity = {
      };
      finLeadService.addCommentToLead(leadActivity, (fetchError, leads) => {
        assert.isNotNull(fetchError, 'Comments Add error');
      });
    });
    it('returns error, coz comment is not set', async () => {
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
      const salesRole = await app.Roles.findOne({ where: { name: 'FINANCIER_SALES' } });
      await factory.create('UserRole', {
        user_id: salesUser.id,
        role_id: salesRole.id,
        principalId: salesUser.id
      });
      const financierTeam =  await factory.create('FinancierTeam', {
        financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
      });
      const financierTeamMember =  await factory.create('FinancierTeamMember', {
        financier_id: financier.id, city_id: city.id, user_id: salesUser.id,
        financier_team_id: financierTeam.id
      });
      const lead = await factory.create('FinancierLead', {status: 500, financier_id: financier.id, assigned_to: salesUser.id,
      financier_team_id: financierTeam.id});
      const currentUser = await app.Users.findOne({
         where: {
            id: salesUser.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });
      const finLeadService = new FinancierLeadService(lead.id, null, currentUser);
      const leadActivity = {
      };
      finLeadService.addCommentToLead(leadActivity, (fetchError, leads) => {
        assert.isNotNull(fetchError, 'Comments Add error');
      });
    });

    it('returns error, coz comment is not set', async () => {
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
      const salesRole = await app.Roles.findOne({ where: { name: 'FINANCIER_SALES' } });
      await factory.create('UserRole', {
        user_id: salesUser.id,
        role_id: salesRole.id,
        principalId: salesUser.id
      });
      const financierTeam =  await factory.create('FinancierTeam', {
        financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
      });
      const financierTeamMember =  await factory.create('FinancierTeamMember', {
        financier_id: financier.id, city_id: city.id, user_id: salesUser.id,
        financier_team_id: financierTeam.id
      });
      const lead = await factory.create('FinancierLead', {status: 500, financier_id: financier.id, assigned_to: salesUser.id,
      financier_team_id: financierTeam.id});
      const currentUser = await app.Users.findOne({
         where: {
            id: salesUser.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });
      const finLeadService = new FinancierLeadService(null, null, currentUser);
      const leadActivity = {
      };
      finLeadService.addCommentToLead(leadActivity, (fetchError, leads) => {
        assert.isNotNull(fetchError, 'Comments Add error');
      });
    });
  });

  describe('Add followups for the lead', () => {
    it('add followup', async () => {
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
      const salesRole = await app.Roles.findOne({ where: { name: 'FINANCIER_SALES' } });
      await factory.create('UserRole', {
        user_id: salesUser.id,
        role_id: salesRole.id,
        principalId: salesUser.id
      });
      const financierTeam =  await factory.create('FinancierTeam', {
        financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
      });
      const financierTeamMember =  await factory.create('FinancierTeamMember', {
        financier_id: financier.id, city_id: city.id, user_id: salesUser.id,
        financier_team_id: financierTeam.id
      });
      const lead = await factory.create('FinancierLead', {status: 500, financier_id: financier.id, assigned_to: salesUser.id,
      financier_team_id: financierTeam.id});
      const currentUser = await app.Users.findOne({
         where: {
            id: salesUser.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });
      const finLeadService = new FinancierLeadService(lead.id, null, currentUser);
      const currentMonth = DateUtils.getCurrentMonthDates(new Date());
      const followup = {
        "follow_up_at": currentMonth.to_date,
        "comment": 'We will discuss tomorrow',
      };
      finLeadService.scheduleFollowup(followup, (fetchError, leads) => {
        assert.isNotNull(leads, 'followup done');
      });
    });

    it('followup - lead id wrong', async () => {
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
      const salesRole = await app.Roles.findOne({ where: { name: 'FINANCIER_SALES' } });
      await factory.create('UserRole', {
        user_id: salesUser.id,
        role_id: salesRole.id,
        principalId: salesUser.id
      });
      const financierTeam =  await factory.create('FinancierTeam', {
        financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
      });
      const financierTeamMember =  await factory.create('FinancierTeamMember', {
        financier_id: financier.id, city_id: city.id, user_id: salesUser.id,
        financier_team_id: financierTeam.id
      });
      const lead = await factory.create('FinancierLead', {status: 500, financier_id: financier.id, assigned_to: salesUser.id,
      financier_team_id: financierTeam.id});
      const currentUser = await app.Users.findOne({
         where: {
            id: salesUser.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });
      const finLeadService = new FinancierLeadService(salesRole.id, null, currentUser);
      const currentMonth = DateUtils.getCurrentMonthDates(new Date());
      const followup = {
        "follow_up_at": currentMonth.to_date,
        "comment": 'We will discuss tomorrow',
      };
      finLeadService.scheduleFollowup(followup, (fetchError, leads) => {
        assert.isNotNull(fetchError, 'lead id wrong');
      });
    });

    it('followup - error, sent empty params', async () => {
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
      const salesRole = await app.Roles.findOne({ where: { name: 'FINANCIER_SALES' } });
      await factory.create('UserRole', {
        user_id: salesUser.id,
        role_id: salesRole.id,
        principalId: salesUser.id
      });
      const financierTeam =  await factory.create('FinancierTeam', {
        financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
      });
      const financierTeamMember =  await factory.create('FinancierTeamMember', {
        financier_id: financier.id, city_id: city.id, user_id: salesUser.id,
        financier_team_id: financierTeam.id
      });
      const lead = await factory.create('FinancierLead', {status: 500, financier_id: financier.id, assigned_to: salesUser.id,
      financier_team_id: financierTeam.id});
      const currentUser = await app.Users.findOne({
         where: {
            id: salesUser.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });
      const finLeadService = new FinancierLeadService();
      const currentMonth = DateUtils.getCurrentMonthDates(new Date());
      const followup = {
      };
      finLeadService.scheduleFollowup(followup, (fetchError, leads) => {
        assert.isNotNull(fetchError, 'lead id wrong');
      });
    });
  });
});
