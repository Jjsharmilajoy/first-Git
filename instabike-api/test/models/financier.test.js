const loopback = require('../../server/server.js');
const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
const factory = require('../factory.js');
const faker = require('faker/locale/en_IND');
const DateUtils = require('../../server/utils/date_utils');

const app = loopback.dataSources.postgres.models;

describe('Financier', () => {

  describe('GET /api/Financiers/forgotPassword', () => {
    it('Send forgot-password mail', async () => {
      const financier =  await factory.create('Financier');
      const cityHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_CITY_HEAD' } });
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier'});
      const managerUserRole = await factory.create('UserRole', { user_id: cityHeadUser.id, principalId: cityHeadUser.id, role_id: cityHeadRole.id })
      request(loopback)
        .get('/api/Financiers/forgotPassword')
        .set('Accept', 'application/json')
        .send('email='+cityHeadUser.email)
        .expect(200)
        .end((err, res) => {
          expect(res.body.message).to.equal('Sent Successfully');
        });
    });
  });

  describe('GET /api/Financiers/:financierId/Users/:userId/homeBranch', () => {
    it('Get financier-branch detail for the given financier-user', async () => {
      const financier =  await factory.create('Financier');
      const city =  await factory.create('City');
      const cityHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_CITY_HEAD' } });
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
      await factory.create('UserRole', {
        user_id: cityHeadUser.id,
        role_id: cityHeadRole.id,
        principalId: cityHeadUser.id
      });
      const accesstoken = await factory.create('AccessToken', {userId: cityHeadUser.id});
      const financierBranch = await factory.create('FinancierBranch', {
        financier_id: financier.id,
        city_id: city.id,
        financier_city_head_id: cityHeadUser.id,
        is_home_branch: true,
      });
      request(loopback)
        .get('/api/Financiers/'+ financier.id +'/Users/' + cityHeadUser.id + '/homeBranch')
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .expect(200)
        .end((err, res) => {
          expect(res.body.financierBranch).to.not.equal(null);
        });
    });
  });

  describe('GET /api/Financiers/:financierId/Users/:userId/dealers', () => {
    it('Get Financier-dealers associated to financier-user', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_CITY_HEAD' } });
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
      await factory.create('UserRole', {
        user_id: cityHeadUser.id,
        role_id: cityHeadRole.id,
        principalId: cityHeadUser.id
      });
      const teamHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_TEAM_HEAD' } });
      const teamHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', manager_id: cityHeadUser.id, city_id: city.id });
      await factory.create('UserRole', { user_id: teamHeadUser.id, role_id: teamHeadRole.id })
      const dealer = await factory.create('Dealer', { city_id: cityHeadUser.city_id });
      const dealerFinancier = await factory.create('DealerFinancier', {
        dealer_id : dealer.id,
        financier_id: financier.id,
      });
      const fianancierTeam = await factory.create('FinancierTeam', {
        dealer_id : dealer.id,
        financier_id: financier.id,
        city_id: cityHeadUser.city_id,
        owned_by: teamHeadUser.id
      });
      const fianancierDealer = await factory.create('FinancierDealer', {
        dealer_id : dealer.id,
        financier_id: financier.id,
        city_id: cityHeadUser.city_id,
        user_id: cityHeadUser.id,
        financier_team_id: fianancierTeam.id
      });
      const accesstoken = await factory.create('AccessToken', {userId: cityHeadUser.id});
      request(loopback)
        .get('/api/Financiers/'+ financier.id +'/Users/' + cityHeadUser.id + '/dealers')
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .expect(200)
        .end((err, res) => {
          expect(res.body.financierUserDealers.length).to.not.equal(0);
        });
    });
  });

  describe('GET /api/Financiers/:financierId/Users/:userId/dealers/unassigned', () => {
    it('Get Financier-dealers associated and un-associated to a financier', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_CITY_HEAD' } });
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
      await factory.create('UserRole', {
        user_id: cityHeadUser.id,
        role_id: cityHeadRole.id,
        principalId: cityHeadUser.id
      });
      const teamHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_TEAM_HEAD' } });
      const teamHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', manager_id: cityHeadUser.id, city_id: city.id });
      await factory.create('UserRole', { user_id: teamHeadUser.id, role_id: teamHeadRole.id })
      const dealer = await factory.create('Dealer', { city_id: cityHeadUser.city_id });
      const dealerFinancier = await factory.create('DealerFinancier', {
        dealer_id : dealer.id,
        financier_id: financier.id,
        city_id: cityHeadUser.city_id,
      });
      const accesstoken = await factory.create('AccessToken', {userId: cityHeadUser.id});
      request(loopback)
        .get('/api/Financiers/'+ financier.id +'/Users/' + cityHeadUser.id + '/dealers/unassigned')
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .expect(200)
        .end((err, res) => {
          expect(res.body.allDealerships.length).to.not.equal(0);
        });
    });
  });

  describe('GET /api/Financiers/:financierId/Users/:userId/teamLeads/unassigned', () => {
    it('Get Financier-dealers associated and un-associated to a financier', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_CITY_HEAD' } });
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
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
      await factory.create('UserRole', { user_id: teamHeadUser.id, role_id: teamHeadRole.id })
      const accesstoken = await factory.create('AccessToken', {userId: cityHeadUser.id});
      const filter = { searchField: "email", searchValue : teamHeadUser.email, limit: 10 };
      request(loopback)
        .post('/api/Financiers/'+ financier.id +'/Users/' + cityHeadUser.id + '/teamLeads/unassigned')
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .send(filter)
        .expect(200)
        .end((err, res) => {
          expect(res.body.teamLeads.length).to.not.equal(0);
        });
    });
  });

  describe('GET /api/Financiers/:financierId/Users/:userId/salesExecutives/unassigned', () => {
    it('Get Financier-dealers associated and un-associated to a financier', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_CITY_HEAD' } });
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
      await factory.create('UserRole', {
        user_id: cityHeadUser.id,
        role_id: cityHeadRole.id,
        principalId: cityHeadUser.id
      });
      const salesUser = await factory.create('User', {
        user_type_id: financier.id,
        user_type_name: 'Financier',
        city_id: city.id
      });
      const salesRole = await app.Roles.findOne({ where: { name: 'FINANCIER_SALES' } });
      await factory.create('UserRole', {
        user_id: salesUser.id,
        role_id: salesRole.id,
        principalId: salesUser.id
      });
      const accesstoken = await factory.create('AccessToken', {userId: cityHeadUser.id});
      const filter = { searchField: "email", searchValue : salesUser.email, limit: 10 };
      request(loopback)
        .post('/api/Financiers/'+ financier.id +'/Users/' + cityHeadUser.id + '/salesExecutives/unassigned')
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .send(filter)
        .expect(200)
        .end((err, res) => {
          expect(res.body.salesExecutives.length).to.not.equal(0);
        });
    });
  });

  describe('GET /api/Financiers/:financierId/Users/:userId/createTeam', () => {
    it('Create and return a new financier-team', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_CITY_HEAD' } });
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
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
      const salesUser = await factory.create('User', {
        user_type_id: financier.id,
        user_type_name: 'Financier',
        city_id: city.id
      });
      const dealer = await factory.create('Dealer', { city_id: cityHeadUser.city_id });
      const dealerFinancier = await factory.create('DealerFinancier', {
        dealer_id : dealer.id,
        financier_id: financier.id,
      });
      const accesstoken = await factory.create('AccessToken', {userId: cityHeadUser.id});
      const financierTeam	 = { name: "team 1", teamHeadId: teamHeadUser.id, dealerIds: [dealer.id],
        salesExecutiveIds: [salesUser.id] };
      request(loopback)
        .post('/api/Financiers/'+ financier.id +'/Users/' + cityHeadUser.id + '/createTeam')
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .send(financierTeam	)
        .expect(200)
        .end((err, res) => {
          expect(res.body.team).to.not.equal(null);
        });
    });
  });

  describe('GET /api/Financiers/:financierId/Users/:userId/teams', () => {
    it('Get teams of a city head user', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_CITY_HEAD' } });
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
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
      const financierTeam =  await factory.create('FinancierTeam', {
        financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
      });
      const accesstoken = await factory.create('AccessToken', {userId: cityHeadUser.id});
      request(loopback)
        .get('/api/Financiers/'+ financier.id +'/Users/'+ cityHeadUser.id +'/teams')
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .expect(200)
        .end((err, res) => {
          expect(res.body.teams.length).to.not.equal(0);
        });
    });
  });

  describe('GET /api/Financiers/:financierId/Users/:userId/myTeam', () => {
    it('Get teams owned by team-head user', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_CITY_HEAD' } });
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
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
      const financierTeam =  await factory.create('FinancierTeam', {
        financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
      });
      const accesstoken = await factory.create('AccessToken', {userId: cityHeadUser.id});
      request(loopback)
        .get('/api/Financiers/'+ financier.id +'/Users/'+ teamHeadUser.id +'/myTeam')
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .expect(200)
        .end((err, res) => {
          expect(res.body.teams.length).to.not.equal(0);
        });
    });
  });

  describe('GET /api/Financiers/:financierId/teamsTarget', () => {
    it('Get teams target for last month, current month and next month', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_CITY_HEAD' } });
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
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
      const accesstoken = await factory.create('AccessToken', {userId: cityHeadUser.id});
      request(loopback)
        .get('/api/Financiers/'+ financier.id +'/teamsTarget')
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .expect(200)
        .end((err, res) => {
          expect(res.body.targets.length).to.not.equal(0);
        });
    });
  });

  describe('GET /api/Financiers/:financierId/teams/:temId/memberTarget', () => {
    it('Get teams-member target for last month, current month and next month', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_CITY_HEAD' } });
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
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
      const monthNames = ["jan", "feb", "mar", "apr", "may", "jun","jul", "aug", "sep", "oct", "nov", "dec"];
      const currentMonth = DateUtils.getCurrentMonthDates(new Date());
      const lastMonth = DateUtils.getLastMonthDates(new Date());
      const nextMonth = DateUtils.getNextMonthDates(new Date());
      const financierTeam =  await factory.create('FinancierTeam', {
        financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
      });
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
      const accesstoken = await factory.create('AccessToken', {userId: cityHeadUser.id});
      request(loopback)
        .get('/api/Financiers/'+ financier.id +'/teams/'+ financierTeam.id +'/memberTarget')
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .expect(200)
        .end((err, res) => {
          expect(res.body.targets.length).to.not.equal(0);
        });
    });
  });

  describe('GET /api/Financiers/:financierId/teams/:temId/nextMonthTarget/available', () => {
    it('Check if team-target is set for the next month based on team-id', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_CITY_HEAD' } });
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
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
      const monthNames = ["jan", "feb", "mar", "apr", "may", "jun","jul", "aug", "sep", "oct", "nov", "dec"];
      const nextMonth = DateUtils.getNextMonthDates(new Date());
      const financierTeam =  await factory.create('FinancierTeam', {
        financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
      });
      const currentMonthFinancierTarget = await factory.create('FinancierTarget', {
        name: monthNames[new Date().getMonth()], from: nextMonth.from_date,
        to: nextMonth.to_date, fianancier_id: financier.id, user_id: teamHeadUser.id,
        financier_team_id: financierTeam.id
      });
      const accesstoken = await factory.create('AccessToken', {userId: cityHeadUser.id});
      request(loopback)
        .get('/api/Financiers/'+ financier.id +'/teams/'+ financierTeam.id +'/nextMonthTarget/available')
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .expect(200)
        .end((err, res) => {
          expect(res.body).to.not.equal(null);
        });
    });
  });

  describe('GET /api/Financiers/:financierId/Users/:userId/nextMonthTarget/available', () => {
    it('Check if team-target is set for the next month based on team-id', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_CITY_HEAD' } });
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
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
      const monthNames = ["jan", "feb", "mar", "apr", "may", "jun","jul", "aug", "sep", "oct", "nov", "dec"];
      const nextMonth = DateUtils.getNextMonthDates(new Date());
      const financierTeam =  await factory.create('FinancierTeam', {
        financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
      });
      const financierTarget = await factory.create('FinancierTarget', {
        name: monthNames[new Date().getMonth()], from: nextMonth.from_date,
        to: nextMonth.to_date, fianancier_id: financier.id, user_id: null,
        financier_team_id: financierTeam.id
      });
      const accesstoken = await factory.create('AccessToken', {userId: cityHeadUser.id});
      request(loopback)
        .get('/api/Financiers/'+ financier.id +'/Users/'+ cityHeadUser.id +'/nextMonthTarget/available')
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .expect(200)
        .end((err, res) => {
          expect(res.body).to.not.equal(null);
        });
    });
  });

  describe('GET /api/Financiers/:financierId/teams/:temId/newMember', () => {
    it('Create or add a new team-member to exsisting team', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_CITY_HEAD' } });
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
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
      const financierTeam =  await factory.create('FinancierTeam', {
        financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
      });
      const dealer = await factory.create('Dealer', { city_id: cityHeadUser.city_id });
      const dealerFinancier = await factory.create('DealerFinancier', {
        dealer_id : dealer.id,
        financier_id: financier.id,
      });
      const salesUser = await factory.create('User', {
        user_type_id: financier.id,
        user_type_name: 'Financier',
        city_id: city.id
      });
      const newMembers = { teamMembers: [salesUser], dealerIds: [dealer.id] };
      const accesstoken = await factory.create('AccessToken', {userId: cityHeadUser.id});
      request(loopback)
        .post('/api/Financiers/'+ financier.id +'/teams/'+ financierTeam.id +'/newMember')
        .set('Accept', 'application/json')
        .send(newMembers)
        .set('Authorization', accesstoken.id)
        .expect(200)
        .end((err, res) => {
          expect(res.body.message).to.not.equal(null);
        });
    });
  });

  describe('GET /api/Financiers/:financierId/Users/:userId/performance', () => {
    it('Check if team-target is set for the next month based on team-id', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_CITY_HEAD' } });
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
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
      const monthNames = ["jan", "feb", "mar", "apr", "may", "jun","jul", "aug", "sep", "oct", "nov", "dec"];
      const nextMonth = DateUtils.getNextMonthDates(new Date());
      const financierTeam =  await factory.create('FinancierTeam', {
        financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
      });
      const financierTarget = await factory.create('FinancierTarget', {
        name: monthNames[new Date().getMonth()], from: nextMonth.from_date,
        to: nextMonth.to_date, fianancier_id: financier.id, user_id: teamHeadUser.id,
        financier_team_id: financierTeam.id
      });
      const filter = { fromDate: "2018-07-01", toDate: "2018-07-31" };
      const accesstoken = await factory.create('AccessToken', {userId: cityHeadUser.id});
      request(loopback)
        .post('/api/Financiers/'+ financier.id +'/Users/'+ teamHeadUser.id +'/performance')
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .send(filter)
        .expect(200)
        .end((err, res) => {
          expect(res.body.userPerformance).to.not.equal(null);
        });
    });
  });

  describe('GET /api/Financiers/:financierId/Users/:userId/overallSummary', () => {
    it('Get overall performance-summary of all teams by city-head', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_CITY_HEAD' } });
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
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
      const monthNames = ["jan", "feb", "mar", "apr", "may", "jun","jul", "aug", "sep", "oct", "nov", "dec"];
      const nextMonth = DateUtils.getNextMonthDates(new Date());
      const financierTeam =  await factory.create('FinancierTeam', {
        financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
      });
      const financierTarget = await factory.create('FinancierTarget', {
        name: monthNames[new Date().getMonth()], from: nextMonth.from_date,
        to: nextMonth.to_date, fianancier_id: financier.id, user_id: null,
        financier_team_id: financierTeam.id
      });
      const filter = { fromDate: "2018-07-01", toDate: "2018-07-31" };
      const accesstoken = await factory.create('AccessToken', {userId: cityHeadUser.id});
      request(loopback)
        .post('/api/Financiers/'+ financier.id +'/Users/'+ cityHeadUser.id +'/overallSummary')
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .send(filter)
        .expect(200)
        .end((err, res) => {
          expect(res.body.performance).to.not.equal(null);
        });
    });
  });

  describe('GET /api/Financiers/:financierId/teams/:teamId/summary', () => {
    it('Get team performance-summary of all teams by team-id', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_CITY_HEAD' } });
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
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
      const monthNames = ["jan", "feb", "mar", "apr", "may", "jun","jul", "aug", "sep", "oct", "nov", "dec"];
      const nextMonth = DateUtils.getNextMonthDates(new Date());
      const financierTeam =  await factory.create('FinancierTeam', {
        financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
      });
      const financierTarget = await factory.create('FinancierTarget', {
        name: monthNames[new Date().getMonth()], from: nextMonth.from_date,
        to: nextMonth.to_date, fianancier_id: financier.id, user_id: teamHeadUser.id,
        financier_team_id: financierTeam.id
      });
      const filter = { fromDate: "2018-07-01", toDate: "2018-07-31" };
      const accesstoken = await factory.create('AccessToken', {userId: cityHeadUser.id});
      request(loopback)
        .post('/api/Financiers/'+ financier.id +'/teams/'+ financierTeam.id +'/summary')
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .send(filter)
        .expect(200)
        .end((err, res) => {
          expect(res.body.performance).to.not.equal(null);
        });
    });
  });

  describe('GET /api/Financiers/:financierId/teams/:teamId/monthlyPerformance', () => {
    it('Get team performance-summary of all teams by team-id', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_CITY_HEAD' } });
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
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
      const monthNames = ["jan", "feb", "mar", "apr", "may", "jun","jul", "aug", "sep", "oct", "nov", "dec"];
      const currentMonth = DateUtils.getCurrentMonthDates(new Date());
      const financierTeam =  await factory.create('FinancierTeam', { financier_id: financier.id, owned_by: teamHeadUser.id });
      const financierLead = await factory.create('FinancierLead', {
        fianancier_id: financier.id, user_id: teamHeadUser.id, assigned_to: teamHeadUser.id,
        financier_team_id: financierTeam.id, status: 500
      });
      const financialYearDate = DateUtils.getFinancialYearDates(new Date());
      const filter = { fromDate: financialYearDate.from_date, toDate: financialYearDate.to_date };
      const accesstoken = await factory.create('AccessToken', {userId: cityHeadUser.id});
      request(loopback)
        .post('/api/Financiers/'+ financier.id +'/teams/'+ financierTeam.id +'/monthlyPerformance')
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .send(filter)
        .expect(200)
        .end((err, res) => {
          expect(res.body.length).to.not.equal(0);
        });
    });
  });

  describe('GET /api/Financiers/:financierId/Users/:userId/teams/performance', () => {
    it('Get overall performance of all teams by city-head', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_CITY_HEAD' } });
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
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
      const monthNames = ["jan", "feb", "mar", "apr", "may", "jun","jul", "aug", "sep", "oct", "nov", "dec"];
      const nextMonth = DateUtils.getNextMonthDates(new Date());
      const financierTeam =  await factory.create('FinancierTeam', {
        financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
      });
      const financierTarget = await factory.create('FinancierTarget', {
        name: monthNames[new Date().getMonth()], from: nextMonth.from_date,
        to: nextMonth.to_date, fianancier_id: financier.id, user_id: null,
        financier_team_id: financierTeam.id
      });
      const financierLead = await factory.create('FinancierLead', {
        fianancier_id: financier.id, user_id: teamHeadUser.id, assigned_to: teamHeadUser.id,
        financier_team_id: financierTeam.id, status: 500
      });
      const financialYearDate = DateUtils.getFinancialYearDates(new Date());
      const filter = { fromDate: financialYearDate.from_date, toDate: financialYearDate.to_date };
      const accesstoken = await factory.create('AccessToken', {userId: cityHeadUser.id});
      request(loopback)
        .post('/api/Financiers/'+ financier.id +'/Users/'+ cityHeadUser.id +'/teams/performance')
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .send(filter)
        .expect(200)
        .end((err, res) => {
          expect(res.body.performance).to.not.equal(null);
        });
    });
  });

  describe('GET /api/Financiers/:financierId/teams/:teamId/leadSummary', () => {
    it('Get overall performance of all teams by team-id', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_CITY_HEAD' } });
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
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
      const monthNames = ["jan", "feb", "mar", "apr", "may", "jun","jul", "aug", "sep", "oct", "nov", "dec"];
      const nextMonth = DateUtils.getNextMonthDates(new Date());
      const financierTeam =  await factory.create('FinancierTeam', {
        financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
      });
      const financierTarget = await factory.create('FinancierTarget', {
        name: monthNames[new Date().getMonth()], from: nextMonth.from_date,
        to: nextMonth.to_date, fianancier_id: financier.id, user_id: null,
        financier_team_id: financierTeam.id
      });
      const financierLead = await factory.create('FinancierLead', {
        fianancier_id: financier.id, user_id: teamHeadUser.id, assigned_to: teamHeadUser.id,
        financier_team_id: financierTeam.id, status: 500
      });
      const financialYearDate = DateUtils.getFinancialYearDates(new Date());
      const filter = { fromDate: financialYearDate.from_date, toDate: financialYearDate.to_date };
      const accesstoken = await factory.create('AccessToken', {userId: cityHeadUser.id});
      request(loopback)
        .post('/api/Financiers/'+ financier.id +'/teams/'+ financierTeam.id +'/leadSummary')
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .send(filter)
        .expect(200)
        .end((err, res) => {
          expect(res.body.length).to.not.equal(0);
        });
    });
  });

  describe('GET /api/Financiers/:financierId/overall/leadSummary', () => {
    it('Get overall performance of all teams by city-head', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_CITY_HEAD' } });
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
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
      const monthNames = ["jan", "feb", "mar", "apr", "may", "jun","jul", "aug", "sep", "oct", "nov", "dec"];
      const nextMonth = DateUtils.getNextMonthDates(new Date());
      const financierTeam =  await factory.create('FinancierTeam', {
        financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
      });
      const financierTarget = await factory.create('FinancierTarget', {
        name: monthNames[new Date().getMonth()], from: nextMonth.from_date,
        to: nextMonth.to_date, fianancier_id: financier.id, user_id: null,
        financier_team_id: financierTeam.id
      });
      const financierLead = await factory.create('FinancierLead', {
        fianancier_id: financier.id, user_id: teamHeadUser.id, assigned_to: teamHeadUser.id,
        financier_team_id: financierTeam.id, status: 500
      });
      const financialYearDate = DateUtils.getFinancialYearDates(new Date());
      const filter = { fromDate: financialYearDate.from_date, toDate: financialYearDate.to_date };
      const accesstoken = await factory.create('AccessToken', {userId: cityHeadUser.id});
      request(loopback)
        .post('/api/Financiers/'+ financier.id +'/overall/leadSummary')
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .send(filter)
        .expect(200)
        .end((err, res) => {
          expect(res.body).to.not.equal(null);
        });
    });
  });

  describe('GET /api/Financiers/:financierId/teams/:teamId/dealers/leadSummary', () => {
    it('Get dealer-based-summary based on team-id', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_CITY_HEAD' } });
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
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
      const monthNames = ["jan", "feb", "mar", "apr", "may", "jun","jul", "aug", "sep", "oct", "nov", "dec"];
      const nextMonth = DateUtils.getNextMonthDates(new Date());
      const financierTeam =  await factory.create('FinancierTeam', {
        financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
      });
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
      const accesstoken = await factory.create('AccessToken', {userId: cityHeadUser.id});
      request(loopback)
        .post('/api/Financiers/'+ financier.id +'/teams/'+ financierTeam.id +'/dealers/leadSummary')
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .send(filter)
        .expect(200)
        .end((err, res) => {
          expect(res.body.length).to.not.equal(0);
        });
    });
  });

  describe('GET /api/Financiers/:financierId/Users/:userId/dealershipPerformance', () => {
    it('Get financier-sales-user based dealership-performance', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_CITY_HEAD' } });
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
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
      const monthNames = ["jan", "feb", "mar", "apr", "may", "jun","jul", "aug", "sep", "oct", "nov", "dec"];
      const nextMonth = DateUtils.getNextMonthDates(new Date());
      const financierTeam =  await factory.create('FinancierTeam', {
        financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
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
      const financialYearDate = DateUtils.getFinancialYearDates(new Date());
      const filter = { fromDate: financialYearDate.from_date, toDate: financialYearDate.to_date };
      const accesstoken = await factory.create('AccessToken', {userId: cityHeadUser.id});
      request(loopback)
        .post('/api/Financiers/'+ financier.id +'/Users/'+ teamHeadUser.id +'/dealershipPerformance')
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .send(filter)
        .expect(200)
        .end((err, res) => {
          expect(res.body.length).to.not.equal(0);
        });
    });
  });

  describe('POST /api/Financiers/:financierId/Dealers/:dealerId/monthlySummary', () => {
    it('Get dealer-based monthly lead-report', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_CITY_HEAD' } });
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
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
      const monthNames = ["jan", "feb", "mar", "apr", "may", "jun","jul", "aug", "sep", "oct", "nov", "dec"];
      const nextMonth = DateUtils.getNextMonthDates(new Date());
      const financierTeam =  await factory.create('FinancierTeam', {
        financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
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
      const financialYearDate = DateUtils.getFinancialYearDates(new Date());
      const filter = { fromDate: financialYearDate.from_date, toDate: financialYearDate.to_date };
      const accesstoken = await factory.create('AccessToken', {userId: cityHeadUser.id});
      request(loopback)
        .post('/api/Financiers/'+ financier.id +'/Dealers/'+ dealer.id +'/monthlySummary')
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .send(filter)
        .expect(200)
        .end((err, res) => {
          expect(res.body.length).to.not.equal(0);
        });
    });
  });

  describe('POST /api/Financiers/:financierId/dealership/leadEffectiveness', () => {
    it('Get dealership lead-effectiveness across teams', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_CITY_HEAD' } });
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
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
      const financierTeam =  await factory.create('FinancierTeam', {
        financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
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
      const financialYearDate = DateUtils.getFinancialYearDates(new Date());
      const filter = { fromDate: financialYearDate.from_date, toDate: financialYearDate.to_date };
      const accesstoken = await factory.create('AccessToken', {userId: cityHeadUser.id});
      request(loopback)
        .post('/api/Financiers/'+ financier.id +'/dealership/leadEffectiveness')
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .send(filter)
        .expect(200)
        .end((err, res) => {
          expect(res.body.length).to.not.equal(0);
        });
    });
  });

  describe('GET /api/Financiers/:financierId/team/:financierTeamId/users', () => {
    it('Get list of financier-members and the team-lead for a given team-id', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_CITY_HEAD' } });
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
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
      const financierTeam =  await factory.create('FinancierTeam', {
        financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
      });
      const accesstoken = await factory.create('AccessToken', {userId: cityHeadUser.id});
      request(loopback)
        .get('/api/Financiers/'+ financier.id +'/team/'+ financierTeam.id + '/users')
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .expect(200)
        .end((err, res) => {
          expect(res.body.length).to.not.equal(0);
        });
    });
  });

  describe('GET /api/Financiers/:financierId/activeIncentive', () => {
    it('Get current-active financier-incentive based on city and financier', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_CITY_HEAD' } });
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
      await factory.create('UserRole', {
        user_id: cityHeadUser.id,
        role_id: cityHeadRole.id,
        principalId: cityHeadUser.id
      });
      const financierIncentive = await factory.create('FinancierIncentive', {
        fianancier_id: financier.id, city_id: city.id
      });
      const accesstoken = await factory.create('AccessToken', {userId: cityHeadUser.id});
      request(loopback)
        .get('/api/Financiers/'+ financier.id +'/activeIncentive')
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .expect(200)
        .end((err, res) => {
          expect(res.body.id).to.equal(financierIncentive.id);
        });
    });
  });

  describe('POST /api/Financiers/:financierId/incentives/update', () => {
    it('Update incentive amount based on city and financier', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_CITY_HEAD' } });
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
      await factory.create('UserRole', {
        user_id: cityHeadUser.id,
        role_id: cityHeadRole.id,
        principalId: cityHeadUser.id
      });
      const financierIncentive = await factory.create('FinancierIncentive', {
        fianancier_id: financier.id, city_id: city.id
      });
      const newIncentive = {incentive_amount: 150};
      const accesstoken = await factory.create('AccessToken', {userId: cityHeadUser.id});
      request(loopback)
        .post('/api/Financiers/'+ financier.id +'/incentives/update')
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .send(newIncentive)
        .expect(200)
        .end((err, res) => {
          expect(res.body).to.not.equal(null);
        });
    });
  });
});
