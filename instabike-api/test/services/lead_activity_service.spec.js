const loopback = require('../../server/server.js');
const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
const factory = require('../factory.js');
const faker = require('faker/locale/en_IND');

const LeadActivityService = require('../../server/services/lead_activity_service.js');
const app = loopback.dataSources.postgres.models;

describe('LeadActivityService', () => {

  let lead = null;
  let currentUser = null;
  let leadActivityService = null;
  let dealerSalesTwo = null;
  let financierLead = null;
  let leadDetail = null;
  before(async () => {
    currentUser = await factory.create('User');
    const user = await factory.create('User');
    const dealer = await factory.create('Dealer');
    const saleRole = await app.Roles.findOne({ where: { name: 'DEALER_SALES' } });
    const dealerSalesOne = await factory.create('User', { user_type_id: dealer.id });
    dealerSalesTwo = await factory.create('User', { user_type_id: dealer.id });
    lead = await factory.create('Lead', {dealer_id: dealer.id, user_id: user.id,
      category: 'COLD', assigned_to: dealerSalesOne.id, status: 200});
    leadActivityService = new LeadActivityService(lead.id);
  });

  describe('Activity', async () => {
    describe('Create category change activity', async () => {
      it('Category change activity created', () => {
        lead.category = 'WARM';
        leadActivityService.saveLeadActivity(lead, currentUser, (err, success) => {
          assert.isNotNull(err, "Updated Successfully");
        });
      });
    });
    describe('Create reassigned activity', async () => {
      it('Reassigned activity created', () => {
        lead.assigned_to = dealerSalesTwo.id;
        leadActivityService.saveLeadActivity(lead, currentUser, (err, success) => {
          assert.isNotNull(err, "Updated Successfully");
        });
      });
    });
    describe('Create invoiced activity', async () => {
      it('Invoiced activity created', () => {
        lead.status = 600;
        leadActivityService.saveLeadActivity(lead, currentUser, (err, success) => {
          assert.isNotNull(err, "Updated Successfully");
        });
      });
    });
    describe('Create lost activity', async () => {
      it('Lost activity created', () => {
        lead.status = 900;
        leadActivityService.saveLeadActivity(lead, currentUser, (err, success) => {
          assert.isNotNull(err, "Updated Successfully");
        });
      });
    });
    describe('Get all activities', async () => {
      it('Activities listed', () => {
        leadActivityService.getActivity((err, success) => {
          assert.notEqual(success.length, 0, 'Activities listed');
        });
      });
    });
  });

});
