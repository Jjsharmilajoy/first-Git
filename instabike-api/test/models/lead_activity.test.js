const loopback = require('../../server/server.js');
const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
const factory = require('../factory.js');
const faker = require('faker/locale/en_IND');
const constants = require('../../server/utils/constants/userConstants');

const app = loopback.dataSources.postgres.models;

describe('LeadActivity', () => {
  describe('GET /api/Leads/:leadId/activities', () => {
    it('Get Leads activities', async () => {
      const manufacturer = await factory.create('Manufacturer');
      const lead = await factory.create('Lead', {category: 'NEW', manufacturer_id: manufacturer.id});
      const leadActivity = await factory.create('LeadActivity', { lead_id: lead.id });
      const accesstoken = await factory.create('AccessToken');
      const role = await app.Roles.findOne({ where: { name: 'MANUFACTURER' } });
      const userRole = await factory.create('UserRole', {
        user_id: accesstoken.userId,
        principalId: accesstoken.userId,
        role_id: role.id,
      });
      const filter = {
        manufacturer_id: manufacturer.id
      };
      request(loopback)
        .get('/api/Leads/'+lead.id+'/activities')
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .expect(200)
        .end((err, res) => {
          expect(res.body.length).to.not.equal(0);
        });
    });
  });
})
