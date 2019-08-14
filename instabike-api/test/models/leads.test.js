const loopback = require('../../server/server.js');
const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
const factory = require('../factory.js');
const faker = require('faker/locale/en_IND');
const constants = require('../../server/utils/constants/userConstants');
const DateUtils = require('../../server/utils/date_utils');

const app = loopback.dataSources.postgres.models;

describe('Lead', () => {

  describe('POST /api/Leads/statusCount', () => {
    it('Get Leads count by status', async () => {
      const manufacturer = await factory.create('Manufacturer');
      const lead = await factory.create('Lead', {category: 'NEW', manufacturer_id: manufacturer.id});
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
        .post('/api/Leads/statusCount')
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .send(filter)
        .expect(200)
        .end((err, res) => {
          expect(res.body[0].fresh_leads).to.not.equal(0);
        });
    });
  });

  describe('POST /api/Leads/filter', () => {
    it('Get Leads list by status', async () => {
      const city = await factory.create('City');
      const manufacturer = await factory.create('Manufacturer');
      const lead = await factory.create('Lead', {
        category: 'hot',
        city_id: city.id,
        manufacturer_id: manufacturer.id
      });
      const accesstoken = await factory.create('AccessToken');
      const role = await app.Roles.findOne({ where: { name: 'MANUFACTURER' } });
      const userRole = await factory.create('UserRole', {
        user_id: accesstoken.userId,
        principalId: accesstoken.userId,
        role_id: role.id,
      });
      const filterObject = {
        manufacturer_id: manufacturer.id,
        cityIds: [city.id],
        category: 'hot',
        stateIds: [],
        cityIds: [],
        orderField: "id",
        orderBy: "ASC",
        pageNo: 1,
        limit: 10
      };
      request(loopback)
        .post('/api/Leads/filter')
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .send(filterObject)
        .expect(200)
        .end((err, res) => {
          expect(res.body.leadsCount).to.not.equal(0);
          expect(res.body.leads).to.not.equal(null);
        });
  });
  });

  describe('GET /api/Leads/{leadId}/leadDetail/{leadDetailId}/priceBreakDown', () => {
    it('get vehicle price break down', async () => {

      const dealer =  await factory.create('Dealer');
      const customerRole = await app.Roles.findOne( { where: { name: 'CUSTOMER' } });
      const customerUser = await factory.create('User', { user_type_id: dealer.id, user_type_name: 'Customer', mobile_no: '8876541230', password: 'test1234'});
      const customerUserRole = await factory.create('UserRole', { user_id: customerUser.id, role_id: customerRole.id  });
      const vehicle = await factory.create('Vehicle', { manufacturer_id: dealer.manufacturer_id});
      const variant = await factory.create('Variant', { vehicle_id: vehicle.id});
      const variantColour = await factory.create('VariantColor', { variant_id: variant.id, vehicle_id: vehicle.id});
      const vehiclePrice = await factory.create('VehiclePrice', {manufacturer_id: dealer.manufacturer_id, dealer_id: dealer.id, variant_id: variant.id, vehicle_id: vehicle.id, variant_colours_id: variantColour.id})
      const lead = await factory.create('Lead', { mobile_number: '8876541230', dealer_id: dealer.id, user_id: customerUser.id});
      const leadDetail = await factory.create('LeadDetail', {manufacturer_id: dealer.manufacturer_id,dealer_id: dealer.id, lead_id: lead.id, vehicle_id: vehicle.id, variant_id: variant.id});
      const accesstoken = await factory.create('AccessToken');
      request(loopback)
        .get('/api/Leads/'+lead.id+'/leadDetail/'+leadDetail.id+'/priceBreakDown')
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .expect(200)
        .end((err, res) => {
          expect(res.body.proformaInvoice.lead_id).to.equal(lead.id);
        });
    });
  });

  describe('GET /api/Leads/status/{leadStatus}', () => {
    it('get leads based on status', async () => {
      const dealer =  await factory.create('Dealer');
      const customerRole = await app.Roles.findOne( { where: { name: 'CUSTOMER' } });
      const customerUser = await factory.create('User', { user_type_id: dealer.id, user_type_name: 'Customer', mobile_no: '8876541231', password: 'test1234'});
      const customerUserRole = await factory.create('UserRole', { user_id: customerUser.id, role_id: customerRole.id  });
      const vehicle = await factory.create('Vehicle', { manufacturer_id: dealer.manufacturer_id});
      const variant = await factory.create('Variant', { vehicle_id: vehicle.id});
      const variantColour = await factory.create('VariantColor', { variant_id: variant.id, vehicle_id: vehicle.id});
      const vehiclePrice = await factory.create('VehiclePrice', {manufacturer_id: dealer.manufacturer_id, dealer_id: dealer.id, variant_id: variant.id, vehicle_id: vehicle.id, variant_colours_id: variantColour.id})
      const lead = await factory.create('Lead', { category: 'HOT', status: 500, mobile_number: '8876541231', dealer_id: dealer.id, user_id: customerUser.id});
      const leadDetail = await factory.create('LeadDetail', {manufacturer_id: dealer.manufacturer_id,dealer_id: dealer.id, lead_id: lead.id, vehicle_id: vehicle.id, variant_id: variant.id});
      const accesstoken = await factory.create('AccessToken');
      const role = await app.Roles.findOne({ where: { name: 'DEALER_MANAGER' } });
      const userRole = await factory.create('UserRole', {
        user_id: accesstoken.userId,
        principalId: accesstoken.userId,
        role_id: role.id,
      });
      request(loopback)
        .get('/api/Leads/status/hot')
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .expect(200)
        .end((err, res) => {
          expect(res.body.length).to.equal(0);
        });
    });
  });

  describe('POST /api/Leads/{leadId}/followup', () => {
    it('create a followup', async () => {
      const dealer =  await factory.create('Dealer');
      const customerRole = await app.Roles.findOne( { where: { name: 'CUSTOMER' } });
      const customerUser = await factory.create('User', { user_type_id: dealer.id, user_type_name: 'Customer', mobile_no: '8876541231', password: 'test1234'});
      const customerUserRole = await factory.create('UserRole', { user_id: customerUser.id, role_id: customerRole.id  });
      const lead = await factory.create('Lead', { category: 'HOT', status: 500, mobile_number: '8876541231', dealer_id: dealer.id, assigned_to: customerUser.id});
      const accesstoken = await factory.create('AccessToken');
      const role = await app.Roles.findOne({ where: { name: 'DEALER_MANAGER' } });
      const userRole = await factory.create('UserRole', {
        user_id: accesstoken.userId,
        principalId: accesstoken.userId,
        role_id: role.id,
      });
      request(loopback)
        .post('/api/Leads/'+lead.id +'/followup')
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .expect(200)
        .end((err, res) => {
          expect(res.body).to.not.equal(null);
        });
    });
  });

  describe('PUT /api/Leads/{leadId}/followup/{followupId}', () => {
    it('mark followup complete', async () => {
      const dealer =  await factory.create('Dealer');
      const customerRole = await app.Roles.findOne( { where: { name: 'CUSTOMER' } });
      const customerUser = await factory.create('User', { user_type_id: dealer.id, user_type_name: 'Customer', mobile_no: '8876541231', password: 'test1234'});
      const customerUserRole = await factory.create('UserRole', { user_id: customerUser.id, role_id: customerRole.id  });
      const lead = await factory.create('Lead', { category: 'HOT', status: 500, mobile_number: '8876541231', dealer_id: dealer.id, assigned_to: customerUser.id});
      const accesstoken = await factory.create('AccessToken');
      const role = await app.Roles.findOne({ where: { name: 'DEALER_MANAGER' } });
      const followup = await factory.create('FollowUp', { lead_id: lead.id });
      const userRole = await factory.create('UserRole', {
        user_id: accesstoken.userId,
        principalId: accesstoken.userId,
        role_id: role.id,
      });
      request(loopback)
        .put('/api/Leads/'+lead.id +'/followup/'+followup.id)
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .expect(200)
        .end((err, res) => {
          expect(res.body).to.not.equal(null);
        });
    });
  });

  describe('POST /api/Leads/{leadId}/comment', () => {
    it('add comment to lead', async () => {
      const dealer =  await factory.create('Dealer');
      const customerRole = await app.Roles.findOne( { where: { name: 'CUSTOMER' } });
      const customerUser = await factory.create('User', { user_type_id: dealer.id, user_type_name: 'Customer', mobile_no: '8876541231', password: 'test1234'});
      const customerUserRole = await factory.create('UserRole', { user_id: customerUser.id, role_id: customerRole.id  });
      const lead = await factory.create('Lead', { category: 'HOT', status: 500, mobile_number: '8876541231', dealer_id: dealer.id, assigned_to: customerUser.id});
      const accesstoken = await factory.create('AccessToken');
      const role = await app.Roles.findOne({ where: { name: 'DEALER_MANAGER' } });
      const userRole = await factory.create('UserRole', {
        user_id: accesstoken.userId,
        principalId: accesstoken.userId,
        role_id: role.id,
      });
      request(loopback)
        .post('/api/Leads/'+lead.id +'/comment')
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .send( {comment: 'comments'} )
        .expect(200)
        .end((err, res) => {
          expect(err).to.equal(null);
        });
    });
  });

  describe('POST /api/Leads/monthlySummary/count', () => {
    it('add comment to lead', async () => {
      const dealer =  await factory.create('Dealer');
      const customerRole = await app.Roles.findOne( { where: { name: 'CUSTOMER' } });
      const customerUser = await factory.create('User', { user_type_id: dealer.id, user_type_name: 'Customer', mobile_no: '8876541231', password: 'test1234'});
      const customerUserRole = await factory.create('UserRole', { user_id: customerUser.id, role_id: customerRole.id  });
      const lead = await factory.create('Lead', { category: 'HOT', status: 500, mobile_number: '8876541231', dealer_id: dealer.id, assigned_to: customerUser.id});
      const accesstoken = await factory.create('AccessToken', { userId: customerUser.id });
      const role = await app.Roles.findOne({ where: { name: 'DEALER_MANAGER' } });
      const userRole = await factory.create('UserRole', {
        user_id: accesstoken.userId,
        principalId: accesstoken.userId,
        role_id: role.id,
      });
      request(loopback)
        .get('/api/Leads/monthlySummary/count')
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .expect(200)
        .end((err, res) => {
          expect(res.body.newLeads).to.not.equal(0);
        });
    });
  });

  describe('GET /api/Leads/type/count', () => {
    it('add comment to lead', async () => {
      const dealer =  await factory.create('Dealer');
      const customerRole = await app.Roles.findOne( { where: { name: 'CUSTOMER' } });
      const customerUser = await factory.create('User', { user_type_id: dealer.id, user_type_name: 'Customer', mobile_no: '8876541231', password: 'test1234'});
      const customerUserRole = await factory.create('UserRole', { user_id: customerUser.id, role_id: customerRole.id  });
      const lead = await factory.create('Lead', { category: 'HOT', type: constants.LEAD_TYPES.OFFLINE, mobile_number: '8876541231', dealer_id: dealer.id, assigned_to: customerUser.id});
      const accesstoken = await factory.create('AccessToken', { userId: customerUser.id });
      const role = await app.Roles.findOne({ where: { name: 'DEALER_MANAGER' } });
      const userRole = await factory.create('UserRole', {
        user_id: accesstoken.userId,
        principalId: accesstoken.userId,
        role_id: role.id,
      });
      request(loopback)
        .get('/api/Leads/type/count')
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .expect(200)
        .end((err, res) => {
          expect(res.body.inShowroom).to.not.equal(0);
        });
    });
  });

  describe('GET /api/Leads/followup/count', () => {
    it('add comment to lead', async () => {
      const dealer =  await factory.create('Dealer');
      const customerRole = await app.Roles.findOne( { where: { name: 'CUSTOMER' } });
      const customerUser = await factory.create('User', { user_type_id: dealer.id, user_type_name: 'Customer', mobile_no: '8876541231', password: 'test1234'});
      const customerUserRole = await factory.create('UserRole', { user_id: customerUser.id, role_id: customerRole.id  });
      const lead = await factory.create('Lead', { category: 'HOT', next_followup_on: new Date(), mobile_number: '8876541231', dealer_id: dealer.id, assigned_to: customerUser.id});
      const accesstoken = await factory.create('AccessToken', { userId: customerUser.id });
      const role = await app.Roles.findOne({ where: { name: 'DEALER_MANAGER' } });
      const userRole = await factory.create('UserRole', {
        user_id: accesstoken.userId,
        principalId: accesstoken.userId,
        role_id: role.id,
      });
      request(loopback)
        .get('/api/Leads/followup/count')
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .expect(200)
        .end((err, res) => {
          expect(res.body.inShowroom).to.not.equal(0);
        });
    });
  });

  describe('GET /api/Leads/inShowroom', () => {
    it('get leads for the day as per dealer', async () => {

      const dealer =  await factory.create('Dealer');
      const saleRole = await app.Roles.findOne({ where: { name: 'DEALER_SALES' } });
      const executiveUser = await factory.create('User', { user_type_id: dealer.id });
      const executiveUserRole = await factory.create('UserRole', { user_id: executiveUser.id, role_id: saleRole.id });
      const newLead = await factory.create('Lead', { dealer_id: dealer.id, assigned_to: executiveUser.id, category: 'HOT',
        type: constants.LEAD_TYPES.OFFLINE, is_invoiced: false, is_lost: false });
      const currentUser = await app.Users.findOne({
         where: {
            id: executiveUser.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });
      const accesstoken = await factory.create('AccessToken', { userId: currentUser.id });
      request(loopback)
        .get('/api/Leads/inShowroom')
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .expect(200)
        .end((err, res) => {
          expect(res.body.HOT.length).to.not.equal(0);
        });
    });
  });

  describe('GET /api/Leads/{leadId}', () => {
    it('get leaddetails from leadId', async () => {
      const dealer =  await factory.create('Dealer');
      const saleRole = await app.Roles.findOne({ where: { name: 'DEALER_SALES' } });
      const executiveUser = await factory.create('User', { user_type_id: dealer.id });
      const executiveUserRole = await factory.create('UserRole', { user_id: executiveUser.id, role_id: saleRole.id });
      const newLead = await factory.create('Lead', { dealer_id: dealer.id, assigned_to: executiveUser.id, category: 'HOT',
        type: constants.LEAD_TYPES.OFFLINE, is_invoiced: false, is_lost: false });
      const leadDetail = await factory.create('LeadDetail', {dealer_id: dealer.id, lead_id: newLead.id});
      const currentUser = await app.Users.findOne({
         where: {
            id: executiveUser.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });
      const accesstoken = await factory.create('AccessToken', { userId: currentUser.id });
      request(loopback)
        .get('/api/Leads/' + newLead.id)
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .expect(200)
        .end((err, res) => {
          expect(res.body.id).to.equal(newLead.id);
        });
    });
  });

  describe('post /api/Leads/{leadId}/leadDetail', () => {
    it('create leaddetail', async () => {
      const dealer =  await factory.create('Dealer');
      const saleRole = await app.Roles.findOne({ where: { name: 'DEALER_SALES' } });
      const executiveUser = await factory.create('User', { user_type_id: dealer.id });
      const executiveUserRole = await factory.create('UserRole', { user_id: executiveUser.id, role_id: saleRole.id });
      const newLead = await factory.create('Lead', { dealer_id: dealer.id, assigned_to: executiveUser.id, category: 'HOT',
        type: constants.LEAD_TYPES.OFFLINE, is_invoiced: false, is_lost: false });
      const leadDetail = await factory.build('LeadDetail', {dealer_id: dealer.id});
      const currentUser = await app.Users.findOne({
         where: {
            id: executiveUser.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });
      const leadid = newLead.id;
      const accesstoken = await factory.create('AccessToken', { userId: currentUser.id });
      request(loopback)
        .post('/api/Leads/' + leadid + '/leadDetail')
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .send(leadDetail)
        .expect(200)
        .end((err, res) => {
          expect(err).to.equal(null);
        });
    });
  });

  describe('PUT /api/Leads/{leadId}/lostReason/{lostReasonId}', () => {
    it('create leaddetail', async () => {
      const dealer =  await factory.create('Dealer');
      const saleRole = await app.Roles.findOne({ where: { name: 'DEALER_SALES' } });
      const lostReason = await factory.create('LostReason');
      const executiveUser = await factory.create('User', { user_type_id: dealer.id });
      const executiveUserRole = await factory.create('UserRole', { user_id: executiveUser.id, role_id: saleRole.id });
      const newLead = await factory.create('Lead', { dealer_id: dealer.id, assigned_to: executiveUser.id, category: 'HOT',
        type: constants.LEAD_TYPES.OFFLINE, is_invoiced: false, is_lost: false });
      const leadDetail = await factory.build('LeadDetail', {dealer_id: dealer.id});

      const currentUser = await app.Users.findOne({
         where: {
            id: executiveUser.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });
      const accesstoken = await factory.create('AccessToken', { userId: currentUser.id });
      request(loopback)
        .put('/api/Leads/' + newLead.id + '/lostReason/' + lostReason.id)
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .expect(200)
        .end((err, res) => {
          expect(res.body.message).to.equal(constants.MESSAGE.UPDATE);
        });
    });
  });

  describe('GET /api/Leads/followup/today', () => {
    it('create leaddetail', async () => {
      const dealer =  await factory.create('Dealer');
      const saleRole = await app.Roles.findOne({ where: { name: 'DEALER_SALES' } });
      const executiveUser = await factory.create('User', { user_type_id: dealer.id });
      const executiveUserRole = await factory.create('UserRole', { user_id: executiveUser.id, role_id: saleRole.id });
      const newLead = await factory.create('Lead', { dealer_id: dealer.id, assigned_to: executiveUser.id, category: 'HOT',
        next_followup_on: new Date()});

      const currentUser = await app.Users.findOne({
         where: {
            id: executiveUser.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });
      const accesstoken = await factory.create('AccessToken', { userId: currentUser.id });
      request(loopback)
        .get('/api/Leads/followup/today')
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .expect(200)
        .end((err, res) => {
          expect(res.body.overdue.length).to.not.equal(0);
        });
    });
  });

  describe('GET /api/Leads/followup/done', () => {
    it('create leaddetail', async () => {
      const dealer =  await factory.create('Dealer');
      const saleRole = await app.Roles.findOne({ where: { name: 'DEALER_SALES' } });
      const executiveUser = await factory.create('User', { user_type_id: dealer.id });
      const executiveUserRole = await factory.create('UserRole', { user_id: executiveUser.id, role_id: saleRole.id });
      const newLead = await factory.create('Lead', { dealer_id: dealer.id, assigned_to: executiveUser.id, category: 'HOT',
        last_followup_on: new Date()});
      const currentUser = await app.Users.findOne({
         where: {
            id: executiveUser.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });
      const accesstoken = await factory.create('AccessToken', { userId: currentUser.id });
      request(loopback)
        .get('/api/Leads/followup/done')
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .expect(200)
        .end((err, res) => {
          expect(res.body.HOT.length).to.not.equal(0);
        });
    });
  });

  describe('put /api/Leads/{leadId}/leadDetail/{leadDetailId}/invoiced', () => {
    it('create leaddetail', async () => {
      const manufacturer = await factory.create('Manufacturer');
      const dealer =  await factory.create('Dealer');
      const managerUser = await factory.create('User', { user_type_id: dealer.id });
      const teamLeadUser = await factory.create('User', { user_type_id: dealer.id, manager_id: managerUser.id});
      const salesUser = await factory.create('User', { user_type_id: dealer.id, manager_id: teamLeadUser.id});
      const managerRole = await app.Roles.findOne({ where: {name: 'DEALER_MANAGER' } });
      await factory.create('UserRole', {user_id: managerUser.id, principalId: managerUser.id, role_id: managerRole.id});
      const teamLeadRole = await app.Roles.findOne({ where: {name: 'DEALER_TEAM_HEAD' } });
      await factory.create('UserRole', {user_id: teamLeadUser.id,principalId: teamLeadUser.id,role_id: teamLeadRole.id});
      const salesRole = await app.Roles.findOne({ where: { name: 'DEALER_SALES' } });
      await factory.create('UserRole', {user_id: salesUser.id,principalId: salesUser.id,
        role_id: salesRole.id,
      });
      const newLead = await factory.create('Lead',
        { manufacturer_id: manufacturer.id, dealer_id: dealer.id, assigned_to: salesUser.id, category: 'NEW',
        next_followup_on: new Date() });
      const leadDetail = await factory.create('LeadDetail', { dealer_id: dealer.id, lead_id: newLead.id });
      const leadDetail2 = await factory.create('LeadDetail', { dealer_id: dealer.id, lead_id: newLead.id });
      const followup = await factory.create('FollowUp', { lead_id: newLead.id });
      const currentUser = await app.Users.findOne({
         where: {
            id: salesUser.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });
      const accesstoken = await factory.create('AccessToken', { userId: currentUser.id });
      request(loopback)
        .put('/api/Leads/'+newLead.id+'/leadDetail/'+leadDetail.id+'/invoiced')
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .send({})
        .expect(200)
        .end((err, res) => {
          expect(res.body.status).to.equal(constants.LEAD_STATUS.INVOICED);
        });
    });
  });

  describe('GET /api/Leads/followup/done', () => {
    it('followup done', async () => {
      const dealer =  await factory.create('Dealer');
      const saleRole = await app.Roles.findOne({ where: { name: 'DEALER_SALES' } });
      const executiveUser = await factory.create('User', { user_type_id: dealer.id });
      const executiveUserRole = await factory.create('UserRole', { user_id: executiveUser.id, role_id: saleRole.id });
      const newLead = await factory.create('Lead',
        { dealer_id: dealer.id, assigned_to: executiveUser.id, category: 'HOT',
          followup_done_on: new Date(), status: 310 });
      const currentUser = await app.Users.findOne({
         where: {
            id: executiveUser.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });
      const accesstoken = await factory.create('AccessToken', { userId: currentUser.id });
      request(loopback)
        .get('/api/Leads/followup/done')
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .expect(200)
        .end((err, res) => {
          expect(err).to.equal(null);
        });
    });
  });

  describe('GET /api/Leads/{leadId}/assignedTo/{dealerSalesId}', () => {
    it('return updated lead', async () => {
      const manufacturer = await factory.create('Manufacturer');
      const dealer = await factory.create('Dealer', { manufacturer_id: manufacturer.id});
      const managerUser = await factory.create('User', { user_type_id: dealer.id });
      const teamLeadUser = await factory.create('User', { user_type_id: dealer.id, manager_id: managerUser.id});
      const salesUser1 = await factory.create('User', { user_type_id: dealer.id, manager_id: teamLeadUser.id});
      const salesUser2 = await factory.create('User', { user_type_id: dealer.id, manager_id: teamLeadUser.id});
      const managerRole = await app.Roles.findOne({ where: {name: 'DEALER_MANAGER' } });
      const managerUserRole = await factory.create('UserRole', {user_id: managerUser.id, principalId: managerUser.id, role_id: managerRole.id});
      const teamLeadRole = await app.Roles.findOne({ where: {name: 'DEALER_TEAM_HEAD' } });
      const teamLeadUserRole = await factory.create('UserRole', {user_id: teamLeadUser.id,principalId: teamLeadUser.id,role_id: teamLeadRole.id});
      const salesRole = await app.Roles.findOne({ where: { name: 'DEALER_SALES' } });
      const salesUserRole1 = await factory.create('UserRole', {user_id: salesUser1.id,principalId: salesUser1.id,
        role_id: salesRole.id,
      });
      const salesUserRole2 = await factory.create('UserRole', {
        user_id: salesUser2.id,
        principalId: salesUser2.id,
        role_id: salesRole.id,
      });
      const monthNames = ["jan", "feb", "mar", "apr", "may", "jun","jul", "aug", "sep", "oct", "nov", "dec"];
      const currentMonth = DateUtils.getCurrentMonthDates(new Date());
      const currentMonthDealerTarget1 = await factory.create('DealerTarget',
        {name:monthNames[new Date().getMonth()], from_date:currentMonth.from_date, vehicle_type: 0,
        to_date:currentMonth.to_date, dealer_id: dealer.id, dealer_sales_id: salesUser1.id,
        manufacturer_id: manufacturer.id});
      const currentMonthDealerTarget2 = await factory.create('DealerTarget',
        {name:monthNames[new Date().getMonth()], from_date:currentMonth.from_date, vehicle_type: 0,
        to_date:currentMonth.to_date, dealer_id: dealer.id, dealer_sales_id: salesUser2.id,
        manufacturer_id: manufacturer.id});
      const leadUser = await factory.create('User');
      const lead = await factory.create('Lead', {manufacturer_id: manufacturer.id, dealer_id: dealer.id, user_id: leadUser.id,
        assigned_to: salesUser1.id, invoiced_on: new Date(), is_invoiced: true });
      const vehicle = await factory.create('Vehicle', {dealer_id: dealer.id, manufacturer_id: manufacturer.id});
      const leadDetails = await factory.create('LeadDetail', { dealer_id: dealer.id, vehicle_id: vehicle.id, lead_id: lead.id, invoiced_on: new Date()});
      const access_token = await factory.create('AccessToken', { userId: managerUser.id});
      const currentUser = await app.Users.findOne({where: {id: managerUser.id}, include: { relation: "user_role",
        scope: { include: "role" }}});
      request(loopback)
        .get('/api/Leads/'+ lead.id + '/assignedTo/'+ salesUser2.id)
        .set('Accept', 'application/json')
        .set('Authorization', access_token.id)
        .expect(200)
        .end((err, res) => {
          expect(res.body).to.not.equal(null);
        });
    });
  });
});
