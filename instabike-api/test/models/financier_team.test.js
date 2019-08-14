const loopback = require('../../server/server.js');
const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
const factory = require('../factory.js');
const faker = require('faker/locale/en_IND');
const DateUtils = require('../../server/utils/date_utils');

const app = loopback.dataSources.postgres.models;

describe('FinancierTeam', () => {

  describe('GET /api/FinancierTeams/:teamId/detail', () => {
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
      const financierTeam =  await factory.create('FinancierTeam', { financier_id: financier.id, owned_by: teamHeadUser.id });
      const financierDealer =  await factory.create('FinancierDealer',
        { financier_id: financier.id,  financier_team_id: financierTeam.id, from_date: new Date(), user_id: null });
      const accesstoken = await factory.create('AccessToken', {userId: cityHeadUser.id});
      request(loopback)
        .get('/api/FinancierTeams/'+ financierTeam.id +'/detail')
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .expect(200)
        .end((err, res) => {
          expect(res.body.financierTeam).to.not.equal(null);
        });
    });
  });

  describe('GET /api/FinancierTeams/:teamId/members/dealers/unassigned', () => {
    it('Get dealers associated to a team and unassociated to any sales-user', async () => {
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
      const financierTeam =  await factory.create('FinancierTeam', { financier_id: financier.id, owned_by: teamHeadUser.id });
      const financierDealer =  await factory.create('FinancierDealer',
        { financier_id: financier.id,  financier_team_id: financierTeam.id, from_date: new Date(), user_id: null });
      const accesstoken = await factory.create('AccessToken', {userId: cityHeadUser.id});
      request(loopback)
        .get('/api/FinancierTeams/'+ financierTeam.id +'/members/dealers/unassigned')
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .expect(200)
        .end((err, res) => {
          expect(res.body.length).to.not.equal(0);
        });
    });
  });

  describe('POST /api/FinancierTeams/:teamId/dealership/leadEffectiveness', () => {
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
        .post('/api/FinancierTeams/'+ financierTeam.id +'/dealership/leadEffectiveness')
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .send(filter)
        .expect(200)
        .end((err, res) => {
          expect(res.body.length).to.not.equal(0);
        });
    });
  });

  describe('PUT /api/FinancierTeams/:teamId/dealers/:dealerId/assignedUser/update', () => {
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
      const accesstoken = await factory.create('AccessToken', {userId: cityHeadUser.id});
      request(loopback)
        .put('/api/FinancierTeams/'+ financierTeam.id +'/dealers/'+ dealer.id +'/assignedUser/update')
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .send(newUser)
        .expect(200)
        .end((err, res) => {
          expect(res.body).to.not.equal(null);
        });
    });
  });

  describe('POST /api/FinancierTeams/:teamId/dealers/:dealerId/memberSummary', () => {
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
        .post('/api/FinancierTeams/'+ financierTeam.id +'/dealers/'+ dealer.id +'/memberSummary')
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .send(filter)
        .expect(200)
        .end((err, res) => {
          expect(res.body.length).to.not.equal(0);
        });
    });
  });

  describe('POST /api/FinancierTeams/:teamId/members/:userId/markDeleted', () => {
    it('Deleted member from team successfully', async () => {
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
      const accesstoken = await factory.create('AccessToken', {userId: cityHeadUser.id});
      request(loopback)
        .put('/api/FinancierTeams/'+ financierTeam.id +'/members/'+ salesUser.id +'/markDeleted')
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .expect(200)
        .end((err, res) => {
          expect(res).to.not.equal(null);
        });
    });
  });

  describe('POST /api/FinancierTeams/:teamId/Dealers/:dealerId/monthlySummary', () => {
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
        .post('/api/FinancierTeams/'+ financierTeam.id +'/Dealers/'+ dealer.id +'/monthlySummary')
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .send(filter)
        .expect(200)
        .end((err, res) => {
          expect(res.body.length).to.not.equal(0);
        });
    });
  });
});
