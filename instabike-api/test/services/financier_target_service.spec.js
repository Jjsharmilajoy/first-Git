const loopback = require('../../server/server.js');
const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
const factory = require('../factory.js');
const FinancierTargetService = require('../../server/services/financier_target_service.js');
const DateUtils = require('../../server/utils/date_utils');

const app = loopback.dataSources.postgres.models;

describe('FinancierTargetService', () => {

  describe('getMembersTargetCompletion', () => {
    it('returns the team-member target for last month, current month and next month', async () => {
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
      const teamHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_TEAM_HEAD' } });
      await factory.create('UserRole', {
        user_id: teamHeadUser.id,
        role_id: teamHeadRole.id,
        principalId: teamHeadUser.id
      });
      const monthNames = ["jan", "feb", "mar", "apr", "may", "jun","jul", "aug", "sep", "oct", "nov", "dec"];
      const currentMonth = DateUtils.getCurrentMonthDates(new Date());
      const lastMonth = DateUtils.getLastMonthDates(new Date());
      const nextMonth = DateUtils.getNextMonthDates(new Date());
      const financierTeam =  await factory.create('FinancierTeam', { financier_id: financier.id, owned_by: teamHeadUser.id });
      const currentMonthFinancierTarget = await factory.create('FinancierTarget', {
        name: monthNames[new Date().getMonth()], from: currentMonth.from_date,
        to: currentMonth.to_date, fianancier_id: financier.id, user_id: teamHeadUser.id,
        financier_team_id: financierTeam.id
      });
      const lastMonthFinancierTarget = await factory.create('FinancierTarget', {
        name: monthNames[new Date().getMonth() - 1], from: lastMonth.from_date,
        to: lastMonth.to_date, fianancier_id: financier.id, user_id: teamHeadUser.id,
        financier_team_id: financierTeam.id
      });
      const financierTargetService = new FinancierTargetService(financier.id, cityHeadUser);
      financierTargetService.getMembersTargetCompletion(financierTeam.id, (err, result) => {
        assert.notEqual(result.targets.length, 0, 'Team-member targets fetched successfully');
      });
    });
  });

  describe('getTeamsTargetCompletion', () => {
    it('returns the teams target for last month, current month and next month', async () => {
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
      const teamHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_TEAM_HEAD' } });
      await factory.create('UserRole', {
        user_id: teamHeadUser.id,
        role_id: teamHeadRole.id,
        principalId: teamHeadUser.id
      });
      const monthNames = ["jan", "feb", "mar", "apr", "may", "jun","jul", "aug", "sep", "oct", "nov", "dec"];
      const currentMonth = DateUtils.getCurrentMonthDates(new Date());
      const lastMonth = DateUtils.getLastMonthDates(new Date());
      const nextMonth = DateUtils.getNextMonthDates(new Date());
      const financierTeam =  await factory.create('FinancierTeam', {
        financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
      });
      const currentMonthFinancierTarget = await factory.create('FinancierTarget', {
        name: monthNames[new Date().getMonth()], from: currentMonth.from_date,
        to: currentMonth.to_date, fianancier_id: financier.id, user_id: null,
        financier_team_id: financierTeam.id
      });
      const lastMonthFinancierTarget = await factory.create('FinancierTarget', {
        name: monthNames[new Date().getMonth() - 1], from: lastMonth.from_date,
        to: lastMonth.to_date, fianancier_id: financier.id, user_id: null,
        financier_team_id: financierTeam.id
      });
      const financierTargetService = new FinancierTargetService(financier.id, cityHeadUser);
      financierTargetService.getTeamsTargetCompletion(city.id, (err, result) => {
        assert.notEqual(result.targets.length, 0, 'Teams targets fetched successfully');
      });
    });
  });

  describe('checkNextMonthMemberTarget', () => {
    it('returns if team-member-target is set for the next month based on team-id', async () => {
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
      const teamHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_TEAM_HEAD' } });
      await factory.create('UserRole', {
        user_id: teamHeadUser.id,
        role_id: teamHeadRole.id,
        principalId: teamHeadUser.id
      });
      const monthNames = ["jan", "feb", "mar", "apr", "may", "jun","jul", "aug", "sep", "oct", "nov", "dec"];
      const nextMonth = DateUtils.getNextMonthDates(new Date());
      const financierTeam =  await factory.create('FinancierTeam', {
        financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
      });
      const nextMonthFinancierTarget = await factory.create('FinancierTarget', {
        name: monthNames[new Date().getMonth()], from: nextMonth.from_date,
        to: nextMonth.to_date, fianancier_id: financier.id, user_id: teamHeadUser.id,
        financier_team_id: financierTeam.id
      });
      const financierTargetService = new FinancierTargetService(financier.id, cityHeadUser);
      financierTargetService.checkNextMonthMemberTarget(financierTeam.id, (err, result) => {
        assert.notEqual(result, null, 'Next-month member target availability fetched successfully');
      });
    });
  });

  describe('checkNextMonthTeamTarget', () => {
    it('returns if team-target is set for the next month based on team-id', async () => {
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
      const nextMonth = DateUtils.getNextMonthDates(new Date());
      const financierTeam =  await factory.create('FinancierTeam', {
        financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
      });
      const nextMonthFinancierTarget = await factory.create('FinancierTarget', {
        name: monthNames[new Date().getMonth()], from: nextMonth.from_date,
        to: nextMonth.to_date, fianancier_id: financier.id, user_id: null,
        financier_team_id: financierTeam.id
      });
      const financierTargetService = new FinancierTargetService(financier.id, cityHeadUser);
      financierTargetService.checkNextMonthTeamTarget(cityHeadUser.id, (err, result) => {
        assert.notEqual(result, null, 'Next-month team target availability fetched successfully');
      });
    });
  });

  describe('getTargetCompletion', () => {
    it('returns the city head teams target for given months', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
      const cityHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_CITY_HEAD' } });
      await factory.create('UserRole', {
        user_id: cityHeadUser.id,
        role_id: cityHeadRole.id,
        principalId: cityHeadUser.id
      });
      const teamHeadUser = await factory.create('User', {
        user_type_id: financier.id,
        user_type_name: 'Financier',
        manager_id: cityHeadUser.id,
        city_id: city.id
      });
      const teamHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_TEAM_HEAD' } });
      await factory.create('UserRole', {
        user_id: teamHeadUser.id,
        role_id: teamHeadRole.id,
        principalId: teamHeadUser.id
      });
      const currentUser = await app.Users.findOne({ where:
        {id: cityHeadUser.id},
      include: {
        relation: "user_role",
        scope: { include: "role" }
      }});
      const monthNames = ["jan", "feb", "mar", "apr", "may", "jun","jul", "aug", "sep", "oct", "nov", "dec"];
      const currentMonth = DateUtils.getCurrentMonthDates(new Date());
      const lastMonth = DateUtils.getLastMonthDates(new Date());
      const nextMonth = DateUtils.getNextMonthDates(new Date());
      const financierTeam =  await factory.create('FinancierTeam', {
        financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
      });
      const currentMonthFinancierTarget = await factory.create('FinancierTarget', {
        name: monthNames[new Date().getMonth()], from: currentMonth.from_date,
        to: currentMonth.to_date, fianancier_id: financier.id, user_id: null,
        financier_team_id: financierTeam.id
      });
      const lastMonthFinancierTarget = await factory.create('FinancierTarget', {
        name: monthNames[new Date().getMonth() - 1], from: lastMonth.from_date,
        to: lastMonth.to_date, fianancier_id: financier.id, user_id: null,
        financier_team_id: financierTeam.id
      });
      const financierTargetService = new FinancierTargetService(financier.id, currentUser);
      const filter = {
        "fromDate": "2018-01-01T00:00:00.000Z",
        "toDate": "2019-03-31T00:00:00.000Z",
      };
      financierTargetService.getTargetCompletion(filter, (err, result) => {
        assert.notEqual(result.length, 0, 'Teams targets fetched successfully');
      });
    });

    it('returns error coz, current user data is not set', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
      const cityHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_CITY_HEAD' } });
      await factory.create('UserRole', {
        user_id: cityHeadUser.id,
        role_id: cityHeadRole.id,
        principalId: cityHeadUser.id
      });
      const teamHeadUser = await factory.create('User', {
        user_type_id: financier.id,
        user_type_name: 'Financier',
        manager_id: cityHeadUser.id,
        city_id: city.id
      });
      const teamHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_TEAM_HEAD' } });
      await factory.create('UserRole', {
        user_id: teamHeadUser.id,
        role_id: teamHeadRole.id,
        principalId: teamHeadUser.id
      });
      const currentUser = await app.Users.findOne({ where:
        {id: cityHeadUser.id},
      include: {
        relation: "user_role",
        scope: { include: "role" }
      }});
      const monthNames = ["jan", "feb", "mar", "apr", "may", "jun","jul", "aug", "sep", "oct", "nov", "dec"];
      const currentMonth = DateUtils.getCurrentMonthDates(new Date());
      const lastMonth = DateUtils.getLastMonthDates(new Date());
      const nextMonth = DateUtils.getNextMonthDates(new Date());
      const financierTeam =  await factory.create('FinancierTeam', {
        financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
      });
      const currentMonthFinancierTarget = await factory.create('FinancierTarget', {
        name: monthNames[new Date().getMonth()], from: currentMonth.from_date,
        to: currentMonth.to_date, fianancier_id: financier.id, user_id: null,
        financier_team_id: financierTeam.id
      });
      const lastMonthFinancierTarget = await factory.create('FinancierTarget', {
        name: monthNames[new Date().getMonth() - 1], from: lastMonth.from_date,
        to: lastMonth.to_date, fianancier_id: financier.id, user_id: null,
        financier_team_id: financierTeam.id
      });
      const financierTargetService = new FinancierTargetService(financier.id);
      const filter = {
        "fromDate": "2018-01-01T00:00:00.000Z",
        "toDate": "2019-03-31T00:00:00.000Z",
      };
      financierTargetService.getTargetCompletion(filter, (err, result) => {
        assert.notEqual(err, null, 'Teams targets error');
      });
    });

    it('returns error coz, from date not set', async () => {
        const city = await factory.create('City');
        const financier =  await factory.create('Financier');
        const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
          user_type_name: 'Financier', city_id: city.id });
        const cityHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_CITY_HEAD' } });
        await factory.create('UserRole', {
          user_id: cityHeadUser.id,
          role_id: cityHeadRole.id,
          principalId: cityHeadUser.id
        });
        const teamHeadUser = await factory.create('User', {
          user_type_id: financier.id,
          user_type_name: 'Financier',
          manager_id: cityHeadUser.id,
          city_id: city.id
        });
        const teamHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_TEAM_HEAD' } });
        await factory.create('UserRole', {
          user_id: teamHeadUser.id,
          role_id: teamHeadRole.id,
          principalId: teamHeadUser.id
        });
        const currentUser = await app.Users.findOne({ where:
          {id: cityHeadUser.id},
        include: {
          relation: "user_role",
          scope: { include: "role" }
        }});
        const monthNames = ["jan", "feb", "mar", "apr", "may", "jun","jul", "aug", "sep", "oct", "nov", "dec"];
        const currentMonth = DateUtils.getCurrentMonthDates(new Date());
        const lastMonth = DateUtils.getLastMonthDates(new Date());
        const nextMonth = DateUtils.getNextMonthDates(new Date());
        const financierTeam =  await factory.create('FinancierTeam', {
          financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
        });
        const currentMonthFinancierTarget = await factory.create('FinancierTarget', {
          name: monthNames[new Date().getMonth()], from: currentMonth.from_date,
          to: currentMonth.to_date, fianancier_id: financier.id, user_id: null,
          financier_team_id: financierTeam.id
        });
        const lastMonthFinancierTarget = await factory.create('FinancierTarget', {
          name: monthNames[new Date().getMonth() - 1], from: lastMonth.from_date,
          to: lastMonth.to_date, fianancier_id: financier.id, user_id: null,
          financier_team_id: financierTeam.id
        });
        const financierTargetService = new FinancierTargetService(financier.id, currentUser);
        const filter = {
          "toDate": "2019-03-31T00:00:00.000Z",
        };
        financierTargetService.getTargetCompletion(filter, (err, result) => {
          assert.notEqual(result, null, 'Teams targets error');
        });
      });

  });

  describe('getSalesPerformance', () => {
    it('returns the sales performance based on City Head teams for given months', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
      const cityHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_CITY_HEAD' } });
      await factory.create('UserRole', {
        user_id: cityHeadUser.id,
        role_id: cityHeadRole.id,
        principalId: cityHeadUser.id
      });
      const teamHeadUser = await factory.create('User', {
        user_type_id: financier.id,
        user_type_name: 'Financier',
        manager_id: cityHeadUser.id,
        city_id: city.id
      });
      const teamHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_TEAM_HEAD' } });
      await factory.create('UserRole', {
        user_id: teamHeadUser.id,
        role_id: teamHeadRole.id,
        principalId: teamHeadUser.id
      });
      const currentUser = await app.Users.findOne({ where:
        {id: cityHeadUser.id},
      include: {
        relation: "user_role",
        scope: { include: "role" }
      }});
      const monthNames = ["jan", "feb", "mar", "apr", "may", "jun","jul", "aug", "sep", "oct", "nov", "dec"];
      const currentMonth = DateUtils.getCurrentMonthDates(new Date());
      const lastMonth = DateUtils.getLastMonthDates(new Date());
      const nextMonth = DateUtils.getNextMonthDates(new Date());
      const financierTeam =  await factory.create('FinancierTeam', {
        financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
      });
      const currentMonthFinancierTarget = await factory.create('FinancierTarget', {
        name: monthNames[new Date().getMonth()], from: currentMonth.from_date,
        to: currentMonth.to_date, fianancier_id: financier.id, user_id: null,
        financier_team_id: financierTeam.id
      });
      const lastMonthFinancierTarget = await factory.create('FinancierTarget', {
        name: monthNames[new Date().getMonth() - 1], from: lastMonth.from_date,
        to: lastMonth.to_date, fianancier_id: financier.id, user_id: null,
        financier_team_id: financierTeam.id
      });
      const financierTargetService = new FinancierTargetService(financier.id, currentUser);
      const filter = {
        "fromDate": "2018-01-01T00:00:00.000Z",
        "toDate": "2019-03-31T00:00:00.000Z",
      };
      financierTargetService.getTeamSalesPerformance(filter, (err, result) => {
        assert.notEqual(result.length, 0, 'Teams targets fetched successfully');
      });
    });

    it('returns error coz, City head data is not set', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
      const cityHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_CITY_HEAD' } });
      await factory.create('UserRole', {
        user_id: cityHeadUser.id,
        role_id: cityHeadRole.id,
        principalId: cityHeadUser.id
      });
      const teamHeadUser = await factory.create('User', {
        user_type_id: financier.id,
        user_type_name: 'Financier',
        manager_id: cityHeadUser.id,
        city_id: city.id
      });
      const teamHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_TEAM_HEAD' } });
      await factory.create('UserRole', {
        user_id: teamHeadUser.id,
        role_id: teamHeadRole.id,
        principalId: teamHeadUser.id
      });
      const monthNames = ["jan", "feb", "mar", "apr", "may", "jun","jul", "aug", "sep", "oct", "nov", "dec"];
      const currentMonth = DateUtils.getCurrentMonthDates(new Date());
      const lastMonth = DateUtils.getLastMonthDates(new Date());
      const nextMonth = DateUtils.getNextMonthDates(new Date());
      const financierTeam =  await factory.create('FinancierTeam', {
        financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
      });
      const currentMonthFinancierTarget = await factory.create('FinancierTarget', {
        name: monthNames[new Date().getMonth()], from: currentMonth.from_date,
        to: currentMonth.to_date, fianancier_id: financier.id, user_id: null,
        financier_team_id: financierTeam.id
      });
      const lastMonthFinancierTarget = await factory.create('FinancierTarget', {
        name: monthNames[new Date().getMonth() - 1], from: lastMonth.from_date,
        to: lastMonth.to_date, fianancier_id: financier.id, user_id: null,
        financier_team_id: financierTeam.id
      });
      const financierTargetService = new FinancierTargetService(financier.id);
      const filter = {
        "fromDate": "2018-01-01T00:00:00.000Z",
        "toDate": "2019-03-31T00:00:00.000Z",
      };
      financierTargetService.getTeamSalesPerformance(filter, (err, result) => {
        assert.notEqual(err.length, 0, 'Teams targets error');
      });
    });

    it('returns error coz, from date not set', async () => {
        const city = await factory.create('City');
        const financier =  await factory.create('Financier');
        const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
          user_type_name: 'Financier', city_id: city.id });
        const cityHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_CITY_HEAD' } });
        await factory.create('UserRole', {
          user_id: cityHeadUser.id,
          role_id: cityHeadRole.id,
          principalId: cityHeadUser.id
        });
        const teamHeadUser = await factory.create('User', {
          user_type_id: financier.id,
          user_type_name: 'Financier',
          manager_id: cityHeadUser.id,
          city_id: city.id
        });
        const teamHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_TEAM_HEAD' } });
        await factory.create('UserRole', {
          user_id: teamHeadUser.id,
          role_id: teamHeadRole.id,
          principalId: teamHeadUser.id
        });
        const currentUser = await app.Users.findOne({ where:
          {id: cityHeadUser.id},
        include: {
          relation: "user_role",
          scope: { include: "role" }
        }});
        const monthNames = ["jan", "feb", "mar", "apr", "may", "jun","jul", "aug", "sep", "oct", "nov", "dec"];
        const currentMonth = DateUtils.getCurrentMonthDates(new Date());
        const lastMonth = DateUtils.getLastMonthDates(new Date());
        const nextMonth = DateUtils.getNextMonthDates(new Date());
        const financierTeam =  await factory.create('FinancierTeam', {
          financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
        });
        const currentMonthFinancierTarget = await factory.create('FinancierTarget', {
          name: monthNames[new Date().getMonth()], from: currentMonth.from_date,
          to: currentMonth.to_date, fianancier_id: financier.id, user_id: null,
          financier_team_id: financierTeam.id
        });
        const lastMonthFinancierTarget = await factory.create('FinancierTarget', {
          name: monthNames[new Date().getMonth() - 1], from: lastMonth.from_date,
          to: lastMonth.to_date, fianancier_id: financier.id, user_id: null,
          financier_team_id: financierTeam.id
        });
        const financierTargetService = new FinancierTargetService(financier.id, currentUser);
        const filter = {
          "toDate": "2019-03-31T00:00:00.000Z",
        };
        financierTargetService.getTeamSalesPerformance(filter, (err, result) => {
          assert.notEqual(err.length, 0, 'Teams targets error');
        });
      });

      it('returns the sales performance based on Team Head teams for given months', async () => {
        const city = await factory.create('City');
        const financier =  await factory.create('Financier');
        const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
          user_type_name: 'Financier', city_id: city.id });
        const cityHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_CITY_HEAD' } });
        await factory.create('UserRole', {
          user_id: cityHeadUser.id,
          role_id: cityHeadRole.id,
          principalId: cityHeadUser.id
        });
        const teamHeadUser = await factory.create('User', {
          user_type_id: financier.id,
          user_type_name: 'Financier',
          manager_id: cityHeadUser.id,
          city_id: city.id
        });
        const teamHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_TEAM_HEAD' } });
        await factory.create('UserRole', {
          user_id: teamHeadUser.id,
          role_id: teamHeadRole.id,
          principalId: teamHeadUser.id
        });
        const currentUser = await app.Users.findOne({ where:
          {id: teamHeadUser.id},
        include: {
          relation: "user_role",
          scope: { include: "role" }
        }});
        const monthNames = ["jan", "feb", "mar", "apr", "may", "jun","jul", "aug", "sep", "oct", "nov", "dec"];
        const currentMonth = DateUtils.getCurrentMonthDates(new Date());
        const lastMonth = DateUtils.getLastMonthDates(new Date());
        const nextMonth = DateUtils.getNextMonthDates(new Date());
        const financierTeam =  await factory.create('FinancierTeam', {
          financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
        });
        const currentMonthFinancierTarget = await factory.create('FinancierTarget', {
          name: monthNames[new Date().getMonth()], from: currentMonth.from_date,
          to: currentMonth.to_date, fianancier_id: financier.id, user_id: null,
          financier_team_id: financierTeam.id
        });
        const lastMonthFinancierTarget = await factory.create('FinancierTarget', {
          name: monthNames[new Date().getMonth() - 1], from: lastMonth.from_date,
          to: lastMonth.to_date, fianancier_id: financier.id, user_id: null,
          financier_team_id: financierTeam.id
        });
        const financierTargetService = new FinancierTargetService(financier.id, currentUser);
        const filter = {
          "fromDate": "2018-01-01T00:00:00.000Z",
          "toDate": "2019-03-31T00:00:00.000Z",
        };
        financierTargetService.getTeamSalesPerformance(filter, (err, result) => {
          assert.notEqual(result.length, 0, 'Teams targets fetched successfully');
        });
      });

      it('returns error coz, City head data is not set', async () => {
        const city = await factory.create('City');
        const financier =  await factory.create('Financier');
        const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
          user_type_name: 'Financier', city_id: city.id });
        const cityHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_CITY_HEAD' } });
        await factory.create('UserRole', {
          user_id: cityHeadUser.id,
          role_id: cityHeadRole.id,
          principalId: cityHeadUser.id
        });
        const teamHeadUser = await factory.create('User', {
          user_type_id: financier.id,
          user_type_name: 'Financier',
          manager_id: cityHeadUser.id,
          city_id: city.id
        });
        const teamHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_TEAM_HEAD' } });
        await factory.create('UserRole', {
          user_id: teamHeadUser.id,
          role_id: teamHeadRole.id,
          principalId: teamHeadUser.id
        });
        const monthNames = ["jan", "feb", "mar", "apr", "may", "jun","jul", "aug", "sep", "oct", "nov", "dec"];
        const currentMonth = DateUtils.getCurrentMonthDates(new Date());
        const lastMonth = DateUtils.getLastMonthDates(new Date());
        const nextMonth = DateUtils.getNextMonthDates(new Date());
        const financierTeam =  await factory.create('FinancierTeam', {
          financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
        });
        const currentMonthFinancierTarget = await factory.create('FinancierTarget', {
          name: monthNames[new Date().getMonth()], from: currentMonth.from_date,
          to: currentMonth.to_date, fianancier_id: financier.id, user_id: null,
          financier_team_id: financierTeam.id
        });
        const lastMonthFinancierTarget = await factory.create('FinancierTarget', {
          name: monthNames[new Date().getMonth() - 1], from: lastMonth.from_date,
          to: lastMonth.to_date, fianancier_id: financier.id, user_id: null,
          financier_team_id: financierTeam.id
        });
        const financierTargetService = new FinancierTargetService(financier.id);
        const filter = {
          "fromDate": "2018-01-01T00:00:00.000Z",
          "toDate": "2019-03-31T00:00:00.000Z",
        };
        financierTargetService.getTeamSalesPerformance(filter, (err, result) => {
          assert.notEqual(err.length, 0, 'Teams targets error');
        });
      });

      it('returns error coz, from date not set', async () => {
          const city = await factory.create('City');
          const financier =  await factory.create('Financier');
          const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
            user_type_name: 'Financier', city_id: city.id });
          const cityHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_CITY_HEAD' } });
          await factory.create('UserRole', {
            user_id: cityHeadUser.id,
            role_id: cityHeadRole.id,
            principalId: cityHeadUser.id
          });
          const teamHeadUser = await factory.create('User', {
            user_type_id: financier.id,
            user_type_name: 'Financier',
            manager_id: cityHeadUser.id,
            city_id: city.id
          });
          const teamHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_TEAM_HEAD' } });
          await factory.create('UserRole', {
            user_id: teamHeadUser.id,
            role_id: teamHeadRole.id,
            principalId: teamHeadUser.id
          });
          const currentUser = await app.Users.findOne({ where:
            {id: teamHeadUser.id},
          include: {
            relation: "user_role",
            scope: { include: "role" }
          }});
          const monthNames = ["jan", "feb", "mar", "apr", "may", "jun","jul", "aug", "sep", "oct", "nov", "dec"];
          const currentMonth = DateUtils.getCurrentMonthDates(new Date());
          const lastMonth = DateUtils.getLastMonthDates(new Date());
          const nextMonth = DateUtils.getNextMonthDates(new Date());
          const financierTeam =  await factory.create('FinancierTeam', {
            financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
          });
          const currentMonthFinancierTarget = await factory.create('FinancierTarget', {
            name: monthNames[new Date().getMonth()], from: currentMonth.from_date,
            to: currentMonth.to_date, fianancier_id: financier.id, user_id: null,
            financier_team_id: financierTeam.id
          });
          const lastMonthFinancierTarget = await factory.create('FinancierTarget', {
            name: monthNames[new Date().getMonth() - 1], from: lastMonth.from_date,
            to: lastMonth.to_date, fianancier_id: financier.id, user_id: null,
            financier_team_id: financierTeam.id
          });
          const financierTargetService = new FinancierTargetService(financier.id, currentUser);
          const filter = {
            "toDate": "2019-03-31T00:00:00.000Z",
          };
          financierTargetService.getTeamSalesPerformance(filter, (err, result) => {
            assert.notEqual(err.length, 0, 'Teams targets error');
          });
        });
  })

  describe('getActiveIncentive', () => {
    it('returns active-incentive based on financier and city-id', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
      const currentMonth = DateUtils.getCurrentMonthDates(new Date());
      const financierIncentive = await factory.create('FinancierIncentive', {
        financier_id: financier.id, city_id: city.id,
        from_date: currentMonth.from_date, to_date: null,
      });
      const financierTargetService = new FinancierTargetService(financier.id, cityHeadUser);
      financierTargetService.getActiveIncentive((err, result) => {
        assert.equal(result.id, financierIncentive.id, 'Active-incentive fetched successfully');
      });
    });
  });

  describe('updateFinancierIncentive', () => {
    it('updates the old incentive to expire, creates and returns a new incentive', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
      const financierIncentive = await factory.create('FinancierIncentive', {
        fianancier_id: financier.id, city_id: city.id
      });
      const financierTargetService = new FinancierTargetService(financier.id, cityHeadUser);
      financierTargetService.updateFinancierIncentive({ incentive_amount: 200 }, (err, result) => {
        assert.notEqual(result, null, 'Financier incentive updated successfully');
      });
    });
  });

  describe('updateFinancierIncentive', () => {
    it('updates the old incentive to expire, creates and returns a new incentive', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
      const financierIncentive = await factory.create('FinancierIncentive', {
        fianancier_id: financier.id, city_id: city.id
      });
      const financierTargetService = new FinancierTargetService(financier.id, cityHeadUser);
      financierTargetService.updateFinancierIncentive({ incentive_amount: 200 }, (err, result) => {
        assert.notEqual(result, null, 'Financier incentive updated successfully');
      });
    });
  });

  describe('beforeUpdateTarget', () => {
    it('before update hook method to update incentive-earned', async () => {
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
      const financierTeam =  await factory.create('FinancierTeam', {
        financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
      });
      const financierIncentive = await factory.create('FinancierIncentive', {
        fianancier_id: financier.id, city_id: city.id, to_date: null,
        from_date: currentMonth.from_date
      });
      const financierTarget = await factory.create('FinancierTarget', {
        name: monthNames[new Date().getMonth()], from: currentMonth.from_date,
        to: currentMonth.to_date, fianancier_id: financier.id, financier_team_id: financierTeam.id,
        user_id: null, target_value: 10, incentive_eligibility: 10, achieved_value: 2
      });
      const financierTargetService = new FinancierTargetService(financier.id, cityHeadUser);
      financierTargetService.beforeUpdateTarget({ id: financierTarget.id,
        incentive_eligibility: 5 }, (err, result) => {
          assert.notEqual(result, null, 'Incentive-earned updated successfully');
        });
    });
    it('before update hook method to update target-value', async () => {
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
      const financierTeam =  await factory.create('FinancierTeam', {
        financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
      });
      const financierIncentive = await factory.create('FinancierIncentive', {
        fianancier_id: financier.id, city_id: city.id
      });
      const financierTarget = await factory.create('FinancierTarget', {
        name: monthNames[new Date().getMonth()], from: currentMonth.from_date,
        to: currentMonth.to_date, fianancier_id: financier.id, financier_team_id: financierTeam.id,
        user_id: null, target_value: 10, incentive_eligibility: 4, achieved_value: 2,
        incentive_earned: 0
      });
      const financierTargetService = new FinancierTargetService(financier.id, cityHeadUser);
      financierTargetService.beforeUpdateTarget({ id: financierTarget.id,
        target_value: 5 }, (err, result) => {
          assert.notEqual(result, null, 'Incentive-earned updated successfully');
        });
    });
    it('before update hook method to update incentive if eligilility is changed', async () => {
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
      const financierTeam =  await factory.create('FinancierTeam', {
        financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
      });
      const financierIncentive = await factory.create('FinancierIncentive', {
        fianancier_id: financier.id, city_id: city.id, from_date: currentMonth.from_date,
        to_date: null
      });
      const financierTarget = await factory.create('FinancierTarget', {
        name: monthNames[new Date().getMonth()], from: currentMonth.from_date,
        to: currentMonth.to_date, fianancier_id: financier.id, financier_team_id: financierTeam.id,
        user_id: null, target_value: 10, incentive_eligibility: 4, achieved_value: 3,
        incentive_earned: 0
      });
      const financierTargetService = new FinancierTargetService(financier.id, cityHeadUser);
      financierTargetService.beforeUpdateTarget({ id: financierTarget.id,
        incentive_eligibility: 2 }, (err, result) => {
          assert.notEqual(result, null, 'Incentive-earned updated successfully');
        });
    });
  });

  describe('beforeCreateTarget', () => {
    it('before create hook method to update incentive-earned', async () => {
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
      const nextMonth = DateUtils.getCurrentMonthDates(new Date());
      const financierTeam =  await factory.create('FinancierTeam', {
        financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
      });
      const financierIncentive = await factory.create('FinancierIncentive', {
        fianancier_id: financier.id, city_id: city.id
      });
      const cmFinancierTarget = await factory.create('FinancierTarget', {
        name: monthNames[new Date().getMonth()], from: currentMonth.from_date,
        to: currentMonth.to_date, fianancier_id: financier.id, financier_team_id: financierTeam.id,
        user_id: null, target_value: 10, incentive_eligibility: 10, achieved_value: 2
      });
      const newFinancierTarget = {
        name: monthNames[new Date().getMonth()], from: nextMonth.from_date,
        to: nextMonth.to_date, fianancier_id: financier.id, financier_team_id: financierTeam.id,
        user_id: null, target_value: 10, incentive_eligibility: 10, achieved_value: 2
      };
      const financierTargetService = new FinancierTargetService(financier.id, cityHeadUser);
      financierTargetService.beforeCreateTarget(newFinancierTarget, (err, result) => {
          assert.notEqual(result, null, 'Financier Target created successfully');
        });
    });
    it('before create hook method to create incentive-eligibility', async () => {
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
      const nextMonth = DateUtils.getCurrentMonthDates(new Date());
      const financierTeam =  await factory.create('FinancierTeam', {
        financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
      });
      const financierIncentive = await factory.create('FinancierIncentive', {
        fianancier_id: financier.id, city_id: city.id
      });
      const newFinancierTarget = {
        name: monthNames[new Date().getMonth()], from: nextMonth.from_date,
        to: nextMonth.to_date, fianancier_id: financier.id, financier_team_id: financierTeam.id,
        user_id: null, target_value: 10, incentive_eligibility: 10, achieved_value: 2
      };
      const financierTargetService = new FinancierTargetService(financier.id, cityHeadUser);
      financierTargetService.beforeCreateTarget(newFinancierTarget, (err, result) => {
          assert.notEqual(result, null, 'Financier Target created successfully');
        });
    });
  });

  describe('updateMonthlyTargets', () => {
    it('returns target-detail with updated values for convertion', async () => {
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
      const nextMonth = DateUtils.getCurrentMonthDates(new Date());
      const financierTeam =  await factory.create('FinancierTeam', {
        financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
      });
      const financierIncentive = await factory.create('FinancierIncentive', {
        fianancier_id: financier.id, city_id: city.id
      });
      const cmFinancierTarget = await factory.create('FinancierTarget', {
        name: monthNames[new Date().getMonth()], from: currentMonth.from_date,
        to: currentMonth.to_date, fianancier_id: financier.id, financier_team_id: financierTeam.id,
        user_id: null, target_value: 1, incentive_eligibility: 1, achieved_value: -0
      });
      const lead = await factory.create('FinancierLead', {status: 520,
        financier_id: financier.id, assigned_to: teamHeadUser.id,
        financier_team_id: financierTeam.id});
      const currentUser = await app.Users.findOne({
         where: {
            id: teamHeadUser.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });
      const financierTargetService = new FinancierTargetService(financier.id, cityHeadUser);
      financierTargetService.updateMonthlyTargets({}, lead, (fetchError, leads) => {
        assert.isNotNull(leads, 'Leads matched with the leadStatus');
      });
    });
    it('returns target-detail with updated values', async () => {
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
      const nextMonth = DateUtils.getCurrentMonthDates(new Date());
      const financierTeam =  await factory.create('FinancierTeam', {
        financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
      });
      const financierIncentive = await factory.create('FinancierIncentive', {
        fianancier_id: financier.id, city_id: city.id
      });
      const cmFinancierTarget = await factory.create('FinancierTarget', {
        name: monthNames[new Date().getMonth()], from: currentMonth.from_date,
        to: currentMonth.to_date, fianancier_id: financier.id, financier_team_id: financierTeam.id,
        user_id: null, target_value: 1, incentive_eligibility: 1, achieved_value: -0
      });
      const lead = await factory.create('FinancierLead', {status: 510,
        financier_id: financier.id, assigned_to: teamHeadUser.id,
        financier_team_id: financierTeam.id});
      const currentUser = await app.Users.findOne({
         where: {
            id: teamHeadUser.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });
      const financierTargetService = new FinancierTargetService(financier.id, cityHeadUser);
      financierTargetService.updateMonthlyTargets({}, lead, (fetchError, leads) => {
        assert.isNotNull(leads, 'Leads matched with the leadStatus');
      });
    });
  });
  describe('sendEmailForTargets', () => {
    it('send email for team-target updation', async () => {
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
      const nextMonth = DateUtils.getCurrentMonthDates(new Date());
      const financierTeam =  await factory.create('FinancierTeam', {
        financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
      });
      const financierIncentive = await factory.create('FinancierIncentive', {
        fianancier_id: financier.id, city_id: city.id
      });
      const cmFinancierTarget = await factory.create('FinancierTarget', {
        name: monthNames[new Date().getMonth()], from: currentMonth.from_date,
        to: currentMonth.to_date, fianancier_id: financier.id, financier_team_id: financierTeam.id,
        user_id: null, target_value: 1, incentive_eligibility: 1, achieved_value: -0
      });
      const currentUser = await app.Users.findOne({
         where: {
            id: teamHeadUser.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });
      const ctx = {
        args: {
          data: { targetType: 'TARGET_UPDATED', updatedValue: 10 },
        }
      };
      const financierTargetService = new FinancierTargetService(financier.id, cityHeadUser);
      financierTargetService.sendEmailForTargets(ctx, cmFinancierTarget, (fetchError, leads) => {
        assert.isNotNull(leads,'Email sent for team-target updation');
      });
    });
    it('send email for team-member-target updation', async () => {
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
      const nextMonth = DateUtils.getCurrentMonthDates(new Date());
      const financierTeam =  await factory.create('FinancierTeam', {
        financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
      });
      const financierIncentive = await factory.create('FinancierIncentive', {
        fianancier_id: financier.id, city_id: city.id
      });
      const cmFinancierUserTarget = await factory.create('FinancierTarget', {
        name: monthNames[new Date().getMonth()], from: currentMonth.from_date,
        to: currentMonth.to_date, fianancier_id: financier.id, financier_team_id: financierTeam.id,
        user_id: teamHeadUser.id, target_value: 1, incentive_eligibility: 1, achieved_value: -0
      });
      const currentUser = await app.Users.findOne({
         where: {
            id: teamHeadUser.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });
      const ctx = {
        args: {
          data: { targetType: 'TARGET_UPDATED', updatedValue: 10 },
        }
      };
      const financierTargetService = new FinancierTargetService(financier.id, cityHeadUser);
      financierTargetService.sendEmailForTargets(ctx, cmFinancierUserTarget, (fetchError, leads) => {
        assert.isNotNull(leads,'Email sent for team-target updation');
      });
    });
  });
});
