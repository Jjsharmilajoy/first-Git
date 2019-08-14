const loopback = require('../../server/server.js');
const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
const factory = require('../factory.js');
const LeadDetailService = require('../../server/services/lead_detail_service.js');
const constants = require('../../server/utils/constants/userConstants');
const DateUtils = require('../../server/utils/date_utils');

const app = loopback.dataSources.postgres.models;

describe('Lead Detail Service',() => {
  describe('currentWeekSlots', () => {
    it('returns the test ride slots for the current week', async () => {
      const vehicle = await factory.create('Vehicle', { vehicle_status: 200 });
      const dealer =  await factory.create('Dealer');
      const saleRole = await app.Roles.findOne({ where: { name: 'DEALER_SALES' } });
      const executiveUser = await factory.create('User', { user_type_id: dealer.id });
      const executiveUserRole = await factory.create('UserRole', { user_id: executiveUser.id, role_id: saleRole.id });
      const newLead = await factory.create('Lead', { dealer_id: dealer.id, assigned_to: executiveUser.id, category: 'HOT'});
      const leadDetails = await factory.create('LeadDetail', { lead_id: newLead.id,
         dealer_id: vehicle.dealer_id, vehicle_id: vehicle.id });
      const currentUser = await app.Users.findOne({
         where: {
            id: executiveUser.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });
      const leadDetailService = new LeadDetailService(newLead.id, dealer.id, vehicle.id);
      leadDetailService.getCurrentWeekSlots(currentUser, (fetchError, leads) => {
        assert.isNotNull(leads, 'data available');
      });
    });

    it('returns error, coz unauthorized user', async () => {
      const vehicle = await factory.create('Vehicle', { vehicle_status: 200 });
      const dealer =  await factory.create('Dealer');
      const saleRole = await app.Roles.findOne({ where: { name: 'DEALER_SALES' } });
      const executiveUser = await factory.create('User', { user_type_id: dealer.id });
      const executiveUserRole = await factory.create('UserRole', { user_id: executiveUser.id, role_id: saleRole.id });
      const newLead = await factory.create('Lead', { dealer_id: dealer.id, assigned_to: executiveUser.id, category: 'HOT'});
      const leadDetails = await factory.create('LeadDetail', { lead_id: newLead.id,
         dealer_id: vehicle.dealer_id, vehicle_id: vehicle.id });
      const currentUser = await app.Users.findOne({
         where: {
            id: executiveUser.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });
      const leadDetailService = new LeadDetailService(newLead.id, dealer.id, vehicle.id);
      leadDetailService.getCurrentWeekSlots(dealer, (fetchError, leads) => {
        assert.isNotNull(fetchError, 'error');
      });
    });

    it('returns error, if dealer id is not passed', async () => {
      const vehicle = await factory.create('Vehicle', { vehicle_status: 200 });
      const dealer =  await factory.create('Dealer');
      const saleRole = await app.Roles.findOne({ where: { name: 'DEALER_SALES' } });
      const executiveUser = await factory.create('User', { user_type_id: dealer.id });
      const executiveUserRole = await factory.create('UserRole', { user_id: executiveUser.id, role_id: saleRole.id });
      const newLead = await factory.create('Lead', { dealer_id: dealer.id, assigned_to: executiveUser.id, category: 'HOT'});
      const leadDetails = await factory.create('LeadDetail', { lead_id: newLead.id,
         dealer_id: vehicle.dealer_id, vehicle_id: vehicle.id });
      const currentUser = await app.Users.findOne({
         where: {
            id: executiveUser.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });
      const leadDetailService = new LeadDetailService(newLead.id);
      leadDetailService.getCurrentWeekSlots(currentUser, (fetchError, leads) => {
        assert.isNotNull(fetchError, 'error');
      });
    });

    it('returns error', async () => {
      const vehicle = await factory.create('Vehicle', { vehicle_status: 200 });
      const dealer =  await factory.create('Dealer');
      const saleRole = await app.Roles.findOne({ where: { name: 'DEALER_SALES' } });
      const executiveUser = await factory.create('User', { user_type_id: dealer.id });
      const executiveUserRole = await factory.create('UserRole', { user_id: executiveUser.id, role_id: saleRole.id });
      const newLead = await factory.create('Lead', { dealer_id: dealer.id, assigned_to: executiveUser.id, category: 'HOT'});
      const leadDetails = await factory.create('LeadDetail', { lead_id: newLead.id,
         dealer_id: vehicle.dealer_id, vehicle_id: vehicle.id });
      const currentUser = await app.Users.findOne({
         where: {
            id: executiveUser.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });
      const leadDetailService = new LeadDetailService(newLead.id);
      leadDetailService.getCurrentWeekSlots(null, (fetchError, leads) => {
        assert.isNotNull(fetchError, 'error');
      });
    });
  });

  describe('dailySlots', () => {
    it('returns the test ride daily slots', async () => {
      const vehicle = await factory.create('Vehicle', { vehicle_status: 200 });
      const dealer =  await factory.create('Dealer');
      const saleRole = await app.Roles.findOne({ where: { name: 'DEALER_SALES' } });
      const executiveUser = await factory.create('User', { user_type_id: dealer.id });
      const executiveUserRole = await factory.create('UserRole', { user_id: executiveUser.id, role_id: saleRole.id });
      const newLead = await factory.create('Lead', { dealer_id: dealer.id, assigned_to: executiveUser.id, category: 'HOT'});
      const leadDetails = await factory.create('LeadDetail', { lead_id: newLead.id,
         dealer_id: vehicle.dealer_id, vehicle_id: vehicle.id });
      const currentUser = await app.Users.findOne({
         where: {
            id: executiveUser.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });
      const leadDetailService = new LeadDetailService(newLead.id, dealer.id, vehicle.id);
      const searchFilter = {
        monday_friday_start: "10",
        monday_friday_end: "18",
        test_ride_vehicle: 2,
        date: new Date(),
      };
      leadDetailService.slotsByDate(searchFilter, currentUser, (fetchError, slots) => {
        assert.isNotNull(slots, 'slots available');
      });
    });

    it('slots returns error, coz unauthorized user', async () => {
      const vehicle = await factory.create('Vehicle', { vehicle_status: 200 });
      const dealer =  await factory.create('Dealer');
      const saleRole = await app.Roles.findOne({ where: { name: 'DEALER_SALES' } });
      const executiveUser = await factory.create('User', { user_type_id: dealer.id });
      const executiveUserRole = await factory.create('UserRole', { user_id: executiveUser.id, role_id: saleRole.id });
      const newLead = await factory.create('Lead', { dealer_id: dealer.id, assigned_to: executiveUser.id, category: 'HOT'});
      const leadDetails = await factory.create('LeadDetail', { lead_id: newLead.id,
         dealer_id: vehicle.dealer_id, vehicle_id: vehicle.id });
      const currentUser = await app.Users.findOne({
         where: {
            id: executiveUser.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });
      const leadDetailService = new LeadDetailService(newLead.id, dealer.id, vehicle.id);
      const searchFilter = {
        monday_friday_start: "10",
        monday_friday_end: "18",
        test_ride_vehicle: 2,
        date: new Date(),
      };
      leadDetailService.slotsByDate(searchFilter, dealer, (fetchError, slots) => {
        assert.isNotNull(fetchError, 'error');
      });
    });

    it('slots returns error, if dealer is not present', async () => {
      const vehicle = await factory.create('Vehicle', { vehicle_status: 200 });
      const dealer =  await factory.create('Dealer');
      const saleRole = await app.Roles.findOne({ where: { name: 'DEALER_SALES' } });
      const executiveUser = await factory.create('User', { user_type_id: dealer.id });
      const executiveUserRole = await factory.create('UserRole', { user_id: executiveUser.id, role_id: saleRole.id });
      const newLead = await factory.create('Lead', { dealer_id: dealer.id, assigned_to: executiveUser.id, category: 'HOT'});
      const leadDetails = await factory.create('LeadDetail', { lead_id: newLead.id,
         dealer_id: vehicle.dealer_id, vehicle_id: vehicle.id });
      const currentUser = await app.Users.findOne({
         where: {
            id: executiveUser.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });
      const leadDetailService = new LeadDetailService(newLead.id, newLead.id, vehicle.id);
      const searchFilter = {
        monday_friday_start: "10",
        monday_friday_end: "18",
        test_ride_vehicle: 2,
        date: new Date(),
      };
      leadDetailService.slotsByDate(searchFilter, currentUser, (fetchError, slots) => {
        assert.isNotNull(fetchError, 'error');
      });
    });

    it('slot returns error', async () => {
      const vehicle = await factory.create('Vehicle', { vehicle_status: 200 });
      const dealer =  await factory.create('Dealer');
      const saleRole = await app.Roles.findOne({ where: { name: 'DEALER_SALES' } });
      const executiveUser = await factory.create('User', { user_type_id: dealer.id });
      const executiveUserRole = await factory.create('UserRole', { user_id: executiveUser.id, role_id: saleRole.id });
      const newLead = await factory.create('Lead', { dealer_id: dealer.id, assigned_to: executiveUser.id, category: 'HOT'});
      const leadDetails = await factory.create('LeadDetail', { lead_id: newLead.id,
         dealer_id: vehicle.dealer_id, vehicle_id: vehicle.id });
      const currentUser = await app.Users.findOne({
         where: {
            id: executiveUser.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });
      const leadDetailService = new LeadDetailService(newLead.id, newLead.id, vehicle.id);
      const searchFilter = {
        monday_friday_start: "10",
        monday_friday_end: "18",
        test_ride_vehicle: 2,
      };
      leadDetailService.slotsByDate(searchFilter, currentUser, (fetchError, slots) => {
        assert.isNotNull(fetchError, 'error');
      });
    });
  });

  describe('fetch testride vehicles', () => {
    it('testride vehicles by status', async () => {
      const vehicle = await factory.create('Vehicle', { vehicle_status: 200 });
      const dealer =  await factory.create('Dealer');
      const saleRole = await app.Roles.findOne({ where: { name: 'DEALER_SALES' } });
      const executiveUser = await factory.create('User', { user_type_id: dealer.id });
      const executiveUserRole = await factory.create('UserRole', { user_id: executiveUser.id, role_id: saleRole.id });
      const newLead = await factory.create('Lead', { dealer_id: dealer.id, assigned_to: executiveUser.id, category: 'HOT'});
      const leadDetails = await factory.create('LeadDetail', { lead_id: newLead.id,
         dealer_id: vehicle.dealer_id, vehicle_id: vehicle.id, test_ride_on: new Date(), booked_on: new Date(),
         test_ride_status: 200});
      const currentUser = await app.Users.findOne({
         where: {
            id: executiveUser.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });
      const leadDetailService = new LeadDetailService(newLead.id, dealer.id, vehicle.id);
      const filter = {
        date: new Date(),
      };
      leadDetailService.getTestRideVehiclesByStatus('scheduled', filter, currentUser, (fetchError, slots) => {
        assert.isNotNull(slots, 'data available');
      });
    });

    it('testride vehicles by status, error', async () => {
      const vehicle = await factory.create('Vehicle', { vehicle_status: 200 });
      const dealer =  await factory.create('Dealer');
      const saleRole = await app.Roles.findOne({ where: { name: 'DEALER_SALES' } });
      const executiveUser = await factory.create('User', { user_type_id: dealer.id });
      const executiveUserRole = await factory.create('UserRole', { user_id: executiveUser.id, role_id: saleRole.id });
      const newLead = await factory.create('Lead', { dealer_id: dealer.id, assigned_to: executiveUser.id, category: 'HOT'});
      const leadDetails = await factory.create('LeadDetail', { lead_id: newLead.id,
         dealer_id: vehicle.dealer_id, vehicle_id: vehicle.id, test_ride_on: new Date(), booked_on: new Date(),
         test_ride_status: 200});
      const currentUser = await app.Users.findOne({
         where: {
            id: executiveUser.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });
      const leadDetailService = new LeadDetailService(newLead.id);
      const filter = {
      };
      leadDetailService.getTestRideVehiclesByStatus('scheduled', filter, currentUser, (fetchError, slots) => {
        assert.isNotNull(fetchError, 'errors');
      });
    });
  });

  describe('get testride vehicles count', () => {
    it('testride vehicles count, error', async () => {
      const vehicle = await factory.create('Vehicle', { vehicle_status: 200 });
      const dealer =  await factory.create('Dealer');
      const saleRole = await app.Roles.findOne({ where: { name: 'DEALER_SALES' } });
      const executiveUser = await factory.create('User', { user_type_id: dealer.id });
      const executiveUserRole = await factory.create('UserRole', { user_id: executiveUser.id, role_id: saleRole.id });
      const newLead = await factory.create('Lead', { dealer_id: dealer.id, assigned_to: executiveUser.id, category: 'HOT'});
      const leadDetails = await factory.create('LeadDetail', { lead_id: newLead.id,
         dealer_id: vehicle.dealer_id, vehicle_id: vehicle.id, test_ride_on: new Date(), booked_on: new Date(),
         test_ride_status: 200});
      const currentUser = await app.Users.findOne({
         where: {
            id: executiveUser.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });
      const leadDetailService = new LeadDetailService(newLead.id);
      const filter = {
        date: new Date(),
      };
      leadDetailService.getTestRideCount(filter, currentUser, (fetchError, slots) => {
        assert.isNotNull(fetchError, 'error');
      });
    });
  });

  describe('deleteProformoInvoice', () => {
    it('to delete proformo-invoice', async () => {
      const vehicle = await factory.create('Vehicle', { vehicle_status: 200 });
      const dealer =  await factory.create('Dealer');
      const saleRole = await app.Roles.findOne({ where: { name: 'DEALER_SALES' } });
      const executiveUser = await factory.create('User', { user_type_id: dealer.id });
      const executiveUserRole = await factory.create('UserRole', { user_id: executiveUser.id, role_id: saleRole.id });
      const newLead = await factory.create('Lead', { dealer_id: dealer.id, assigned_to: executiveUser.id, category: 'HOT'});
      const proformaInvoice = await factory.create('ProformaInvoice', { lead_id: newLead.id });
      const leadDetail = await factory.create('LeadDetail', { lead_id: newLead.id,
         dealer_id: dealer.id, vehicle_id: vehicle.id, test_ride_on: new Date(), booked_on: new Date(),
         test_ride_status: 200, proforma_invoice_id: proformaInvoice.id});
      const currentUser = await app.Users.findOne({
         where: {
            id: executiveUser.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });
      const leadDetailService = new LeadDetailService(newLead.id, dealer.id, null, currentUser);
      const filter = {
        date: new Date(),
      };
      leadDetailService.deleteProformoInvoice(leadDetail.id, (error, slots) => {
        assert.equal(error, null, 'Proforma-invoice deleted successfully');
      });
    });
    it('to throw user-not-authorized error', async () => {
      const vehicle = await factory.create('Vehicle', { vehicle_status: 200 });
      const dealer =  await factory.create('Dealer');
      const saleRole = await app.Roles.findOne({ where: { name: 'DEALER_SALES' } });
      const executiveUser = await factory.create('User', { user_type_id: null });
      const executiveUserRole = await factory.create('UserRole', { user_id: executiveUser.id, role_id: saleRole.id });
      const newLead = await factory.create('Lead', { dealer_id: dealer.id, assigned_to: executiveUser.id, category: 'HOT'});
      const proformaInvoice = await factory.create('ProformaInvoice', { lead_id: newLead.id });
      const leadDetail = await factory.create('LeadDetail', { lead_id: newLead.id,
         dealer_id: vehicle.dealer_id, vehicle_id: vehicle.id, test_ride_on: new Date(), booked_on: new Date(),
         test_ride_status: 200, proforma_invoice_id: proformaInvoice.id});
      const currentUser = await app.Users.findOne({
         where: {
            id: executiveUser.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });
      const leadDetailService = new LeadDetailService(newLead.id, dealer.id, null, currentUser);
      const filter = {
        date: new Date(),
      };
      leadDetailService.deleteProformoInvoice(leadDetail.id, (error, slots) => {
        assert.notEqual(error, null, 'User-not-authorized error');
      });
    });
    it('to throw lead-not-found error', async () => {
      const vehicle = await factory.create('Vehicle', { vehicle_status: 200 });
      const dealer =  await factory.create('Dealer');
      const saleRole = await app.Roles.findOne({ where: { name: 'DEALER_SALES' } });
      const executiveUser = await factory.create('User', { user_type_id: null });
      const executiveUserRole = await factory.create('UserRole', { user_id: executiveUser.id, role_id: saleRole.id });
      const newLead = await factory.create('Lead', { dealer_id: dealer.id, assigned_to: executiveUser.id, category: 'HOT'});
      const proformaInvoice = await factory.create('ProformaInvoice', { lead_id: newLead.id });
      const leadDetail = await factory.create('LeadDetail', { lead_id: newLead.id,
         dealer_id: vehicle.dealer_id, vehicle_id: vehicle.id, test_ride_on: new Date(), booked_on: new Date(),
         test_ride_status: 200, proforma_invoice_id: proformaInvoice.id});
      const currentUser = await app.Users.findOne({
         where: {
            id: executiveUser.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });
      const leadDetailService = new LeadDetailService(newLead.id, dealer.id, null, currentUser);
      const filter = {
        date: new Date(),
      };
      leadDetailService.deleteProformoInvoice(newLead.id, (error, slots) => {
        assert.notEqual(error, null, 'Lead-not-found error');
      });
    });
  });

  describe('updateLeadDetail', () => {
    it('to update Lead-Detail and create test-ride scheduled activity', async () => {
      const vehicle = await factory.create('Vehicle', { vehicle_status: 200 });
      const dealer =  await factory.create('Dealer');
      const saleRole = await app.Roles.findOne({ where: { name: 'DEALER_SALES' } });
      const executiveUser = await factory.create('User', { user_type_id: dealer.id });
      const executiveUserRole = await factory.create('UserRole', { user_id: executiveUser.id, role_id: saleRole.id });
      const newLead = await factory.create('Lead', { dealer_id: dealer.id, assigned_to: executiveUser.id, category: 'HOT'});
      const leadDetail = await factory.create('LeadDetail', { lead_id: newLead.id,
         dealer_id: dealer.id, vehicle_id: vehicle.id, test_ride_on: new Date(), booked_on: new Date()});
      const currentUser = await app.Users.findOne({
         where: {
            id: executiveUser.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });
      const leadDetailService = new LeadDetailService(newLead.id);
      const newLeadDetail = {
        id: leadDetail.id, lead_id: newLead.id,
        dealer_id: dealer.id, vehicle_id: vehicle.id, test_ride_on: new Date(),
        booked_on: new Date(), test_ride_status: 200
      };
      leadDetailService.updateLeadDetail(newLeadDetail, (error, result) => {
        assert.notEqual(error, null, 'Update Lead-Detail successfully');
      });
    });
    it('to update Lead-Detail and create test-ride started activity', async () => {
      const vehicle = await factory.create('Vehicle', { vehicle_status: 200 });
      const dealer =  await factory.create('Dealer');
      const saleRole = await app.Roles.findOne({ where: { name: 'DEALER_SALES' } });
      const executiveUser = await factory.create('User', { user_type_id: dealer.id });
      const executiveUserRole = await factory.create('UserRole', { user_id: executiveUser.id, role_id: saleRole.id });
      const newLead = await factory.create('Lead', { dealer_id: dealer.id, assigned_to: executiveUser.id, category: 'HOT'});
      const leadDetail = await factory.create('LeadDetail', { lead_id: newLead.id,
         dealer_id: dealer.id, vehicle_id: vehicle.id, test_ride_on: new Date(), booked_on: new Date()});
      const currentUser = await app.Users.findOne({
         where: {
            id: executiveUser.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });
      const leadDetailService = new LeadDetailService(newLead.id);
      const newLeadDetail = {
        id: leadDetail.id, lead_id: newLead.id,
        dealer_id: dealer.id, vehicle_id: vehicle.id, test_ride_on: new Date(),
        booked_on: new Date(), test_ride_status: 300
      };
      leadDetailService.updateLeadDetail(newLeadDetail, (error, result) => {
        assert.notEqual(error, null, 'Update Lead-Detail successfully');
      });
    });
    it('to update Lead-Detail and create test-ride completed activity', async () => {
      const vehicle = await factory.create('Vehicle', { vehicle_status: 200 });
      const dealer =  await factory.create('Dealer');
      const saleRole = await app.Roles.findOne({ where: { name: 'DEALER_SALES' } });
      const executiveUser = await factory.create('User', { user_type_id: dealer.id });
      const executiveUserRole = await factory.create('UserRole', { user_id: executiveUser.id, role_id: saleRole.id });
      const newLead = await factory.create('Lead', { dealer_id: dealer.id, assigned_to: executiveUser.id, category: 'HOT'});
      const leadDetail = await factory.create('LeadDetail', { lead_id: newLead.id,
         dealer_id: dealer.id, vehicle_id: vehicle.id, test_ride_on: new Date(), booked_on: new Date()});
      const currentUser = await app.Users.findOne({
         where: {
            id: executiveUser.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });
      const leadDetailService = new LeadDetailService(newLead.id);
      const newLeadDetail = {
        id: leadDetail.id, lead_id: newLead.id,
        dealer_id: dealer.id, vehicle_id: vehicle.id, test_ride_on: new Date(),
        booked_on: new Date(), test_ride_status: 400
      };
      leadDetailService.updateLeadDetail(newLeadDetail, (error, result) => {
        assert.notEqual(error, null, 'Update Lead-Detail successfully');
      });
    });
    it('to update Lead-Detail and create test-ride cancelled activity', async () => {
      const vehicle = await factory.create('Vehicle', { vehicle_status: 200 });
      const dealer =  await factory.create('Dealer');
      const saleRole = await app.Roles.findOne({ where: { name: 'DEALER_SALES' } });
      const executiveUser = await factory.create('User', { user_type_id: dealer.id });
      const executiveUserRole = await factory.create('UserRole', { user_id: executiveUser.id, role_id: saleRole.id });
      const newLead = await factory.create('Lead', { dealer_id: dealer.id, assigned_to: executiveUser.id, category: 'HOT'});
      const leadDetail = await factory.create('LeadDetail', { lead_id: newLead.id,
         dealer_id: dealer.id, vehicle_id: vehicle.id, test_ride_on: new Date(), booked_on: new Date()});
      const currentUser = await app.Users.findOne({
         where: {
            id: executiveUser.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });
      const leadDetailService = new LeadDetailService(newLead.id);
      const newLeadDetail = {
        id: leadDetail.id, lead_id: newLead.id,
        dealer_id: dealer.id, vehicle_id: vehicle.id, test_ride_on: new Date(),
        booked_on: new Date(), test_ride_status: 500
      };
      leadDetailService.updateLeadDetail(newLeadDetail, (error, result) => {
        assert.notEqual(error, null, 'Update Lead-Detail successfully');
      });
    });
  });

  describe('updateTestRideVehicleStatus', () => {
    it('to update testride vehicle status', async () => {
      const vehicle = await factory.create('Vehicle', { vehicle_status: 200 });
      const dealer =  await factory.create('Dealer');
      await factory.create('DealerVehicle', { dealer_id: dealer.id, vehicle_id: vehicle.id });
      const saleRole = await app.Roles.findOne({ where: { name: 'DEALER_SALES' } });
      const executiveUser = await factory.create('User', { user_type_id: dealer.id });
      const executiveUserRole = await factory.create('UserRole', { user_id: executiveUser.id, role_id: saleRole.id });
      const newLead = await factory.create('Lead', { dealer_id: dealer.id, assigned_to: executiveUser.id, category: 'HOT'});
      const leadDetail = await factory.create('LeadDetail', { lead_id: newLead.id,
         dealer_id: dealer.id, vehicle_id: vehicle.id,
         test_ride_status: 200});
      const currentUser = await app.Users.findOne({
         where: {
            id: executiveUser.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });
      const newLeadDetail = {
        id: leadDetail.id, lead_id: newLead.id,
        dealer_id: dealer.id, vehicle_id: vehicle.id, test_ride_on: new Date(),
        booked_on: new Date(), test_ride_status: 200
      };
      const leadDetailService = new LeadDetailService(newLead.id, dealer.id, vehicle.id, currentUser);
      leadDetailService.updateTestRideVehicleStatus(leadDetail.id, newLeadDetail, (error, result) => {
        assert.notEqual(result, null, 'Updated testride vehicle status successfully');
      });
    });
  });

  describe('updateLeadDetailAsDeleted', () => {
    it('to update lead-detail as deleted', async () => {
      const vehicle = await factory.create('Vehicle', { vehicle_status: 200 });
      const dealer =  await factory.create('Dealer');
      await factory.create('DealerVehicle', { dealer_id: dealer.id, vehicle_id: vehicle.id });
      const executiveUser = await factory.create('User', { user_type_id: dealer.id });
      const newLead = await factory.create('Lead', { dealer_id: dealer.id, assigned_to: executiveUser.id, category: 'HOT'});
      const leadDetail = await factory.create('LeadDetail', { lead_id: newLead.id,
         dealer_id: dealer.id, vehicle_id: vehicle.id,
         test_ride_status: 200});
      const newLeadDetail = {
        id: leadDetail.id, lead_id: newLead.id,
        dealer_id: dealer.id, vehicle_id: vehicle.id, test_ride_on: new Date(),
        booked_on: new Date(), test_ride_status: 200
      };
      const leadDetailService = new LeadDetailService(newLead.id, dealer.id, vehicle.id, executiveUser);
      leadDetailService.updateLeadDetailAsDeleted(leadDetail.id, (error, result) => {
        assert.equal(error, null, 'Updated lead-detail as deleted successfully');
      });
    });
    it('user not-authorized error', async () => {
      const vehicle = await factory.create('Vehicle', { vehicle_status: 200 });
      const dealer =  await factory.create('Dealer');
      await factory.create('DealerVehicle', { dealer_id: dealer.id, vehicle_id: vehicle.id });
      const executiveUser = await factory.create('User', { user_type_id: null });
      const newLead = await factory.create('Lead', { dealer_id: dealer.id, assigned_to: executiveUser.id, category: 'HOT'});
      const leadDetail = await factory.create('LeadDetail', { lead_id: newLead.id,
         dealer_id: dealer.id, vehicle_id: vehicle.id,
         test_ride_status: 200});
      const newLeadDetail = {
        id: leadDetail.id, lead_id: newLead.id,
        dealer_id: dealer.id, vehicle_id: vehicle.id, test_ride_on: new Date(),
        booked_on: new Date(), test_ride_status: 200
      };
      const leadDetailService = new LeadDetailService(newLead.id, dealer.id, vehicle.id, executiveUser);
      leadDetailService.updateLeadDetailAsDeleted(leadDetail.id, (error, result) => {
        assert.notEqual(error, null, 'User not-authorized error');
      });
    });
    it('lead not-found error', async () => {
      const vehicle = await factory.create('Vehicle', { vehicle_status: 200 });
      const dealer =  await factory.create('Dealer');
      await factory.create('DealerVehicle', { dealer_id: dealer.id, vehicle_id: vehicle.id });
      const executiveUser = await factory.create('User', { user_type_id: dealer.id });
      const newLead = await factory.create('Lead', { dealer_id: dealer.id, assigned_to: executiveUser.id, category: 'HOT'});
      const leadDetail = await factory.create('LeadDetail', { lead_id: newLead.id,
         dealer_id: dealer.id, vehicle_id: vehicle.id,
         test_ride_status: 200});
      const newLeadDetail = {
        id: leadDetail.id, lead_id: newLead.id,
        dealer_id: dealer.id, vehicle_id: vehicle.id, test_ride_on: new Date(),
        booked_on: new Date(), test_ride_status: 200
      };
      const leadDetailService = new LeadDetailService(newLead.id, dealer.id, vehicle.id, executiveUser);
      leadDetailService.updateLeadDetailAsDeleted(newLead.id, (error, result) => {
        assert.notEqual(error, null, 'lead not-found error');
      });
    });
  });
});
