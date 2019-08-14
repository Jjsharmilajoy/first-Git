const loopback = require('../../server/server.js');
const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
const factory = require('../factory.js');
const faker = require('faker/locale/en_IND');
const DateUtils = require('../../server/utils/date_utils');
const constants = require('../../server/utils/constants/userConstants');

const app = loopback.dataSources.postgres.models;

describe('Dealer', () => {
  let accessToken = {};

  before(async () => {
    const manufacturer = await factory.create('Manufacturer');
    const dealer = await factory.create('Dealer', { manufacturer_id: manufacturer.id });
    const user = await factory.create('User', { user_type_id: dealer.id });
    accessToken = await factory.create('AccessToken', { userId: user.id });
    const role = await app.Roles.findOne({ where: { name: 'DEALER_MANAGER' } });
    const userRole = await factory.create('UserRole', {
      user_id: accessToken.userId,
      principalId: accessToken.userId,
      role_id: role.id,
    });
    return accessToken;
  });

  describe('POST /api/Dealers/{dealerId}/targetDetail', () => {
    it('Get Leads count by status', async () => {
      const manufacturer = await factory.create('Manufacturer');
      const dealer = await factory.create('Dealer', {manfacturer_id : manufacturer.id});
      const dealerTargets = await factory.create('ManufacturerTarget', {
        dealer_id: dealer.id,
        target_from_date: "2018-04-01",
        target_to_date: "2018-04-30",
        is_special_target: false,
        target_name: "jan",
        financial_year: "2018-2019"
      });
      const filter = { fromDate: "2018-04-01", toDate: "2018-04-30" };
      request(loopback)
        .post('/api/Dealers/' + dealer.id + '/targetDetail')
        .set('Accept', 'application/json')
        .set('Authorization', accessToken.id)
        .send(filter)
        .expect(200)
        .end((err, res) => {
          expect(res.body.length).to.equal(1);
        });
    });
  });

  describe('GET /api/Dealers/{dealerId}/details', () => {
    it('Get vehicle price', async () => {
    let dealer = await factory.create('Dealer');
      request(loopback)
        .get('/api/Dealers/'+ dealer.id +'/details')
        .set('Authorization', accessToken.id)
        .set('Content-Type', 'application/json')
        .expect(200)
        .end((err, res) => {
          expect(res.body.id).to.equal(dealer.id);
        });
    });
  });

  describe('GET /api/Dealers/{dealerId}/vehicles/summary', () => {
    it('Get vehicle summary', async () => {
      const manufacturer = await factory.create('Manufacturer');
      const dealer = await factory.create('Dealer', {manufacturer_id: manufacturer.id});
      const managerRole = await app.Roles.findOne({ where: { name: 'DEALER_MANAGER' } });
      const manager = await factory.create('User', { user_type_id: dealer.id });
      const managerUserRole = await factory.create('UserRole', { user_id: manager.id, role_id: managerRole.id });
      const lead = await factory.create('Lead', { 'dealer_id': dealer.id });
      const vehicle = await factory.create('Vehicle', { manufacturer_id: manufacturer.id });
      const leadDetail = await factory.create('LeadDetail', { 'dealer_id': dealer.id, lead_id: lead.id, vehicle_id: vehicle.id });
      const accesstoken = await factory.create('AccessToken', { userId: manager.id });
      const role = await app.Roles.findOne({ where: { name: 'DEALER_MANAGER' } });
      const userRole = await factory.create('UserRole', {
        user_id: accesstoken.userId,
        principalId: accesstoken.userId,
        role_id: role.id,
      });
      request(loopback)
        .get('/api/Dealers/'+ dealer.id +'/details')
        .set('Authorization', accessToken.id)
        .set('Content-Type', 'application/json')
        .expect(200)
        .end((err, res) => {
          expect(res.body.id).to.equal(dealer.id);
        });
    });
  });

  describe('GET /api/dealers/{dealerid}/targetSummary', () => {
    it('returns the target summary for current month', async () => {
      const monthNames = ["jan", "feb", "mar", "apr", "may", "jun","jul", "aug", "sep", "oct", "nov", "dec"];
      const dealer = await factory.create('Dealer');
      const executiveUser = await factory.create('User', { user_type_id: dealer.id });
      const currentMonth = DateUtils.getCurrentMonthDates(new Date());
      const currentMonthBikeTarget = await factory.create('DealerTarget',
        {name:monthNames[new Date().getMonth()], from_date:currentMonth.from_date, vehicle_type: 0,
        to_date:currentMonth.to_date, dealer_id: dealer.id, dealer_sales_id: executiveUser.id});
      const currentMonthScooterTarget = await factory.create('DealerTarget',
        {name:monthNames[new Date().getMonth()], from_date:currentMonth.from_date, vehicle_type: 1,
        to_date:currentMonth.to_date, dealer_id: dealer.id, dealer_sales_id: executiveUser.id});
      const manufacturerBikeTarget = await factory.create('ManufacturerTarget',
        {target_name:monthNames[new Date().getMonth()], target_from_date:currentMonth.from_date,
        target_to_date:currentMonth.to_date, dealer_id: dealer.id, vehicle_type: 0,
        financial_year:new Date(currentMonth.from_date).getFullYear()+'-'+new Date(currentMonth.to_date).getFullYear()});
      const manufacturerScooterTarget = await factory.create('ManufacturerTarget',
        {target_name:monthNames[new Date().getMonth()], target_from_date:currentMonth.from_date,
        target_to_date:currentMonth.to_date, dealer_id: dealer.id, vehicle_type: 1,
        financial_year:new Date(currentMonth.from_date).getFullYear()+'-'+new Date(currentMonth.to_date).getFullYear()});
      const saleRole = await app.Roles.findOne({ where: { name: 'DEALER_SALES' } });
      const executiveUserRole = await factory.create('UserRole', { user_id: executiveUser.id, role_id: saleRole.id });
      const currentUser = await app.Users.findOne({ where: { id: executiveUser.id},
         include: { relation: "user_role", scope: { include: "role" }}});
      const accesstoken = await factory.create('AccessToken', { userId: executiveUser.id });
      const role = await app.Roles.findOne({ where: { name: 'DEALER_SALES' } });
      const userRole = await factory.create('UserRole', {
        user_id: accesstoken.userId,
        principalId: accesstoken.userId,
        role_id: role.id,
      });
      request(loopback)
        .post('/api/dealers/+' + dealer.id + '+/targetSummary')
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .send({ fromDate: currentMonth.from_date, toDate: currentMonth.to_date})
        .expect(200)
        .end((err, res) => {
          expect(res.body.length).to.not.equal(0);
        });
    });
  });

  describe('GET /api/dealers/{dealerid}/leadSummary', () => {
    it('return lead summary for present day', async() => {
      const dealer = await factory.create('Dealer');
      const managerUser = await factory.create('User', { user_type_id: dealer.id });
      const salesUser = await factory.create('User', { user_type_id: dealer.id, manager_id: managerUser.id });
      const managerRole = await app.Roles.findOne({ where: { name: 'DEALER_MANAGER' } });
      const salesRole = await app.Roles.findOne({ where: { name: 'DEALER_SALES' } });
      const managerUserRole = await factory.create('UserRole', { user_id: managerUser.id, role_id: managerRole.id });
      const salesUserRole = await factory.create('UserRole', { user_id: salesUser.id, role_id: salesRole.id });
      const lead = await factory.create('Lead', { dealer_id: dealer.id, assigned_to: salesUser.id, next_followup_on: new Date().toISOString()});
      const scheduledTestRideLeadDetail = await factory.create('LeadDetail', {lead_id: lead.id,test_ride_status: 200})
      const inProgressTestRideLeadDetail = await factory.create('LeadDetail', {lead_id: lead.id,test_ride_status: 300})
      const completedTestRideLeadDetail = await factory.create('LeadDetail', {lead_id: lead.id,test_ride_status: 400})
      const currentUser = await app.Users.findOne({ where: { id: managerUser.id},
         include: { relation: "user_role", scope: { include: "role" }}});
      const accesstoken = await factory.create('AccessToken', { userId: managerUser.id });
      request(loopback)
        .get('/api/dealers/+' + dealer.id + '+/leadSummary')
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .expect(200)
        .end((err, res) => {
          expect(res.body.inprogress_test_ride).to.not.equal(0);
        });
    });
  });

  describe('GET /api/dealers/{dealerId}/Financiers/{financierId}/salesExecutives', () => {
    it('return list of financier sales-executives and team-leads assigned', async() => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_CITY_HEAD' } });
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
      await factory.create('UserRole', { user_id: cityHeadUser.id, role_id: cityHeadRole.id });
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
        user_id: teamHeadUser.id,
        financier_team_id: fianancierTeam.id
      });
      const managerUser = await factory.create('User', { user_type_id: dealer.id });
      const managerRole = await app.Roles.findOne({ where: { name: 'DEALER_MANAGER' } });
      const managerUserRole = await factory.create('UserRole', {
         user_id: managerUser.id, role_id: managerRole.id, principalId: managerUser.id
       });
      const accesstoken = await factory.create('AccessToken', { userId: managerUser.id });
      request(loopback)
        .get('/api/dealers/' + dealer.id + '/Financiers/' + financier.id + '/salesExecutives')
        .set('Accept', 'application/json')
        .set('Authorization', accesstoken.id)
        .expect(200)
        .end((err, res) => {
          expect(res.length).to.not.equal(0);
        });
    });
  });

  describe('POST /api/dealers/{dealerId}/vehicles/{vechileId}/associate', () => {
    it('associate vehicle', async() => {
      const vehicle = await factory.create('Vehicle');
      await app.Vehicle.updateAll({ id: vehicle.id} , { manufacturer_id: null });
      const dealer = await factory.create('Dealer');
      request(loopback)
        .post('/api/dealers/' + dealer.id + '/vehicles/' + vehicle.id + '/associate')
        .set('Accept', 'application/json')
        .set('Authorization', accessToken.id)
        .expect(200)
        .end((err, res) => {
          expect(res.body.dealer_id).to.equal(dealer.id);
        });
    });
  });

  describe('POST /api/dealers/{dealerId}/customer/{customerId}', () => {
    it('associate vehicle', async() => {
      const vehicle = await factory.create('Vehicle');
      const dealer = await factory.create('Dealer');
      const user = await factory.create('User', { user_type_id: dealer.id });
      const role = await app.Roles.findOne({ where: { name: 'DEALER_TEAM_HEAD' } });
      const userRole = await factory.create('UserRole', { user_id: user.id, role_id: role.id });
      const customerObj = { id: user.id, last_name: 'lastname' };
      request(loopback)
        .put('/api/dealers/' + dealer.id + '/customer/' + user.id)
        .set('Accept', 'application/json')
        .set('Authorization', accessToken.id)
        .send(customerObj)
        .expect(200)
        .end((err, res) => {
          expect(res.body.last_name).to.equal('lastname');
        });
    });
  });

  describe('POST /api/dealers/{dealerId}/lead/create', () => {
    it('associate vehicle', async() => {
      const dealer = await factory.create('Dealer');
      const user = await factory.create('User', { user_type_name: 'Customer', mobile_no: '1234' });
      const dealerUser = await factory.create('User', { user_type_id: dealer.id });
      const lead = await factory.build('Lead', { 'dealer_id': dealer.id, mobile_number: user.mobile_no });
      const role = await app.Roles.findOne({ where: { name: 'DEALER_MANAGER' } });
      const userRole = await factory.create('UserRole', { user_id: dealerUser.id, role_id: role.id });
      request(loopback)
        .post('/api/dealers/' + dealer.id + '/lead/create')
        .set('Accept', 'application/json')
        .set('Authorization', accessToken.id)
        .send(lead)
        .expect(200)
        .end((err, res) => {
          expect(res.body.dealer_id).to.equal(lead.dealer_id);
        });
    });
  });

  describe('POST /api/dealers/{dealerId}/allMembers', () => {
    it('associate vehicle', async() => {
      const dealer = await factory.create('Dealer');
      const dealerUser = await factory.create('User', { user_type_id: dealer.id });
      const role = await app.Roles.findOne({ where: { name: 'DEALER_MANAGER' } });
      const userRole = await factory.create('UserRole', { user_id: dealerUser.id, role_id: role.id });
      request(loopback)
        .get('/api/dealers/' + dealer.id + '/allMembers')
        .set('Accept', 'application/json')
        .set('Authorization', accessToken.id)
        .expect(200)
        .end((err, res) => {
          expect(res.body.length).to.not.equal(0);
        });
    });
  });

  describe('POST /api/dealers/{dealerId}/salesMemberHead/create', () => {
    it('associate vehicle', async() => {
      const dealer = await factory.create('Dealer');
      const adminUser = await factory.create('User');
      const dealerUser = await factory.build('User');
      dealerUser.manager_id = adminUser.id;
      dealerUser.user_type_id = dealer.id;
      const role = await app.Roles.findOne({ where: { name: 'DEALER_MANAGER' } });
      const userRole = await factory.create('UserRole', { user_id: adminUser.id, role_id: role.id });
      request(loopback)
        .post('/api/dealers/' + dealer.id + '/salesMemberHead/create')
        .set('Accept', 'application/json')
        .set('Authorization', accessToken.id)
        .send(dealerUser)
        .expect(200)
        .end((err, res) => {
          expect(res.body.manager_id).to.equal(adminUser.id);
        });
    });
  });

  describe('POST /api/dealers/{dealerId}/salesMember/create', () => {
    it('associate vehicle', async() => {
      const dealer = await factory.create('Dealer');
      const adminUser = await factory.create('User');
      const dealerUser = await factory.build('User');
      dealerUser.manager_id = adminUser.id;
      dealerUser.user_type_id = dealer.id;
      const role = await app.Roles.findOne({ where: { name: 'DEALER_TEAM_HEAD' } });
      const userRole = await factory.create('UserRole', { user_id: adminUser.id, role_id: role.id });
      request(loopback)
        .post('/api/dealers/' + dealer.id + '/salesMember/create')
        .set('Accept', 'application/json')
        .set('Authorization', accessToken.id)
        .send(dealerUser)
        .expect(200)
        .end((err, res) => {
          expect(res.body.manager_id).to.equal(adminUser.id);
        });
    });
  });

  describe('GET /api/dealers/{userId}/salesMember/update', () => {
    it('associate vehicle', async() => {
      const dealer = await factory.create('Dealer');
      const adminUser = await factory.create('User');
      const dealerUser = await factory.create('User', { manager_id: adminUser.id, user_type_id: dealer.id });
      const dealerUserObj = dealerUser.toObject();
      delete dealerUserObj.id;
      dealerUserObj.username = 'last_name';
      dealerUserObj.email = 'email@email.com';
      request(loopback)
        .put('/api/dealers/' + dealerUser.id + '/salesMember/update')
        .set('Accept', 'application/json')
        .set('Authorization', accessToken.id)
        .send(dealerUserObj)
        .expect(200)
        .end((err, res) => {
          expect(res.body.email).to.equal(dealerUserObj.email);
        });
    });
  });

  describe('PUT /api/dealers/{userId}/salesMemberHead/update', () => {
    it('associate vehicle', async() => {
      const dealer = await factory.create('Dealer');
      const adminUser = await factory.create('User');
      const dealerUser = await factory.create('User', { manager_id: adminUser.id, user_type_id: dealer.id });
      const dealerUserObj = dealerUser.toObject();
      delete dealerUserObj.id;
      dealerUserObj.username = 'last_name1';
      dealerUserObj.email = 'email1@email.com';
      request(loopback)
        .put('/api/dealers/' + dealerUser.id + '/salesMemberHead/update')
        .set('Accept', 'application/json')
        .set('Authorization', accessToken.id)
        .send(dealerUserObj)
        .expect(200)
        .end((err, res) => {
          expect(res.body.email).to.equal(dealerUserObj.email);
        });
    });
  });

  describe('PUT /api/dealers/{userId}/salesMember/delete', () => {
    it('associate vehicle', async() => {
      const dealer = await factory.create('Dealer');
      const adminUser = await factory.create('User');
      const dealerUser = await factory.create('User', { manager_id: adminUser.id, user_type_id: dealer.id });
      request(loopback)
        .delete('/api/dealers/' + dealerUser.id + '/salesMember/delete')
        .set('Accept', 'application/json')
        .set('Authorization', accessToken.id)
        .expect(200)
        .end((err, res) => {
          expect(res.body.is_active).to.equal(false);
        });
    });
  });

  describe('POST /api/dealers/{dealerId}/accessories/getAll', () => {
    it('associate vehicle', async() => {
      const accessories = await factory.createMany('Accessory', 5);
      const dealer = await factory.create('Dealer', {
        name: 'dealer 1',
        manufacturer_id: accessories[0].manufacturer_id
      });
      const DealerAccessory = await factory.create('DealerAccessory', {
        dealer_id: dealer.id,
        accessory_id: accessories[0].id,
        manufacturer_id: accessories[0].manufacturer_id
      });
      const filter = { order_field: 'id', order_by: 'ASC' };
      request(loopback)
        .post('/api/dealers/' + dealer.id + '/accessories/getAll')
        .set('Accept', 'application/json')
        .set('Authorization', accessToken.id)
        .send(filter)
        .expect(200)
        .end((err, res) => {
          expect(res.body.length).to.not.equal(0);
        });
    });
  });

  describe('POST /api/dealers/{dealerId}/accessories/associate', () => {
    it('associate vehicle', async() => {
      const accessories = await factory.createMany('Accessory', 5);
      const dealer = await factory.create('Dealer', {
        name: 'dealer 1',
        manufacturer_id: accessories[0].manufacturer_id
      });
      const dealerAccessoryList = [{ accessory_id: accessories[0].id, name: accessories[0].name }];
      request(loopback)
        .post('/api/dealers/' + dealer.id + '/accessories/associate')
        .set('Accept', 'application/json')
        .set('Authorization', accessToken.id)
        .send(dealerAccessoryList)
        .expect(200)
        .end((err, res) => {
          expect(res.body.length).to.not.equal(0);
        });
    });
  });

  describe('GET /api/dealers/{dealerId}/directReportingMembers', () => {
    it('associate vehicle', async() => {
      const dealer =  await factory.create('Dealer');
      const managerUser = await factory.create('User', { user_type_id: dealer.id });
      const leadUser = await factory.create('User', { user_type_id: dealer.id, manager_id: accessToken.userId, is_active: true });
      request(loopback)
        .get('/api/dealers/' + dealer.id + '/directReportingMembers')
        .set('Accept', 'application/json')
        .set('Authorization', accessToken.id)
        .expect(200)
        .end((err, res) => {
          expect(res.body.length).to.not.equal(0);
        });
    });
  });

  describe('GET /api/dealers/{dealerId}/testRideVehicles', () => {
    it('associate vehicle', async() => {
      const manufacture = await factory.create('Manufacturer');
      const dealer = await factory.create('Dealer');
      const vehicle = await factory.create('Vehicle');
      const testRideVehicles = await factory.create('TestRideVehicle', { dealer_id: dealer.id, vehicle_id: vehicle.id });
      request(loopback)
        .get('/api/dealers/' + dealer.id + '/testRideVehicles')
        .set('Accept', 'application/json')
        .set('Authorization', accessToken.id)
        .expect(200)
        .end((err, res) => {
          expect(res.body.length).to.not.equal(0);
        });
    });
  });

  describe('GET /api/dealers/{dealerId}/teamMembers', () => {
    it('associate vehicle', async() => {
      const dealer = await factory.create('Dealer');
      const dealerUser = await factory.create('User', { manager_id: accessToken.userId, user_type_id: dealer.id });
      const managerRole = await factory.create('Role', { name: 'DEALER_MANAGER' });
      const dealerUserRole = await factory.create('UserRole', { user_id: dealerUser.id, role_id: managerRole.id });
      request(loopback)
        .get('/api/dealers/' + dealer.id + '/teamMembers')
        .set('Accept', 'application/json')
        .set('Authorization', accessToken.id)
        .expect(200)
        .end((err, res) => {
          expect(res.body.length).to.not.equal(0);
        });
    });
  });

  describe('GET /api/dealers/login', () => {
    it('dealer login', async() => {
      const dealer =  await factory.create('Dealer');
      const managerRole = await app.Roles.findOne({ where: { name: 'DEALER_MANAGER' } });
      const managerUser = await factory.create('User', { user_type_id: dealer.id, mobile_no: '14725836901' });
      const managerUserRole = await factory.create('UserRole', { user_id: managerUser.id, role_id: managerRole.id })
      request(loopback)
        .post('/api/dealers/login')
        .set('Accept', 'application/json')
        .send({'mobile_no':'14725836901', 'password':'test1234'})
        .expect(200)
        .end((err, res) => {
          expect(res.body.accessToken).to.not.equal(null);
        });
    });
  });

  describe('GET /api/dealers/{dealerId}/financiers', () => {
    it('associate vehicle', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const dealer = await factory.create('Dealer', {manufacturer_id : manufacturer.id});
      const financier = await factory.createMany('Financier', 5);
      const dealerFinancier = await factory.create('DealerFinancier', {
        dealer_id : dealer.id,
        financier_id: financier[0].id,
      });
      const manufacturerFinancier = await factory.create('ManufacturerFinancier', {
        manufacturer_id : manufacturer.id,
        financier_id: financier[0].id,
      });
      request(loopback)
        .get('/api/dealers/' + dealer.id + '/financiers')
        .set('Accept', 'application/json')
        .set('Authorization', accessToken.id)
        .expect(200)
        .end((err, res) => {
          expect(res.body.length).to.not.equal(0);
        });
    });
  });

  describe('POST /api/dealers/{dealerId}/updateFinancier', () => {
    it('update Financier', async() => {
      const dealer = await factory.create('Dealer');
      const financier = await factory.createMany('Financier', 5);
      const dealerFinancier = {
        id: financier[0].id,
      };
      request(loopback)
        .post('/api/dealers/' + dealer.id + '/updateFinancier')
        .set('Accept', 'application/json')
        .set('Authorization', accessToken.id)
        .send([dealerFinancier])
        .expect(200)
        .end((err, res) => {
          expect(res.body.dealerFinanciers.length).to.not.equal(0);
        });
    });
  });

  describe('GET /api/dealers/{dealerId}/vehicle/{vehicleId}/variant/{variantId}/vehicleDetail', () => {
    it('associate vehicle', async() => {
      const manufacture = await factory.create('Manufacturer');
      const dealer = await factory.create('Dealer');
      const vehicle = await factory.create('Vehicle');
      const variant = await factory.create('Variant', { vehicle_id: vehicle.id });
      const variantColor = await factory.create('VariantColor', { vehicle_id: vehicle.id, variant_id: variant.id });
      const VehiclePrice = await factory.create('VehiclePrice', { dealer_id: dealer.id, vehicle_id: vehicle.id, variant_id: variant.id })
      request(loopback)
        .get('/api/dealers/' + dealer.id + '/vehicle/' + vehicle.id + '/variant/' + variant.id + '/vehicleDetail')
        .set('Accept', 'application/json')
        .set('Authorization', accessToken.id)
        .expect(200)
        .end((err, res) => {
          expect(res.body.length).to.not.equal(0);
        });
    });
  });

  describe('GET /api/dealers/{dealerId}/user/{userId}/updateDealerWithManager', () => {
    it('associate vehicle', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const dealer = await factory.create('Dealer', {manufacturer_id: manufacturer.id});
      const managerUser = {};
      managerUser.dealer = dealer;
      managerUser.user = await factory.create('User', { user_type_id: dealer.id });
      const managerRole = await factory.create('Role', { name: 'DEALER_MANAGER' });
      const managerUserRole = await factory.create('UserRole', { user_id: managerUser.user.id, role_id: managerRole.id });
      const dealerObj = await app.Dealer.findById(dealer.id);
      const user = await app.Users.findById(managerUser.user.id);
      dealerObj.name = 'Ramsay';
      user.name = 'Viraj';
      request(loopback)
        .put('/api/dealers/' + dealer.id + '/user/' + user.id + '/updateDealerWithManager')
        .set('Accept', 'application/json')
        .set('Authorization', accessToken.id)
        .send(managerUser)
        .expect(200)
        .end((err, res) => {
          expect(res.body.dealer.id).to.equal(dealer.id);
        });
    });
  });

  describe('GET /api/dealers/{dealerId}/vehicles/keyvalue', () => {
    it('associate vehicle', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const vehicle = await factory.create('Vehicle', {manufacturer_id: manufacturer.id});
      const variant = await factory.create('Variant', {vehicle_id: vehicle.id});
      const vehicleColor = await factory.create('VariantColor', {vehicle_id: vehicle.id, variant_id: variant.id});
      const dealer = await factory.create('Dealer', {manufacturer_id: manufacturer.id});
      const vehiclePrice = await factory.create('VehiclePrice', {vehicle_id: vehicle.id, dealer_id: dealer.id, manufacturer_id: manufacturer.id, variant_id: variant.id});
      request(loopback)
        .get('/api/dealers/' + dealer.id + '/vehicles/keyvalue')
        .set('Accept', 'application/json')
        .set('Authorization', accessToken.id)
        .expect(200)
        .end((err, res) => {
          expect(res.body.length).to.not.equal(0);
        });
    });
  });

  describe('GET /api/dealers/{dealerId}/users/keyvalue', () => {
    it('associate vehicle', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const dealer = await factory.create('Dealer', {manufacturer_id: manufacturer.id});
      const managerRole = await app.Roles.findOne({ where: { name: 'DEALER_MANAGER' } });
      const manager = await factory.create('User', { user_type_id: dealer.id });
      const managerUserRole = await factory.create('UserRole', { user_id: manager.id, role_id: managerRole.id });
      request(loopback)
        .get('/api/dealers/' + dealer.id + '/users/keyvalue')
        .set('Accept', 'application/json')
        .set('Authorization', accessToken.id)
        .expect(200)
        .end((err, res) => {
          expect(res.body.length).to.not.equal(0);
        });
    });
  });

  describe('GET /api/dealers/{dealerId}/salesTeamMembers', () => {
    it('associate vehicle', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const dealer = await factory.create('Dealer', {manufacturer_id: manufacturer.id});
      const managerRole = await app.Roles.findOne({ where: { name: 'DEALER_MANAGER' } });
      const manager = await factory.create('User', { user_type_id: dealer.id });
      const managerUserRole = await factory.create('UserRole', { user_id: manager.id, role_id: managerRole.id });
      const leadRole = await app.Roles.findOne({ where: { name: 'DEALER_TEAM_HEAD' } });
      const leadUser = await factory.create('User', { user_type_id: dealer.id, manager_id: manager.id });
      const leadUserRole = await factory.create('UserRole', { user_id: leadUser.id, role_id: leadRole.id  });
      const saleRole = await app.Roles.findOne({ where: { name: 'DEALER_SALES' } });
      const executiveUser = await factory.create('User', { user_type_id: dealer.id, manager_id: leadUser.id });
      const executiveUserRole = await factory.create('UserRole', { user_id: executiveUser.id, role_id: saleRole.id })

      request(loopback)
        .get('/api/dealers/' + dealer.id + '/salesTeamMembers')
        .set('Accept', 'application/json')
        .set('Authorization', accessToken.id)
        .expect(200)
        .end((err, res) => {
          expect(res.body.length).to.not.equal(0);
        });
    });
  });

  describe('GET /api/dealers/{dealerId}/teamPerformance', () => {
    it('associate vehicle', async() => {
      const dealer = await factory.create('Dealer');
      const adminUser = await factory.create('User');
      await app.Users.updateAll({ id: accessToken.userId }, { manager_id: adminUser.id, user_type_id: dealer.id });
      const managerRole = await factory.create('Role', { name: 'DEALER_TEAM_HEAD' });
      const dealerUserRole = await factory.create('UserRole', { user_id: accessToken.userId, role_id: managerRole.id });
      const dealerUserObj = await app.Users.findOne({
         where: {
            id: accessToken.userId
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });
      const dealerTarget = await factory.create('DealerTarget',
        { from_date: new Date(), vehicle_type: 1,
        to_date: new Date(), dealer_id: dealer.id, name: 'name', dealer_sales_id: accessToken.userId, target_value: 10 });
      request(loopback)
        .get('/api/dealers/' + dealer.id + '/teamPerformance')
        .set('Accept', 'application/json')
        .set('Authorization', accessToken.id)
        .expect(200)
        .end((err, res) => {
          expect(res.body[0].monthlyTargets).to.equal(10);
        });
    });
  });
});
