const loopback = require('../../server/server.js');
const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
const factory = require('../factory.js');
const LeadService = require('../../server/services/lead_service.js');
const constants = require('../../server/utils/constants/userConstants');
const DateUtils = require('../../server/utils/date_utils');

const app = loopback.dataSources.postgres.models;

describe('Lead Service',() => {
  describe('fetchLeadsByStatus', () => {
    it('returns the list of leads that matches with the status', async () => {
      const leadStatus = 'fresh';
      const lead = await factory.create('Lead', {category: leadStatus, status: 500});
      const dealer =  await factory.create('Dealer');
      const saleRole = await app.Roles.findOne({ where: { name: 'DEALER_SALES' } });
      const executiveUser = await factory.create('User', { user_type_id: dealer.id });
      const executiveUserRole = await factory.create('UserRole', { user_id: executiveUser.id, role_id: saleRole.id });
      const newLead = await factory.create('Lead', { dealer_id: dealer.id, assigned_to: executiveUser.id, category: 'HOT'});
      const currentUser = await app.Users.findOne({
         where: {
            id: executiveUser.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });

      const leadService = new LeadService(null, null, currentUser);
      leadService.fetchLeadsByStatus(leadStatus, (fetchError, leads) => {
        assert.isNotNull(leads, 'Leads matched with the leadStatus');
      });
    });

    it('returns empty for not available status', async () => {
      const leadStatus = 'fresh';
      const lead = await factory.create('Lead', {category: leadStatus, status: 500});
      const dealer =  await factory.create('Dealer');
      const saleRole = await app.Roles.findOne({ where: { name: 'DEALER_SALES' } });
      const executiveUser = await factory.create('User', { user_type_id: dealer.id });
      const executiveUserRole = await factory.create('UserRole', { user_id: executiveUser.id, role_id: saleRole.id });
      const newLead = await factory.create('Lead', { dealer_id: dealer.id, assigned_to: executiveUser.id, category: 'HOT'});
      const currentUser = await app.Users.findOne({
         where: {
            id: executiveUser.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });

      const leadService = new LeadService(null, null, currentUser);

      leadService.fetchLeadsByStatus('HOTT', (fetchError, leads) => {
        assert.equal(leads.length, 0, 'Leads matched with the leadStatus');
      });
    });
  });
  describe('createLead', () => {
    it('New lead created', async () => {
      const currentUser = await factory.create('User');
      const user = await factory.create('User');
      const dealer = await factory.create('Dealer');
      const newLead = await factory.build('Lead', {dealer_id: dealer.id, user_id: user.id});
      const leadService = new LeadService(null, newLead);
      leadService.createNewLead(currentUser, (error, success) => {
        assert.equal(success.toJSON().assigned_to, currentUser.id, 'Lead is created Successfully');
      });
    });
    it('lead already exist', async () => {
      const user = await factory.create('User');
      const currentUser = await factory.create('User');
      const dealer = await factory.create('Dealer');
      const newLead = await factory.create('Lead', {mobile_number: 9876543210,dealer_id: dealer.id, user_id: user.id});
      const leadService = new LeadService(null, newLead);
      leadService.createNewLead(currentUser, (fetchError, lead) => {
        assert.isNotNull(fetchError.InstabikeError, 'Lead already exists');
      });
    });
  });

  describe('getDetails', () => {
    it('Get complete detail of a lead by valid lead-Id', async () => {
      const user = await factory.create('User');
      const dealer = await factory.create('Dealer');
      const lead = await factory.build('Lead', {dealer_id: dealer.id, user_id: user.id});
      const leadService = new LeadService(lead.id, lead);
      leadService.getDetails((fetchError, result) => {
        assert.isNotNull(result, 'Lead details fetched');
      });
    });

    it('throw error for invalid lead-Id', async () => {
      const user = await factory.create('User');
      const dealer = await factory.create('Dealer');
      const lead = await factory.build('Lead', {dealer_id: dealer.id, user_id: user.id});
      const leadService = new LeadService(dealer.id, lead);
      leadService.getDetails((fetchError, result) => {
        assert.isNotNull(fetchError, 'throws No Such Lead error');
      });
    });
  });

  describe('getLeadsCountByStatus', () => {
    it('returns the number of leads for each status', async () => {
      const zone = await factory.create('Zone');
      const lead = await factory.create('Lead', {
        category: 'hot',
        manufacturer_id: zone.manufacturer_id,
        zone_id: zone.id
      });
      const leadService = new LeadService();
      const filter = {
        "manufacturer_id": zone.manufacturer_id,
        "zoneIds": [zone.id],
        "stateIds": [],
        "cityIds": []
      };
      const leads = leadService.getLeadsCountByStatus(filter, (fetchError, leadsCount) => {
        expect(leadsCount).to.have.length(1);
        assert.equal(leadsCount[0].hot_leads, 1, 'Leads count fetched successfully');
      });
    });
  });

  describe('fetchLeadsByFilter', () => {
    it('returns the list of leads based on status and filter', async () => {
      const zone = await factory.create('Zone');
      const lead = await factory.create('Lead', {
        category: 'hot',
        manufacturer_id: zone.manufacturer_id,
        zone_id: zone.id
      });
      const leadDetail = await factory.create('LeadDetail', {
        manufacturer_id: zone.manufacturer_id,
        lead_id: lead.id,
      });
      const leadService = new LeadService();
      const filter = {
        manufacturer_id: zone.manufacturer_id,
        zoneIds: [zone.id],
        category: 'hot',
        stateIds: [],
        cityIds: [],
        orderField: "id",
        orderBy: "ASC",
        pageNo: 1,
        limit: 10
      };
      leadService.fetchLeadsByFilter(filter, (fetchError, result) => {
        assert.equal(result.leadsCount, 1, 'Leads List fetched successfully');
      });
    });
  });

  describe('getInShowroomLeadsByToday', () => {
    it('returns the leads for each status', async () => {
      const dealer =  await factory.create('Dealer');
      const saleRole = await app.Roles.findOne({ where: { name: 'DEALER_SALES' } });
      const executiveUser = await factory.create('User', { user_type_id: dealer.id });
      const executiveUserRole = await factory.create('UserRole', { user_id: executiveUser.id, role_id: saleRole.id });
      const newLead = await factory.create('Lead', { dealer_id: dealer.id, assigned_to: executiveUser.id, category: 'HOT', type: 'offline'});
      const currentUser = await app.Users.findOne({
         where: {
            id: executiveUser.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });
      const leadService = new LeadService(null, null, currentUser);
      leadService.getInShowroomLeadsByToday((fetchError, leads) => {
        assert.notEqual(leads.HOT.length, 0, 'Leads fetched successfully');
      });
    });
  });

  describe('Create Lead Details', () => {
    it('Lead details created successfully', async () => {
      const vehicle = await factory.create('Vehicle', { vehicle_status: 200 });
      const dealerSales = await factory.create('User', { user_type_name: 'Dealer', user_type_id: vehicle.dealer_id });
      const user = await factory.create('User', { user_type_name: 'Customer' });
      const lead = await factory.create('Lead', { dealer_id: vehicle.dealer_id, user_id: user.id });
      const leadDetails = await factory.build('LeadDetail');
      const leadService = new LeadService(lead.id);
      leadService.leadDetail(leadDetails, dealerSales, (fetchError, result) => {
        assert.isNotNull(result, 'Lead Details created');
      });
    });
  });

  describe('Create Lead Details with Invalid Lead', () => {
    it('Invalid lead Id when create Lead details', async () => {
      const vehicle = await factory.create('Vehicle', { vehicle_status: 200 });
      const dealerSales = await factory.create('User', { user_type_name: 'Dealer', user_type_id: vehicle.dealer_id });
      const user = await factory.create('User', { user_type_name: 'Customer' });
      const lead = await factory.create('Lead', { dealer_id: vehicle.dealer_id, user_id: user.id });
      const leadDetails = await factory.build('LeadDetail');
      const leadService = new LeadService(vehicle.id);
      leadService.leadDetail(leadDetails, dealerSales, (fetchError, result) => {
        assert.isNotNull(fetchError, 'Invalid Lead');
      });
    });
  });

  describe('Update Lead and LeadDetails as Lost', () => {
    it('Update Lead and Lead Details vehicles as lost', async () => {
      const vehicle = await factory.create('Vehicle', { vehicle_status: 200 });
      const dealerSales = await factory.create('User', { user_type_name: 'Dealer', user_type_id: vehicle.dealer_id });
      const user = await factory.create('User', { user_type_name: 'Customer' });
      const lead = await factory.create('Lead', { dealer_id: vehicle.dealer_id, user_id: user.id });
      const leadDetails = await factory.create('LeadDetail', { dealer_id: vehicle.dealer_id, vehicle_id: vehicle.id });
      const leadService = new LeadService(lead.id);

      const currentUser = await app.Users.findOne({
         where: {
            id: dealerSales.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });

      leadService.markAsLost(currentUser, dealerSales, null, (fetchError, result) => {
        assert.isNotNull(result, 'Lead and Lead Details updated');
      });
    });
  });

  describe('Update Lead and LeadDetails as Lost', () => {
    it('Update Lead and Lead Details vehicles as lost', async () => {
      const vehicle = await factory.create('Vehicle', { vehicle_status: 200 });
      const dealerSales = await factory.create('User', { user_type_name: 'Dealer', user_type_id: vehicle.dealer_id });
      const user = await factory.create('User', { user_type_name: 'Customer' });
      const lead = await factory.create('Lead', { dealer_id: vehicle.dealer_id, user_id: user.id });
      const leadDetails = await factory.create('LeadDetail', { dealer_id: vehicle.dealer_id, vehicle_id: vehicle.id });
      const leadService = new LeadService(vehicle.id);

      const currentUser = await app.Users.findOne({
         where: {
            id: dealerSales.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });

      leadService.markAsLost(currentUser, dealerSales, null, (fetchError, result) => {
        assert.isNotNull(fetchError, 'Invalid Lead');
      });
    });
  });

  describe('Get Followup Leads by Today', () => {
    it('Leads listed based on followup needs to be done today', async () => {
      const dealer =  await factory.create('Dealer');
      const saleRole = await app.Roles.findOne({ where: { name: 'DEALER_SALES' } });
      const executiveUser = await factory.create('User', { user_type_id: dealer.id });
      const executiveUserRole = await factory.create('UserRole', { user_id: executiveUser.id, role_id: saleRole.id });
      const newLead = await factory.create('Lead',
        { dealer_id: dealer.id, assigned_to: executiveUser.id, category: 'HOT',
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
      const leadService = new LeadService(null, null, currentUser);
      leadService.getFollowupLeadsByToday((fetchError, leads) => {
        assert.isNotNull(leads, 'Leads Listed');
      });
    });
  });

  describe('Get Followup Done Leads by Today', () => {
    it('Leads listed based on followup done by today', async () => {
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
      const leadService = new LeadService(null, null, currentUser);
      leadService.getFollowupDoneLeadsByToday((fetchError, leads) => {
        assert.isNotNull(leads, 'Leads Listed');
      });
    });
  });

  describe('schedule a follow-up', () => {
    it('will schedule a follow-up', async () => {
      const manufacturer = await factory.create('Manufacturer');
      const dealer =  await factory.create('Dealer');
      const saleRole = await app.Roles.findOne({ where: { name: 'DEALER_SALES' } });
      const user = await factory.create('User', { user_type_id: dealer.id });
      const executiveUserRole = await factory.create('UserRole', { user_id: user.id, role_id: saleRole.id });
      const newLead = await factory.create('Lead',
        { dealer_id: dealer.id, assigned_to: user.id, category: 'NEW',
          manufacturer_id: manufacturer.id, status: 200 });
      const currentUser = await app.Users.findOne({
         where: {
            id: user.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });
      const followupReq = { "follow_up_at": new Date() };
      const leadService = new LeadService(newLead.id, null, currentUser);
      leadService.scheduleFollowup(followupReq, (error, followup) => {
        assert.equal(followup.dealer_id, dealer.id ,'Leads Listed');
      });
    });
  });

  describe('mark followup complete', () => {
    it('will mark followup complete', async () => {
      const manufacturer = await factory.create('Manufacturer');
      const dealer =  await factory.create('Dealer');
      const saleRole = await app.Roles.findOne({ where: { name: 'DEALER_SALES' } });
      const user = await factory.create('User', { user_type_id: dealer.id });
      const executiveUserRole = await factory.create('UserRole', { user_id: user.id, role_id: saleRole.id });
      const newLead = await factory.create('Lead',
        { dealer_id: dealer.id, assigned_to: user.id, category: 'NEW',
          manufacturer_id: manufacturer.id, status: 200 });
      const followup = await factory.create('FollowUp', { lead_id: newLead.id });
      const currentUser = await app.Users.findOne({
         where: {
            id: user.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });
      const followupReq = { comment: 'comment example' };
      const leadService = new LeadService(newLead.id, null, currentUser);
      leadService.markFollowupComplete(followupReq, followup.id, (error, followup) => {
        assert.isNotNull(followup, 'Leads Listed');
      });
    });
  });

  describe('add Comment To Lead', () => {
    it('will add Comment To Lead', async () => {
      const manufacturer = await factory.create('Manufacturer');
      const dealer =  await factory.create('Dealer');
      const saleRole = await app.Roles.findOne({ where: { name: 'DEALER_SALES' } });
      const user = await factory.create('User', { user_type_id: dealer.id });
      const executiveUserRole = await factory.create('UserRole', { user_id: user.id, role_id: saleRole.id });
      const newLead = await factory.create('Lead',
        { dealer_id: dealer.id, assigned_to: user.id, category: 'NEW',
          manufacturer_id: manufacturer.id, status: 200 });
      const followup = await factory.create('FollowUp', { lead_id: newLead.id });
      const currentUser = await app.Users.findOne({
         where: {
            id: user.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });
      const leadActivity = { comment: 'comment example' };
      const leadService = new LeadService(newLead.id, null, currentUser);
      leadService.addCommentToLead(leadActivity, (error, followup) => {
        assert.isNotNull(followup, 'Leads Listed');
      });
    });
  });

  describe('get Monthly Summary', () => {
    it('will get Monthly Summary', async () => {
      const manufacturer = await factory.create('Manufacturer');
      const dealer =  await factory.create('Dealer');
      const saleRole = await app.Roles.findOne({ where: { name: 'DEALER_SALES' } });
      const user = await factory.create('User', { user_type_id: dealer.id });
      const executiveUserRole = await factory.create('UserRole', { user_id: user.id, role_id: saleRole.id });
      const newLead = await factory.create('Lead',
        { dealer_id: dealer.id, assigned_to: user.id, category: 'NEW',
          manufacturer_id: manufacturer.id, status: 200 });
      const followup = await factory.create('FollowUp', { lead_id: newLead.id });
      const currentUser = await app.Users.findOne({
         where: {
            id: user.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });
      const leadActivity = { comment: 'comment example' };
      const leadService = new LeadService(newLead.id, null, currentUser);
      const lds = await app.Roles.find();
      leadService.getMonthlySummary((error, summary) => {
        assert.notEqual(summary.newLeads, 0);
      });
    });
  });

  describe('Update LeadDetails as deleted', () => {
    it('Update lead vehicle as deleted', async () => {
      const vehicle = await factory.create('Vehicle', { vehicle_status: 200 });
      const dealerSales = await factory.create('User', { user_type_name: 'Dealer', user_type_id: vehicle.dealer_id });
      const user = await factory.create('User', { user_type_name: 'Customer' });
      const lead = await factory.create('Lead', { dealer_id: vehicle.dealer_id, user_id: user.id });
      const leadDetails = await factory.create('LeadDetail', { dealer_id: vehicle.dealer_id, vehicle_id: vehicle.id, lead_id: lead.id });

      const currentUser = await app.Users.findOne({
         where: {
            id: dealerSales.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });

      const leadService = new LeadService(lead.id, null, currentUser);
      leadService.updateLeadVehicleAsDeleted(lead.id, leadDetails.id, (fetchError, result) => {
        assert.isNotNull(result, 'Lead Details updated');
      });
    });
  });

  describe('get Leads Count By Today', () => {
    it('Will get Leads Count By Today', async () => {
      const dealer =  await factory.create('Dealer');
      const saleRole = await app.Roles.findOne({ where: { name: 'DEALER_SALES' } });
      const dealerUser = await factory.create('User', { user_type_name: 'Dealer', user_type_id: dealer.id });
      const lead = await factory.create('Lead', { assigned_to: dealerUser.id,  type: constants.LEAD_TYPES.OFFLINE });
      const executiveUserRole = await factory.create('UserRole', { user_id: dealerUser.id, role_id: saleRole.id });
      const currentUser = await app.Users.findOne({
         where: {
            id: dealerUser.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });
      const leadService = new LeadService(null, null, currentUser);
      leadService.getLeadsCountByToday((fetchError, result) => {
        assert.notEqual(result.inShowroom.length, 0, 'Lead counts fetched');
      });
    });
  });

  describe('get Followup Count By Today', () => {
    it('will get Follow up Count By Today', async () => {
      const manufacturer = await factory.create('Manufacturer');
      const dealer =  await factory.create('Dealer');
      const saleRole = await app.Roles.findOne({ where: { name: 'DEALER_SALES' } });
      const user = await factory.create('User', { user_type_id: dealer.id });
      const executiveUserRole = await factory.create('UserRole', { user_id: user.id, role_id: saleRole.id });
      const newLead = await factory.create('Lead',
        { dealer_id: dealer.id, assigned_to: user.id, category: 'NEW',
        next_followup_on: new Date() });
      const followup = await factory.create('FollowUp', { lead_id: newLead.id });
      const currentUser = await app.Users.findOne({
         where: {
            id: user.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });
      const leadService = new LeadService(newLead.id, null, currentUser);
      leadService.getFollowupCountByToday((error, summary) => {
        assert.notEqual(summary.followup, 0);
      });
    });
  });

  describe('getLostReasons', () => {
    it('returns list of lost reasons available', async () => {
      const dealer =  await factory.createMany('LostReason', 5);
      const leadService = new LeadService();
      leadService.getLostReasons((fetchError, result) => {
        assert.isNotNull(result.lostReasons, 'Lost reasons fetched successfully');
      });
    });
  });

  describe('updateTargetAchievedForNewSales', () => {
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
      const accesstoken = await factory.create('AccessToken', { userId: managerUser.id});
      const currentUser = await app.Users.findOne({where: {id: managerUser.id}, include: { relation: "user_role",
        scope: { include: "role" }}});
      const leadService = new LeadService(lead.id, null, currentUser);
      leadService.updateTargetAchievedForNewSales(salesUser2.id, (err, result) => {
        assert.isNotNull(result, 'Lead updated successfully');
      });
    });
  });

  describe('update Lead Vehicle Status As Lost', () => {
    it('will update Lead Vehicle Status As Lost', async () => {
      const manufacturer = await factory.create('Manufacturer');
      const dealer =  await factory.create('Dealer');
      const managerUser = await factory.create('User', { user_type_id: dealer.id });
      const teamLeadUser = await factory.create('User', { user_type_id: dealer.id, manager_id: managerUser.id});
      const salesUser = await factory.create('User', { user_type_id: dealer.id, manager_id: teamLeadUser.id});
      const managerRole = await app.Roles.findOne({ where: {name: 'DEALER_MANAGER' } });
      const managerUserRole = await factory.create('UserRole', {user_id: managerUser.id, principalId: managerUser.id, role_id: managerRole.id});
      const teamLeadRole = await app.Roles.findOne({ where: {name: 'DEALER_TEAM_HEAD' } });
      const teamLeadUserRole = await factory.create('UserRole', {user_id: teamLeadUser.id,principalId: teamLeadUser.id,role_id: teamLeadRole.id});
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
      const leadService = new LeadService(newLead.id, null, currentUser);
      leadService.updateLeadVehicleStatusAsLost(leadDetail.id, {}, (error, lead) => {
        assert.equal(lead.status, constants.LEAD_STATUS.INVOICED);
      });
    });
  });
});
