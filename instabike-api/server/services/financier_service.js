/**
 * Financier service: This service handles methods login as a financier user,
 * create a financier user, add a user to a team, unaccociate a sales user and dealership
 * assigned from a team, forgot password, get assigned and unassigned delaerships for a team,
 * get financier branch detail, get unassigned team-leads, get unassigned sales-users, get
 * dealers assigned to user, create a new team, associate team to dealership, associate user
 * to dealerships, get teams of a city-head, get teams by owner-id, create a new financier lead,
 * get financier-lead details, get performance summaray of a team or user or city-head, etc.,
 */

// import dependencies
const lodash = require('lodash');
const dot = require('dot');
const moment = require('moment');

// import files
const loopback = require('../server.js');
const BaseService = require('../services/base_service');
const constants = require('../utils/constants/userConstants');
const InstabikeError = require('../error/instabike_error');
const ErrorConstants = require('../utils/constants/error_constants');
const PasswordUtils = require('../utils/password_utils');
const ExternalServiceProviders = require('../utils/external_services_providers');
const DateUtils = require('../utils/date_utils');
const StringUtils = require('../utils/string_utils');
const FilterUtil = require('../utils/filter_utils');

const app = loopback.dataSources.postgres.models;
const postgresDs = loopback.dataSources.postgres;

/**
 * @author Ajaykkumar Rajendran
 */
