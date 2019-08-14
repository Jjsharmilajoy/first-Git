const loopback = require('../../server/server.js');
const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
const factory = require('../factory.js');
const LeadActivityService = require('../../server/services/lead_activity_service.js');
const constants = require('../../server/utils/constants/userConstants');

const app = loopback.dataSources.postgres.models;

describe('Lead activity Service',() => {
  describe('get activity for lead', () => {
    it('get activity for lead', async () => {
      const manufacturer = await factory.create('Manufacturer');
      const dealer =  await factory.create('Dealer');
      const saleRole = await app.Roles.findOne({ where: { name: 'DEALER_SALES' } });
      const user = await factory.create('User', { user_type_id: dealer.id });
      const executiveUserRole = await factory.create('UserRole', { user_id: user.id, role_id: saleRole.id });
      const newLead = await factory.create('Lead',
        { dealer_id: dealer.id, assigned_to: user.id, category: 'NEW',
          manufacturer_id: manufacturer.id, status: 200 });
      const followup = await factory.create('FollowUp', { lead_id: newLead.id });
      const leadActivity = await factory.create('LeadActivity', { comment: 'comment example', lead_id: newLead.id });
      const currentUser = await app.Users.findOne({
        where: {
          id: user.id
        },
        include: {
          relation: "user_role",
          scope: { include: "role" }
        }
      });
      const leadActivityService = new LeadActivityService(newLead.id);
      leadActivityService.getActivity((error, leadActivities) => {
        assert.notEqual(leadActivities.length, 0);
      });
    });
  });
})
