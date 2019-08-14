const loopback = require('../../server/server.js');
const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
const factory = require('../factory.js');
const DealerService = require('../../server/services/dealer_service.js');
const DateUtils = require('../../server/utils/date_utils');
const faker = require('faker/locale/en_IND');
const constants = require('../../server/utils/constants/userConstants');

const app = loopback.dataSources.postgres.models;

describe('dealerService', () => {
  describe('createSales', () => {
    it('returns the sales member created by the manager', async () => {
      const dealer = await factory.create('Dealer');
      const dealerService = new DealerService(dealer.id);
      const adminUser = await factory.create('User');
      const salesUser = await factory.build('User');
      salesUser.manager_id = adminUser.id;
      salesUser.user_type_id = dealer.id;
      dealerService.createSales(salesUser, 'DEALER_SALES', adminUser, (err, dealerSales) => {
        assert.isNotNull(dealerSales, 'Dealer sales created successfully');
      });
    });
  });
  describe('getSalesMember', () => {
    it('returns list of sales members', async () => {
      const dealer = await factory.create('Dealer');
      const dealerService = new DealerService(dealer.id);
      const salesUser = await factory.create('User', { user_type_id : dealer.id });
      dealerService.getAllSalesMember((err, dealerSales) => {
        assert.equal(dealerSales.length, 1, 'Sales members listed successfully');
      });
    });
  });
  describe('getSalesMemberById', () => {
    it('returns sales member by id', async () => {
      const dealer = await factory.create('Dealer');
      const dealerService = new DealerService(dealer.id);
      const salesUser = await factory.create('User');
      dealerService.getSalesMemberById(salesUser.id, (err, dealerSales) => {
        assert.isNotNull(dealerSales, 'Found sales member');
      });
    });
  });
  describe('updateSalesMember', () => {
    it('returns updated sales member', async () => {
      const dealer = await factory.create('Dealer');
      const dealerService = new DealerService(dealer.id);
      const adminUser = await factory.create('User');
      const salesUser = await factory.build('User', {gender: 'female'});
      dealerService.updateSalesMember(salesUser.id, salesUser, 'DEALER_TEAM_HEAD', adminUser, (err, dealerSales) => {
        assert.isNotNull(dealerSales, 'Member updated successfully');
      });
    });
  });
  describe('deleteSalesMember', () => {
    it('returns deleted sales member', async () => {
      const dealer = await factory.create('Dealer');
      const dealerService = new DealerService(dealer.id);
      const adminUser = await factory.create('User');
      const salesUser = await factory.create('User',{manager_id: adminUser.id, user_type_name: 'Dealer'});
      dealerService.deleteSalesMember(salesUser.id, adminUser, (err, salesPerson) => {
        assert.equal(salesPerson.is_active, false, 'Sales member deleted successfully');
      });
    });
  });
  describe('associateAccessories', () => {
    it('associate an accessory to a dealer and returns the associated list', async () => {
      try{
        const accessories = await factory.createMany('Accessory', 5);
        const dealer = await factory.create('Dealer', {
          name: 'dealer 1',
          manufacturer_id: accessories[0].manufacturer_id
        });
        const dealerService = new DealerService(dealer.id);
        const dealerAccessoryList = [{ accessory_id: accessories[0].id, name: accessories[0].name }];
        dealerService.associateAccessories(dealerAccessoryList, (err, dealerAccessories) => {
            expect(dealerAccessories).to.have.length(1);
          });
        } catch (err) {
          throw(err);
        }
      });
    });
    describe('showAllAccessories', () => {
      it('returns the list of dealerAccessories', async () => {
        try{
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
          const dealerService = new DealerService(dealer.id);
          dealerService.showAllAccessories({order_field: 'id', order_by: 'ASC'},
          (err, dealerAccessories) => {
            expect(dealerAccessories).to.have.length(1);
          });
        } catch (err) {
          throw(err);
        }
      });
    });

    describe('getAllMembersByManager', () => {
      it('get sales members under dealer Manager', async() => {
        const dealer =  await factory.create('Dealer');
        const managerRole = await app.Roles.findOne({ where: { name: 'DEALER_MANAGER' } });
        const leadRole = await app.Roles.findOne({ where: { name: 'DEALER_TEAM_HEAD' } });
        const saleRole = await app.Roles.findOne({ where: { name: 'DEALER_SALES' } });
        const managerUser = await factory.create('User', { user_type_id: dealer.id });
        const managerUserRole = await factory.create('UserRole', { user_id: managerUser.id, role_id: managerRole.id })
        const leadUser = await factory.create('User', { user_type_id: dealer.id, manager_id: managerUser.id });
        const leadUserRole = await factory.create('UserRole', { user_id: leadUser.id, role_id: leadRole.id  })
        const executiveUser = await factory.create('User', { user_type_id: dealer.id, manager_id: leadUser.id });
        const executiveUserRole = await factory.create('UserRole', { user_id: executiveUser.id, role_id: saleRole.id })
        const dealerService = new DealerService(dealer.id);
        dealerService.getAllSalesMember(( err, result ) => {
          assert.equal(result.length, 3, 'members found');
        });
      });
    });

    describe('getDirectReportingMembers', () => {
      it('get team leads for a manager', async() => {
        const dealer =  await factory.create('Dealer');
        const managerUser = await factory.create('User', { user_type_id: dealer.id });
        const leadUser = await factory.create('User', { user_type_id: dealer.id, manager_id: managerUser.id });
        const dealerService = new DealerService(dealer.id);
        dealerService.getDirectReportingMembers(managerUser, (err,result) => {
          assert.equal(result.length, 1, ' team lead is found');
        })
      })
      it('no team leads for a manager', async() => {
        const dealer =  await factory.create('Dealer');
        const managerUser = await factory.create('User', { user_type_id: dealer.id });
        const dealerService = new DealerService(dealer.id);
        dealerService.getDirectReportingMembers(managerUser, (err,result) => {
          assert.equal(result.length, 0, ' team lead is found');
        })
      })
    });

  describe('fetchDealersByManufacturerId', () => {
    it('returns the list of dealers that matches with the manufacturer id and zone id', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const zone = await factory.create('Zone', {manufacturer_id: manufacturer.id});
      const state = await factory.create('State', {manufacturer_id: manufacturer.id, zone_id: zone.id});
      const city = await factory.create('City', {manufacturer_id: manufacturer.id, zone_id: zone.id, state_id: state.id});
      const dealer = await factory.create('Dealer', {manufacturer_id: manufacturer.id, zone_id: zone.id, state_id: state.id, city_id: city.id});

      const dealerService = new DealerService();
      const searchFilter = {
        zoneIds: [zone.id],
        orderField: 'name',
        orderBy: 'ASC',
        pageNo: 1,
        limit: 10,
      };
      dealerService.getDealers(manufacturer.id, searchFilter, (fetchError, result) => {
        assert.equal(result.dealers[0].zone_id, zone.id, 'Zone based dealer found');
      });
    });
  });

  describe('fetchDealersByManufacturerIdAndZoneAndOTher', () => {
    it('returns the list of dealers that matches with the manufacturer id and Zone, state, city Id',  async() => {
      const manufacturer = await factory.create('Manufacturer');
      const zone = await factory.create('Zone', {manufacturer_id: manufacturer.id});
      const state = await factory.create('State', {manufacturer_id: manufacturer.id, zone_id: zone.id});
      const city = await factory.create('City', {manufacturer_id: manufacturer.id, zone_id: zone.id, state_id: state.id});
      const dealer = await factory.create('Dealer', {manufacturer_id: manufacturer.id, zone_id: zone.id, state_id: state.id, city_id: city.id});

      const dealerService = new DealerService();
      const searchFilter = {
        zoneIds: [zone.id],
        stateIds: [state.id],
        cityIds: [city.id],
        orderField: 'name',
        orderBy: 'ASC',
        pageNo: 1,
        limit: 10,
      };
      dealerService.getDealers(manufacturer.id, searchFilter, (fetchError, result) => {
        assert.equal(result.dealers[0].city_id, city.id, 'City based dealer found');
      });
    });
  });

  describe('dealerLogin', () => {
    it('Login dealer manager', async () => {
      const dealer =  await factory.create('Dealer');
      const managerRole = await app.Roles.findOne({ where: { name: 'DEALER_MANAGER' } });
      const managerUser = await factory.create('User', { user_type_id: dealer.id, mobile_no: faker.phone.phoneNumber() });
      const managerUserRole = await factory.create('UserRole', { user_id: managerUser.id, role_id: managerRole.id })
      const dealerService = new DealerService();
      dealerService.dealerLogin({'mobile_no':managerUser.mobile_no, 'password':'test1234'}, ( err, result ) => {
        assert.property(result, 'accessToken', 'Dealer Manager logged in successfully');
      });
    });
    it('Login dealer manager with invalid mobile number', async() => {
      const dealer =  await factory.create('Dealer');
      const managerRole = await app.Roles.findOne({ where: { name: 'DEALER_MANAGER' } });
      const managerUser = await factory.create('User', { user_type_id: dealer.id, mobile_no: faker.phone.phoneNumber() });
      const managerUserRole = await factory.create('UserRole', { user_id: managerUser.id, role_id: managerRole.id })
      const dealerService = new DealerService();
      dealerService.dealerLogin({'mobile_no': faker.phone.phoneNumber(), 'password':'test1234'}, ( err, result ) => {
        assert.isNotNull(err, 'Invalid mobile number');
      });
    });
    it('Login dealer manager with invalid password', async() => {
      const dealer =  await factory.create('Dealer');
      const managerRole = await app.Roles.findOne({ where: { name: 'DEALER_MANAGER' } });
      const managerUser = await factory.create('User', { user_type_id: dealer.id, mobile_no: faker.phone.phoneNumber() });
      const managerUserRole = await factory.create('UserRole', { user_id: managerUser.id, role_id: managerRole.id })
      const dealerService = new DealerService();
      dealerService.dealerLogin({'mobile_no':managerUser.mobile_no, 'password':'test12345'}, ( err, result ) => {
        assert.isNotNull(err, 'Invalid Password');
      });
    });
    it('Login unauthorized member', async() => {
      const dealer =  await factory.create('Dealer');
      const managerRole = await app.Roles.findOne({ where: { name: 'SUPER_ADMIN' } });
      const managerUser = await factory.create('User', { user_type_id: dealer.id, mobile_no: faker.phone.phoneNumber() });
      const managerUserRole = await factory.create('UserRole', { user_id: managerUser.id, role_id: managerRole.id })
      const dealerService = new DealerService();
      dealerService.dealerLogin({'mobile_no':managerUser.mobile_no, 'password':'test1234'}, ( err, result ) => {
        assert.isNotNull(err, 'User not authorized');
      });
    });
  });

  describe('getDealerFinancier', () => {
    it('returns dealer-financier list', async() => {
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
      const dealerService = new DealerService(dealer.id);
      dealerService.getDealerFinancier((err, result) => {
        assert.isNotNull(result, 'Dealer-financier listed');
        assert.equal(result.dealerFinanciers.length, 1, 'Dealer-financier listed');
      });
    });
    it('returns dealer not found error', async() => {
      const dealer = await factory.create('Dealer');
      const financier = await factory.createMany('Financier', 5);
      const dealerFinancier = await factory.create('DealerFinancier', {
        dealer_id : dealer.id,
        financier_id: financier[0].id,
      });
      const dealerService = new DealerService(dealerFinancier.id);
      dealerService.getDealerFinancier((err, result) => {
        assert.isNotNull(err, 'throws dealer-not-found error');
      });
    });
  });

  describe('updateFinancier', () => {
    it('returns updated dealer-financier detail', async() => {
      const dealer = await factory.create('Dealer');
      const financier = await factory.createMany('Financier', 5);
      const dealerFinancier = {
        id: financier[0].id,
      };
      const dealerService = new DealerService(dealer.id);
      dealerService.updateFinancier([dealerFinancier], (err, result) => {
        assert.equal(result.dealerFinanciers.length, 1, 'Dealer-Financier detail update done');
      });
    });
    it('returns dealer not found error', async() => {
      const dealer = await factory.create('Dealer');
      const financier = await factory.createMany('Financier', 5);
      const dealerService = new DealerService(financier[0].id);
      const dealerFinancier = {
        id: financier[0].id,
      };
      dealerService.updateFinancier([dealerFinancier], (err, result) => {
        assert.isNotNull(err, 'throws dealer-not-found error');
      });
    });
  });

  describe('getVehiclesWithPrices', () => {
    it('get vehicles with price', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const vehicle = await factory.create('Vehicle', {manufacturer_id: manufacturer.id});
      const variant = await factory.create('Variant', {vehicle_id: vehicle.id});
      const vehicleColor = await factory.create('VehiclePrice', {vehicle_id: vehicle.id, variant_id: variant.id});
      const dealer = await factory.create('Dealer', {manufacturer_id: manufacturer.id});
      const vehiclePrice = await factory.create('VehiclePrice', {vehicle_id: vehicle.id, dealer_id: dealer.id, manufacturer_id: manufacturer.id, variant_id: variant.id});
      const dealerService = new DealerService(dealer.id);
      dealerService.getAllVehicles((fetchError, vehicles) => {
        expect(vehicles).to.not.be.null;
      });
    });

    it('error, dealer id not set', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const vehicle = await factory.create('Vehicle', {manufacturer_id: manufacturer.id});
      const variant = await factory.create('Variant', {vehicle_id: vehicle.id});
      const vehicleColor = await factory.create('VehiclePrice', {vehicle_id: vehicle.id, variant_id: variant.id});
      const dealer = await factory.create('Dealer', {manufacturer_id: manufacturer.id});
      const vehiclePrice = await factory.create('VehiclePrice', {vehicle_id: vehicle.id, dealer_id: dealer.id, manufacturer_id: manufacturer.id, variant_id: variant.id});
      const dealerService = new DealerService(manufacturer.id);
      dealerService.getAllVehicles((fetchError, vehicles) => {
        assert.isNotNull(fetchError);
      });
    });
  });

  describe('updateDealerWithManager', () => {
    it('update dealership and manager details', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const dealer = await factory.create('Dealer', {manufacturer_id: manufacturer.id});
      const managerUser = await factory.create('User', { user_type_id: dealer.id });
      const managerRole = await factory.create('Role', { name: 'DEALER_MANAGER' });
      const managerUserRole = await factory.create('UserRole', { user_id: managerUser.id, role_id: managerRole.id });
      const dealerObj = await app.Dealer.findById(dealer.id);
      const user = await app.Users.findById(managerUser.id);
      dealerObj.name = 'Ramsay';
      user.name = 'Viraj';

      const dealerService = new DealerService(dealer.id);
      dealerService.updateDealerWithManager(dealerObj, user.userId, user, managerUser, (fetchError, dealerUser) => {
        assert.equal(dealerUser.dealer.id, dealer.id,'dealerShip updated');
      });
    });
    it('dealer mismatch for details update', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const dealerOne = await factory.create('Dealer', {manufacturer_id: manufacturer.id});
      const dealerTwo = await factory.create('Dealer', {manufacturer_id: manufacturer.id});
      const managerUser = await factory.create('User', { user_type_id: dealerOne.id });
      const managerRole = await factory.create('Role', { name: 'DEALER_MANAGER' });
      const managerUserRole = await factory.create('UserRole', { user_id: managerUser.id, role_id: managerRole.id });
      const dealerObj = await app.Dealer.findById(dealerOne.id);
      const user = await app.Users.findById(managerUser.id);
      dealerObj.name = 'Ramsay';
      user.name = 'Viraj';

      const dealerService = new DealerService(dealerTwo.id);
      dealerService.updateDealerWithManager(dealerObj, user.userId, user, managerUser, (fetchError, dealerUser) => {
        assert.isNotNull(fetchError, 'throws dealer-not-found error');
      });
    });
  });

  describe('getDetails', () => {
    it('return dealer detail', async() => {
      const dealer = await factory.create('Dealer');
      const dealerService = new DealerService(dealer.id);
      dealerService.getDetails((err, dealerObj) => {
        assert.equal(dealerObj.id, dealer.id, 'Dealer detail found');
      });
    });
    it('return empty dealer', async() => {
      const dealer = await factory.create('Dealer');
      const dealerService = new DealerService(dealer.city_id);
      dealerService.getDetails((err, dealerObj) => {
        assert.equal(dealerObj, null, 'Dealer detail not found');
      });
    });
    it('return empty dealer ', async() => {
      const dealer = await factory.create('Dealer');
      const dealerService = new DealerService();
      dealerService.getDetails((err, dealerObj) => {
        assert.isNotNull(err, 'Dealer id not found');
      });
    });
  });

  describe('getTargetByDate', () => {
    it('return tragets set fo a dealer by id and date filter', async() => {
      const dealer = await factory.create('Dealer');
      const dealerTargets = await factory.create('ManufacturerTarget', {
        dealer_id: dealer.id,
        target_from_date: "2018-04-01",
        target_to_date: "2018-04-30",
        is_special_target: false,
        target_name: "jan",
        financial_year: "2018-2019"
      });
      const dealerService = new DealerService(dealer.id);
      const filter = {
        fromDate: "2018-04-01",
        toDate: "2018-04-30"
      };
      dealerService.getTargetByDate(filter, (err, targets) => {
        assert.equal(targets.length, 1, 'Dealer targets fetched');
      });
    });
  });

  describe('Get Vehicle Key and Value', () => {
    it('List of Vehicles, Variants and Variant Colors', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const vehicle = await factory.create('Vehicle', {manufacturer_id: manufacturer.id});
      const variant = await factory.create('Variant', {vehicle_id: vehicle.id});
      const vehicleColor = await factory.create('VariantColor', {vehicle_id: vehicle.id, variant_id: variant.id});
      const dealer = await factory.create('Dealer', {manufacturer_id: manufacturer.id});
      const vehiclePrice = await factory.create('VehiclePrice', {vehicle_id: vehicle.id, dealer_id: dealer.id, manufacturer_id: manufacturer.id, variant_id: variant.id});
      const dealerService = new DealerService(dealer.id);
      dealerService.getVehiclesKeyValue((error, result) => {
        assert.isNotNull(result, 'Vehicles, Variants and VariantColors listed');
      });
    });
  });

  describe('Get Team members', () => {
    it('Dealer team members listed', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const dealer = await factory.create('Dealer', {manufacturer_id: manufacturer.id});
      const managerRole = await app.Roles.findOne({ where: { name: 'DEALER_MANAGER' } });
      const manager = await factory.create('User', { user_type_id: dealer.id });
      const managerUserRole = await factory.create('UserRole', { user_id: manager.id, role_id: managerRole.id });
      const currentUser = await app.Users.findOne({
         where: {
            id: manager.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });
      const dealerService = new DealerService(dealer.id);
      dealerService.getUsersKeyValue(currentUser, (error, result) => {
        assert.isNotNull(result, 'Dealer team members listed');
      });
    });
  });

  describe('getTeamMembersByCurrentUser', () => {
    it('get sales members under dealer Manager', async() => {
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

      const currentUser = await app.Users.findOne({
         where: {
            id: manager.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });
      const dealerService = new DealerService(dealer.id);
      dealerService.getSalesTeamMembers(currentUser, ( err, result ) => {
        assert.equal(result.length, 2, 'members found');
      });
    });
  });

  describe('getVehiclesSummary', () => {
    it('get Vehicles Summary', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const dealer = await factory.create('Dealer', {manufacturer_id: manufacturer.id});
      const managerRole = await app.Roles.findOne({ where: { name: 'DEALER_MANAGER' } });
      const manager = await factory.create('User', { user_type_id: dealer.id });
      const managerUserRole = await factory.create('UserRole', { user_id: manager.id, role_id: managerRole.id });
      const lead = await factory.create('Lead', { 'dealer_id': dealer.id });
      const vehicle = await factory.create('Vehicle', { manufacturer_id: manufacturer.id });
      const leadDetail = await factory.create('LeadDetail', { 'dealer_id': dealer.id, lead_id: lead.id, vehicle_id: vehicle.id })

      const currentUser = await app.Users.findOne({
         where: {
            id: manager.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });
      const dealerService = new DealerService(dealer.id);
      dealerService.getVehiclesSummary({vehicleId: vehicle.id}, ( err, result ) => {
        assert.equal(result.length, 1, 'members found');
      });
    });
  });

  describe('getTargetSummary', () => {
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
      const filter = { fromDate: currentMonth.from_date, toDate: currentMonth.to_date};
      const dealerService = new DealerService(dealer.id, currentUser);
      dealerService.getTargetSummary(filter ,(err, targets) => {
        assert.notEqual(targets.length, 0, 'Dealer sales created successfully');
      });
    });
  });

  describe('getLeadsSummary', () => {
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
      const dealerService = new DealerService(dealer.id, currentUser);
      dealerService.getLeadsSummary((err, leadsCount) => {
       assert.notEqual(leadsCount.inprogress_test_ride, 0, 'Leads count is taken successfully');
      });
    });
  });

  describe('getExecutivesAssociated', () => {
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
      const dealerService = new DealerService(dealer.id);
      dealerService.getExecutivesAssociated(financier.id, ( err, result ) => {
        assert.notEqual(result.length, 0, 'Financier sales-executives and team-leads fetched successfully');
      });
    });
  });

  describe('associateVehicle', () => {
    it('associate Vehicle', async() => {
      const vehicle = await factory.create('Vehicle');
      await app.Vehicle.updateAll({ id: vehicle.id} , { manufacturer_id: null });
      const dealer = await factory.create('Dealer');
      const managerUser = await factory.create('User', { user_type_id: dealer.id });
      const managerRole = await app.Roles.findOne({ where: { name: 'DEALER_MANAGER' } });
      const currentUser = await app.Users.findOne({ where: { id: managerUser.id},
         include: { relation: "user_role", scope: { include: "role" }}});
      const dealerService = new DealerService(dealer.id, currentUser);
      dealerService.associateVehicle(vehicle.id, currentUser.id, (err, result) => {
        assert.equal(result.dealer_id, dealer.id);
      });
    });
  });

  describe('updateCustomer', () => {
    it('update Customer', async() => {
      const vehicle = await factory.create('Vehicle');
      await app.Vehicle.updateAll({ id: vehicle.id} , { manufacturer_id: null });
      const dealer = await factory.create('Dealer');
      const user = await factory.create('User', { user_type_id: dealer.id });
      const role = await app.Roles.findOne({ where: { name: 'DEALER_TEAM_HEAD' } });
      const userRole = await factory.create('UserRole', { user_id: user.id, role_id: role.id });
      const currentUser = await app.Users.findOne({ where: { id: user.id},
         include: { relation: "user_role", scope: { include: "role" }}});
      const dealerService = new DealerService(dealer.id, currentUser);
      const customerObj = { id: currentUser.id, last_name: 'lastname' };
      dealerService.updateCustomer(currentUser.id, customerObj, (err, result) => {
        assert.equal(result.last_name, 'lastname');
      });
    });
  });

  describe('createNewLead', () => {
    it('create New Lead', async() => {
      const dealer = await factory.create('Dealer');
      const user = await factory.create('User', { user_type_name: 'Customer', mobile_no: '1234' });
      const dealerUser = await factory.create('User', { user_type_id: dealer.id });
      const lead = await factory.create('Lead', { 'dealer_id': dealer.id, mobile_number: user.mobile_no });
      const role = await app.Roles.findOne({ where: { name: 'DEALER_MANAGER' } });
      const userRole = await factory.create('UserRole', { user_id: dealerUser.id, role_id: role.id });
      const currentUser = await app.Users.findOne({ where: { id: dealerUser.id},
         include: { relation: "user_role", scope: { include: "role" }}});
      const dealerService = new DealerService(dealer.id, currentUser);
      dealerService.createNewLead(lead, dealerUser.id, (err, result) => {
        assert.equal(result.id, lead.id);
      });
    });
  });

  describe('updateSalesMember', () => {
    it('update Sales Member', async() => {
      const dealer = await factory.create('Dealer');
      const adminUser = await factory.create('User');
      const dealerUser = await factory.create('User', { manager_id: adminUser.id, user_type_id: dealer.id });
      const dealerUserObj = dealerUser.toObject();
      delete dealerUserObj.id;
      dealerUserObj.username = 'last_name';
      dealerUserObj.email = 'email@email.com';
      const dealerService = new DealerService();
      const userRole = 'DEALER_SALES';
      dealerService.updateSalesMember(dealerUser.id, dealerUserObj, userRole, adminUser, (err, result) => {
        assert.equal(result.email, dealerUserObj.email);
      });
    });
  });

  describe('updateSalesMemberHead', () => {
    it('update Sales Member', async() => {
      const dealer = await factory.create('Dealer');
      const adminUser = await factory.create('User');
      const dealerUser = await factory.create('User', { manager_id: adminUser.id, user_type_id: dealer.id });
      const dealerUserObj = dealerUser.toObject();
      delete dealerUserObj.id;
      dealerUserObj.username = 'last_name1';
      dealerUserObj.email = 'email@email.com1';
      const dealerService = new DealerService();
      const userRole = 'DEALER_TEAM_HEAD';
      dealerService.updateSalesMemberHead(dealerUser.id, dealerUserObj, userRole, adminUser, (err, result) => {
        assert.equal(result.email, dealerUserObj.email);
      });
    });
  });

  describe('getAllSalesTeamMember', () => {
    it('get All Sales Team Member', async() => {
      const dealer = await factory.create('Dealer');
      const adminUser = await factory.create('User');
      const dealerUser = await factory.create('User', { manager_id: adminUser.id, user_type_id: dealer.id });
      const managerRole = await factory.create('Role', { name: 'DEALER_TEAM_HEAD' });
      const dealerUserRole = await factory.create('UserRole', { user_id: dealerUser.id, role_id: managerRole.id });
      const dealerService = new DealerService(dealer.id);
      dealerService.getAllSalesTeamMember(adminUser, (err, result) => {
        assert.equal(result.length, 1);
      });
    });
  });

  describe('getTeamPerformance', () => {
    it('get Team Performance', async() => {
      const dealer = await factory.create('Dealer');
      const adminUser = await factory.create('User');
      const dealerUser = await factory.create('User', { manager_id: adminUser.id, user_type_id: dealer.id });
      const managerRole = await factory.create('Role', { name: 'DEALER_TEAM_HEAD' });
      const dealerUserRole = await factory.create('UserRole', { user_id: dealerUser.id, role_id: managerRole.id });
      const dealerUserObj = await app.Users.findOne({
         where: {
            id: dealerUser.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });
      const dealerTarget = await factory.create('DealerTarget',
        { from_date: new Date(), vehicle_type: 1,
        to_date: new Date(), dealer_id: dealer.id, name: 'name', dealer_sales_id: dealerUser.id, target_value: 10 });
      const dealerService = new DealerService(dealer.id, dealerUserObj);
      dealerService.getTeamPerformance((err, result) => {
        assert.equal(result[0].monthlyTargets, 10);
      });
    });
  });

  describe('Get Financier Interest Details', () => {
    it('Return invalid dealer', async() => {
      const vehicle = await factory.create('Vehicle');
      dealerService = new DealerService(vehicle.id);
      dealerService.getFinancierInterestDetails({}, (err, res) => {
        assert.isNotNull(err, 'Invalid Dealer');
      });
    });
    it('Return Invalid proforma Invoice', async() => {
      const dealer = await factory.create('Dealer');
      dealerService = new DealerService(dealer.id);
      dealerService.getFinancierInterestDetails({}, (err, res) => {
        assert.isNotNull(err, 'Invalid proforma invoice');
      });
    });
    it('Return Invalid proforma Invoice', async() => {
      const manufacturer = await factory.create('Manufacturer');
      const dealer = await factory.create('Dealer', { manufacturer_id: manufacturer.id });
      const vehicle = await factory.create('Vehicle', {
        manufacturer_id: manufacturer.id,
        type: 0
      });
      const variant = await factory.create('Variant', { vehicle_id: vehicle.id });
      const variantColor = await factory.create('VariantColor', { vehicle_id: vehicle.id });
      const price = await factory.create('VehiclePrice', {
        vehicle_id: vehicle.id,
        variant_id: variant.id,
        manufacturer_id: manufacturer.id,
        dealer_id: dealer.id,
        ex_showroom_price:70000,
        rto_charges:1500,
        insurance:1200,
        accessories_price:0,
        onroad_price:72700
      });
      const lead = await factory.create('Lead', { 'dealer_id': dealer.id });
      const leadDetail = await factory.create('LeadDetail', {
        dealer_id: dealer.id,
        lead_id: lead.id,
        vehicle_id: vehicle.id
      });
      const proformaInvoice = await factory.create('ProformaInvoice', {
        manufacturer_id: manufacturer.id,
        dealer_id: dealer.id,
        variant_colour_id: variantColor.id,
        variant_id: variant.id,
        vehicle_price_id: price.id,
        vehicle_id: vehicle.id,
        lead_id: lead.id,
        lead_detail_id: leadDetail.id
      });
      const financier = await factory.create('Financier');
      const interest = await factory.create('FinancierInterestDetail', { financier_id: financier.id });
      const dealerFinancier = await factory.create('DealerFinancier', {
        order: 1,
        dealer_id: dealer.id,
        financier_id: financier.id,
        manufacturer_id: manufacturer.id,
      });
      const filter = {
        income_status: 0,
        domicile_status: 0,
        tenure_from: 12,
        tenure_to: 12,
        advance_emi: 0,
        proforma_invoice_id: proformaInvoice.id,
        down_payment: 20000
      }
      const dealerService = new DealerService(dealer.id);
      dealerService.getFinancierInterestDetails(filter, (err, res) => {
        assert.notEqual(res.length, 0, 'Financier Listed');
      });
    });
  });

  describe('Exchange Vehicles', () => {
    let lead = null;
    let dealerService = null;
    let currentUser = null;
    let dealer = null;
    let proformaInvoice = null;
    before(async () => {
      const manufacturer = await factory.create('Manufacturer');
      dealer = await factory.create('Dealer', { manufacturer_id: manufacturer.id });
      const vehicle = await factory.create('Vehicle', {
        manufacturer_id: manufacturer.id,
        type: 0
      });
      const variant = await factory.create('Variant', { vehicle_id: vehicle.id });
      const variantColor = await factory.create('VariantColor', { vehicle_id: vehicle.id });
      const price = await factory.create('VehiclePrice', {
        vehicle_id: vehicle.id,
        variant_id: variant.id,
        manufacturer_id: manufacturer.id,
        dealer_id: dealer.id,
        ex_showroom_price:70000,
        rto_charges:1500,
        insurance:1200,
        accessories_price:0,
        onroad_price:72700
      });
      lead = await factory.create('Lead', { 'dealer_id': dealer.id });
      const leadDetail = await factory.create('LeadDetail', {
        dealer_id: dealer.id,
        lead_id: lead.id,
        vehicle_id: vehicle.id
      });
      proformaInvoice = await factory.create('ProformaInvoice', {
        manufacturer_id: manufacturer.id,
        dealer_id: dealer.id,
        variant_colour_id: variantColor.id,
        variant_id: variant.id,
        vehicle_price_id: price.id,
        vehicle_id: vehicle.id,
        lead_id: lead.id,
        lead_detail_id: leadDetail.id
      });
      const managerRole = await app.Roles.findOne({ where: { name: 'DEALER_MANAGER' } });
      const manager = await factory.create('User', { user_type_id: dealer.id });
      const managerUserRole = await factory.create('UserRole', { user_id: manager.id, role_id: managerRole.id });
      currentUser = await app.Users.findOne({
         where: {
            id: manager.id
         },
         include: {
           relation: "user_role",
           scope: { include: "role" }
         }
      });
    });
    it('Add exchange vehicle with invalid dealer ID', async () => {
      const exchangeVehicle = {
        manufacturer: 'Bajaj',
        vehicle: 'Pulsar 150',
        variant_year: '2015',
        kilometers_used: '20000',
        quoted_value: 26500,
        status: 'Active',
        dealer_id: dealer.id,
        proforma_invoice_id: proformaInvoice.id,
        lead_id: lead.id
      };
      dealerService = new DealerService(lead.id, currentUser);
      dealerService.addExchangeVehicle(lead.id, exchangeVehicle, (err, res) => {
        assert.isNotNull(err, 'Return invalid dealer ID');
      });
    });
    it('Add exchange vehicle with invalid lead ID', async () => {
      const exchangeVehicle = {
        manufacturer: 'Bajaj',
        vehicle: 'Pulsar 150',
        variant_year: '2015',
        kilometers_used: '20000',
        quoted_value: 26500,
        status: 'Active',
        dealer_id: dealer.id,
        proforma_invoice_id: proformaInvoice.id,
        lead_id: lead.id
      };
      dealerService = new DealerService(dealer.id, currentUser);
      dealerService.addExchangeVehicle(dealer.id, exchangeVehicle, (err, res) => {
        assert.isNotNull(err, 'Return invalid lead ID');
      });
    });
    it('Add Exchange Vehicle', async () => {
      const exchangeVehicle = {
        manufacturer: 'Bajaj',
        vehicle: 'Pulsar 150',
        variant_year: '2015',
        kilometers_used: '20000',
        quoted_value: 26500,
        status: 'Active',
        dealer_id: dealer.id,
        proforma_invoice_id: proformaInvoice.id,
        lead_id: lead.id
      };
      dealerService = new DealerService(dealer.id, currentUser);
      dealerService.addExchangeVehicle(lead.id, exchangeVehicle, (err, res) => {
        assert.isNotNull(res, 'Exchange vehicle added');
      });
    });
    it('Update Exchange Vehicles with invalid dealer ID', async () => {
      const exchangeVehicle = await factory.create('ExchangeVehicle', {
        manufacturer: 'Honda',
        vehicle: 'Shine',
        variant_year: '2015',
        kilometers_used: '20000',
        quoted_value: 26500,
        status: 'Active',
        dealer_id: dealer.id,
        proforma_invoice_id: proformaInvoice.id,
        lead_id: lead.id
      });
      dealerService = new DealerService(lead.id, currentUser);
      exchangeVehicle.status = 'Inactive';
      dealerService.updateExchangeVehicle(lead.id, exchangeVehicle, (err, res) => {
        assert.isNotNull(err, 'Return invalid dealer ID');
      });
    });
    it('Update Exchange Vehicles with invalid lead ID', async () => {
      const exchangeVehicle = await factory.create('ExchangeVehicle', {
        manufacturer: 'Honda',
        vehicle: 'Unicorn',
        variant_year: '2015',
        kilometers_used: '20000',
        quoted_value: 26500,
        status: 'Active',
        dealer_id: dealer.id,
        proforma_invoice_id: proformaInvoice.id,
        lead_id: lead.id
      });
      dealerService = new DealerService(dealer.id, currentUser);
      exchangeVehicle.status = 'Inactive';
      dealerService.updateExchangeVehicle(dealer.id, exchangeVehicle, (err, res) => {
        assert.isNotNull(err, 'Return invalid lead ID');
      });
    });
    it('Update Exchange Vehicles', async () => {
      dealerService = new DealerService(dealer.id, currentUser);
      const exchangeVehicle = await factory.create('ExchangeVehicle', {
        manufacturer: 'Bajaj',
        vehicle: 'Pulsar 220',
        variant_year: '2015',
        kilometers_used: '20000',
        quoted_value: 26500,
        status: 'Active',
        dealer_id: dealer.id,
        proforma_invoice_id: proformaInvoice.id,
        lead_id: lead.id
      });
      exchangeVehicle.status = 'Inactive';
      dealerService.updateExchangeVehicle(lead.id, exchangeVehicle, (err, res) => {
        assert.isNotNull(res, 'Exchange vehicle updated');
      });
    });
    it('Get Exchange Vehicles with invalid dealer ID', async () => {
      const exchangeVehicle = await factory.create('ExchangeVehicle', {
        manufacturer: 'Honda',
        vehicle: 'abc',
        variant_year: '2015',
        kilometers_used: '20000',
        quoted_value: 26500,
        status: 'Active',
        dealer_id: dealer.id,
        proforma_invoice_id: proformaInvoice.id,
        lead_id: lead.id
      });
      dealerService = new DealerService(lead.id, currentUser);
      dealerService.updateExchangeVehicle(lead.id, proformaInvoice.id, (err, res) => {
        assert.isNotNull(err, 'Return invalid dealer ID');
      });
    });
    it('Get Exchange Vehicles with invalid lead ID', async () => {
      const exchangeVehicle = await factory.create('ExchangeVehicle', {
        manufacturer: 'Honda',
        vehicle: 'Unicorn',
        variant_year: '2015',
        kilometers_used: '20000',
        quoted_value: 26500,
        status: 'Active',
        dealer_id: dealer.id,
        proforma_invoice_id: proformaInvoice.id,
        lead_id: lead.id
      });
      dealerService = new DealerService(dealer.id, currentUser);
      dealerService.updateExchangeVehicle(dealer.id, proformaInvoice.id, (err, res) => {
        assert.isNotNull(err, 'Return invalid lead ID');
      });
    });
    it('Update Exchange Vehicles', async () => {
      dealerService = new DealerService(dealer.id, currentUser);
      const exchangeVehicle = await factory.create('ExchangeVehicle', {
        manufacturer: 'Bajaj',
        vehicle: 'Pulsar 220',
        variant_year: '2015',
        kilometers_used: '20000',
        quoted_value: 26500,
        status: 'Active',
        dealer_id: dealer.id,
        proforma_invoice_id: proformaInvoice.id,
        lead_id: lead.id
      });
      dealerService.updateExchangeVehicle(lead.id, proformaInvoice.id, (err, res) => {
        assert.isNotNull(res, 'Exchange vehicle listed');
      });
    });
  });
});
