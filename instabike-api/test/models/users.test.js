const loopback = require('../../server/server.js');
const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
const factory = require('../factory.js');
const faker = require('faker/locale/en_IND');

const app = loopback.dataSources.postgres.models;

describe('Users', () => {

  describe('GET /api/Users/passwordToken/:accessToken/validate', () => {
    it('Get Zones', async () => {
      const cityHeadUser = await factory.create('User', { user_type_name: 'Financier' });
      const accesstoken = await factory.create('AccessToken', { userId: cityHeadUser.id });
      request(loopback)
        .get('/api/Users/passwordToken/' + accesstoken.id + '/validate')
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          expect(res.body.isValid).to.equal(true);
        });
    });
  });

  describe('GET /api/Users/:userId/detail', () => {
    it('Get user detail, roles associated and reporting manager', async () => {
      const financier =  await factory.create('Financier');
      const cityHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_CITY_HEAD' } });
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier' });
      await factory.create('UserRole', { user_id: cityHeadUser.id, role_id: cityHeadRole.id });
      const teamHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_TEAM_HEAD' } });
      const teamHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', manager_id: cityHeadUser.id });
      await factory.create('UserRole', { user_id: teamHeadUser.id, role_id: teamHeadRole.id });
      const accesstoken = await factory.create('AccessToken', {userId: teamHeadUser.id});
      request(loopback)
        .get('/api/Users/'+ teamHeadUser.id +'/detail')
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .expect(200)
        .end((err, res) => {
          expect(res.body.user.manager.id).to.equal(cityHeadUser.id);
        });
    });
  });
});