module.exports = class FinancierService extends BaseService {
  constructor(financierId, currentUser) {
    super();
    this.financierId = financierId;
    this.currentUser = currentUser;
  }

  /**
   * Login financier users and return accesstoken
   *
   * @param  {Object} credentials                       user credentials
   * @param  {Function} callback                        callback
   * @return {Function} callback                        callback
   * @author Ajaykkumar Rajendran
   */
  async financierLogin(credentials, callback) {
    this.credentials = credentials;
    this.roles = await FilterUtil.getRole('financier_roles');
    try {
      const accessToken = await this.login(constants.USER_TYPE_NAMES.FINANCIER);
      return callback(null, accessToken);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * To update all dealership assigned to financier-team-members as expired
   * when a dealer associated to team is deleted
   *
   * @param  {Object} financierDealer             financier-dealer instance
   * @param  {Function} callback                                   callback
   * @return {Function} callback                                   callback
   * @author Jaiyashree Subramanian
   */
  async beforeUpdateDealer(financierDealer, callback) {
    this.financierDealer = financierDealer;
    try {
      const existingDealer = await app.FinancierDealer.findById(financierDealer.id);
      if (!existingDealer) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.FINANCIER.DEALER_NOT_FOUND));
      }
      const whereCondition = [
        { financier_id: existingDealer.financier_id },
        { dealer_id: existingDealer.dealer_id },
        { financier_team_id: existingDealer.financier_team_id },
        { status: { lt: constants.FINANCIER_LEAD_STATUS.CONVERSION } },
      ];
      if (existingDealer.user_id) {
        whereCondition.push({ assigned_to: existingDealer.user_id });
      }
      const financierLeads = await app.FinancierLead.find({
        where: {
          and: whereCondition,
        },
      });
      if (financierLeads.length) return callback(ErrorConstants.ERRORS.FINANCIER.LEAD_EXIST);
      if (!existingDealer.user_id) {
        await app.FinancierDealer.updateAll({
          financier_id: existingDealer.financier_id,
          dealer_id: existingDealer.dealer_id,
          financier_team_id: existingDealer.financier_team_id,
          user_id: { neq: null },
          to_date: null,
        }, { to_date: financierDealer.to_date });
      }
      return callback(null, financierDealer);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * A new fianancier member is created either by city head.
   *
   * @param  {object}   newUser                     new user
   * @param  {string}   roleName                    user role
   * @param  {string}   currentUser                 financier member
   * @param  {function} callback                    callback
   * @author Ajaykkumar Rajendran
   */
  async createFinancierMember(newUser, roleName, callback) {
    this.newUser = newUser;
    try {
      const userRole = await FilterUtil.getRole(roleName);
      const financier = await app.Financier.findById(this.financierId);
      if (!financier) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.FINANCIER.NOT_FOUND));
      }
      if (userRole === 'FINANCIER_TEAM_HEAD') {
        this.newUser.manager_id = this.currentUser.id;
      }
      this.newUser.city_id = this.currentUser.city_id;
      this.newUser.password = PasswordUtils.generatePassword();
      this.newUser.user_type_name = constants.USER_TYPE_NAMES.FINANCIER;
      this.newUser.user_type_id = this.financierId;
      const user = await app.Users.findOne({
        where: {
          and: [
            {
              or: [{ mobile_no: { regexp: `/${this.newUser.mobile_no}/i` } },
                { email: { regexp: `/${this.newUser.email}/i` } }],
            },
            { user_type_name: this.newUser.user_type_name },
          ],
        },
      });
      if (user) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.USER.EMAIL_MOBILE_ALREADY_EXIST));
      }
      const financierMember = await this.createUser(userRole, this.newUser);
      return callback(null, financierMember);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * A new fianancier member is created either by city head or a team-head
   * based om team-id.
   *
   * @param  {object}   newUser                     new user
   * @param  {string}   roleName                    user role
   * @param  {string}   currentUser                 financier member
   * @param  {function} callback                    callback
   * @author Jaiyashree Subramanian
   */
  async addSalesMemberToTeam(teamId, newUsers, dealerIds, roleName, currentUser, callback) {
    this.newUsers = newUsers;
    try {
      const userRole = await FilterUtil.getRole(roleName);
      const financier = await app.Financier.findById(this.financierId);
      if (!financier) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.FINANCIER.NOT_FOUND));
      }
      const team = await app.FinancierTeam.findOne({ where: { id: teamId } });
      if (!team) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.FINANCIER.TEAM_NOT_FOUND));
      }
      const salesMembers = [];
      const promises = this.newUsers.map(async (newUser) => {
        this.newUser = newUser;
        if (!newUser.id) {
          if (userRole === 'FINANCIER_TEAM_HEAD') {
            this.newUser.manager_id = currentUser.id;
          }
          this.newUser.city_id = currentUser.city_id;
          this.newUser.password = PasswordUtils.generatePassword();
          this.newUser.manager_id = currentUser.id;
          this.newUser.user_type_name = constants.USER_TYPE_NAMES.FINANCIER;
          this.newUser.user_type_id = this.financierId;
          this.newUser = await this.createUser(userRole, this.newUser);
        }
        salesMembers.push(this.newUser.id);
        await this.createFinancierTeamMembers([this.newUser.id], team);
        if (dealerIds && dealerIds.length) {
          await this.createFinancierDealer(dealerIds, team, this.newUser.id);
        }
        return this.newUser;
      });
      await Promise.all(promises);
      return callback(null, { message: 'Team-member added successfully' });
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * To update user with a random generated password and send email
   *
   * @param  {string}   email      email of the user to send new password
   * @param  {string}   userType               user type name - financier
   * @param  {function} callback                                 callback
   * @author Jaiyashree Subramanian
   */
  async forgotPassword(email, userType, callback) {
    this.email = email;
    try {
      const user = await app.Users.findOne({
        where: {
          email: this.email,
          user_type_name: userType,
        },
      });
      if (!user) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.USER.INVALID));
      }
      const accessToken = await app.AccessToken.create({
        userId: user.id,
        ttl: 3600,
        scopes: '["reset-password"]',
      });
      const url = `${process.env.SITE_URL}/reset-password?access_token=${accessToken.id}`;
      const emailTemplate = dot.template(constants.NOTIFICATION.PASSWORD_RESET);
      const emailMsg = emailTemplate({ name: user.first_name, url });
      const emailStatus = await ExternalServiceProviders.sendByEmail(
        user.email, emailMsg,
        constants.SUBJECT.PASSWORD_RESET,
      );
      return callback(null, { message: emailStatus });
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * To get the home branch address of a financier branch based on city
   *
   * @param  {object} financierUser  financier-team-lead or financier-city-head
   * @param  {function} callback                                       callback
   * @author Jaiyashree Subramanian
   */
  async getFinancierBranch(financierUser, callback) {
    this.financierUser = financierUser;
    try {
      const user = await app.Users.findOne({
        where: {
          id: financierUser.id,
          user_type_name: constants.USER_TYPE_NAMES.FINANCIER,
        },
      });
      if (!user) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.USER.NOT_EXIST));
      }
      const financierBranch = await app.FinancierBranch.findOne({
        where: { city_id: user.city_id, financier_id: user.user_type_id, is_home_branch: true },
      });
      if (!financierBranch) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.FINANCIER.NO_HOME_BRANCH_FOUND));
      }
      return callback(null, financierBranch);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * To get all possible dealers to associate to an new financier-team and
   * associated dealers to disable from creating another entry
   *
   * @param  {object} userId                   financier-city-head user-id
   * @param  {function} callback                                  callback
   * @author Jaiyashree Subramanian
   */
  async getUnassignedDealerFinanciers(userId, callback) {
    this.userId = userId;
    try {
      const user = await app.Users.findOne({
        where: {
          id: userId,
          user_type_name: constants.USER_TYPE_NAMES.FINANCIER,
        },
        include: ['city'],
      });
      if (!user || !user.city()) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.USER.NOT_EXIST));
      }
      const cities = await app.City.find({
        where: {
          name: user.city().name,
        },
      });
      if (!cities.length) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.USER.NOT_EXIST));
      }
      const cityIds = lodash.map(cities, 'id');
      const allDealerships = await app.DealerFinancier.find({
        where: { city_id: { inq: cityIds }, financier_id: user.user_type_id },
        include: { relation: 'dealer', scope: { include: 'manufacturer' } },
      });
      const dealershipsAssociated = await app.FinancierDealer.find({
        where: {
          and: [
            { city_id: user.city_id },
            { financier_id: this.financierId },
            { user_id: null },
            { from_date: { neq: null } },
            { to_date: null },
          ],
        },
      });
      return callback(null, { dealershipsAssociated, allDealerships });
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * To get all unassigned financier-team-leads of a financier-city-head
   *
   * @param  {string} userId                           financier-user-id
   * @param  {object} filter                limit, searchField and value
   * @param  {function} callback                                callback
   * @author Jaiyashree Subramanian
   */
  async getUnassignedFinancierTL(userId, filter, callback) {
    this.userId = userId;
    this.filter = filter;
    this.roleName = await FilterUtil.getRole('financier_team_head');
    try {
      const user = await app.Users.findOne({
        where: {
          id: userId,
          user_type_name: constants.USER_TYPE_NAMES.FINANCIER,
        },
      });
      if (!user) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.USER.NOT_EXIST));
      }
      const existingTeams = await app.FinancierTeam.find({
        where: {
          and: [
            { city_id: user.city_id },
            { financier_id: this.financierId },
            { owned_by: { neq: null } },
          ],
        },
      });
      const assignedTeamLeadIds = lodash.map(existingTeams, 'owned_by');
      const teamLeads = await this.getFinancierUsers(assignedTeamLeadIds, user.city_id);
      return callback(null, { teamLeads });
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * To get all unassigned financier-sales of a financier-city-head
   *
   * @param  {string} userId                      financier-user-id
   * @param  {object} filter           limit, searchField and value
   * @param  {function} callback                           callback
   * @author Jaiyashree Subramanian
   */
  async getUnassignedFinancierSales(userId, filter, callback) {
    this.userId = userId;
    this.filter = filter;
    this.roleName = await FilterUtil.getRole('financier_sales');
    try {
      const user = await app.Users.findOne({
        where: {
          id: userId,
          user_type_name: constants.USER_TYPE_NAMES.FINANCIER,
        },
      });
      if (!user) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.USER.NOT_EXIST));
      }
      const existingTeams = await app.FinancierTeam.find({
        where: { and: [{ city_id: user.city_id }, { financier_id: this.financierId }] },
      });
      const teamIds = lodash.map(existingTeams, 'id');
      const existingTeamMembers = await app.FinancierTeamMember.find({
        where: {
          and: [
            { from_date: { lte: new Date() } },
            { financier_team_id: { inq: teamIds } },
            { to_date: null },
            { user_id: { neq: null } },
          ],
        },
      });
      const existingTeamMemberIds = lodash.map(existingTeamMembers, 'user_id');
      const salesExecutives = await this.getFinancierUsers(existingTeamMemberIds, user.city_id);
      return callback(null, { salesExecutives });
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * To constructa nd execute query to fetch users unnassigned to any team
   *
   * @param  {[string]} existingUserIds          existing Users to exclude
   * @param  {function} callback                                  callback
   * @author Jaiyashree Subramanian
   */
  getFinancierUsers(existingUserIds, cityId) {
    this.existingUserIds = existingUserIds;
    return new Promise((resolve, reject) => {
      this.filter.searchValue = this.filter.searchValue.replace(/[^a-zA-Z0-9]/g, '\\$&');
      let params = [this.roleName, cityId, this.financierId, `%${this.filter.searchValue}%`,
        this.filter.limit];
      let existingIds = '';
      if (existingUserIds.length) {
        const userString =
          StringUtils.generateInClause(params.length + 1, existingUserIds);
        params = params.concat(existingUserIds);
        existingIds = `AND id NOT IN (${userString})`;
      }
      const userQuery = `select * from users where id IN ( select user_id from user_role
        where role_id = ( select id from roles where name = $1 ) ) ${existingIds}
        AND city_id = $2 AND user_type_id = $3
        AND is_active = true
        AND ${this.filter.searchField} ILIKE $4 LIMIT $5`;
      postgresDs.connector.query(userQuery, params, (err, result) => {
        if (err) reject(new InstabikeError(err));
        resolve(result);
      });
    });
  }

  /**
   * To get the associated dealers of the financier user
   *
   * @param  {string} userId                           financier-user ID
   * @param  {function} callback                                callback
   * @author Jaiyashree Subramanian
   */
  async getFinancierDealersOfUser(userId, callback) {
    this.userId = userId;
    try {
      const user = await app.Users.findOne({
        where: {
          id: userId,
          user_type_name: constants.USER_TYPE_NAMES.FINANCIER,
        },
      });
      if (!user) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.USER.NOT_EXIST));
      }
      const financierUserDealers = await app.FinancierDealer.find({
        where: {
          and: [
            { user_id: userId },
            { financier_id: this.financierId },
            { to_date: null },
          ],
        },
        include: { relation: 'dealer', scope: { include: 'manufacturer' } },
      });
      return callback(null, { financierUserDealers });
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * To create and associate a new financier team and its associated data
   *
   * @param  {string} userId                           financier-user ID
   * @param  {object} financierTeam                  financier team data
   * @param  {function} callback                                callback
   * @author Jaiyashree Subramanian
   */
  async createTeam(userId, financierTeam, callback) {
    this.financierTeam = financierTeam;
    try {
      const user = await app.Users.findById(userId);
      if (!user) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.USER.NOT_EXIST));
      }
      const oldTeam = await app.FinancierTeam.findOne({
        where: { and: [{ name: financierTeam.name }, { financier_id: this.financierId }] },
      });
      if (oldTeam) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.FINANCIER.TEAM_NAME_EXIST));
      }
      const team = await app.FinancierTeam.create({
        name: financierTeam.name,
        financier_id: this.financierId,
        city_id: user.city_id,
        owned_by: financierTeam.teamHeadId,
      });
      if (financierTeam.dealerIds && financierTeam.dealerIds.length) {
        await this.createFinancierDealer(financierTeam.dealerIds, team, null);
      }
      if (financierTeam.salesExecutiveIds && financierTeam.salesExecutiveIds.length) {
        await this.createFinancierTeamMembers(financierTeam.salesExecutiveIds, team);
      }
      return callback(null, { team });
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  async createFinancierDealer(dealerIds, team, userId) {
    this.dealerIds = dealerIds;
    try {
      const promises = this.dealerIds.map(async (dealerId) => {
        const financierDealer = await app.FinancierDealer.upsertWithWhere({
          dealer_id: dealerId,
          user_id: userId,
          financier_id: this.financierId,
          to_date: null,
        }, {
          dealer_id: dealerId,
          user_id: userId,
          from_date: new Date(),
          financier_id: this.financierId,
          financier_team_id: team.id,
          city_id: this.currentUser.city_id,
        });
        return financierDealer;
      });
      const financierDealers = await Promise.all(promises);
      return financierDealers;
    } catch (error) {
      throw (new InstabikeError(error));
    }
  }

  async createFinancierTeamMembers(salesExecutiveIds, team) {
    this.salesExecutiveIds = salesExecutiveIds;
    try {
      const promises = this.salesExecutiveIds.map(async (salesMemberId) => {
        await app.Users.updateAll({ id: salesMemberId }, { manager_id: team.owned_by });
        const financierTeamMember = await app.FinancierTeamMember.upsertWithWhere({
          user_id: salesMemberId,
          to_date: null,
          financier_id: this.financierId,
        }, {
          user_id: salesMemberId,
          from_date: new Date(),
          financier_id: this.financierId,
          financier_team_id: team.id,
        });
        return financierTeamMember;
      });
      const financierTeamMembers = await Promise.all(promises);
      return financierTeamMembers;
    } catch (error) {
      throw (new InstabikeError(error));
    }
  }

  /**
   * To get list of teams for a financier-user (city-head)
   *
   * @param  {string} userId                      financier-user-id
   * @param  {function} callback                           callback
   * @author Jaiyashree Subramanian
   */
  async getTeamsOfCityHead(userId, callback) {
    this.userId = userId;
    try {
      const user = await app.Users.findOne({
        where: {
          id: userId,
          user_type_name: constants.USER_TYPE_NAMES.FINANCIER,
        },
      });
      if (!user) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.USER.NOT_EXIST));
      }
      const teams = await app.FinancierTeam.find({
        where: { and: [{ city_id: user.city_id }, { financier_id: this.financierId }] },
        include: [
          'financierTarget', 'financierTeamMembers',
          { relation: 'owner', scope: { fields: ['first_name', 'last_name'] } },
        ],
      });
      return callback(null, { teams });
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * To get list of teams owned by a financier-user (team-head)
   *
   * @param  {string} userId                      financier-user-id
   * @param  {function} callback                           callback
   * @author Jaiyashree Subramanian
   */
  async getTeamByOwnerId(userId, callback) {
    this.userId = userId;
    try {
      const user = await app.Users.findOne({
        where: {
          id: userId,
          user_type_name: constants.USER_TYPE_NAMES.FINANCIER,
        },
      });
      if (!user) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.USER.NOT_EXIST));
      }
      if (user.user_type_id !== this.financierId) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.FINANCIER.TEAM_NOT_FOUND));
      }
      const teams = await app.FinancierTeam.find({
        where: { owned_by: userId },
        include: ['owner', {
          relation: 'financierTeamMembers',
          scope: { include: 'user' },
        }, {
          relation: 'financierTarget',
          scope: { where: { user_id: null } },
        }],
      });
      return callback(null, { teams });
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * Create Financier Lead
   * @param  {string}   financierId
   * @param  {FinancierLead}   lead
   * @param  {Function} callback
   * @return {FinancierLead} financier lead
   */
  async createLead(lead, callback) {
    this.lead = lead;
    try {
      const financier = await app.Financier.findById(this.financierId);
      if (!financier) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.FINANCIER.NOT_FOUND));
      }
      const assignedTo = await app.FinancierDealer.findOne({
        where: {
          and: [{ user_id: lead.assigned_to }, { to_date: null }, { dealer_id: lead.dealer_id }],
        },
      });
      if (!assignedTo) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.FINANCIER.CAN_NOT_ASSIGN));
      }
      const dealerLead = await app.Lead.findById(lead.lead_id);
      if (!dealerLead) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.LEAD.NOT_FOUND));
      }
      const isLeadExist = await app.FinancierLead.findOne({
        where: {
          financier_id: lead.financier_id,
          mobile_number: lead.mobile_number,
          lead_id: dealerLead.id,
          lead_detail_id: lead.lead_detail_id,
          status: { lte: 900 },
        },
      });
      if (isLeadExist) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.FINANCIER.LEAD_EXIST));
      }
      this.lead.financier_team_id = assignedTo.financier_team_id;
      this.lead.status = constants.FINANCIER_LEAD_STATUS.ACTIVE;
      this.lead.converted_on = new Date();
      this.lead.user_id = dealerLead.user_id;
      this.lead.dealer_id = dealerLead.dealer_id;
      this.lead.assigned_by = this.currentUser.id;
      this.lead.zone_id = assignedTo.zone_id;
      this.lead.state_id = assignedTo.state_id;
      this.lead.country_id = assignedTo.country_id;
      this.lead.city_id = assignedTo.city_id;
      this.lead.name = dealerLead.name;
      this.lead.mobile_number = dealerLead.mobile_number;
      const newLead = await app.FinancierLead.create(this.lead);
      this.saveActivity(
        dealerLead, newLead, this.currentUser.id,
        constants.ACTIVITY.FINANCE_SELECTED,
        null, financier.id, lead.lead_detail_id,
      );
      await this.saveFinancierActivity(
        lead, null, this.currentUser.id,
        constants.ACTIVITY.LEAD_CREATED,
      );
      await this.saveFinancierActivity(
        lead, null, this.currentUser.id,
        constants.ACTIVITY.LEAD_ASSIGNED,
      );
      this.id = newLead.id;
      const response = await this.getFinancierLead();
      return callback(null, response);
    } catch (e) {
      return callback(new InstabikeError(e));
    }
  }

  /**
   * Get Financier Lead and Details by Id
   * @return {Promise} Lead
   */
  async getFinancierLead() {
    const lead = await app.FinancierLead.findById(this.id, {
      include: [
        {
          relation: 'lead',
          scope: {
            fields: ['id', 'name', 'mobile_number',
              'income_status', 'domicile_status', 'income_range'],
          },
        },
        {
          relation: 'dealer',
          scope: {
            include: { relation: 'manufacturer', scope: { fields: ['id', 'logo_url'] } },
            fields: ['id', 'name', 'manufacturer_id'],
          },
        },
        {
          relation: 'assignedTo',
          scope: { fields: ['id', 'first_name', 'last_name', 'mobile_no'] },
        },
        {
          relation: 'financier',
          scope: { fields: ['id', 'name'] },
        },
        {
          relation: 'document_details',
        },
      ],
    });
    return lead;
  }

  /**
   * To get current-month-target and the performance summary based on financier-user-id
   *
   * @param  {string} userId                      financier-user-id
   * @param  {function} callback                           callback
   * @author Jaiyashree Subramanian
   */
  /* eslint no-param-reassign: ["error", { "props": false }] */
  async getUserPerformanceSummary(userId, filter, callback) {
    this.filter = filter;
    try {
      if (this.currentUser.user_type_id !== this.financierId) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.FINANCIER.INVALID_ACCESS));
      }
      if (this.verifyRole('FINANCIER_CITY_HEAD')) {
        if (!filter.financierTeamIds || !filter.financierTeamIds.length) {
          let teamIds = await app.FinancierTeam.find({
            where: {
              and: [
                { city_id: this.currentUser.city_id },
                { financier_id: this.currentUser.user_type_id },
              ],
            },
            fields: 'id',
          });
          teamIds = lodash.map(teamIds, 'id');
          filter.financierTeamIds = teamIds;
        }
      } else if (this.verifyRole('FINANCIER_TEAM_HEAD')) {
        const team = await app.FinancierTeam.find({
          where: {
            and: [
              { financier_id: this.financierId },
              { owned_by: this.currentUser.id },
              { to_date: null },
            ],
          },
        });
        if (team.length === 0) {
          return callback(new InstabikeError(ErrorConstants.ERRORS.FINANCIER.INVALID_ACCESS));
        }
        if (team[0].owned_by !== userId) {
          const financierMemberId = await app.FinancierTeamMember.find({
            where: {
              and: [
                { financier_id: this.financierId },
                { user_id: userId },
                { financier_team_id: team[0].id },
              ],
            },
          });
          if (financierMemberId.length === 0) {
            return callback(new InstabikeError(ErrorConstants.ERRORS.FINANCIER.INVALID_ACCESS));
          }
        }
      } else if (this.verifyRole('FINANCIER_SALES')) {
        filter.userId = this.currentUser.id;
      }
      const user = await app.Users.findOne({
        where: {
          and: [
            { id: userId },
            { user_type_id: this.financierId },
            { user_type_name: constants.USER_TYPE_NAMES.FINANCIER },
          ],
        },
      });
      if (!user) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.USER.NOT_EXIST));
      }
      this.filter.userId = user.id;
      const start = moment().startOf('month');
      const end = moment().endOf('month');
      const targetQuery = `select * from financier_targets ft where ft.user_id = $1
        and ft.financier_id = $2 and ft.from::timestamp::date = $3
        and ft.to::timestamp::date = $4`;
      const targetQueryParams = [userId, this.financierId, start, end];
      const target = await new Promise((resolve, reject) => {
        postgresDs.connector.query(targetQuery, targetQueryParams, (err, result) => {
          if (err) reject(new InstabikeError(err));
          resolve(result[0]);
        });
      });
      const performance = this.buildPerformanceSummary();
      const userPerformance = await new Promise((resolve, reject) => {
        postgresDs.connector.query(performance.query, performance.params, (err, result) => {
          if (err) reject(new InstabikeError(err));
          resolve(result && result.length ? result[0] : {});
        });
      });
      return callback(null, { target, userPerformance });
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  buildPerformanceSummary() {
    const { filter } = this;
    let params = [filter.fromDate, filter.toDate, this.financierId, this.currentUser.city_id];
    let query = `SELECT count(1)  AS total_leads,
      count(1) FILTER (where status = 930) AS lost_leads,
      count(1) FILTER (where status = 500) AS active_leads,
      count(1) FILTER (where status = 510) AS pending_leads,
      count(1) FILTER (where status = 520) AS converted_leads
      from financier_leads fl WHERE ( created_at::date BETWEEN $1 AND $2
      OR lost_on::date BETWEEN $1 AND $2 ) and financier_id = $3 and city_id = $4`;
    if (filter.userId) {
      query = `${query}  AND assigned_to = $5`;
      params.push(filter.userId);
    }
    if (filter.financierTeamIds && filter.financierTeamIds.length) {
      const teamString =
        StringUtils.generateInClause(params.length + 1, filter.financierTeamIds);
      params = params.concat(filter.financierTeamIds);
      query = `${query}  AND financier_team_id IN (${teamString})`;
    }
    return { query, params };
  }

  buildCurrentMonthTargetQuery(targetFilter) {
    this.targetFilter = targetFilter;
    let params = [this.financierId, targetFilter.currentMonth.from_date,
      targetFilter.currentMonth.to_date];
    if (targetFilter.userId) params.push(this.targetFilter.userId);
    let query = `SELECT SUM(achieved_value) achieved_value, SUM(target_value) target_value
      FROM financier_targets ft WHERE financier_id = $1 AND
      ft.from::date >= $2 and
      ft.to::date <= $3 AND user_id ${targetFilter.userId ? '= $4' : 'IS null'}`;
    if (targetFilter.teamIds && targetFilter.teamIds.length) {
      const teamString =
        StringUtils.generateInClause(params.length + 1, targetFilter.teamIds);
      params = params.concat(targetFilter.teamIds);
      query = `${query} AND financier_team_id IN (${teamString})`;
    }
    return { query, params };
  }

  /**
   * To get city-wise target and leads summary based on city-head-id
   *
   * @param  {string} userId                      financier-user-id
   * @param  {object} filter                          date - filter
   * @param  {function} callback                           callback
   * @author Jaiyashree Subramanian
   */
  async getCityHeadSummary(userId, filter, callback) {
    this.filter = filter;
    try {
      const user = await app.Users.findOne({
        where: {
          id: userId,
          user_type_name: constants.USER_TYPE_NAMES.FINANCIER,
        },
      });
      if (!user) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.USER.NOT_EXIST));
      }
      this.filter.financierTeamIds = await app.FinancierTeam.find({
        where: { and: [{ city_id: user.city_id }, { financier_id: this.financierId }] },
      });
      this.filter.financierTeamIds = lodash.map(this.filter.financierTeamIds, 'id');
      const currentMonth = DateUtils.getCurrentMonthDates(new Date());
      const targetQuery = this.buildCurrentMonthTargetQuery({
        teamIds: this.filter.financierTeamIds,
        currentMonth,
      });
      const target = await new Promise((resolve, reject) => {
        postgresDs.connector.query(targetQuery.query, targetQuery.params, (err, result) => {
          if (err) reject(new InstabikeError(err));
          resolve(result[0]);
        });
      });
      const performanceStmt = this.buildPerformanceSummary(this.filter);
      const performance = await new Promise((resolve, reject) => {
        postgresDs.connector.query(performanceStmt.query, performanceStmt.params, (err, result) => {
          if (err) reject(new InstabikeError(err));
          resolve(result);
        });
      });
      return callback(null, { target, performance: performance[0] });
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * To get team target and leads summary based on teamId
   *
   * @param  {string} userId                      financier-user-id
   * @param  {object} filter                          date - filter
   * @param  {function} callback                           callback
   * @author Jaiyashree Subramanian
   */
  async getTeamSummary(teamId, filter, callback) {
    this.filter = filter;
    try {
      this.filter.financierTeamIds = [teamId];
      const currentMonth = DateUtils.getCurrentMonthDates(new Date());
      const targetQuery = this.buildCurrentMonthTargetQuery({
        teamIds: this.filter.financierTeamIds,
        currentMonth,
      });
      const target = await new Promise((resolve, reject) => {
        postgresDs.connector.query(targetQuery.query, targetQuery.params, (err, result) => {
          if (err) reject(new InstabikeError(err));
          resolve(result);
        });
      });
      const performanceStmt = this.buildPerformanceSummary(this.filter);
      const performance = await new Promise((resolve, reject) => {
        postgresDs.connector.query(performanceStmt.query, performanceStmt.params, (err, result) => {
          if (err) reject(new InstabikeError(err));
          resolve(result);
        });
      });
      return callback(null, { target: target[0], performance: performance[0] });
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * To get month-wise performance summary for a given team based on team-id
   *
   * @param  {string} teamId                      financier-team-id
   * @param  {object} filter                          date - filter
   * @param  {function} callback                           callback
   * @author Jaiyashree Subramanian
   */
  async getMonthlyPerformanceOfTeam(teamId, filter, callback) {
    this.filter = filter;
    try {
      const params = [this.filter.fromDate, this.filter.toDate, teamId];
      const performanceQuery = this.monthlyTeamPerformance(this.filter);
      const monthlyPerformance = await new Promise((resolve, reject) => {
        postgresDs.connector.query(performanceQuery, params, (err, result) => {
          if (err) reject(new InstabikeError(err));
          resolve(result);
        });
      });
      const result =
        await this.groupResultByMonth(monthlyPerformance, [filter.fromDate, filter.toDate]);
      return callback(null, result);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  monthlyTeamPerformance(inputs) {
    this.inputs = inputs;
    return `
    select temp.*,
      (select sum(target_value) from financier_targets ft where user_id is null and financier_team_id = $3
      and to_char(ft.from,'Mon') =  month and extract(year FROM ft.to) = year ) as target_value,
      (select sum(achieved_value) from financier_targets ft where user_id is null and financier_team_id = $3
      and to_char(ft.from,'Mon') =  month and extract(year FROM ft.to) = year ) as achieved_value from
      ( SELECT to_char(COALESCE(lost_on, created_at),'Mon') as month,
      extract(year FROM COALESCE(lost_on, created_at)) as year,
      COUNT(1) total_leads,
      COUNT(1) FILTER (where status = 500) active_leads,
      COUNT(1) FILTER (where status = 510) pending_leads,
      COUNT(1) FILTER (where status = 520) converted_leads,
      COUNT(1) FILTER (where status = 930) lost_leads
      FROM financier_leads WHERE (created_at::date BETWEEN $1 AND $2
      OR lost_on::date BETWEEN $1 AND $2) AND financier_team_id = $3
      GROUP BY month, year ) temp
    `;
  }

  /**
   * To get all-teams performance summary based on city-head-id
   *
   * @param  {string} userId                      financier-user-id
   * @param  {object} filter                          date - filter
   * @param  {function} callback                           callback
   * @author Jaiyashree Subramanian
   */
  async getAllTeamsPerformance(userId, filter, callback) {
    this.filter = filter;
    try {
      if (this.currentUser.user_type_id !== this.financierId) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.FINANCIER.INVALID_ACCESS));
      }
      const user = await app.Users.findOne({
        where: { id: userId, user_type_name: constants.USER_TYPE_NAMES.FINANCIER },
      });
      if (!user) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.USER.NOT_EXIST));
      }
      let financierTeamIds = await app.FinancierTeam.find({
        where: { and: [{ city_id: user.city_id }, { financier_id: this.financierId }] },
      });
      financierTeamIds = lodash.map(financierTeamIds, 'id');
      if (financierTeamIds.length) {
        let params = [this.filter.fromDate, this.filter.toDate];
        const financierTeamString =
          StringUtils.generateInClause(params.length + 1, financierTeamIds);
        params = params.concat(financierTeamIds);
        const performanceQuery = this.allTeamsPerformance({
          financierTeamString: `AND financier_team_id IN (${financierTeamString})`,
        });
        const teamsPerformance = await new Promise((resolve, reject) => {
          postgresDs.connector.query(performanceQuery, params, (err, result) => {
            if (err) reject(new InstabikeError(err));
            resolve(result);
          });
        });
        return callback(null, teamsPerformance);
      }
      return callback(null, []);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  allTeamsPerformance(inputs) {
    this.inputs = inputs;
    return ` SELECT financier_team_id,
      (select name from financier_teams where id = financier_team_id) as team_name,
      COUNT(1) total_leads,
      COUNT(1) FILTER (where status = 500) active_leads,
      COUNT(1) FILTER (where status = 510) pending_leads,
      COUNT(1) FILTER (where status = 520) converted_leads,
      COUNT(1) FILTER (where status = 930) lost_leads,
      (SELECT SUM(target_value) as target_value FROM financier_targets ft WHERE user_id IS null AND
      financier_team_id = financier_leads.financier_team_id AND ft.from::date >= $1
      AND ft.to::date <= $2),
      (SELECT SUM(achieved_value) as achieved_value FROM financier_targets ft WHERE user_id IS null AND
      financier_team_id = financier_leads.financier_team_id AND ft.from::date >= $1 AND
      ft.to::date <= $2)
      FROM financier_leads WHERE ( created_at::date BETWEEN $1 AND $2
      OR lost_on::date BETWEEN $1 AND $2 ) ${inputs.financierTeamString} GROUP BY financier_team_id
    `;
  }
  /**
   * To get all-team-members performance summary based on team-id
   *
   * @param  {string} teamId                      financier-team-id
   * @param  {object} filter                          date - filter
   * @param  {function} callback                           callback
   * @author Jaiyashree Subramanian
   */
  /* eslint prefer-destructuring: ["error", {VariableDeclarator: {object: true}}] */
  async getLeadSummaryBasedOnMembers(teamId, filter, callback) {
    this.filter = filter;
    try {
      const financierTeam = await app.FinancierTeam.findOne({
        where: { and: [{ id: teamId }] },
      });
      if (!financierTeam) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.FINANCIER.TEAM_NOT_FOUND));
      }
      let teamMemberIds = [];
      if (!filter.teamMemberIds || !filter.teamMemberIds.length) {
        const existingTeamMembers = await app.FinancierTeamMember.find({
          where: {
            and: [
              { from_date: { lte: new Date() } },
              { financier_team_id: teamId },
              { to_date: null },
              { user_id: { neq: null } },
            ],
          },
          fields: 'user_id',
        });
        teamMemberIds = lodash.map(existingTeamMembers, 'user_id');
        if (financierTeam && financierTeam.owned_by) teamMemberIds.push(financierTeam.owned_by);
      } else {
        teamMemberIds = filter.teamMemberIds;
      }
      if (!teamMemberIds.length) {
        return callback(null, []);
      }
      let params = [financierTeam.owned_by, filter.fromDate, filter.toDate, teamId];
      const teamMemberString =
        StringUtils.generateInClause(params.length + 1, teamMemberIds);
      params = params.concat(teamMemberIds);
      const membersBasedLeadSummary = this.membersBasedLeadSummary({ teamMemberString });
      const summary = await new Promise((resolve, reject) => {
        postgresDs.connector.query(membersBasedLeadSummary, params, (err, result) => {
          if (err) reject(new InstabikeError(err));
          resolve(result);
        });
      });
      return callback(null, summary);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  membersBasedLeadSummary(inputs) {
    this.inputs = inputs;
    return ` SELECT u.id, u.first_name, u.last_name, u.mobile_no, u.email, u.is_credential_send,
      temp.*, CASE WHEN u.id = $1 THEN 1 ELSE 0 END AS is_owner,
      (SELECT SUM(incentive_eligibility) as incentive_eligibility FROM financier_targets ft
      WHERE user_id = u.id  AND financier_team_id = $4
      AND ft.from::date >= $2 AND ft.to::date <= $3),
      (SELECT SUM(incentive_earned) as incentive_earned FROM financier_targets ft WHERE user_id = u.id
      AND financier_team_id = $4
      AND ft.from::date >= $2 AND ft.to::date <= $3),
      (SELECT SUM(target_value) as target_value FROM financier_targets ft WHERE user_id = u.id
      AND financier_team_id = $4
      AND ft.from::date >= $2 AND ft.to::date <= $3),
      (SELECT SUM(achieved_value) as achieved_value FROM financier_targets ft WHERE user_id = u.id
      AND financier_team_id = $4
      AND ft.from::date >= $2 AND ft.to::date <= $3)
      FROM users u LEFT JOIN ( SELECT financier_leads.assigned_to as user_id,
      COUNT(1) total_leads,
      COUNT(1) FILTER (where status = 500) active_leads,
      COUNT(1) FILTER (where status = 510) pending_leads,
      COUNT(1) FILTER (where status = 520) converted_leads,
      COUNT(1) FILTER (where status = 930) lost_leads
      FROM financier_leads WHERE ( created_at::date BETWEEN $2 AND $3
      OR lost_on::date BETWEEN $2 AND $3 ) AND financier_team_id
      = $4 GROUP BY assigned_to ) temp on u.id = temp.user_id WHERE u.id
      IN (${inputs.teamMemberString})
    `;
  }
  /**
   * To get all-teams performance summary based on city-head-id
   *
   * @param  {string} userId                      financier-user-id
   * @param  {object} filter                          date - filter
   * @param  {function} callback                           callback
   * @author Jaiyashree Subramanian
   */
  async getLeadSummaryBasedOnTeams(userId, filter, callback) {
    this.filter = filter;
    try {
      const user = await app.Users.findById(userId);
      if (!user) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.USER.NOT_EXIST));
      }
      let financierTeamIds = [];
      if (filter.teamIds && filter.teamIds.length) {
        financierTeamIds = filter.teamIds;
      } else {
        financierTeamIds = await app.FinancierTeam.find({
          where: { and: [{ city_id: user.city_id }, { financier_id: this.financierId }] },
        });
        financierTeamIds = lodash.map(financierTeamIds, 'id');
      }
      if (financierTeamIds.length) {
        let params = [this.filter.fromDate, this.filter.toDate];
        const financierTeamString =
          StringUtils.generateInClause(params.length + 1, financierTeamIds);
        params = params.concat(financierTeamIds);
        const teamsBasedLeadSummary = this.teamsBasedLeadSummary({
          teamString: `team.id IN (${financierTeamString})`,
          financierTeamString: `AND financier_team_id IN (${financierTeamString})`,
        });
        const summary = await new Promise((resolve, reject) => {
          postgresDs.connector.query(teamsBasedLeadSummary, params, (err, result) => {
            if (err) reject(new InstabikeError(err));
            resolve(result);
          });
        });
        return callback(null, summary);
      }
      return callback(null, []);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  teamsBasedLeadSummary(inputs) {
    this.inputs = inputs;
    return ` SELECT id, name, temp.*,
      (select first_name from users where id = team.owned_by),
      (select last_name from users where id = team.owned_by),
      (SELECT COUNT(1) FROM financier_team_members ftm WHERE ftm.to_date IS null AND
      financier_team_id = team.id) as total_team_members,
      (SELECT SUM(incentive_eligibility) as incentive_eligibility FROM financier_targets ft WHERE user_id IS null AND
      financier_team_id = team.id AND ft.from::date >= $1 AND ft.to::date <= $2),
      (SELECT SUM(incentive_earned) as incentive_earned FROM financier_targets ft WHERE user_id IS null AND
      financier_team_id = team.id AND ft.from::date >= $1 AND ft.to::date <= $2),
      (SELECT SUM(target_value) as target_value FROM financier_targets ft WHERE user_id IS null AND
      financier_team_id = team.id AND ft.from::date >= $1 AND ft.to::date <= $2),
      (SELECT SUM(achieved_value) as achieved_value FROM financier_targets ft WHERE user_id IS null AND
      financier_team_id = team.id AND ft.from::date >= $1 AND ft.to::date <= $2)
      FROM financier_teams team LEFT JOIN ( SELECT financier_leads.financier_team_id as team_id,
      COUNT(1) total_leads,
      COUNT(1) FILTER (where status = 500) active_leads,
      COUNT(1) FILTER (where status = 510) pending_leads,
      COUNT(1) FILTER (where status = 520) converted_leads,
      COUNT(1) FILTER (where status = 930) lost_leads
      FROM financier_leads WHERE ( created_at::date BETWEEN $1 AND $2
      OR lost_on::date BETWEEN $1 AND $2 ) ${inputs.financierTeamString} GROUP BY team_id )
      temp on team.id = temp.team_id WHERE ${inputs.teamString}
    `;
  }

  /**
   * Get financier with interest details
   * @param  {Function} callback
   * @return {Financier}
   * @author Ponnuvel G
   */
  async getInterestDetails(callback) {
    try {
      const financier = await app.Financier.find({
        where: { id: this.financierId },
        include: {
          relation: 'financierInterestDetail',
          scope: {
            where: {
              vehicle_type: 0, income_status: 0, domicile_status: 0, vehicle_value_range: 0,
            },
            order: 'tenure ASC, advance_emi ASC',
          },
        },
      });
      return callback(null, financier);
    } catch (e) {
      return callback(new InstabikeError(e));
    }
  }

  /**
   * To get all-dealers performance summary based on team-id
   *
   * @param  {string} teamId                      financier-team-id
   * @param  {object} filter                          date - filter
   * @param  {function} callback                           callback
   * @author Jaiyashree Subramanian
   */
  async getLeadSummaryBasedOnDealers(teamId, filter, callback) {
    this.filter = filter;
    try {
      const financierTeam = await app.FinancierTeam.findOne({
        where: { and: [{ id: teamId }, { financier_id: this.financierId }] },
      });
      if (!financierTeam) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.FINANCIER.TEAM_NOT_FOUND));
      }
      let dealerIds = await app.FinancierDealer.find({
        where: {
          and: [
            { financier_team_id: teamId },
            { or: [{ to_date: null }, { to_date: { lte: new Date(this.filter.toDate) } }] },
            { user_id: null },
          ],
        },
        fields: ['dealer_id'],
      });
      dealerIds = lodash.map(dealerIds, 'dealer_id');
      if (dealerIds.length) {
        let params = [this.filter.fromDate, this.filter.toDate, this.financierId, teamId];
        const dealerString =
          StringUtils.generateInClause(params.length + 1, dealerIds);
        params = params.concat(dealerIds);
        const dealersBasedLeadSummary = this.dealersBasedLeadSummary({
          dealerString: `d.id IN (${dealerString})`,
        });
        const summary = await new Promise((resolve, reject) => {
          postgresDs.connector.query(dealersBasedLeadSummary, params, (err, result) => {
            if (err) reject(new InstabikeError(err));
            resolve(result);
          });
        });
        return callback(null, summary);
      }
      return callback(null, []);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  dealersBasedLeadSummary(inputs) {
    this.inputs = inputs;
    return ` SELECT d.*, temp.*,
      (select logo_url from manufacturers where id = d.manufacturer_id) as image_url,
      (select fd.to_date from financier_dealers fd where fd.dealer_id = d.id AND
        financier_team_id = $4 and user_id IS null ORDER BY
        created_at DESC LIMIT 1 ) as to_date,
      (select fd.user_id from financier_dealers fd where fd.dealer_id = d.id AND
      financier_team_id = $4 AND fd.to_date IS NULL and user_id IS NOT null) as assigned_to
      FROM dealers d LEFT JOIN ( SELECT financier_leads.dealer_id as dealer_id,
      COUNT(1) total_leads,
      COUNT(1) FILTER (where status = 500) active_leads,
      COUNT(1) FILTER (where status = 510) pending_leads,
      COUNT(1) FILTER (where status = 520) converted_leads,
      COUNT(1) FILTER (where status = 930) lost_leads
      FROM financier_leads WHERE ( created_at::date BETWEEN $1 AND $2
      OR lost_on::date BETWEEN $1 AND $2 ) AND financier_id = $3 AND financier_team_id = $4
      GROUP BY dealer_id ) temp on d.id = temp.dealer_id  WHERE ${inputs.dealerString}
    `;
  }

  /**
   * To get dealership-performance based on a sales executive or team head
   * associated to dealers
   *
   * @param  {string} userId                      financier-user-id
   * @param  {object} filter                          date - filter
   * @param  {function} callback                           callback
   * @author Jaiyashree Subramanian
   */
  async getDealershipPerformanceBySales(userId, filter, callback) {
    this.filter = filter;
    try {
      let dealerIds = await app.FinancierDealer.find({
        where: {
          and: [{ user_id: userId }, { to_date: null }, { financier_id: this.financierId }],
        },
        fields: ['dealer_id'],
      });
      dealerIds = lodash.map(dealerIds, 'dealer_id');
      if (dealerIds.length) {
        let params = [this.filter.fromDate, this.filter.toDate, this.financierId, userId];
        const dealerString =
          StringUtils.generateInClause(params.length + 1, dealerIds);
        params = params.concat(dealerIds);
        const dealershipPerformanceQuery = this.dealershipPerformanceByUser({
          dealerString: `d.id IN (${dealerString})`,
        });
        const dealershipPerformance = await new Promise((resolve, reject) => {
          postgresDs.connector.query(dealershipPerformanceQuery, params, (err, result) => {
            if (err) reject(new InstabikeError(err));
            resolve(result);
          });
        });
        return callback(null, dealershipPerformance);
      }
      return callback(null, []);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  dealershipPerformanceByUser(inputs) {
    this.inputs = inputs;
    return ` SELECT d.*, temp.*,
      (select logo_url from manufacturers where id = d.manufacturer_id) as image_url
      FROM dealers d LEFT JOIN ( SELECT financier_leads.dealer_id as dealer_id,
      COUNT(1) total_leads,
      COUNT(1) FILTER (where status = 500) active_leads,
      COUNT(1) FILTER (where status = 510) pending_leads,
      COUNT(1) FILTER (where status = 520) converted_leads,
      COUNT(1) FILTER (where status = 930) lost_leads
      FROM financier_leads WHERE ( created_at::date BETWEEN $1 AND $2
      OR lost_on::date BETWEEN $1 AND $2 ) AND financier_id = $3 AND assigned_to = $4
      GROUP BY dealer_id ) temp on d.id = temp.dealer_id  WHERE ${inputs.dealerString}
    `;
  }

  /**
   * To get monthly lead-summary of a dealer based on financier and dealer id
   *
   * @param  {string} dealerId                                      dealer-id
   * @param  {object} filter                                    date - filter
   * @param  {function} callback                                     callback
   * @author Jaiyashree Subramanian
   */
  async getDealershipMonthlyReport(dealerId, filter, callback) {
    this.filter = filter;
    try {
      const financierDealer = await app.FinancierDealer.findOne({
        where: {
          and: [
            { dealer_id: dealerId },
            { financier_id: this.financierId },
            { user_id: null },
            { to_date: null },
          ],
        },
      });
      if (!financierDealer) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.FINANCIER.DEALER_NOT_FOUND));
      }
      const dealershipMonthlyReport = this.dealershipMonthlyReport();
      const params = [this.filter.fromDate, this.filter.toDate, this.financierId, dealerId];
      const summary = await new Promise((resolve, reject) => {
        postgresDs.connector.query(dealershipMonthlyReport, params, (err, result) => {
          if (err) reject(new InstabikeError(err));
          resolve(result);
        });
      });
      const result = await this.groupResultByMonth(
        summary,
        [this.filter.fromDate, this.filter.toDate],
      );
      return callback(null, result);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * To construct a consecutive month-based array of response
   *
   * @param  {[object]} response                     array of result
   * @param  {[object]} dateParams                     date - filter
   * @param  {[object]} result                      month-based data
   * @author Jaiyashree Subramanian
   */
  async groupResultByMonth(response, dateParams) {
    this.dateParams = dateParams;
    try {
      const dateSeriesQuery = this.generateMonthSeries();
      const dateSeries = await new Promise((resolve, reject) => {
        postgresDs.connector.query(dateSeriesQuery, dateParams, (err, result) => {
          if (err) reject(new InstabikeError(err));
          resolve(result);
        });
      });
      const result = [];
      await Promise.all(dateSeries.map(async (eachDate) => {
        const performanceObj = response.filter(eachPerformance =>
          eachPerformance.month === eachDate.month_series
          && eachPerformance.year === eachDate.year_series);
        if (performanceObj && performanceObj.length) result.push(performanceObj[0]);
        else {
          result.push({ month: eachDate.month_series, year: eachDate.year_series });
        }
      }));
      return result;
    } catch (err) {
      throw (new InstabikeError(ErrorConstants.ERRORS.FINANCIER.TEAM_NOT_FOUND));
    }
  }

  dealershipMonthlyReport(inputs) {
    this.inputs = inputs;
    return `SELECT to_char(COALESCE(lost_on, created_at),'Mon') as month,
      extract(year FROM COALESCE(lost_on, created_at)) as year,
      COUNT(1) total_leads,
      COUNT(1) FILTER (where status = 500) active_leads,
      COUNT(1) FILTER (where status = 510) pending_leads,
      COUNT(1) FILTER (where status = 520) converted_leads,
      COUNT(1) FILTER (where status = 930) lost_leads
      FROM financier_leads WHERE ( created_at::date BETWEEN $1 AND $2
      OR lost_on::date BETWEEN $1 AND $2 ) AND financier_id = $3
      AND dealer_id = $4 GROUP BY month, year
    `;
  }

  /**
   * To get overall dealership lead-effectiveness across teams by city-head
   *
   * @param  {string} currentUser                        financier-city-head
   * @param  {object} filter                                   date - filter
   * @param  {function} callback                                    callback
   * @author Jaiyashree Subramanian
   */
  async getDealershipLeadEffectiveness(currentUser, filter, callback) {
    this.filter = filter;
    try {
      const condition = [{ financier_id: this.financierId }, { city_id: currentUser.city_id },
        { user_id: null }, { dealer_id: { neq: null } }];
      let financierTeamIds = [];
      if (filter.financierTeamIds && filter.financierTeamIds.length) {
        financierTeamIds = lodash.map(filter.financierTeamIds);
        condition.push({ financier_team_id: { inq: financierTeamIds } });
      }
      const dealerIds = await app.FinancierDealer.find({
        where: {
          and: condition,
        },
        fields: ['dealer_id'],
      });
      if (filter.dealerIds && filter.dealerIds.length) {
        if (filter.financierTeamIds && filter.financierTeamIds.length) {
          this.filter.dealerIds = filter.dealerIds.concat(lodash.map(dealerIds, 'dealer_id'));
        }
      } else {
        this.filter.dealerIds = lodash.map(dealerIds, 'dealer_id');
      }
      if (this.filter.dealerIds.length) {
        let financierTeamString = '';
        let params = [this.filter.fromDate, this.filter.toDate, this.financierId];
        if (filter.financierTeamIds && filter.financierTeamIds.length) {
          financierTeamString =
            StringUtils.generateInClause(params.length + 1, financierTeamIds);
          params = params.concat(financierTeamIds);
          financierTeamString = `AND financier_team_id IN (${financierTeamString}) `;
        }
        const dealerString =
          StringUtils.generateInClause(params.length + 1, this.filter.dealerIds);
        params = params.concat(this.filter.dealerIds);
        const leadEffectivenessQuery = this.overallDealershipLeadEffectiveness({
          financierTeamString,
          dealerString: `d.id IN (${dealerString})`,
        });
        const leadEffectiveness = await new Promise((resolve, reject) => {
          postgresDs.connector.query(leadEffectivenessQuery, params, (err, result) => {
            if (err) reject(new InstabikeError(err));
            resolve(result);
          });
        });
        return callback(null, leadEffectiveness);
      }
      return callback(null, []);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  overallDealershipLeadEffectiveness(inputs) {
    this.inputs = inputs;
    return ` SELECT d.*, temp.*,
      (SELECT financier_team_id from financier_dealers WHERE dealer_id = d.id
        AND user_id is null AND financier_id = $3 order by created_at DESC
        limit 1) as financier_team_id,
      ( select name from financier_teams where id = COALESCE (
          temp.financier_team_id,
          (SELECT financier_team_id from financier_dealers WHERE dealer_id = d.id
          AND user_id is null AND financier_id = $3 AND to_date IS NULL order by created_at DESC
          limit 1)
        )
      ) as team_name
      FROM dealers d LEFT JOIN ( SELECT financier_leads.dealer_id as dealer_id,
      financier_leads.financier_team_id,
      COUNT(1) total_leads,
      COUNT(1) FILTER (where status = 500) active_leads,
      COUNT(1) FILTER (where status = 510) pending_leads,
      COUNT(1) FILTER (where status = 520) converted_leads,
      COUNT(1) FILTER (where status = 930) lost_leads
      FROM financier_leads WHERE ( created_at::date BETWEEN $1 AND $2
      OR lost_on::date BETWEEN $1 AND $2 ) AND financier_id = $3 ${inputs.financierTeamString}
      GROUP BY dealer_id, financier_team_id ) temp on d.id = temp.dealer_id  WHERE ${inputs.dealerString}
      ORDER BY d.name
    `;
  }

  /**
   * To get a list of financier sales-executives and team-leads assigned to
   * this dealership by financier-is and dealer-id
   *
   * @param  {string}  financierId           id of the financier-selected
   * @param  {string} financierTeamId                   financier-team-id
   * @return {function} callback                                 callback
   * @author Jaiyashree Subramanian
   */
  async getExecutivesAssociated(financierTeamId, callback) {
    try {
      const financierTeam = await app.FinancierTeam.findOne({
        where: {
          and: [
            { id: financierTeamId },
            { financier_id: this.financierId },
            { from_date: { lte: new Date() } },
            { to_date: null },
          ],
        },
      });
      if (!financierTeam) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.FINANCIER.TEAM_NOT_FOUND));
      }
      let userIds = [financierTeam.owned_by];
      const financierTeamMembers = await app.FinancierTeamMember.find({
        where: {
          and: [
            { financier_team_id: financierTeamId },
            { financier_id: this.financierId },
            { from_date: { lte: new Date() } },
            { to_date: null },
          ],
        },
      });
      userIds = userIds.concat(lodash.map(financierTeamMembers, 'user_id'));
      const users = await app.Users.find({
        where: {
          and: [
            { id: { inq: userIds } },
            { user_type_id: this.financierId },
            { user_type_name: constants.USER_TYPE_NAMES.FINANCIER },
          ],
        },
      });
      return callback(null, users);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * Get Roles under the module financier
   * @param  {Function} callback
   * @return {Array} List of roles
   */
  async getRoles(callback) {
    this.roles = [];
    try {
      this.roles = await app.Roles.find({ where: { module: constants.USER_TYPE_NAMES.FINANCIER } });
      return callback(null, this.roles);
    } catch (e) {
      return callback(new InstabikeError(e));
    }
  }

  /**
   * To delete a financier-user from financier-application
   *
   * @param  {string} userId                financier-team-id
   * @param  {function} callback                     callback
   * @author Jaiyashree Subramanian
   */
  async deleteFinancierUser(userId, callback) {
    try {
      const team = await app.FinancierTeam.findOne({
        where: {
          and: [{ owned_by: userId }, { financier_id: this.financierId },
            { to_date: null }],
        },
      });
      if (team) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.FINANCIER.ASSIGNED_TO_TEAM));
      }
      const teams = await app.FinancierTeamMember.findOne({
        where: {
          and: [{ user_id: userId }, { to_date: null },
            { financier_id: this.financierId }],
        },
      });
      if (teams) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.FINANCIER.ASSIGNED_TO_TEAM));
      }
      const financierDealers = await app.FinancierDealer.find({
        where: {
          and: [
            { financier_id: this.financierId }, { user_id: userId }, { to_date: null }],
        },
      });
      if (financierDealers && financierDealers.length) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.FINANCIER.MEMBER_HAS_DEALERS));
      }
      await app.Users.updateAll({
        id: userId,
      }, {
        to_date: new Date(),
        is_active: false,
        email: null,
        mobile_no: '0000000',
      });
      return callback(null, 'Deleted Successfully');
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * To get all active financier-user from financier-application for current financier
   *
   * @param  {function} callback                     callback
   * @author Jaiyashree Subramanian
   */
  async getFinancierUsersList(financierRole, filter, callback) {
    let users = [];
    let totalCount = [{ count: 0 }];
    try {
      this.roleName = await FilterUtil.getRole(financierRole);
      if (!this.roleName) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.FINANCIER.ROLE_NOT_FOUND));
      }
      const params = [this.roleName, this.currentUser.city_id, this.currentUser.id,
        this.financierId, filter.limit, filter.skip];
      users = await new Promise((resolve, reject) => {
        const userQuery = `select *, (SELECT name from financier_teams where
            ( to_date is null ) and (
              ( owned_by = u.id and financier_id = $4 ) or
              ( id = (select financier_team_id
                from financier_team_members where user_id = u.id and financier_id = $4
                and to_date is null
                order by created_at DESC limit 1) )
              )
          ) as team_name
          from users u where id IN ( select user_id from user_role
          where role_id = ( select id from roles where name = $1 ) ) and id != $3 and is_active = true
          AND city_id = $2 AND user_type_id = $4 order by ${filter.sortField} ${filter.sortOrder}
          limit $5 offset $6`;
        postgresDs.connector.query(userQuery, params, (err, result) => {
          if (err) reject(new InstabikeError(err));
          resolve(result);
        });
      });
      const countParams = [this.roleName, this.currentUser.city_id, this.currentUser.id,
        this.financierId];
      totalCount = await new Promise((resolve, reject) => {
        const countQuery = `SELECT count(1) from users where id IN ( select user_id from user_role
          where role_id = ( select id from roles where name = $1 ) ) and id != $3 and is_active = true
          AND city_id = $2 AND user_type_id = $4`;
        postgresDs.connector.query(countQuery, countParams, (err, result) => {
          if (err) reject(new InstabikeError(err));
          resolve(result);
        });
      });
      return callback(null, { data: users, totalCount: totalCount[0].count });
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * To create financier-user for current financier
   *
   * @param  {object} data                        user data
   * @param  {function} callback                     callback
   * @author Jaiyashree Subramanian
   */
  async createFinancierUser(data, callback) {
    this.newUser = data;
    try {
      if (!(data.role === 'financier_sales' || data.role === 'financier_team_head')) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.FINANCIER.ROLE_NOT_ALLOWED));
      }
      this.roleName = await FilterUtil.getRole(data.role);
      if (!this.roleName) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.FINANCIER.ROLE_NOT_FOUND));
      }
      const user = await this.createUser(data.role, this.newUser);
      return callback(null, user);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * Validate financier executives is already exist
   * @param {Users} user
   * @param {Function} callback
   * @author Ponnuvel G
   */
  async validateFinancierUser(user, callback) {
    try {
      this.user = user;
      await this.validateSplCharsInUserNames(this.user);
      const isUpdate = await this.isProfileUpdate(user);
      if (isUpdate) {
        const existingUser = await app.Users.find({
          where: {
            and: [
              { or: [{ mobile_no: user.mobile_no }, { email: user.email }] },
              { id: { neq: user.id } },
              { user_type_name: constants.USER_TYPE_NAMES.FINANCIER },
            ],
          },
        });
        const err = ErrorConstants.ERRORS.USER.EMAIL_MOBILE_ALREADY_EXIST;
        if (existingUser && existingUser.length > 0) {
          return callback(new InstabikeError(err));
        }
      }
      return callback(null, user);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  async isProfileUpdate(user) {
    let isUpdate = false;
    if (user.id) {
      this.existing = await app.Users.findById(user.id);
      if (user.mobile_no) {
        if (user.mobile_no !== this.existing.mobile_no) {
          isUpdate = true;
        }
      }
      if (user.email) {
        if (user.email !== this.existing.email) {
          isUpdate = true;
        }
      }
    }
    return isUpdate;
  }
};
