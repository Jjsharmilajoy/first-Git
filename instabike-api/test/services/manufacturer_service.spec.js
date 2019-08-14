const loopback = require('../../server/server.js');
const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
const factory = require('../factory.js');
const ManufacturerService = require('../../server/services/manufacturer_service.js');
const DateUtils = require('../../server/utils/date_utils');

const app = loopback.dataSources.postgres.models;

describe('manufacturerService', () => {
  describe('manufacturerLogin', () => {
    it('Munufacturer login', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const role = await app.Roles.findOne({ where: { name: 'MANUFACTURER' } });
      const manufacturerUser = await factory.create('User', {
        user_type_id : manufacturer.id,
        mobile_no: '1237896540',
        user_type_name: 'Manufacturer',
      });
      const userRole = await factory.create('UserRole', {
        user_id: manufacturerUser.id, role_id: role.id, principalId: manufacturerUser.id,
      });
      const manufacturerService = new ManufacturerService();
      manufacturerService.manufacturerLogin({'mobile_no': '1237896540', 'password': 'test1234'}, (err, result) => {
        assert.property(result, 'accessToken', 'Manufaturer logged in successfully');
      })
    });
    it('Manufacturer login with invalid mobile number', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const role = await app.Roles.findOne({ where: { name: 'MANUFACTURER' } });
      const manufacturerUser = await factory.create('User', {
        user_type_id : manufacturer.id,
        mobile_no: '9638527410',
        user_type_name: 'Manufacturer',
      });
      const userRole = await factory.create('UserRole', {
        user_id: manufacturerUser.id, role_id: role.id, principalid: manufacturerUser.id,
      });
      const manufacturerService = new ManufacturerService();
      manufacturerService.manufacturerLogin({'mobile_no': '9876541231', 'password': 'test1234'}, (err,result) => {
        assert.isNotNull(err, 'Invalid mobile number');
      })
    });
    it('Manufaturer login with invalid password', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const role = await app.Roles.findOne({ where: { name: 'MANUFACTURER' } });
      const manufacturerUser = await factory.create('User', {
        user_type_id : manufacturer.id,
        mobile_no: '1237896540',
        user_type_name: 'Manufacturer',
      });
      const userRole = await factory.create('UserRole', {
        user_id: manufacturerUser.id, role_id: role.id, principalid: manufacturerUser.id,
      });
      const manufacturerService = new ManufacturerService();
      manufacturerService.manufacturerLogin({'mobile_no': '1237896540', 'password': 'test12345'}, (err,result) => {
        assert.isNotNull(err, 'Invalid password');
      })
    });
    it('Manufaturer login with invalid password', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const role = await app.Roles.findOne({ where: { name: 'DEALER_MANAGER' } });
      const manufacturerUser = await factory.create('User', {
        user_type_id : manufacturer.id,
        mobile_no: '1237896540',
        user_type_name: 'Manufacturer',
      });
      const userRole = await factory.create('UserRole', {
        user_id: manufacturerUser.id, role_id: role.id, principalid: manufacturerUser.id,
      });
      const manufacturerService = new ManufacturerService();
      manufacturerService.manufacturerLogin({'mobile_no': '1478523690', 'password': 'test1234'}, (err,result) => {
        assert.isNotNull(err, 'User not authorized');
      })
    });
  });

  describe('updateDetail', () => {
    it('returns updated user and manufacturer detail', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const manufacturerUser = await factory.create('User', {
        user_type_id : manufacturer.id,
        user_type_name: 'MANUFACTURER',
      });
      manufacturerUser.first_name = 'new firstName';
      const manufacturerService = new ManufacturerService();
      manufacturerService.updateDetail(manufacturer.id, manufacturerUser, manufacturer, (err, result) => {
        assert.equal(result.user.first_name, manufacturerUser.first_name, 'Manufacturer detail update done');
      });
    });
  });

  describe('getManufacturerDetail', () => {
    it('returns manufacturer detail based on id', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const manufacturerUser = await factory.create('User', {
        user_type_id : manufacturer.id,
        user_type_name: 'Manufacturer',
      });
      const manufacturerService = new ManufacturerService(manufacturer.id, manufacturerUser);
      manufacturerService.getManufacturerDetail((err, result) => {
        assert.equal(result.manufacturer.id, manufacturer.id, 'Manufacturer detail fetched successfully');
      });
    });
  });

  describe('getManufacturerFinancier', () => {
    it('returns manufacturer-financier list for country-head', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const role = await app.Roles.findOne({ where: { name: 'MANUFACTURER_COUNTRY_HEAD' } });
      const manufacturerUser = await factory.create('User', {
        user_type_id : manufacturer.id,
        user_type_name: 'Manufacturer',
      });
      const userRole = await factory.create('UserRole', {
        user_id: manufacturerUser.id, role_id: role.id, principalid: manufacturerUser.id,
      });
      const currentUser = await app.Users.findOne({
        where: { id: manufacturerUser.id },
        include: {
          relation: 'user_role',
          scope: {
            fields: ['role_id'],
            include: { relation: 'role', scope: { fields: ['id', 'name'] } },
          },
        },
      });
      const financier = await factory.createMany('Financier', 5);
      const manufacturerFinancier = await factory.create('ManufacturerFinancier', {
        manufacturer_id : manufacturer.id,
        financier_id: financier[0].id,
        country_id: currentUser.country_id
      });
      const manufacturerFinancierOrder = await factory.create('ManufacturerFinancierOrder', {
        manufacturer_id : manufacturer.id,
        financier_id: financier[0].id,
        country_id: currentUser.country_id
      });
      const manufacturerService = new ManufacturerService(manufacturer.id, currentUser);
      manufacturerService.getManufacturerFinancier((err, result) => {
        assert.equal(result.manufacturerFinanciers.length, 1, 'Manufacturer-financier listed');
      });
    });
    it('returns manufacturer-financier list for zone-head', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const role = await app.Roles.findOne({ where: { name: 'MANUFACTURER_ZONE_HEAD' } });
      const manufacturerUser = await factory.create('User', {
        user_type_id : manufacturer.id,
        user_type_name: 'Manufacturer',
      });
      const userRole = await factory.create('UserRole', {
        user_id: manufacturerUser.id, role_id: role.id, principalid: manufacturerUser.id,
      });
      const currentUser = await app.Users.findOne({
        where: { id: manufacturerUser.id },
        include: {
          relation: 'user_role',
          scope: {
            fields: ['role_id'],
            include: { relation: 'role', scope: { fields: ['id', 'name'] } },
          },
        },
      });
      const financier = await factory.createMany('Financier', 5);
      const manufacturerFinancier = await factory.create('ManufacturerFinancier', {
        manufacturer_id : manufacturer.id,
        financier_id: financier[0].id,
        zone_id: currentUser.zone_id,
        country_id: currentUser.country_id
      });
      const manufacturerFinancierOrder = await factory.create('ManufacturerFinancierOrder', {
        manufacturer_id : manufacturer.id,
        financier_id: financier[0].id,
        zone_id: currentUser.zone_id,
        country_id: currentUser.country_id
      });
      const manufacturerService = new ManufacturerService(manufacturer.id, currentUser);
      manufacturerService.getManufacturerFinancier((err, result) => {
        assert.equal(result.manufacturerFinanciers.length, 1, 'Manufacturer-financier listed');
      });
    });
    it('returns manufacturer-financier list for state-head', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const role = await app.Roles.findOne({ where: { name: 'MANUFACTURER_STATE_HEAD' } });
      const manufacturerUser = await factory.create('User', {
        user_type_id : manufacturer.id,
        user_type_name: 'Manufacturer',
      });
      const userRole = await factory.create('UserRole', {
        user_id: manufacturerUser.id, role_id: role.id, principalid: manufacturerUser.id,
      });
      const currentUser = await app.Users.findOne({
        where: { id: manufacturerUser.id },
        include: {
          relation: 'user_role',
          scope: {
            fields: ['role_id'],
            include: { relation: 'role', scope: { fields: ['id', 'name'] } },
          },
        },
      });
      const financier = await factory.createMany('Financier', 5);
      const manufacturerFinancier = await factory.create('ManufacturerFinancier', {
        manufacturer_id : manufacturer.id,
        financier_id: financier[0].id,
        state_id: currentUser.state_id,
        zone_id: currentUser.zone_id,
        country_id: currentUser.country_id
      });
      const manufacturerFinancierOrder = await factory.create('ManufacturerFinancierOrder', {
        manufacturer_id : manufacturer.id,
        financier_id: financier[0].id,
        state_id: currentUser.state_id,
        zone_id: currentUser.zone_id,
        country_id: currentUser.country_id
      });
      const manufacturerService = new ManufacturerService(manufacturer.id, currentUser);
      manufacturerService.getManufacturerFinancier((err, result) => {
        assert.equal(result.manufacturerFinanciers.length, 1, 'Manufacturer-financier listed');
      });
    });
    it('returns manufacturer-financier list for city-head', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const role = await app.Roles.findOne({ where: { name: 'MANUFACTURER_CITY_HEAD' } });
      const manufacturerUser = await factory.create('User', {
        user_type_id : manufacturer.id,
        user_type_name: 'Manufacturer',
      });
      const userRole = await factory.create('UserRole', {
        user_id: manufacturerUser.id, role_id: role.id, principalid: manufacturerUser.id,
      });
      const currentUser = await app.Users.findOne({
        where: { id: manufacturerUser.id },
        include: {
          relation: 'user_role',
          scope: {
            fields: ['role_id'],
            include: { relation: 'role', scope: { fields: ['id', 'name'] } },
          },
        },
      });
      const financier = await factory.createMany('Financier', 5);
      const manufacturerFinancier = await factory.create('ManufacturerFinancier', {
        manufacturer_id : manufacturer.id,
        financier_id: financier[0].id,
        city_id: currentUser.city_id,
        state_id: currentUser.state_id,
        zone_id: currentUser.zone_id,
        country_id: currentUser.country_id
      });
      const manufacturerFinancierOrder = await factory.create('ManufacturerFinancierOrder', {
        manufacturer_id : manufacturer.id,
        financier_id: financier[0].id,
        city_id: currentUser.city_id,
        state_id: currentUser.state_id,
        zone_id: currentUser.zone_id,
        country_id: currentUser.country_id
      });
      const manufacturerService = new ManufacturerService(manufacturer.id, currentUser);
      manufacturerService.getManufacturerFinancier((err, result) => {
        assert.equal(result.manufacturerFinanciers.length, 1, 'Manufacturer-financier listed');
      });
    });
  });

  describe('updateFinancier', () => {
    it('returns updated manufacturer-financier detail as country-head', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const role = await app.Roles.findOne({ where: { name: 'MANUFACTURER_COUNTRY_HEAD' } });
      const manufacturerUser = await factory.create('User', {
        user_type_id : manufacturer.id,
        mobile_no: '9638527410',
        user_type_name: 'Manufacturer',
      });
      const userRole = await factory.create('UserRole', {
        user_id: manufacturerUser.id, role_id: role.id, principalid: manufacturerUser.id,
      });
      const currentUser = await app.Users.findOne({
        where: { id: manufacturerUser.id },
        include: {
          relation: 'user_role',
          scope: {
            fields: ['role_id'],
            include: { relation: 'role', scope: { fields: ['id', 'name'] } },
          },
        },
      });
      const financier = await factory.create('Financier');
      const financier2 = await factory.create('Financier');
      const input = {
        updateList: [{
          manufacturer_id : manufacturer.id,
          financier_id: financier.id,
          order: 1}],
        deleteList: [financier2.id],
      };
      const manufacturerService = new ManufacturerService(manufacturer.id, currentUser);
      manufacturerService.updateFinancier(input.updateList, input.deleteList, (err, result) => {
        assert.equal(result.length, 1, 'Manufacturer-Financier detail update done for country');
      });
    });
    it('returns updated manufacturer-financier detail as zone-head', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const role = await app.Roles.findOne({ where: { name: 'MANUFACTURER_ZONE_HEAD' } });
      const manufacturerUser = await factory.create('User', {
        user_type_id : manufacturer.id,
        mobile_no: '9638527410',
        user_type_name: 'Manufacturer',
      });
      const userRole = await factory.create('UserRole', {
        user_id: manufacturerUser.id, role_id: role.id, principalid: manufacturerUser.id,
      });
      const currentUser = await app.Users.findOne({
        where: { id: manufacturerUser.id },
        include: {
          relation: 'user_role',
          scope: {
            fields: ['role_id'],
            include: { relation: 'role', scope: { fields: ['id', 'name'] } },
          },
        },
      });
      const financier = await factory.create('Financier');
      const financier2 = await factory.create('Financier');
      const input = {
        updateList: [{
          manufacturer_id : manufacturer.id,
          financier_id: financier.id,
          order: 1}],
        deleteList: [financier2.id],
      };
      const manufacturerService = new ManufacturerService(manufacturer.id, currentUser);
      manufacturerService.updateFinancier(input.updateList, input.deleteList, (err, result) => {
        assert.equal(result.length, 1, 'Manufacturer-Financier detail update done for zone');
      });
    });
    it('returns updated manufacturer-financier detail as state-head', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const role = await app.Roles.findOne({ where: { name: 'MANUFACTURER_STATE_HEAD' } });
      const manufacturerUser = await factory.create('User', {
        user_type_id : manufacturer.id,
        mobile_no: '9638527410',
        user_type_name: 'Manufacturer',
      });
      const userRole = await factory.create('UserRole', {
        user_id: manufacturerUser.id, role_id: role.id, principalid: manufacturerUser.id,
      });
      const currentUser = await app.Users.findOne({
        where: { id: manufacturerUser.id },
        include: {
          relation: 'user_role',
          scope: {
            fields: ['role_id'],
            include: { relation: 'role', scope: { fields: ['id', 'name'] } },
          },
        },
      });
      const financier = await factory.create('Financier');
      const financier2 = await factory.create('Financier');
      const input = {
        updateList: [{
          manufacturer_id : manufacturer.id,
          financier_id: financier.id,
          order: 1}],
        deleteList: [financier2.id],
      };
      const manufacturerService = new ManufacturerService(manufacturer.id, currentUser);
      manufacturerService.updateFinancier(input.updateList, input.deleteList, (err, result) => {
        assert.equal(result.length, 1, 'Manufacturer-Financier detail update done for state');
      });
    });
    it('returns updated manufacturer-financier detail as city-head', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const role = await app.Roles.findOne({ where: { name: 'MANUFACTURER_CITY_HEAD' } });
      const manufacturerUser = await factory.create('User', {
        user_type_id : manufacturer.id,
        mobile_no: '9638527410',
        user_type_name: 'Manufacturer',
      });
      const userRole = await factory.create('UserRole', {
        user_id: manufacturerUser.id, role_id: role.id, principalid: manufacturerUser.id,
      });
      const currentUser = await app.Users.findOne({
        where: { id: manufacturerUser.id },
        include: {
          relation: 'user_role',
          scope: {
            fields: ['role_id'],
            include: { relation: 'role', scope: { fields: ['id', 'name'] } },
          },
        },
      });
      const financier = await factory.create('Financier');
      const financier2 = await factory.create('Financier');
      const input = {
        updateList: [{
          manufacturer_id : manufacturer.id,
          financier_id: financier.id,
          order: 1}],
        deleteList: [financier2.id],
      };
      const manufacturerService = new ManufacturerService(manufacturer.id, currentUser);
      manufacturerService.updateFinancier(input.updateList, input.deleteList, (err, result) => {
        assert.equal(result.length, 1, 'Manufacturer-Financier detail update done for city');
      });
    });
  });

  describe('getStatesByZone', () => {
    it('returns list of states for a given zone Id', async() => {
      const country = await factory.create('Country');
      const zone = await factory.create('Zone');
      const state = await factory.create('State', { zone_id: zone.id });
      const manufacturerService = new ManufacturerService();
      manufacturerService.getStatesByZone([zone.id], null, (err, result) => {
        assert.equal(result.length, 1, 'States based on zone-id');
      });
    });
    it('returns list of states for a given zone and country', async() => {
      const country = await factory.create('Country');
      const zone = await factory.create('Zone',{country_id: country.id});
      const state = await factory.create('State', { zone_id: zone.id, country_id: country.id });
      const manufacturerService = new ManufacturerService();
      manufacturerService.getStatesByZone([zone.id], country.id, (err, result) => {
        assert.equal(result.length, 1, 'States based on zone-id');
      });
    });
  });

  describe('getCities', () => {
    it('returns list of cities for a given zone-id and state-id', async() => {
      const zone = await factory.create('State');
      const state = await factory.create('Zone', { zone_id: zone.id });
      const city = await factory.create('City', { zone_id: zone.id, state_id : state.id });
      const manufacturerService = new ManufacturerService();
      manufacturerService.getCities([zone.id], [state.id], null, (err, result) => {
        assert.equal(result.length, 1, 'Cities based on zone-id and state-id');
      });
    });
    it('returns list of cities for a given zone-id and state-id', async() => {
      const country = await factory.create('Country');
      const zone = await factory.create('Zone', {country_id: country.id});
      const state = await factory.create('State', { zone_id: zone.id, country_id: country.id});
      const city = await factory.create('City', { zone_id: zone.id, state_id : state.id,
        country_id: country.id});
      const manufacturerService = new ManufacturerService();
      manufacturerService.getCities([zone.id], [state.id], country.id, (err, result) => {
        assert.equal(result.length, 1, 'Cities based on zone-id and state-id');
      });
    });
  });

  describe('getProductSales', () => {
    it('returns product sales count for the current financial year', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const role = await app.Roles.findOne({ where: { name: 'MANUFACTURER' } });
      const manufacturerUser = await factory.create('User', {
        user_type_id : manufacturer.id,
        mobile_no: '9638527410',
        user_type_name: 'Manufacturer',
      });
      const userRole = await factory.create('UserRole', {
        user_id: manufacturerUser.id, role_id: role.id, principalid: manufacturerUser.id,
      });
      const currentUser = await app.Users.findOne({
        where: { id: manufacturerUser.id },
        include: {
          relation: 'user_role',
          scope: {
            fields: ['role_id'],
            include: { relation: 'role', scope: { fields: ['id', 'name'] } },
          },
        },
      });
      const vehicleBike = await factory.create('Vehicle', {type: 0, manufacturer_id: manufacturer.id});
      const vehicleScooter = await factory.create('Vehicle', {type: 1, manufacturer_id: manufacturer.id});
      const bike = await factory.create('LeadDetail', {
        manufacturer_id: manufacturer.id,
        vehicle_id: vehicleBike.id,
        vehicle_status : 600
      });
      const scooter = await factory.create('LeadDetail', {
        manufacturer_id: manufacturer.id,
        vehicle_id: vehicleScooter.id,
        vehicle_status : 600
      });
      const manufacturerService = new ManufacturerService(manufacturer.id, currentUser);
      manufacturerService.getProductSales(new Date(), (err, result) => {
        assert.notEqual(result.length, 1, 'Product sales count for the current financial year');
      });
    });
  });

  describe('getDealersNearBy', () => {
    it('returns all dealers near the location based on radius', async() => {
      const manufacturer = await factory.create('Manufacturer', {location: {"lat":13.02248 , "lng":80.203187}});
      const dealer = await factory.create('Dealer', {manufacturer_id: manufacturer.id, location: {"lat":13.0266396 , "lng":80.2055819}})
      const manufacturerService = new ManufacturerService(manufacturer.id);
      manufacturerService.getDealersNearBy({location:manufacturer.location, radius:5}, (err, result) => {
        assert.notEqual(result.length, 0, 'Dealers near the location based on radius listed');
      });
    });
  });

  describe('getTargetCompletion', () => {
    it('return target completion based on the dealer category', async() => {
      const monthNames = ["jan", "feb", "mar", "apr", "may", "jun","jul", "aug", "sep", "oct", "nov", "dec"];
      const date = new Date();
      let startDate, endDate;
      if (date.getMonth() < 4) {
        startDate = new Date(date.getFullYear() - 1, 3, 1);
        endDate = new Date(date.getFullYear(), 2, 1);
      } else {
        startDate = new Date(date.getFullYear(), 3, 1);
        endDate = new Date(date.getFullYear() + 1, 2, 1);
      }
      const manufacturer = await factory.create('Manufacturer');
      const role = await app.Roles.findOne({ where: { name: 'MANUFACTURER' } });
      const manufacturerUser = await factory.create('User', {
        user_type_id : manufacturer.id,
        mobile_no: '9638527410',
        user_type_name: 'Manufacturer',
      });
      const userRole = await factory.create('UserRole', {
        user_id: manufacturerUser.id, role_id: role.id, principalid: manufacturerUser.id,
      });
      const currentUser = await app.Users.findOne({
        where: { id: manufacturerUser.id },
        include: {
          relation: 'user_role',
          scope: {
            fields: ['role_id'],
            include: { relation: 'role', scope: { fields: ['id', 'name'] } },
          },
        },
      });
      const dealerTarget = await factory.create('ManufacturerTarget',
        {target_name:monthNames[date.getMonth()], target_from_date:startDate,
          target_to_date: endDate, financial_year: startDate.getFullYear()+'-'+endDate.getFullYear(),
          country_id: currentUser.country_id, manufacturer_id: manufacturer.id});
      const filter = { "manufacturerId": dealerTarget.manufacturer_id, "fromDate": startDate.toISOString(),
        "toDate": endDate.toISOString(), "countryId": currentUser.country_id,
        "zoneIds": [dealerTarget.zone_id], "stateIds": [dealerTarget.state_id],
        "cityIds": [dealerTarget.city_id], "vehicleIds":[dealerTarget.vehicle_id]};
      const manufacturerService = new ManufacturerService(dealerTarget.manufacturer_id, currentUser);
      manufacturerService.getTargetCompletion(filter, (err, result) => {
        assert.notEqual(result.length, 0, 'Get the target completion for the current financial year');
      });
    });
    it('return target completion based on category and vehicle', async() => {
      const monthNames = ["jan", "feb", "mar", "apr", "may", "jun","jul", "aug", "sep", "oct", "nov", "dec"];
      const date = new Date();
      let startDate, endDate;
      if (date.getMonth() < 4) {
        startDate = new Date(date.getFullYear() - 1, 3, 1);
        endDate = new Date(date.getFullYear(), 2, 1);
      } else {
        startDate = new Date(date.getFullYear(), 3, 1);
        endDate = new Date(date.getFullYear() + 1, 2, 1);
      }
      const manufacturer = await factory.create('Manufacturer');
      const role = await app.Roles.findOne({ where: { name: 'MANUFACTURER' } });
      const manufacturerUser = await factory.create('User', {
        user_type_id : manufacturer.id,
        mobile_no: '9638527410',
        user_type_name: 'Manufacturer',
      });
      const userRole = await factory.create('UserRole', {
        user_id: manufacturerUser.id, role_id: role.id, principalid: manufacturerUser.id,
      });
      const currentUser = await app.Users.findOne({
        where: { id: manufacturerUser.id },
        include: {
          relation: 'user_role',
          scope: {
            fields: ['role_id'],
            include: { relation: 'role', scope: { fields: ['id', 'name'] } },
          },
        },
      });
      const dealerCategory = await factory.create('DealerCategory', {manufacturer_id: manufacturer.id});
      const dealerTarget = await factory.create('ManufacturerTarget',
        {target_name:monthNames[date.getMonth()], target_from_date:startDate,
          target_to_date: endDate, financial_year: startDate.getFullYear()+'-'+endDate.getFullYear(),
          country_id: currentUser.country_id, manufacturer_id: manufacturer.id,
          dealer_category_id: dealerCategory.id});
      const filter = { "manufacturerId": dealerTarget.manufacturer_id, "fromDate": startDate.toISOString(),
        "toDate": endDate.toISOString(), "countryId": currentUser.country_id,
        "zoneIds": [dealerTarget.zone_id], "stateIds": [dealerTarget.state_id],
        "cityIds": [dealerTarget.city_id], "vehicleIds":[dealerTarget.vehicle_id],
        "dealerCategoryIds": [dealerCategory.id]};
      const manufacturerService = new ManufacturerService(dealerTarget.manufacturer_id, currentUser);
      manufacturerService.getTargetCompletion(filter, (err, result) => {
        assert.notEqual(result.length, 0, 'Get the target completion for the current financial year');
      });
    });
  });

  describe('getFinancierDealersNearBy', () => {
    it('return dealers near the financier location', async()=> {
      const dealer =  await factory.create('Dealer',{location:{"lat":13.00 , "lng":79.20}});
      const financier = await factory.create('Financier', {location:{"lat":13.00 , "lng":79.20}});
      const dealerFinancier = await factory.create('DealerFinancier',
      {dealer_id:dealer.id, financier_id:financier.id, manufacturer_id: dealer.manufacturer_id});
      const manufacturerService = new ManufacturerService(dealer.manufacturer_id);
      manufacturerService.getFinancierDealersNearBy({financierId:financier.id,location:{"lat":13.0266396 , "lng":80.2055819}, radius:2000}, (err, result) => {
        assert.notEqual(result.length, 0, 'Get the dealer near with financier location');
      });
    });
  });

  describe('getFinancierDealershipCount', () => {
    it('return total count of the dealer and dealer associated with financier', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const dealers =  await factory.createMany('Dealer', 5, {manufacturer_id: manufacturer.id});
      const dealerFinancier = await factory.create('DealerFinancier', {manufacturer_id: manufacturer.id, dealer_id: dealers[0].id});
      const manufacturerService = new ManufacturerService(dealerFinancier.manufacturer_id);
      manufacturerService.getFinancierDealershipCount(dealerFinancier.financier_id, (err, result) => {
        assert.isNotNull(result, 'Get the total count of the dealer and dealer associated with financier');
      });
    });
  })

  describe('getDealersCountByCategory', () => {
    it('returns dealer counts based on category and filters', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const country = await factory.create('Country');
      const zone = await factory.create('Zone', {country_id: country.id,
        manufacturer_id: manufacturer.id});
      const state = await factory.create('State', {country_id: country.id, zone_id: zone.id});
      const city = await factory.create('City', {country_id: country.id, zone_id: zone.id,
        state_id: state.id});
      const dealerCategories = await factory.createMany('DealerCategory', 4, { manufacturer_id : manufacturer.id });
      const dealers = await factory.create('Dealer', {
        manufacturer_id : manufacturer.id,
        dealer_category_id: dealerCategories[0].id,
        city_id: city.id,
      });
      const filter = {cityIds: [city.id], stateIds: [state.id], zoneIds: [zone.id],
        countryId: country.id};
      const manufacturerService = new ManufacturerService(manufacturer.id);
      manufacturerService.getDealersCountByCategory(filter, (err, result) => {
        assert.equal(result.length, 4, 'Dealerships count fetched successfully');
      });
    });
  });

  describe('getTopPerformingDealers', () => {
    it('return top performing dealers', async() => {
      const dealer = await factory.create('Dealer');
      const lead = await factory.create('Lead', {dealer_id: dealer.id,
        manufacturer_id: dealer.manufacturer_id});
      const vehicle = await factory.create('Vehicle', {manufacturer_id: dealer.manufacturer_id});
      const leadDetails = await factory.createMany('LeadDetail', 5, {
        manufacturer_id: dealer.manufacturer_id,
        vehicle_id: vehicle.id,
        dealer_id: dealer.id
      });
      const filter = { "manufacturerId": dealer.manufacturer_id, "date": "2018-06-04",
        "countryId": dealer.country_id, "zoneIds": [dealer.zone_id], "cityIds": [dealer.city_id],
        "stateIds": [dealer.state_id],"order_field": "MTD_conversion_percentage",
        "dealerCategoryIds": [dealer.dealer_category_id], "searchValue": dealer.name,
        "order_by": "DESC","limit": 10, pageNo: 1};
      const manufacturerService = new ManufacturerService(dealer.manufacturer_id);
      manufacturerService.getTopPerformingDealers(filter, (err, result) => {
        assert.notEqual(result.dealers.length, 0, 'TopPerformingDealers fetched successfully');
      });
    });
    it('return top performing dealers based on vehicle', async() => {
      const dealer = await factory.create('Dealer');
      const lead = await factory.create('Lead', {dealer_id: dealer.id,
        manufacturer_id: dealer.manufacturer_id});
      const vehicle = await factory.create('Vehicle', {manufacturer_id: dealer.manufacturer_id});
      const leadDetails = await factory.createMany('LeadDetail', 5, {
        manufacturer_id: dealer.manufacturer_id,
        vehicle_id: vehicle.id,
        dealer_id: dealer.id
      });
      const filter = { "manufacturerId": dealer.manufacturer_id, "date": "2018-06-04",
        "countryId": dealer.country_id, "zoneIds": [dealer.zone_id], "cityIds": [dealer.city_id],
        "stateIds": [dealer.state_id],"order_field": "MTD_conversion_percentage",
        "dealerCategoryIds": [dealer.dealer_category_id], "searchValue": dealer.name,
        "order_by": "DESC","limit": 10, pageNo: 1, vehicleIds: [vehicle.id]};
      const manufacturerService = new ManufacturerService(dealer.manufacturer_id);
      manufacturerService.getTopPerformingDealers(filter, (err, result) => {
        assert.notEqual(result.dealers.length, 0, 'TopPerformingDealers fetched successfully');
      });
    });
  })

  describe('getDealerSalesEffectiveness', () => {
    it('returns list of sales sales-effectiveness by product for a dealer', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const dealer = await factory.create('Dealer', {manufacturer_id: manufacturer.id});
      const vehicle = await factory.create('Vehicle', {manufacturer_id: manufacturer.id});
      const leadDetails = await factory.createMany('LeadDetail', 5, {
        manufacturer_id: manufacturer.id,
        vehicle_id: vehicle.id,
        dealer_id: dealer.id
      });
      const filter = {
        "fromDate": "2018-04-01",
        "toDate": "2018-07-31",
        "orderField": "vehicle_name",
        "orderBy": "ASC",
        "limit": 10,
        "pageNo": 1
      };
      const manufacturerService = new ManufacturerService(manufacturer.id);
      manufacturerService.getDealerSalesEffectiveness(dealer.id, filter, (err, result) => {
        assert.notEqual(result.count, 0, 'List of delaer sales-effectiveness fetched successfully');
      });
    });
  });

  describe('getActiveLeads', () => {
    it('returns list of active-leads based on zone', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const zone = await factory.create('Zone', {manufacturer_id: manufacturer.id});
      const dealer = await factory.create('Dealer', {manufacturer_id: manufacturer.id});
      const vehicle = await factory.create('Vehicle', {manufacturer_id: manufacturer.id});
      const lead = await factory.create('Lead', {manufacturer_id: manufacturer.id, dealer_id: dealer.id});
      const leadDetails = await factory.createMany('LeadDetail', 5, {
        manufacturer_id: manufacturer.id,
        vehicle_id: vehicle.id,
        dealer_id: dealer.id,
        lead_id: lead.id
      });
      const filter = {
        "orderField" : "tab_value",
        "orderBy" : "ASC",
        "limit": 10,
        "pageNo": 1,
        "tabGroup": "zone",
      };
      const manufacturerService = new ManufacturerService(manufacturer.id);
      manufacturerService.getActiveLeads(filter, (err, result) => {
        assert.notEqual(result.count, '0', 'List of active-leads based on filter fetched successfully');
      });
    });
    it('returns list of active-leads by default', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const zone = await factory.create('Zone', {manufacturer_id: manufacturer.id});
      const dealer = await factory.create('Dealer', {manufacturer_id: manufacturer.id});
      const vehicle = await factory.create('Vehicle', {manufacturer_id: manufacturer.id});
      const lead = await factory.create('Lead', {manufacturer_id: manufacturer.id, dealer_id: dealer.id});
      const leadDetails = await factory.createMany('LeadDetail', 5, {
        manufacturer_id: manufacturer.id,
        vehicle_id: vehicle.id,
        dealer_id: dealer.id,
        lead_id: lead.id
      });
      const filter = {
        "orderField" : "tab_value",
        "orderBy" : "ASC",
        "limit": 10,
        "pageNo": 1,
        "tabGroup": "",
      };
      const manufacturerService = new ManufacturerService(manufacturer.id);
      manufacturerService.getActiveLeads(filter, (err, result) => {
        assert.notEqual(result.count, '0', 'List of active-leads based on filter fetched successfully');
      });
    });
  });
  describe('getLeadsLostAnalysis', () => {
    it('returns lead-count based on lost-reason grouped by zone', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const zone = await factory.create('Zone', {manufacturer_id: manufacturer.id});
      const lostReason = await factory.create('LostReason');
      const dealer = await factory.create('Dealer', {manufacturer_id: manufacturer.id});
      const vehicle = await factory.create('Vehicle', {manufacturer_id: manufacturer.id});
      const lead = await factory.create('Lead', {
        manufacturer_id: manufacturer.id,
        dealer_id: dealer.id,
        status: 900,
        lost_on: new Date(),
        lost_reason_id: lostReason.id
      });
      const leadDetails = await factory.createMany('LeadDetail', 5, {
        manufacturer_id: manufacturer.id,
        vehicle_id: vehicle.id,
        dealer_id: dealer.id,
        lead_id: lead.id
      });
      const filter = {
        "orderField" : "tab_value",
        "orderBy" : "ASC",
        "limit": 10,
        "pageNo": 1,
        "tabGroup": "zone",
      };
      const manufacturerService = new ManufacturerService(manufacturer.id);
      manufacturerService.getLeadsLostAnalysis(filter, (err, result) => {
        assert.notEqual(result.count, '0', 'List of active-leads based on filter fetched successfully');
      });
    });
    it('returns lead-count based on lost-reason grouped by state', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const zone = await factory.create('Zone', {manufacturer_id: manufacturer.id});
      const state = await factory.create('State', {manufacturer_id: manufacturer.id, zone_id: zone.id});
      const lostReason = await factory.create('LostReason');
      const dealer = await factory.create('Dealer', {manufacturer_id: manufacturer.id});
      const vehicle = await factory.create('Vehicle', {manufacturer_id: manufacturer.id});
      const lead = await factory.create('Lead', {
        manufacturer_id: manufacturer.id,
        dealer_id: dealer.id,
        status: 900,
        lost_on: new Date(),
        lost_reason_id: lostReason.id
      });
      const leadDetails = await factory.createMany('LeadDetail', 5, {
        manufacturer_id: manufacturer.id,
        vehicle_id: vehicle.id,
        dealer_id: dealer.id,
        lead_id: lead.id
      });
      const filter = {
        "orderField" : "tab_value",
        "orderBy" : "ASC",
        "limit": 10,
        "pageNo": 1,
        "tabGroup": "state",
      };
      const manufacturerService = new ManufacturerService(manufacturer.id);
      manufacturerService.getLeadsLostAnalysis(filter, (err, result) => {
        assert.notEqual(result.count, '0', 'List of active-leads based on filter fetched successfully');
      });
    });
    it('returns lead-count based on lost-reason grouped by city', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const zone = await factory.create('Zone', {manufacturer_id: manufacturer.id});
      const state = await factory.create('State', {manufacturer_id: manufacturer.id, zone_id: zone.id});
      const city = await factory.create('City', {manufacturer_id: manufacturer.id, zone_id: zone.id, state_id: state.id});
      const lostReason = await factory.create('LostReason');
      const dealer = await factory.create('Dealer', {manufacturer_id: manufacturer.id});
      const vehicle = await factory.create('Vehicle', {manufacturer_id: manufacturer.id});
      const lead = await factory.create('Lead', {
        manufacturer_id: manufacturer.id,
        dealer_id: dealer.id,
        status: 900,
        lost_on: new Date(),
        lost_reason_id: lostReason.id
      });
      const leadDetails = await factory.createMany('LeadDetail', 5, {
        manufacturer_id: manufacturer.id,
        vehicle_id: vehicle.id,
        dealer_id: dealer.id,
        lead_id: lead.id
      });
      const filter = {
        "orderField" : "tab_value",
        "orderBy" : "ASC",
        "limit": 10,
        "pageNo": 1,
        "tabGroup": "city",
      };
      const manufacturerService = new ManufacturerService(manufacturer.id);
      manufacturerService.getLeadsLostAnalysis(filter, (err, result) => {
        assert.notEqual(result.count, '0', 'List of active-leads based on filter fetched successfully');
      });
    });
    it('returns lead-count based on lost-reason grouped by dealer-category', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const dealerCategory = await factory.create('DealerCategory', {manufacturer_id: manufacturer.id});
      const zone = await factory.create('Zone', {manufacturer_id: manufacturer.id});
      const state = await factory.create('State', {manufacturer_id: manufacturer.id, zone_id: zone.id});
      const city = await factory.create('City', {manufacturer_id: manufacturer.id, zone_id: zone.id, state_id: state.id});
      const lostReason = await factory.create('LostReason');
      const dealer = await factory.create('Dealer', {manufacturer_id: manufacturer.id,
        dealer_category_id: dealerCategory.id});
      const vehicle = await factory.create('Vehicle', {manufacturer_id: manufacturer.id});
      const lead = await factory.create('Lead', {
        manufacturer_id: manufacturer.id,
        dealer_id: dealer.id,
        status: 900,
        lost_on: new Date(),
        lost_reason_id: lostReason.id,
        dealer_category_id: dealerCategory.id
      });
      const leadDetails = await factory.createMany('LeadDetail', 5, {
        manufacturer_id: manufacturer.id,
        vehicle_id: vehicle.id,
        dealer_id: dealer.id,
        lead_id: lead.id
      });
      const filter = {
        "orderField" : "tab_value",
        "orderBy" : "ASC",
        "limit": 10,
        "pageNo": 1,
        "tabGroup": "dealerCategory",
      };
      const manufacturerService = new ManufacturerService(manufacturer.id);
      manufacturerService.getLeadsLostAnalysis(filter, (err, result) => {
        assert.notEqual(result.count, '0', 'List of active-leads based on filter fetched successfully');
      });
    });
  });

  describe('getLeadList', () => {
    it('returns list of leads based on filter', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const zone = await factory.create('Zone', {manufacturer_id: manufacturer.id});
      const state = await factory.create('State', {manufacturer_id: manufacturer.id, zone_id: zone.id});
      const city = await factory.create('City', {manufacturer_id: manufacturer.id, zone_id: zone.id, state_id: state.id});
      const dealer = await factory.create('Dealer', {manufacturer_id: manufacturer.id});
      const vehicle = await factory.create('Vehicle', {manufacturer_id: manufacturer.id});
      const lead = await factory.create('Lead', {manufacturer_id: manufacturer.id, dealer_id: dealer.id});
      const leadDetails = await factory.create('LeadDetail', {
        manufacturer_id: manufacturer.id,
        vehicle_id: vehicle.id,
        dealer_id: dealer.id,
        lead_id: lead.id
      });
      const filter = {
        "orderField" : "created_at",
        "orderBy" : "ASC",
        "limit": 10,
        "pageNo": 1,
        "is_lost": false,
      };
      const manufacturerService = new ManufacturerService(manufacturer.id);
      manufacturerService.getLeadList(filter, (err, result) => {
        assert.notEqual(result.count, 0, 'List of leads based on filter fetched successfully');
      });
    });
    it('returns list of leads based on more than one filter', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const country = await factory.create('Country');
      const zone = await factory.create('Zone', {manufacturer_id: manufacturer.id, country_id: country.id});
      const state = await factory.create('State', {manufacturer_id: manufacturer.id, zone_id: zone.id,
         country_id: country.id});
      const city = await factory.create('City', {manufacturer_id: manufacturer.id, zone_id: zone.id,
        state_id: state.id, country_id: country.id});
      const dealerCategory = await factory.create('DealerCategory', {manufacturer_id: manufacturer.id});
      const dealer = await factory.create('Dealer', {manufacturer_id: manufacturer.id,
        zone_id: zone.id, state_id: state.id, city_id: city.id, country_id: country.id,
        dealer_category_id: dealerCategory.id});
      const vehicle = await factory.create('Vehicle', {manufacturer_id: manufacturer.id});
      const lead = await factory.create('Lead', {manufacturer_id: manufacturer.id, dealer_id: dealer.id,
        state_id: dealer.state_id, city_id: dealer.city_id, zone_id: dealer.zone_id,
        dealer_category_id: dealerCategory.id, country_id: country.id
      });
      const leadDetails = await factory.create('LeadDetail', {
        manufacturer_id: manufacturer.id,
        vehicle_id: vehicle.id,
        dealer_id: dealer.id,
        lead_id: lead.id
      });
      const filter = {
        category: 'HOT',
        countryId: country.id,
        stateIds: [state.id],
        cityIds: [city.id],
        zoneIds: [zone.id],
        dealerCategoryIds: [dealerCategory.id],
        vehicleIds: [vehicle.id],
        orderField : "created_at",
        orderBy : "ASC",
        limit: 10,
        pageNo: 1,
        is_lost: false,
        searchValue: lead.name,
        searchField: 'name',
      };
      const manufacturerService = new ManufacturerService(manufacturer.id);
      manufacturerService.getLeadList(filter, (err, result) => {
        assert.notEqual(result.count, 0, 'List of leads based on filter fetched successfully');
      });
    });
  });

  describe('getInvoicedLeadAnalysis', () => {
    it('returns invoiced-count grouped by zone', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const country = await factory.create('Country');
      const zone = await factory.create('Zone', {manufacturer_id: manufacturer.id,
        country_id: country.id});
      const lostReason = await factory.create('LostReason');
      const dealer = await factory.create('Dealer', {manufacturer_id: manufacturer.id,
        zone_id: zone.id, country_id: country.id});
      const vehicle = await factory.create('Vehicle', {manufacturer_id: manufacturer.id});
      const lead = await factory.create('Lead', {
        manufacturer_id: manufacturer.id,
        dealer_id: dealer.id,
        status: 900,
        lost_on: new Date(),
        lost_reason_id: lostReason.id,
        zone_id: zone.id, country_id: country.id
      });
      const leadDetails = await factory.createMany('LeadDetail', 5, {
        manufacturer_id: manufacturer.id,
        vehicle_id: vehicle.id,
        dealer_id: dealer.id,
        lead_id: lead.id
      });
      const currentMonth = DateUtils.getCurrentMonthDates(new Date());
      const filter = {
        "fromDate" : currentMonth.from_date,
        "toDate" : currentMonth.to_date,
        "orderField" : "tab_value",
        "orderBy" : "ASC",
        "limit": 10,
        "pageNo": 1,
        "tabGroup": "zone",
        "zoneIds": [zone.id],
        "countryId": country.id
      };
      const manufacturerService = new ManufacturerService(manufacturer.id);
      manufacturerService.getInvoicedLeadAnalysis(filter, (err, result) => {
        assert.notEqual(result.count, '0', 'List of invoiced-leads counts fetched successfully');
      });
    });
    it('returns invoiced lead-count based on state', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const zone = await factory.create('Zone', {manufacturer_id: manufacturer.id});
      const state = await factory.create('State', {manufacturer_id: manufacturer.id, zone_id: zone.id});
      const lostReason = await factory.create('LostReason');
      const dealer = await factory.create('Dealer', {manufacturer_id: manufacturer.id});
      const vehicle = await factory.create('Vehicle', {manufacturer_id: manufacturer.id});
      const lead = await factory.create('Lead', {
        manufacturer_id: manufacturer.id,
        dealer_id: dealer.id,
        status: 900,
        lost_on: new Date(),
        lost_reason_id: lostReason.id,
        state_id: state.id,
      });
      const leadDetails = await factory.createMany('LeadDetail', 5, {
        manufacturer_id: manufacturer.id,
        vehicle_id: vehicle.id,
        dealer_id: dealer.id,
        lead_id: lead.id
      });
      const currentMonth = DateUtils.getCurrentMonthDates(new Date());
      const filter = {
        "fromDate" : currentMonth.from_date,
        "toDate" : currentMonth.to_date,
        "orderField" : "tab_value",
        "orderBy" : "ASC",
        "limit": 10,
        "pageNo": 1,
        "tabGroup": "state",
        "stateIds": [state.id]
      };
      const manufacturerService = new ManufacturerService(manufacturer.id);
      manufacturerService.getInvoicedLeadAnalysis(filter, (err, result) => {
        assert.notEqual(result.count, '0', 'List of invoiced-leads count fetched successfully');
      });
    });
    it('returns invoiced-count grouped by city', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const zone = await factory.create('Zone', {manufacturer_id: manufacturer.id});
      const state = await factory.create('State', {manufacturer_id: manufacturer.id, zone_id: zone.id});
      const city = await factory.create('City', {manufacturer_id: manufacturer.id, zone_id: zone.id, state_id: state.id});
      const lostReason = await factory.create('LostReason');
      const dealer = await factory.create('Dealer', {manufacturer_id: manufacturer.id});
      const vehicle = await factory.create('Vehicle', {manufacturer_id: manufacturer.id});
      const lead = await factory.create('Lead', {
        manufacturer_id: manufacturer.id,
        dealer_id: dealer.id,
        status: 900,
        lost_on: new Date(),
        lost_reason_id: lostReason.id,
        city_id: city.id
      });
      const leadDetails = await factory.createMany('LeadDetail', 5, {
        manufacturer_id: manufacturer.id,
        vehicle_id: vehicle.id,
        dealer_id: dealer.id,
        lead_id: lead.id
      });
      const currentMonth = DateUtils.getCurrentMonthDates(new Date());
      const filter = {
        "fromDate" : currentMonth.from_date,
        "toDate" : currentMonth.to_date,
        "orderField" : "tab_value",
        "orderBy" : "ASC",
        "limit": 10,
        "pageNo": 1,
        "tabGroup": "city",
        "cityIds": [city.id]
      };
      const manufacturerService = new ManufacturerService(manufacturer.id);
      manufacturerService.getInvoicedLeadAnalysis(filter, (err, result) => {
        assert.notEqual(result.count, '0', 'List of invoiced-leads count fetched successfully');
      });
    });
    it('returns invoiced-count grouped by dealer-category', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const country = await factory.create('Country');
      const dealerCategory = await factory.create('DealerCategory', {manufacturer_id: manufacturer.id});
      const zone = await factory.create('Zone', {manufacturer_id: manufacturer.id,
        country_id: country.id});
      const state = await factory.create('State', {manufacturer_id: manufacturer.id,
        zone_id: zone.id, country_id: country.id});
      const city = await factory.create('City', {manufacturer_id: manufacturer.id,
        zone_id: zone.id, state_id: state.id, country_id: country.id});
      const lostReason = await factory.create('LostReason');
      const dealer = await factory.create('Dealer', {manufacturer_id: manufacturer.id,
        country_id: country.id, dealer_category_id: dealerCategory.id});
      const vehicle = await factory.create('Vehicle', {manufacturer_id: manufacturer.id});
      const lead = await factory.create('Lead', {
        manufacturer_id: manufacturer.id,
        dealer_id: dealer.id,
        status: 900,
        lost_on: new Date(),
        lost_reason_id: lostReason.id,
        country_id: country.id,
        dealer_category_id: dealerCategory.id
      });
      const leadDetails = await factory.createMany('LeadDetail', 5, {
        manufacturer_id: manufacturer.id,
        vehicle_id: vehicle.id,
        dealer_id: dealer.id,
        lead_id: lead.id
      });
      const currentMonth = DateUtils.getCurrentMonthDates(new Date());
      const filter = {
        "fromDate" : currentMonth.from_date,
        "toDate" : currentMonth.to_date,
        "orderField" : "tab_value",
        "orderBy" : "ASC",
        "limit": 10,
        "pageNo": 1,
        "tabGroup": "dealerCategory",
      };
      const manufacturerService = new ManufacturerService(manufacturer.id);
      manufacturerService.getInvoicedLeadAnalysis(filter, (err, result) => {
        assert.notEqual(result.count, '0', 'List of invoiced-leads count fetched successfully');
      });
    });
    it('returns invoiced-count filtered by vehicle', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const country = await factory.create('Country');
      const dealerCategory = await factory.create('DealerCategory', {manufacturer_id: manufacturer.id});
      const zone = await factory.create('Zone', {manufacturer_id: manufacturer.id,
        country_id: country.id});
      const state = await factory.create('State', {manufacturer_id: manufacturer.id,
        zone_id: zone.id, country_id: country.id});
      const city = await factory.create('City', {manufacturer_id: manufacturer.id,
        zone_id: zone.id, state_id: state.id, country_id: country.id});
      const lostReason = await factory.create('LostReason');
      const dealer = await factory.create('Dealer', {manufacturer_id: manufacturer.id,
        country_id: country.id, dealer_category_id: dealerCategory.id});
      const vehicle = await factory.create('Vehicle', {manufacturer_id: manufacturer.id});
      const lead = await factory.create('Lead', {
        manufacturer_id: manufacturer.id,
        dealer_id: dealer.id,
        status: 900,
        lost_on: new Date(),
        lost_reason_id: lostReason.id,
        country_id: country.id,
        dealer_category_id: dealerCategory.id
      });
      const leadDetails = await factory.createMany('LeadDetail', 5, {
        manufacturer_id: manufacturer.id,
        vehicle_id: vehicle.id,
        dealer_id: dealer.id,
        lead_id: lead.id
      });
      const currentMonth = DateUtils.getCurrentMonthDates(new Date());
      const filter = {
        "fromDate" : currentMonth.from_date,
        "toDate" : currentMonth.to_date,
        "orderField" : "tab_value",
        "orderBy" : "ASC",
        "limit": 10,
        "pageNo": 1,
        "tabGroup": "dealerCategory",
        "productIds": [vehicle.id],
      };
      const manufacturerService = new ManufacturerService(manufacturer.id);
      manufacturerService.getInvoicedLeadAnalysis(filter, (err, result) => {
        assert.notEqual(result.count, '0', 'List of invoiced-leads count fetched successfully');
      });
    });
  });

  describe('getConversionRate', () => {
    it('returns active-leads-count filtered by country', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const country = await factory.create('Country');
      const zone = await factory.create('Zone', {manufacturer_id: manufacturer.id,
        country_id: country.id});
      const lostReason = await factory.create('LostReason');
      const dealer = await factory.create('Dealer', {manufacturer_id: manufacturer.id,
        zone_id: zone.id, country_id: country.id});
      const vehicle = await factory.create('Vehicle', {manufacturer_id: manufacturer.id});
      const lead = await factory.create('Lead', {
        manufacturer_id: manufacturer.id,
        dealer_id: dealer.id,
        status: 900,
        lost_on: new Date(),
        lost_reason_id: lostReason.id,
        zone_id: zone.id, country_id: country.id
      });
      const leadDetails = await factory.createMany('LeadDetail', 5, {
        manufacturer_id: manufacturer.id,
        vehicle_id: vehicle.id,
        dealer_id: dealer.id,
        lead_id: lead.id
      });
      const currentMonth = DateUtils.getCurrentMonthDates(new Date());
      const filter = {
        "fromDate" : currentMonth.from_date,
        "toDate" : currentMonth.to_date,
        "orderField" : "tab_value",
        "orderBy" : "ASC",
        "limit": 10,
        "pageNo": 1,
        "tabGroup": "zone",
        "countryId": country.id
      };
      const manufacturerService = new ManufacturerService(manufacturer.id);
      manufacturerService.getConversionRate(filter, (err, result) => {
        assert.notEqual(result.count, '0', 'List of active-leads counts fetched successfully');
      });
    });
    it('returns active-leads-count grouped by zone', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const zone = await factory.create('Zone', {manufacturer_id: manufacturer.id});
      const lostReason = await factory.create('LostReason');
      const dealer = await factory.create('Dealer', {manufacturer_id: manufacturer.id,
        zone_id: zone.id});
      const vehicle = await factory.create('Vehicle', {manufacturer_id: manufacturer.id});
      const lead = await factory.create('Lead', {
        manufacturer_id: manufacturer.id,
        dealer_id: dealer.id,
        status: 900,
        lost_on: new Date(),
        lost_reason_id: lostReason.id,
        zone_id: zone.id
      });
      const leadDetails = await factory.createMany('LeadDetail', 5, {
        manufacturer_id: manufacturer.id,
        vehicle_id: vehicle.id,
        dealer_id: dealer.id,
        lead_id: lead.id
      });
      const currentMonth = DateUtils.getCurrentMonthDates(new Date());
      const filter = {
        "fromDate" : currentMonth.from_date,
        "toDate" : currentMonth.to_date,
        "orderField" : "tab_value",
        "orderBy" : "ASC",
        "limit": 10,
        "pageNo": 1,
        "tabGroup": "zone",
        "zoneIds": [zone.id]
      };
      const manufacturerService = new ManufacturerService(manufacturer.id);
      manufacturerService.getConversionRate(filter, (err, result) => {
        assert.notEqual(result.count, '0', 'List of active-leads counts fetched successfully');
      });
    });
    it('returns active lead-count based on state', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const zone = await factory.create('Zone', {manufacturer_id: manufacturer.id});
      const state = await factory.create('State', {manufacturer_id: manufacturer.id, zone_id: zone.id});
      const lostReason = await factory.create('LostReason');
      const dealer = await factory.create('Dealer', {manufacturer_id: manufacturer.id, state_id: state.id});
      const vehicle = await factory.create('Vehicle', {manufacturer_id: manufacturer.id});
      const lead = await factory.create('Lead', {
        manufacturer_id: manufacturer.id,
        dealer_id: dealer.id,
        status: 900,
        lost_on: new Date(),
        lost_reason_id: lostReason.id,
        zone_id: zone.id, state_id: state.id
      });
      const leadDetails = await factory.createMany('LeadDetail', 5, {
        manufacturer_id: manufacturer.id,
        vehicle_id: vehicle.id,
        dealer_id: dealer.id,
        lead_id: lead.id
      });
      const currentMonth = DateUtils.getCurrentMonthDates(new Date());
      const filter = {
        "fromDate" : currentMonth.from_date,
        "toDate" : currentMonth.to_date,
        "orderField" : "tab_value",
        "orderBy" : "ASC",
        "limit": 10,
        "pageNo": 1,
        "tabGroup": "state",
        "stateIds": [state.id]
      };
      const manufacturerService = new ManufacturerService(manufacturer.id);
      manufacturerService.getConversionRate(filter, (err, result) => {
        assert.notEqual(result.count, '0', 'List of active-leads count fetched successfully');
      });
    });
    it('returns active-leads-count grouped by city', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const zone = await factory.create('Zone', {manufacturer_id: manufacturer.id});
      const state = await factory.create('State', {manufacturer_id: manufacturer.id, zone_id: zone.id});
      const city = await factory.create('City', {manufacturer_id: manufacturer.id, zone_id: zone.id, state_id: state.id});
      const lostReason = await factory.create('LostReason');
      const dealer = await factory.create('Dealer', {manufacturer_id: manufacturer.id});
      const vehicle = await factory.create('Vehicle', {manufacturer_id: manufacturer.id});
      const lead = await factory.create('Lead', {
        manufacturer_id: manufacturer.id,
        dealer_id: dealer.id,
        status: 900,
        lost_on: new Date(),
        lost_reason_id: lostReason.id
      });
      const leadDetails = await factory.createMany('LeadDetail', 5, {
        manufacturer_id: manufacturer.id,
        vehicle_id: vehicle.id,
        dealer_id: dealer.id,
        lead_id: lead.id
      });
      const currentMonth = DateUtils.getCurrentMonthDates(new Date());
      const filter = {
        "fromDate" : currentMonth.from_date,
        "toDate" : currentMonth.to_date,
        "orderField" : "tab_value",
        "orderBy" : "ASC",
        "limit": 10,
        "pageNo": 1,
        "tabGroup": "city",
        "cityIds": [city.id]
      };
      const manufacturerService = new ManufacturerService(manufacturer.id);
      manufacturerService.getConversionRate(filter, (err, result) => {
        assert.notEqual(result.count, '0', 'List of active-leads count fetched successfully');
      });
    });
    it('returns active-leads-count grouped by dealer-category', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const zone = await factory.create('Zone', {manufacturer_id: manufacturer.id});
      const state = await factory.create('State', {manufacturer_id: manufacturer.id, zone_id: zone.id});
      const city = await factory.create('City', {manufacturer_id: manufacturer.id, zone_id: zone.id, state_id: state.id});
      const lostReason = await factory.create('LostReason');
      const dealer = await factory.create('Dealer', {manufacturer_id: manufacturer.id});
      const vehicle = await factory.create('Vehicle', {manufacturer_id: manufacturer.id});
      const lead = await factory.create('Lead', {
        manufacturer_id: manufacturer.id,
        dealer_id: dealer.id,
        status: 900,
        lost_on: new Date(),
        lost_reason_id: lostReason.id
      });
      const leadDetails = await factory.createMany('LeadDetail', 5, {
        manufacturer_id: manufacturer.id,
        vehicle_id: vehicle.id,
        dealer_id: dealer.id,
        lead_id: lead.id
      });
      const currentMonth = DateUtils.getCurrentMonthDates(new Date());
      const filter = {
        "fromDate" : currentMonth.from_date,
        "toDate" : currentMonth.to_date,
        "orderField" : "tab_value",
        "orderBy" : "ASC",
        "limit": 10,
        "pageNo": 1,
        "tabGroup": "dealerCategory",
        "dealerCategoryIds": [dealer.dealer_category_id],
      };
      const manufacturerService = new ManufacturerService(manufacturer.id);
      manufacturerService.getConversionRate(filter, (err, result) => {
        assert.notEqual(result.count, '0', 'List of active-leads count fetched successfully');
      });
    });
    it('returns active-leads-count filtered by product', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const zone = await factory.create('Zone', {manufacturer_id: manufacturer.id});
      const state = await factory.create('State', {manufacturer_id: manufacturer.id, zone_id: zone.id});
      const city = await factory.create('City', {manufacturer_id: manufacturer.id, zone_id: zone.id, state_id: state.id});
      const lostReason = await factory.create('LostReason');
      const dealer = await factory.create('Dealer', {manufacturer_id: manufacturer.id});
      const vehicle = await factory.create('Vehicle', {manufacturer_id: manufacturer.id});
      const lead = await factory.create('Lead', {
        manufacturer_id: manufacturer.id,
        dealer_id: dealer.id,
        status: 900,
        lost_on: new Date(),
        lost_reason_id: lostReason.id
      });
      const leadDetails = await factory.createMany('LeadDetail', 5, {
        manufacturer_id: manufacturer.id,
        vehicle_id: vehicle.id,
        dealer_id: dealer.id,
        lead_id: lead.id
      });
      const currentMonth = DateUtils.getCurrentMonthDates(new Date());
      const filter = {
        "fromDate" : currentMonth.from_date,
        "toDate" : currentMonth.to_date,
        "orderField" : "tab_value",
        "orderBy" : "ASC",
        "limit": 10,
        "pageNo": 1,
        "tabGroup": "city",
        "productIds": [vehicle.id]
      };
      const manufacturerService = new ManufacturerService(manufacturer.id);
      manufacturerService.getConversionRate(filter, (err, result) => {
        assert.notEqual(result.count, '0', 'List of active-leads count fetched successfully');
      });
    });
  });

  describe('getManufacturer', () => {
    it('returns manufacturer by slug', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const manufacturerService = new ManufacturerService(manufacturer.id);
      manufacturerService.getManufacturer(manufacturer.slug, (err, result) => {
        assert.notEqual(result, null, 'Manufacturer fetched successfully');
      });
    });
  });

  describe('getZonesByCountry', () => {
    it('returns zones by country-id', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const country = await factory.create('Country');
      const zones = await factory.createMany('Zone', 3, {
        manufacturer_id: manufacturer.id, country_id: country.id
      });
      const manufacturerService = new ManufacturerService(manufacturer.id);
      manufacturerService.getZonesByCountry(country.id, (err, result) => {
        assert.notEqual(result, null, 'Manufacturer-zones of country fetched successfully');
      });
    });
  });
});
