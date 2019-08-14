const loopback = require('../../server/server.js');
const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
const factory = require('../factory.js');
const FinancierService = require('../../server/services/financier_service.js');
const DateUtils = require('../../server/utils/date_utils');

const app = loopback.dataSources.postgres.models;

describe('financierService', () => {
  describe('financierLogin', () => {
    it('Login financier manager', async() => {
      const financier =  await factory.create('Financier');
      const managerRole = await app.Roles.findOne({ where: { name: 'FINANCIER_CITY_HEAD' } });
      const managerUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', mobile_no: '123' });
      const managerUserRole = await factory.create('UserRole', { user_id: managerUser.id, role_id: managerRole.id })
      const financierService = new FinancierService();
      financierService.financierLogin({'mobile_no':'123', 'password':'test1234'}, ( err, result ) => {
        assert.property(result, 'accessToken', 'Financier city head logged in successfully');
      });
    });
    it('Login financier manager with invalid mobile number', async() => {
      const financier =  await factory.create('Financier');
      const managerRole = await app.Roles.findOne({ where: { name: 'FINANCIER_CITY_HEAD' } });
      const managerUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', mobile_no: '456780' });
      const managerUserRole = await factory.create('UserRole', { user_id: managerUser.id, role_id: managerRole.id })
      const financierService = new FinancierService();
      financierService.financierLogin({'mobile_no':'123499', 'password':'test1234'}, ( err, result ) => {
        assert.isNotNull(err, 'Invalid mobile number');
      });
    });
    it('Login financier manager with invalid password', async() => {
      const financier =  await factory.create('Financier');
      const managerRole = await app.Roles.findOne({ where: { name: 'FINANCIER_CITY_HEAD' } });
      const managerUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', mobile_no: '9876210' });
      const managerUserRole = await factory.create('UserRole', { user_id: managerUser.id, role_id: managerRole.id })
      const financierService = new FinancierService();
      financierService.financierLogin({'mobile_no':'9876210', 'password':'test12345'}, ( err, result ) => {
        assert.isNotNull(err, 'Invalid Password');
      });
    });
    it('Login unauthorized member', async() => {
      const financier =  await factory.create('Financier');
      const managerRole = await app.Roles.findOne({ where: { name: 'SUPER_ADMIN' } });
      const managerUser = await factory.create('User', { user_type_id: financier.id, mobile_no: '78914560' });
      const managerUserRole = await factory.create('UserRole', { user_id: managerUser.id, role_id: managerRole.id })
      const financierService = new FinancierService();
      financierService.financierLogin({'mobile_no':'78912560', 'password':'test1234'}, ( err, result ) => {
        assert.isNotNull(err, 'User not authorized');
      });
    });
  });

  describe('createFinancierMember', async() => {
    it('Team lead is created by city head', async() => {
      const financier =  await factory.create('Financier');
      const managerRole = await app.Roles.findOne({ where: { name: 'FINANCIER_CITY_HEAD' } });
      const managerUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', mobile_no: '6666666' });
      const managerUserRole = await factory.create('UserRole', { user_id: managerUser.id, role_id: managerRole.id })
      const financierService = new FinancierService(financier.id);
      financierService.createFinancierMember({'mobile_no':'777777', 'email':'abc@abc.com', 'name':'teamlead'},
        'FINANCIER_TEAM_HEAD', managerUser, ( err, result ) => {
        assert.equal(result.manager_id, managerUser.id, 'Financier team lead created successfully');
      });
    });
    it('Sales Executive is created by city head', async() => {
      const financier =  await factory.create('Financier');
      const managerRole = await app.Roles.findOne({ where: { name: 'FINANCIER_CITY_HEAD' } });
      const managerUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', mobile_no: '12347555' });
      const managerUserRole = await factory.create('UserRole', { user_id: managerUser.id, role_id: managerRole.id })
      const financierService = new FinancierService(financier.id);
      financierService.createFinancierMember({'mobile_no':'88888889', 'email':'abcsales@abc.com', 'name':'sales'},
        'FINANCIER_SALES', managerUser, ( err, result ) => {
        assert.isNotNull(result, 'Financier sales executive created successfully');
      });
    });
    it('Member creation failed without financier id', async() => {
      const financier =  await factory.create('Financier');
      const managerRole = await app.Roles.findOne({ where: { name: 'FINANCIER_CITY_HEAD' } });
      const managerUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', mobile_no: '1234567' });
      const managerUserRole = await factory.create('UserRole', { user_id: managerUser.id, role_id: managerRole.id })
      const financierService = new FinancierService(managerUser.id);
      financierService.createFinancierMember({'mobile_no':'12345678901', 'email':'abc@abc.com', 'name':'abc'},
        'FINANCIER_SALES', managerUser, ( err, result ) => {
        assert.isNotNull(err, 'Financier member creation failed');
      });
    });
    it('Member creation failed without current user', async() => {
      const financier =  await factory.create('Financier');
      const managerRole = await app.Roles.findOne({ where: { name: 'FINANCIER_CITY_HEAD' } });
      const managerUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', mobile_no: '1234' });
      const managerUserRole = await factory.create('UserRole', { user_id: managerUser.id, role_id: managerRole.id })
      const financierService = new FinancierService(financier.id);
      financierService.createFinancierMember({'mobile_no':'88866', 'email':'abc@abc.com', 'name':'abc'},
        'FINANCIER_SALES', {}, ( err, result ) => {
        assert.isNotNull(err, 'Financier sales executive creation failed');
      });
    });
  })

  describe('forgotPassword', () => {
    it('Forgot Password', async() => {
      const financier =  await factory.create('Financier');
      const cityHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_CITY_HEAD' } });
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier'});
      const managerUserRole = await factory.create('UserRole', { user_id: cityHeadUser.id, role_id: cityHeadRole.id })
      const financierService = new FinancierService();
      financierService.forgotPassword(cityHeadUser.email, 'Financier', ( err, result ) => {
        assert.isNotNull(result, 'Forgot Password mail sent successfully');
      });
    });
    it('Forgot Password', async() => {
      const financier =  await factory.create('Financier');
      const cityHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_CITY_HEAD' } });
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier'});
      const managerUserRole = await factory.create('UserRole', { user_id: cityHeadUser.id, role_id: cityHeadRole.id })
      const financierService = new FinancierService();
      financierService.forgotPassword(cityHeadUser.first_name, 'Financier', ( err, result ) => {
        assert.isNotNull(err, 'Invalid email-id');
      });
    });
  });

  describe('validatePasswordToken', () => {
    it('Validate Password-token', async() => {
      const cityHeadUser = await factory.create('User', { user_type_name: 'Financier' });
      const accesstoken = await factory.create('AccessToken', { userId: cityHeadUser.id });
      const financierService = new FinancierService();
      financierService.validateAccessToken(accesstoken.id, ( err, result ) => {
        assert.equal(result.isValid, true, 'Check if a required accesstoken has expired');
      });
    });
  });

  describe('getFinancierBranch', () => {
    it('return financier-branch detail for the given financier-user', async() => {
      const financier =  await factory.create('Financier');
      const city =  await factory.create('City');
      const cityHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_CITY_HEAD' } });
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
      await factory.create('UserRole', { user_id: cityHeadUser.id, role_id: cityHeadRole.id })
      const financierBranch = await factory.create('FinancierBranch', {
        financier_id: financier.id,
        city_id: city.id,
        financier_city_head_id: cityHeadUser.id,
        is_home_branch: true,
      });
      const financierService = new FinancierService();
      financierService.getFinancierBranch(cityHeadUser, ( err, result ) => {
        assert.isNotNull(result.financierBranch, 'Financier-branch detail fetched successfully');
      });
    });
  });

  describe('getUserDetail', () => {
    it('return user detail, roles associated and reporting manager', async() => {
      const financier =  await factory.create('Financier');
      const cityHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_CITY_HEAD' } });
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier' });
      await factory.create('UserRole', { user_id: cityHeadUser.id, role_id: cityHeadRole.id });
      const teamHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_TEAM_HEAD' } });
      const teamHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', manager_id: cityHeadUser.id });
      await factory.create('UserRole', { user_id: teamHeadUser.id, role_id: teamHeadRole.id })
      const financierService = new FinancierService(financier.id);
      financierService.getUserDetail(teamHeadUser.id, ( err, result ) => {
        assert.isNotNull(result.user, 'User detail, roles and reporting manager fetched successfully');
      });
    });
  });

  describe('getFinancierDealersOfUser', () => {
    it('return Financier-dealers associated to financier-user', async() => {
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
      const financierService = new FinancierService(financier.id);
      financierService.getFinancierDealersOfUser(teamHeadUser.id, ( err, result ) => {
        assert.notEqual(result.financierUserDealers.length, 0, 'Financier-dealers fetched successfully');
      });
    });
  });

  describe('getUnassignedDealerFinanciers', () => {
    it('return Financier-dealers associated and un-associated to a financier', async() => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
      const dealer = await factory.create('Dealer', { city_id: cityHeadUser.city_id });
      const dealerFinancier = await factory.create('DealerFinancier', {
        dealer_id : dealer.id,
        city_id: cityHeadUser.city_id,
        financier_id: financier.id,
      });
      const financierService = new FinancierService(financier.id);
      financierService.getUnassignedDealerFinanciers(cityHeadUser.id, ( err, result ) => {
        assert.notEqual(result.allDealerships.length, 0, 'all dealer-financiers fetched successfully');
      });
    });
  });

  describe('getUnassignedFinancierTL', () => {
    it('return unassigned Team-Leads of financier-city-head', async() => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
      const teamHeadUser = await factory.create('User', {
        user_type_id: financier.id,
        user_type_name: 'Financier',
        manager_id: cityHeadUser.id,
        city_id: city.id
      });
      const teamHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_TEAM_HEAD' } });
      await factory.create('UserRole', {
        user_id: teamHeadUser.id,
        role_id: teamHeadRole.id,
        principalId: teamHeadUser.id
      });
      const financierService = new FinancierService(financier.id);
      financierService.getUnassignedFinancierTL(cityHeadUser.id, { searchField: "email",
        searchValue : teamHeadUser.email,
        limit: 10
      }, ( err, result ) => {
        assert.notEqual(result.teamLeads.length, 0, 'Unassigned Team-Leads fetched successfully');
      });
    });
  });

  describe('getUnassignedFinancierSales', () => {
    it('return unassigned sales-executives of financier-city-head', async() => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
      const salesUser = await factory.create('User', {
        user_type_id: financier.id,
        user_type_name: 'Financier',
        city_id: city.id
      });
      const salesRole = await app.Roles.findOne({ where: { name: 'FINANCIER_SALES' } });
      await factory.create('UserRole', {
        user_id: salesUser.id,
        role_id: salesRole.id,
        principalId: salesUser.id
      });
      const financierService = new FinancierService(financier.id);
      financierService.getUnassignedFinancierSales(cityHeadUser.id, { searchField: "email",
        searchValue : salesUser.email,
        limit: 10
      }, ( err, result ) => {
        assert.notEqual(result.salesExecutives.length, 0, 'Unassigned sales-executives fetched successfully');
      });
    });
  });

  describe('createTeam', () => {
    it('create and return a new team created by the city-head', async() => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
      const teamHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', manager_id: cityHeadUser.id, city_id: city.id });
      const dealer = await factory.create('Dealer', { city_id: cityHeadUser.city_id });
      const dealerFinancier = await factory.create('DealerFinancier', {
        dealer_id : dealer.id,
        financier_id: financier.id,
      });
      const salesUser = await factory.create('User', {
        user_type_id: financier.id,
        user_type_name: 'Financier',
        city_id: city.id
      });
      const financierService = new FinancierService(financier.id, cityHeadUser);
      financierService.createTeam(teamHeadUser.id, {
        name: "team 1",
        teamHeadId: teamHeadUser.id,
        dealerIds: [dealer.id],
        salesExecutiveIds: [salesUser.id]
      }, ( err, result ) => {
        assert.notEqual(result.team, null, 'Financier-team created successfully');
      });
    });
  });

  describe('getTeamsOfCityHead', () => {
    it('returns the teams of a city-head user', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
      const teamHeadUser = await factory.create('User', {
        user_type_id: financier.id,
        user_type_name: 'Financier',
        manager_id: cityHeadUser.id,
        city_id: city.id
      });
      const teamHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_TEAM_HEAD' } });
      await factory.create('UserRole', {
        user_id: teamHeadUser.id,
        role_id: teamHeadRole.id,
        principalId: teamHeadUser.id
      });
      const financierTeam =  await factory.create('FinancierTeam', {
        financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
      });
      const financierService = new FinancierService(financier.id);
      financierService.getTeamsOfCityHead(cityHeadUser.id, (err, result) => {
        assert.notEqual(result.teams.length, 0, 'Teams of a city-head fetched successfully');
      });
    });
  });

  describe('getTeamByOwnerId', () => {
    it('returns the teams of a team-head user', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
      const teamHeadUser = await factory.create('User', {
        user_type_id: financier.id,
        user_type_name: 'Financier',
        manager_id: cityHeadUser.id,
        city_id: city.id
      });
      const teamHeadRole = await app.Roles.findOne({ where: { name: 'FINANCIER_TEAM_HEAD' } });
      await factory.create('UserRole', {
        user_id: teamHeadUser.id,
        role_id: teamHeadRole.id,
        principalId: teamHeadUser.id
      });
      const financierTeam =  await factory.create('FinancierTeam', {
        financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
      });
      const financierService = new FinancierService(financier.id);
      financierService.getTeamByOwnerId(teamHeadUser.id, (err, result) => {
        assert.notEqual(result.teams.length, 0, 'Teams of a team-head fetched successfully');
      });
    });
  });

  describe('addSalesMemberToTeam', () => {
    it('create or add a new team-member to exsisting team', async() => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
      const teamHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', manager_id: cityHeadUser.id, city_id: city.id });
      const dealer = await factory.create('Dealer', { city_id: cityHeadUser.city_id });
      const dealerFinancier = await factory.create('DealerFinancier', {
        dealer_id : dealer.id,
        financier_id: financier.id,
      });
      const salesUser = await factory.create('User', {
        user_type_id: financier.id,
        user_type_name: 'Financier',
        city_id: city.id
      });
      const financierTeam =  await factory.create('FinancierTeam', {
        financier_id: financier.id, city_id: city.id, owned_by: teamHeadUser.id
      });
      const newMembers = { teamMembers: [salesUser], dealerIds: [dealer.id] };
      const financierService = new FinancierService(financier.id, cityHeadUser);
      financierService.addSalesMemberToTeam(financierTeam.id, newMembers.teamMembers,
        newMembers.dealerIds, 'FINANCIER_SALES', cityHeadUser, ( err, result ) => {
          assert.notEqual(result.message, null, 'Financier-team-member created successfully');
        });
    });
  });

  describe('getUserPerformanceSummary', () => {
    it('returns the financier-user target and leads summary', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
      const teamHeadUser = await factory.create('User', {
        user_type_id: financier.id,
        user_type_name: 'Financier',
        manager_id: cityHeadUser.id,
        city_id: city.id
      });
      const monthNames = ["jan", "feb", "mar", "apr", "may", "jun","jul", "aug", "sep", "oct", "nov", "dec"];
      const currentMonth = DateUtils.getCurrentMonthDates(new Date());
      const financierTeam =  await factory.create('FinancierTeam', { financier_id: financier.id, owned_by: teamHeadUser.id });
      const currentMonthFinancierTarget = await factory.create('FinancierTarget', {
        name: monthNames[new Date().getMonth()], from: currentMonth.from_date,
        to: currentMonth.to_date, fianancier_id: financier.id, user_id: teamHeadUser.id,
        financier_team_id: financierTeam.id
      });
      const filter = { fromDate: "2018-07-01", toDate: "2018-07-31" };
      const financierService = new FinancierService(financier.id);
      financierService.getUserPerformanceSummary( teamHeadUser.id, filter, (err, result) => {
        assert.notEqual(result.userPerformance, null, 'Financier-user target and leads summary fetched successfully');
      });
    });
  });

  describe('getCityHeadSummary', () => {
    it('returns the financier-city-head target and leads summary', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
      const teamHeadUser = await factory.create('User', {
        user_type_id: financier.id,
        user_type_name: 'Financier',
        manager_id: cityHeadUser.id,
        city_id: city.id
      });
      const monthNames = ["jan", "feb", "mar", "apr", "may", "jun","jul", "aug", "sep", "oct", "nov", "dec"];
      const currentMonth = DateUtils.getCurrentMonthDates(new Date());
      const financierTeam =  await factory.create('FinancierTeam', { financier_id: financier.id, owned_by: teamHeadUser.id });
      const currentMonthFinancierTarget = await factory.create('FinancierTarget', {
        name: monthNames[new Date().getMonth()], from: currentMonth.from_date,
        to: currentMonth.to_date, fianancier_id: financier.id, user_id: null,
        financier_team_id: financierTeam.id
      });
      const filter = { fromDate: "2018-07-01", toDate: "2018-07-31" };
      const financierService = new FinancierService(financier.id);
      financierService.getCityHeadSummary( cityHeadUser.id, filter, (err, result) => {
        assert.notEqual(result.performance, null, 'Financier-city-head target and leads summary fetched successfully');
      });
    });
  });

  describe('getTeamSummary', () => {
    it('returns the financier-team target and leads summary', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
      const teamHeadUser = await factory.create('User', {
        user_type_id: financier.id,
        user_type_name: 'Financier',
        manager_id: cityHeadUser.id,
        city_id: city.id
      });
      const monthNames = ["jan", "feb", "mar", "apr", "may", "jun","jul", "aug", "sep", "oct", "nov", "dec"];
      const currentMonth = DateUtils.getCurrentMonthDates(new Date());
      const financierTeam =  await factory.create('FinancierTeam', { financier_id: financier.id, owned_by: teamHeadUser.id });
      const currentMonthFinancierTarget = await factory.create('FinancierTarget', {
        name: monthNames[new Date().getMonth()], from: currentMonth.from_date,
        to: currentMonth.to_date, fianancier_id: financier.id, user_id: teamHeadUser.id,
        financier_team_id: financierTeam.id
      });
      const filter = { fromDate: "2018-07-01", toDate: "2018-07-31" };
      const financierService = new FinancierService(financier.id);
      financierService.getTeamSummary( financierTeam.id, filter, (err, result) => {
        assert.notEqual(result.performance, null, 'Financier-team target and leads summary fetched successfully');
      });
    });
  });

  describe('getMonthlyPerformanceOfTeam', () => {
    it('returns the financier-team monthly performance', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
      const teamHeadUser = await factory.create('User', {
        user_type_id: financier.id,
        user_type_name: 'Financier',
        manager_id: cityHeadUser.id,
        city_id: city.id
      });
      const monthNames = ["jan", "feb", "mar", "apr", "may", "jun","jul", "aug", "sep", "oct", "nov", "dec"];
      const currentMonth = DateUtils.getCurrentMonthDates(new Date());
      const financierTeam =  await factory.create('FinancierTeam', { financier_id: financier.id, owned_by: teamHeadUser.id });
      const financierLead = await factory.create('FinancierLead', {
        fianancier_id: financier.id, user_id: teamHeadUser.id, assigned_to: teamHeadUser.id,
        financier_team_id: financierTeam.id, status: 500
      });
      const financialYearDate = DateUtils.getFinancialYearDates(new Date());
      const filter = { fromDate: financialYearDate.from_date, toDate: financialYearDate.to_date };
      const financierService = new FinancierService(financier.id);
      financierService.getMonthlyPerformanceOfTeam( financierTeam.id, filter, (err, result) => {
        assert.notEqual(result.length, 0, 'Financier-team monthly performance fetched successfully');
      });
    });
  });

  describe('getAllTeamsPerformance', () => {
    it('returns the financier-team-wise performance', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
      const teamHeadUser = await factory.create('User', {
        user_type_id: financier.id,
        user_type_name: 'Financier',
        manager_id: cityHeadUser.id,
        city_id: city.id
      });
      const monthNames = ["jan", "feb", "mar", "apr", "may", "jun","jul", "aug", "sep", "oct", "nov", "dec"];
      const currentMonth = DateUtils.getCurrentMonthDates(new Date());
      const financierTeam =  await factory.create('FinancierTeam',
        { financier_id: financier.id, owned_by: teamHeadUser.id, city_id: city.id });
      const financierLead = await factory.create('FinancierLead', {
        fianancier_id: financier.id, assigned_to: teamHeadUser.id,
        financier_team_id: financierTeam.id, status: 500, city_id: city.id
      });
      const financialYearDate = DateUtils.getFinancialYearDates(new Date());
      const filter = { fromDate: financialYearDate.from_date, toDate: financialYearDate.to_date };
      const financierService = new FinancierService(financier.id);
      financierService.getAllTeamsPerformance( cityHeadUser.id, filter, (err, result) => {
        assert.notEqual(result, null, 'Team-wise performance fetched successfully');
      });
    });
  });

  describe('getLeadSummaryBasedOnMembers', () => {
    it('returns the lead-based-summary based on team-id', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
      const teamHeadUser = await factory.create('User', {
        user_type_id: financier.id,
        user_type_name: 'Financier',
        manager_id: cityHeadUser.id,
        city_id: city.id
      });
      const monthNames = ["jan", "feb", "mar", "apr", "may", "jun","jul", "aug", "sep", "oct", "nov", "dec"];
      const currentMonth = DateUtils.getCurrentMonthDates(new Date());
      const financierTeam =  await factory.create('FinancierTeam',
        { financier_id: financier.id, owned_by: teamHeadUser.id, city_id: city.id });
      const financierLead = await factory.create('FinancierLead', {
        fianancier_id: financier.id, assigned_to: teamHeadUser.id,
        financier_team_id: financierTeam.id, status: 500, city_id: city.id
      });
      const financialYearDate = DateUtils.getFinancialYearDates(new Date());
      const filter = { fromDate: financialYearDate.from_date, toDate: financialYearDate.to_date };
      const financierService = new FinancierService(financier.id);
      financierService.getLeadSummaryBasedOnMembers( financierTeam.id, filter, (err, result) => {
        assert.notEqual(result, null, 'Lead-based-summary based on team-id fetched successfully');
      });
    });
  });

  describe('getLeadSummaryBasedOnTeams', () => {
    it('returns the lead-based-summary based on city-head-id', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
      const teamHeadUser = await factory.create('User', {
        user_type_id: financier.id,
        user_type_name: 'Financier',
        manager_id: cityHeadUser.id,
        city_id: city.id
      });
      const monthNames = ["jan", "feb", "mar", "apr", "may", "jun","jul", "aug", "sep", "oct", "nov", "dec"];
      const currentMonth = DateUtils.getCurrentMonthDates(new Date());
      const financierTeam =  await factory.create('FinancierTeam',
        { financier_id: financier.id, owned_by: teamHeadUser.id, city_id: city.id });
      const financierLead = await factory.create('FinancierLead', {
        fianancier_id: financier.id, assigned_to: teamHeadUser.id,
        financier_team_id: financierTeam.id, status: 500, city_id: city.id
      });
      const financialYearDate = DateUtils.getFinancialYearDates(new Date());
      const filter = { fromDate: financialYearDate.from_date, toDate: financialYearDate.to_date };
      const financierService = new FinancierService(financier.id);
      financierService.getLeadSummaryBasedOnTeams( cityHeadUser.id, filter, (err, result) => {
        assert.notEqual(result, null, 'Lead-based-summary based on city-head-id fetched successfully');
      });
    });
  });

  describe('getLeadSummaryBasedOnDealers', () => {
    it('returns the dealer-based-summary based on team-id', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
      const teamHeadUser = await factory.create('User', {
        user_type_id: financier.id,
        user_type_name: 'Financier',
        manager_id: cityHeadUser.id,
        city_id: city.id
      });
      const monthNames = ["jan", "feb", "mar", "apr", "may", "jun","jul", "aug", "sep", "oct", "nov", "dec"];
      const currentMonth = DateUtils.getCurrentMonthDates(new Date());
      const financierTeam =  await factory.create('FinancierTeam',
        { financier_id: financier.id, owned_by: teamHeadUser.id, city_id: city.id });
      const dealer = await factory.create('Dealer', { city_id: cityHeadUser.city_id });
      const dealerFinancier = await factory.create('DealerFinancier', {
        dealer_id : dealer.id, financier_id: financier.id,
      });
      const financierDealer = await factory.create('FinancierDealer', {
        dealer_id : dealer.id, financier_team_id: financierTeam.id, from_date: new Date(),
        to_date: null, financier_id: financier.id,
      });
      const financierLead = await factory.create('FinancierLead', {
        fianancier_id: financier.id, assigned_to: teamHeadUser.id, dealer_id: dealer.id,
        financier_team_id: financierTeam.id, status: 500, city_id: city.id
      });
      const financialYearDate = DateUtils.getFinancialYearDates(new Date());
      const filter = { fromDate: financialYearDate.from_date, toDate: financialYearDate.to_date };
      const financierService = new FinancierService(financier.id);
      financierService.getLeadSummaryBasedOnDealers(financierTeam.id, filter, (err, result) => {
        assert.notEqual(result.length, 0, 'Dealer-based-summary based on team-id fetched successfully');
      });
    });
  });

  describe('getDealershipPerformanceBySales', () => {
    it('returns sales-user based dealership-performance', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
      const teamHeadUser = await factory.create('User', {
        user_type_id: financier.id,
        user_type_name: 'Financier',
        manager_id: cityHeadUser.id,
        city_id: city.id
      });
      const monthNames = ["jan", "feb", "mar", "apr", "may", "jun","jul", "aug", "sep", "oct", "nov", "dec"];
      const currentMonth = DateUtils.getCurrentMonthDates(new Date());
      const financierTeam =  await factory.create('FinancierTeam',
        { financier_id: financier.id, owned_by: teamHeadUser.id, city_id: city.id });
      const dealer = await factory.create('Dealer', { city_id: cityHeadUser.city_id });
      const dealerFinancier = await factory.create('DealerFinancier', {
        dealer_id : dealer.id, financier_id: financier.id,
      });
      const financierDealer = await factory.create('FinancierDealer', {
        dealer_id : dealer.id, financier_team_id: financierTeam.id, from_date: new Date(),
        to_date: null, financier_id: financier.id,
      });
      await factory.create('FinancierDealer', {
        dealer_id : dealer.id, financier_team_id: financierTeam.id, from_date: new Date(),
        to_date: null, financier_id: financier.id, user_id: teamHeadUser.id,
      });
      const financierLead = await factory.create('FinancierLead', {
        fianancier_id: financier.id, assigned_to: teamHeadUser.id, dealer_id: dealer.id,
        financier_team_id: financierTeam.id, status: 500, city_id: city.id
      });
      const financialYearDate = DateUtils.getFinancialYearDates(new Date());
      const filter = { fromDate: financialYearDate.from_date, toDate: financialYearDate.to_date };
      const financierService = new FinancierService(financier.id);
      financierService.getDealershipPerformanceBySales(teamHeadUser.id, filter, (err, result) => {
        assert.notEqual(result.length, 0, 'Sales-user based dealership-performance fetched successfully');
      });
    });
  });

  describe('getDealershipMonthlyReport', () => {
    it('returns the dealer-based monthly lead-report ', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
      const teamHeadUser = await factory.create('User', {
        user_type_id: financier.id,
        user_type_name: 'Financier',
        manager_id: cityHeadUser.id,
        city_id: city.id
      });
      const monthNames = ["jan", "feb", "mar", "apr", "may", "jun","jul", "aug", "sep", "oct", "nov", "dec"];
      const currentMonth = DateUtils.getCurrentMonthDates(new Date());
      const financierTeam =  await factory.create('FinancierTeam',
        { financier_id: financier.id, owned_by: teamHeadUser.id, city_id: city.id });
      const dealer = await factory.create('Dealer', { city_id: cityHeadUser.city_id });
      const dealerFinancier = await factory.create('DealerFinancier', {
        dealer_id : dealer.id, financier_id: financier.id,
      });
      const financierDealer = await factory.create('FinancierDealer', {
        dealer_id : dealer.id, financier_team_id: financierTeam.id, from_date: new Date(),
        to_date: null, financier_id: financier.id,
      });
      const financierLead = await factory.create('FinancierLead', {
        fianancier_id: financier.id, assigned_to: teamHeadUser.id, dealer_id: dealer.id,
        financier_team_id: financierTeam.id, status: 500, city_id: city.id
      });
      const financialYearDate = DateUtils.getFinancialYearDates(new Date());
      const filter = { fromDate: financialYearDate.from_date, toDate: financialYearDate.to_date };
      const financierService = new FinancierService(financier.id);
      financierService.getDealershipMonthlyReport(dealer.id, filter, (err, result) => {
        assert.notEqual(result.length, 0, 'Dealer-based monthly lead-report fetched successfully');
      });
    });
  });

  describe('getDealershipLeadEffectiveness', () => {
    it('returns dealership lead-effectiveness across teams by city-head ', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
      const teamHeadUser = await factory.create('User', {
        user_type_id: financier.id,
        user_type_name: 'Financier',
        manager_id: cityHeadUser.id,
        city_id: city.id
      });
      const financierTeam =  await factory.create('FinancierTeam',
        { financier_id: financier.id, owned_by: teamHeadUser.id, city_id: city.id });
      const dealer = await factory.create('Dealer', { city_id: cityHeadUser.city_id });
      const dealerFinancier = await factory.create('DealerFinancier', {
        dealer_id : dealer.id, financier_id: financier.id,
      });
      const financierDealer = await factory.create('FinancierDealer', {
        dealer_id : dealer.id, financier_team_id: financierTeam.id, from_date: new Date(),
        to_date: null, financier_id: financier.id,
      });
      await factory.create('FinancierDealer', {
        dealer_id : dealer.id, financier_team_id: financierTeam.id, from_date: new Date(),
        to_date: null, financier_id: financier.id, user_id: teamHeadUser.id
      });
      const financierLead = await factory.create('FinancierLead', {
        fianancier_id: financier.id, assigned_to: teamHeadUser.id, dealer_id: dealer.id,
        financier_team_id: financierTeam.id, status: 500, city_id: city.id
      });
      const financialYearDate = DateUtils.getFinancialYearDates(new Date());
      const filter = { fromDate: financialYearDate.from_date, toDate: financialYearDate.to_date,
        dealerIds: [dealer.id], financierTeamIds: [] };
      const financierService = new FinancierService(financier.id);
      financierService.getDealershipLeadEffectiveness(cityHeadUser, filter, (err, result) => {
        assert.notEqual(result.length, 0, ' Dealership lead-effectiveness across teams by city-head fetched successfully');
      });
    });
  });

  describe('getExecutivesAssociated', () => {
    it('returns list of financier-members and the team-lead for a given team-id ', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
      const teamHeadUser = await factory.create('User', {
        user_type_id: financier.id,
        user_type_name: 'Financier',
        manager_id: cityHeadUser.id,
        city_id: city.id
      });
      const financierTeam =  await factory.create('FinancierTeam',
        { financier_id: financier.id, owned_by: teamHeadUser.id, city_id: city.id });
      const financierService = new FinancierService(financier.id);
      financierService.getExecutivesAssociated(financierTeam.id, (err, result) => {
        assert.notEqual(result.length, 0, 'Financier-members and team-lead for a given team-id fetched successfully');
      });
    });
  });

  describe('beforeUpdateDealer', () => {
    it('expires membership-dealers when a team-dealer is expired', async () => {
      const city = await factory.create('City');
      const financier =  await factory.create('Financier');
      const cityHeadUser = await factory.create('User', { user_type_id: financier.id,
        user_type_name: 'Financier', city_id: city.id });
      const teamHeadUser = await factory.create('User', {
        user_type_id: financier.id,
        user_type_name: 'Financier',
        manager_id: cityHeadUser.id,
        city_id: city.id
      });
      const financierTeam =  await factory.create('FinancierTeam',
        { financier_id: financier.id, owned_by: teamHeadUser.id, city_id: city.id });
      const dealer = await factory.create('Dealer', { city_id: cityHeadUser.city_id });
      const dealerFinancier = await factory.create('DealerFinancier', {
        dealer_id : dealer.id, financier_id: financier.id,
      });
      const financierDealer = await factory.create('FinancierDealer', {
        dealer_id : dealer.id, financier_team_id: financierTeam.id, from_date: new Date(),
        to_date: null, financier_id: financier.id,
      });
      await factory.create('FinancierDealer', {
        dealer_id : dealer.id, financier_team_id: financierTeam.id, from_date: new Date(),
        to_date: null, financier_id: financier.id, user_id: teamHeadUser.id
      });
      const financierService = new FinancierService(financier.id);
      financierService.beforeUpdateDealer({ id: financierDealer.id, to_date: new Date },
        (err, result) => {
          assert.notEqual(result, null, 'Financier dealer updated successfully');
        });
    });
  });
});
