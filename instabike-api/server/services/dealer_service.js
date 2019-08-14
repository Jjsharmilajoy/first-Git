/* eslint-disable class-methods-use-this */
/**
 * Dealer Service consists methods such as: get inventory details
 * to get accessories available and vehicles, variants etc,. stocks left and to
 * update the stock
 */

// import dependencies
const moment = require('moment');
const dot = require('dot');
const lodash = require('lodash');
const base64 = require('base-64');
const wkhtmltopdf = require('wkhtmltopdf');
const streamToBuffer = require('stream-to-buffer');
const json2csv = require('json2csv').parse;

// import files
const loopback = require('../server.js');
const BaseService = require('../services/base_service');
const constants = require('../utils/constants/userConstants');
const reportQueries = require('../utils/constants/reportQueries');
const InstabikeError = require('../error/instabike_error');
const ErrorConstants = require('../utils/constants/error_constants');
const PasswordUtils = require('../utils/password_utils');
const StringUtils = require('../utils/string_utils');
const ExternalServiceProviders = require('../utils/external_services_providers');
const FilterUtil = require('../utils/filter_utils');
const ImageProcessor = require('../utils/image_processor');

wkhtmltopdf.command = process.env.WKHTMLTOPDF_COMMAND;
const app = loopback.dataSources.postgres.models;
const postgresDs = loopback.dataSources.postgres.connector;

/**
 * @author Sathish Kumar
 */
module.exports = class DealerService extends BaseService {
  constructor(dealerId, currentUser) {
    super(currentUser);
    this.dealerId = dealerId;
    this.registerChild(this);
    this.currentUser = currentUser;
  }

  /**
   * Maps vehilcles with the associated dealer
   * @param  {String}   vehicleId
   * @param  {Function} callback
   * @author Sathish kumar
   */
  async associateVehicle(vehicleId, userId, callback) {
    this.vehicleId = vehicleId;
    try {
      const dealerDetails = await app.Dealer.findOne({ where: { id: this.dealerId } });
      if (!dealerDetails || !dealerDetails.is_active) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.DEALER.NOT_FOUND));
      }
      const vehicleDetails = await app.Vehicle.findOne({ where: { id: this.vehicleId } });
      if (!vehicleDetails || vehicleDetails.manufacturer_id !== null) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.VEHICLE.NOT_ASSOCIATE));
      }
      const status = await app.DealerVehicle.create({
        dealer_id: this.dealerId,
        vehicle_id: this.vehicleId,
        user_id: userId,
        is_active: true,
      });
      return callback(null, status);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * To persist a new customer and associate with corresponding role
   * by finding CUSTOMER role id, and creating a new customer if
   * not exist and associate to the role and also the dealer sales
   * using the current context.
   * @param  {Object}   salesUser   Dealer sales person user object
   * @param  {Object}   leadUserObj Lead details entered from sales Login
   * @param  {Function} callback
   * @return {Function} callback
   * @author shahul hameed b
   */
  async createCustomer(salesUser, customerObj, callback) {
    try {
      const dealer = await app.Dealer.findOne({ where: { id: this.dealerId } });
      if (!dealer || !dealer.is_active) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.DEALER.NOT_FOUND));
      }
      if (!salesUser) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.DEALER.SALES_NOT_FOUND));
      }
      const userObj = this.validateUserInput(salesUser, customerObj);
      const user =
         await this.createUser(await FilterUtil.getRole('customer'), userObj);
      const lead = DealerService.constructLead(user, salesUser);
      user.lead = await this.createLead(lead);
      return callback(null, user);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * Construct Leads using Users
   * @param  {Users} user
   * @param  {Users} sales created by
   * @return {Leads} lead
   */
  static constructLead(user, sales) {
    const lead = {};
    lead.name = user.first_name + user.last_name;
    lead.mobile_number = user.mobile_no;
    lead.gender = user.gender;
    lead.is_invoiced = false;
    lead.type = constants.LEAD_TYPES.OFFLINE;
    lead.category = constants.LEAD_CATEGORIES.NEW;
    lead.parent_dealer_id = sales.user_type_id;
    lead.user_id = user.id;
    lead.assigned_to = sales.id;
    lead.dealer_id = sales.user_type_id;
    return lead;
  }

  /**
   * Find user by lead mobile number
   * If user not exists, create user
   * Find lead by mobile number, dealer ID and invoice status
   * If lead exists, return lead else create lead
   * @param  {Leads}   lead
   * @param  {Users}   dealerUser
   * @param  {Function} callback
   * @return {Leads}  lead
   */
  async createNewLead(lead, dealerUser, callback) {
    this.lead = lead;
    try {
      const dealer = await app.Dealer.findOne({ where: { id: this.dealerId } });
      if (!dealer || !dealer.is_active) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.DEALER.NOT_FOUND));
      }
      let user = null;
      let leadObj = null;
      if (this.lead.mobile_number) {
        const userWhereCond = [
          { user_type_name: constants.USER_TYPE_NAMES.CUSTOMER },
          { mobile_no: this.lead.mobile_number },
          { gender: this.lead.gender },
        ];
        const nameArray = this.lead.name.split(' ');
        if (lodash.nth(nameArray, 0)) {
          userWhereCond.push({ first_name: lodash.nth(nameArray, 0) });
        }
        if (lodash.nth(nameArray, 1)) {
          userWhereCond.push({ last_name: lodash.nth(nameArray, 1) });
        }
        const query = {
          where: {
            and: [
              { mobile_number: this.lead.mobile_number },
              {
                or: [
                  { dealer_id: this.dealerId },
                  { parent_dealer_id: this.dealerId },
                ],
              },
              { is_invoiced: false },
              { status: { lt: 600 } },
            ],
          },
        };
        let contacts = [];
        if (process.env.WHITE_LIST_CONTACTS) {
          contacts = process.env.WHITE_LIST_CONTACTS.split(',');
          contacts = await contacts.map(contact => contact.replace(/[\[\]' ]/g, ''));
        }
        if (contacts.includes(this.lead.mobile_number)) {
          query.where.and = query.where.and.concat([
            { name: this.lead.name },
            { gender: this.lead.gender },
          ]);
        }
        leadObj = await app.Lead.find(query);
        if (leadObj.length > 0) {
          const executive = await app.Users.findById(leadObj[0].assigned_to);
          let name = `${executive.first_name}`;
          if (executive.last_name) {
            name += ` ${executive.last_name}`;
          }
          const error = {
            message: `Lead already exist under ${name}`,
            status: 400,
          };
          return callback(new InstabikeError(error));
        }
        user = await app.Users.findOne({
          where: { and: userWhereCond },
        });
        if (!user) {
          user = this.constructUser();
          user = await this.createUser(await FilterUtil.getRole('customer'), user);
          const messages = [];
          const template = dot.template(constants.NOTIFICATION.WELCOME);
          const msg = template(Object.assign(dealer, {
            sales_executive: dealerUser.first_name,
            official_contact_number: dealerUser.official_contact_number,
          }));
          const message = { mobile: user.mobile_no, message: msg };
          messages.push(message);
          this.send(messages);
        }
      } else {
        user = this.constructUser();
        user = await this.createUser(await FilterUtil.getRole('customer'), user);
      }
      this.lead.assigned_to = dealerUser.id;
      this.lead.owner_id = dealerUser.id;
      this.lead.user_id = user.id;
      this.lead.status = constants.LEAD_STATUS.NEW;
      this.lead.category = constants.LEAD_CATEGORIES.NEW;
      this.lead.type = constants.LEAD_TYPES.OFFLINE;
      this.lead.dealer_id = this.dealerId;
      this.lead.parent_dealer_id = this.dealerId;
      this.lead.manufacturer_id = dealer.manufacturer_id;
      this.lead.dealer_category_id = dealer.dealer_category_id;
      this.lead.region_id = dealer.region_id;
      this.lead.zone_id = dealer.zone_id;
      this.lead.state_id = dealer.state_id;
      this.lead.country_id = dealer.country_id;
      this.lead.city_id = dealer.city_id;
      leadObj = await this.createLead(this.lead);
      await this.saveActivity(leadObj, null, dealerUser.id, constants.ACTIVITY.LEAD_CREATED);
      return callback(null, leadObj);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * Construc Users using Leads
   * @return {Users} user
   */
  constructUser() {
    const user = {};
    const nameArray = this.lead.name.split(' ');
    if (lodash.nth(nameArray, 0)) {
      user.first_name = lodash.nth(nameArray, 0);
    }
    if (lodash.nth(nameArray, 1)) {
      user.last_name = lodash.nth(nameArray, 1);
    }
    user.mobile_no = this.lead.mobile_number;
    user.gender = this.lead.gender;
    user.user_type_name = constants.USER_TYPE_NAMES.CUSTOMER;
    user.password = PasswordUtils.generatePassword();
    return user;
  }

  /**
   * update customer based on the sales executive who will
   * be the current user in LoopBackContext and customer object
   * passed.
   * @param  {string}   customerId
   * @param  {object}   customerObj
   * @param  {Function} callback
   * @return {Function}
   * @author shahul hameed b
   */
  async updateCustomer(customerId, customerObj, callback) {
    try {
      this.customerObj = customerObj;
      const dealer = await app.Dealer.findOne({ where: { id: this.dealerId, is_active: true } });
      if (!dealer) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.DEALER.NOT_FOUND));
      }
      const userExist = await app.Users.findOne({ where: { id: customerId } });
      if (!userExist) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.NOT_EXIST));
      }
      this.customerObj.is_active = true;
      const user = await app.Users.upsert(this.customerObj);
      return callback(null, user);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * Login Dealer users
   * Validate and return accesstoken
   *
   * @param  {Object} credentials      user credentials to login
   * @param  {Function} callback                        callback
   * @return {Function} callback                        callback
   * @author Jaiyashree Subramanian
   */
  async dealerLogin(credentials, callback) {
    this.credentials = credentials;
    this.roles = await FilterUtil.getRole('dealer_roles');
    try {
      const accessToken = await this.login(constants.USER_TYPE_NAMES.DEALER);
      return callback(null, accessToken);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * To persist a new dealer-sales and associate with corresponding role
   * by finding DEALER_SALES role id, and creating a new user if
   * not exist and associate to the role and also the dealer manager
   * using the current context.
   *
   * @param  {object}   newUser   new customer data
   * @param  {string}   salesRole user role
   * @param  {function} callback  callback
   * @author Jaiyashree Subramanian
   */
  async createSales(newUser, salesRole, dealerManagerUser, callback) {
    this.newUser = newUser;
    try {
      const userRole = await FilterUtil.getRole(salesRole);
      if (!this.newUser.manager_id) {
        this.newUser.manager_id = dealerManagerUser.id;
      }
      const dealer = await app.Dealer.findById(this.dealerId);
      if (!dealer) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.DEALER.NOT_FOUND));
      }
      const isUserExist = await app.Users.findOne({
        where: {
          and: [
            {
              or: [{ mobile_no: { regexp: `/${this.newUser.mobile_no}/i` } },
                { email: { regexp: `/${this.newUser.email}/i` } }],
            },
            { user_type_name: constants.USER_TYPE_NAMES.DEALER },
          ],
        },
      });
      if (isUserExist) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.USER.EMAIL_MOBILE_ALREADY_EXIST));
      }
      this.newUser.password = PasswordUtils.generatePassword();
      this.newUser.user_type_name = constants.USER_TYPE_NAMES.DEALER;
      this.newUser.user_type_id = this.dealerId;
      const dealerSales =
        await this.createUser(userRole, this.newUser);
      dealerSales.role = userRole;
      return callback(null, dealerSales);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * To get all the dealer sales team members based on the dealer id.
   *
   * @param  {function} callback  callback
   * @author Jagajeevan
   */
  async getAllSalesMember(callback) {
    try {
      const dealerSales =
        await app.Users.find({
          include: {
            relation: 'user_role',
            where: {
              or: [
                { role_id: await FilterUtil.getRole('dealer_sales') },
                { role_id: await FilterUtil.getRole('dealer_team_head') },
              ],
            },
          },
          where: {
            user_type_id: this.dealerId,
            is_active: true,
          },
        });
      return callback(null, dealerSales);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * To get the dealer sales team member based on the user id.
   *
   * @param  {string}   userId  user Id
   * @param  {function} callback  callback
   * @author Jagajeevan
   */
  async getSalesMemberById(userId, callback) {
    this.userId = userId;
    try {
      const dealerSales =
        await app.Users.findById(this.userId);
      return callback(null, dealerSales);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * To update the user details based on the user id.
   *
   * @param  {string}   userId  user Id
   * @param  {object}   updatedUser   old user data
   * @param  {string}   salesRole sales user role
   * @param  {function} callback  callback
   * @author Jagajeevan
   */
  async updateSalesMember(userId, updatedUser, salesRole, dealerManagerUser, callback) {
    if (!dealerManagerUser) {
      return callback(new InstabikeError(ErrorConstants.ERRORS.DEALER.MANAGER_NOT_FOUND));
    }
    try {
      const userRole = await FilterUtil.getRole(salesRole);
      const reportingUsers = await app.Users.find({
        where: {
          manager_id: userId,
          user_type_name: constants.USER_TYPE_NAMES.DEALER,
          is_active: true,
        },
      });
      if (reportingUsers && (reportingUsers.length > 0)) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.USER.USER_IS_MAPPED));
      }
      this.userId = userId;
      const dealerSales =
        await this.updateSalesWithRole(userRole, updatedUser);
      return callback(null, dealerSales);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * To delete the user details based on the user id (setting inactive).
   *
   * @param  {string}   userId  user Id
   * @param  {function} callback  callback
   * @author shahul hameed b
   */
  async deleteSalesMember(userId, dealerManagerUser, callback) {
    this.userId = userId;
    try {
      if (!dealerManagerUser) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.DEALER.MANAGER_NOT_FOUND));
      }
      const userObj = await app.Users.findById(this.userId);
      if (!userObj) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.DEALER.SALES_NOT_FOUND));
      }
      if (userObj.manager_id == null) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.USER.MANAGER_DELETE));
      }
      const reportingUsers = await app.Users.find({
        where: {
          manager_id: userObj.id,
          user_type_name: constants.USER_TYPE_NAMES.DEALER,
          is_active: true,
        },
      });
      if (reportingUsers && (reportingUsers.length > 0)) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.USER.USER_IS_MAPPED));
      }
      const createdAt = moment().subtract(6, 'months');
      const leads = await app.Lead.find({
        where: {
          assigned_to: userId,
          is_lost: false,
          is_invoiced: false,
          is_booked: false,
          created_at: { gte: createdAt },
        },
        fields: 'id',
      });
      if (leads && (leads.length > 0)) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.USER.USER_HAS_LEADS));
      }
      userObj.is_active = false;
      userObj.mobile_no = constants.GENERAL_CONSTANTS.DEFAULT_MOBILE_NUMBER;
      userObj.email = null;
      const deletedUser = await app.Users.upsert(userObj);
      await app.AccessToken.destroyAll({
        userId: deletedUser.id,
      });
      return callback(null, deletedUser);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * Get dealer by Id and lists all accessories and availability.
   * @param  {function} callback                                         callback
   * @return {function} callback                                         callback
   * @author Jaiyashree Subramanian
   */
  async showAllAccessories(dataFilter, callback) {
    try {
      const dealerObj = await app.Dealer.findById(this.dealerId);
      if (!dealerObj) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.DEALER.NOT_FOUND));
      }
      const query = [
        { manufacturer_id: dealerObj.manufacturer_id },
        {
          or: [
            { dealer_id: this.dealerId },
            { dealer_id: null },
          ],
        },
      ];
      if (dataFilter.vehicle_id) {
        query.push({ vehicle_id: dataFilter.vehicle_id });
      }
      const accessories = await app.Accessory.find({
        where: {
          and: query,
        },
        include: {
          relation: 'dealerAccessories',
          scope: {
            where: {
              dealer_id: this.dealerId,
            },
          },
        },
        order: `${dataFilter.order_field} ${dataFilter.order_by}`,
      });
      return callback(null, accessories);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * Get dealer by Id and lists all accessories and availability.
   * @param  {function} callback                                         callback
   * @return {function} callback                                         callback
   * @author Jaiyashree Subramanian
   */
  async associateAccessories(dealerAccessories, vehicleId, callback) {
    const dealerAccessoryList = [];
    try {
      const dealerObj = await app.Dealer.findById(this.dealerId);
      if (!dealerObj) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.DEALER.NOT_FOUND));
      }
      let accessoryPrice = 0;
      await Promise.all(dealerAccessories.map(async (dealerAccessory) => {
        dealerAccessoryList.push(await app.DealerAccessory.upsertWithWhere({
          dealer_id: this.dealerId,
          accessory_id: dealerAccessory.accessory_id,
        }, dealerAccessory));
        if (dealerAccessory.is_mandatory) {
          accessoryPrice += dealerAccessory.price + dealerAccessory.sgst_price
              + dealerAccessory.cgst_price;
        }
      }));

      const vehiclePrices = await app.VehiclePrice.find({
        where: {
          and: [
            { vehicle_id: vehicleId },
            { dealer_id: this.dealerId },
          ],
        },
        fields: ['id', 'accessories_price', 'onroad_price'],
      });

      lodash.map(vehiclePrices, async (vehiclePrice) => {
        await app.VehiclePrice.updateAll({
          id: vehiclePrice.id,
        }, {
          accessories_price: accessoryPrice,
          onroad_price: (vehiclePrice.onroad_price - vehiclePrice.accessories_price)
            + accessoryPrice,
        });
      });

      const query = [
        { manufacturer_id: dealerObj.manufacturer_id },
        {
          or: [
            { dealer_id: this.dealerId },
            { dealer_id: null },
          ],
        },
        { vehicle_id: vehicleId },
      ];
      const accessoriesList = await app.Accessory.find({
        where: { and: query },
        include: {
          relation: 'dealerAccessories',
          scope: {
            where: {
              dealer_id: this.dealerId,
            },
          },
        },
        order: 'name ASC',
      });
      return callback(null, accessoriesList);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * validate the input user(customer) object and then
   * set the user properties for creation.
   * @param  {object} salesUser
   * @param  {object} userObj
   * @return {object} customer user object
   * @author shahul hameed b
   */
  validateUserInput(salesUser, userObj) {
    this.userObj = userObj;
    if (!this.userObj.username) {
      throw new InstabikeError(ErrorConstants.ERROR.VALIDATION.USER_NAME);
    }
    if (!this.userObj.gender) {
      throw new InstabikeError(ErrorConstants.ERROR.VALIDATION.GENDER);
    }
    if (!this.userObj.mobile_no && !this.userObj.mobile_no.length === 10) {
      throw new InstabikeError(ErrorConstants.ERROR.VALIDATION.MOBILE_NUMBER);
    }
    this.userObj.user_type_name = constants.USER_TYPE_NAMES.CUSTOMER;
    this.userObj.password = PasswordUtils.generatePassword();
    this.userObj.user_type_id = salesUser.id;
    return this.userObj;
  }

  /**
   * To get the list of direct reporting members
   * for dealer sales member.
   * @param  {string}   dealerId     id of dealer to fetch associated accessories
   * @param  {object}   salesUser  object of the currentUser
   * @param  {function} callback  list of suboridinates user object
   * @author shahul hameed b
   */
  async getDirectReportingMembers(salesUser, callback) {
    try {
      if (!salesUser) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.USER.NOT_EXIST));
      }
      const salesTeam =
        await app.Users.find({
          where: {
            manager_id: salesUser.id, user_type_id: this.dealerId, is_active: true,
          },
        });
      return callback(null, salesTeam);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * get all team leads and their respective
   * suboridinates based on the dealer manager.
   * @param  {object}   dealerManager
   * @param  {function} callback
   * @return {function} object containing key as userid and
   * value as userobject with role
   * @author shahul hameed b
   */
  async getAllSalesTeamMember(dealerManager, callback) {
    try {
      const managerUserObj = await app.Users.findById(dealerManager.id);
      if (!managerUserObj) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.USER.NOT_EXIST));
      }
      const salesMembersObj = await app.Users.find({
        where: {
          and: [{
            manager_id: { neq: null },
            user_type_id: this.dealerId,
            is_active: true,
          }],
        },
        include: {
          relation: 'user_role',
          scope: {
            fields: ['role_id'],
            include: {
              relation: 'role',
              scope: {
                fields: ['name'],
              },
            },
          },
        },
      });
      let membersWithRole = [];
      if (salesMembersObj && salesMembersObj.length > 0) {
        membersWithRole = await this.getTeamMembersWithRole(salesMembersObj, managerUserObj);
      }
      return callback(null, membersWithRole);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * get sales head and executive members
   * with their role property.
   * @param  {object}  salesMembersObj team Lead
   * @param  {object}  managerUserObj  team Manager
   * @return {array} team Members with role property
   * @author shahul hameed b
   */
  async getTeamMembersWithRole(salesMembersObj, managerUserObj) {
    const membersWithRole = [];
    this.salesMembersObj = salesMembersObj;
    const ids = [];
    await salesMembersObj.map(async (saleMember) => {
      const member = saleMember.toJSON();
      if (member.user_role && member.user_role.length > 0) {
        const userRole = await FilterUtil.getRole('dealer_team_head');
        if (member.user_role[0].role.name === userRole && member.manager_id === managerUserObj.id) {
          delete member.user_role;
          member.role = userRole;
          membersWithRole.push(member);
          ids.push(member.id);
        }
      }
    });
    await salesMembersObj.map(async (saleMember) => {
      const member = saleMember.toJSON();
      if (member.user_role && member.user_role.length > 0) {
        const userRole = await FilterUtil.getRole('dealer_sales');
        if (member.user_role.length > 0 &&
            member.user_role[0].role.name === userRole && lodash.includes(ids, member.manager_id)) {
          delete member.user_role;
          member.role = userRole;
          membersWithRole.push(member);
        }
      }
    });
    return membersWithRole;
  }

  /**
  * To get the dealers based on the manufacturer id and zone, state, city.
  * @param  {string}   manufacturerId     id of manufacturer
  * @param  {object}   searchFilter  object of zone, state, city ids
  * @param  {function} callback  callback
  * @return {object} dealers object
  * @author Jagajeevan
  */
  async getDealers(manufacturerId, searchFilter, callback) {
    this.searchFilter = searchFilter;
    this.searchCriteria = [{ manufacturer_id: manufacturerId }];
    try {
      const searchCondition = {};
      if (searchFilter.searchField && searchFilter.searchValue) {
        searchCondition[searchFilter.searchField] = {
          regexp: `/${searchFilter.searchValue}/i`,
        };
        this.searchCriteria.push(searchCondition);
      }
      this.searchCriteria = await this.prepareSearchCriteria();
      const dealers = await app.Dealer.find({
        where: { and: this.searchCriteria },
        include: ['state', 'zone', 'city', 'dealer_category'],
        order: `${searchFilter.orderField} ${searchFilter.orderBy}`,
        limit: searchFilter.limit,
        skip: (searchFilter.pageNo - 1) * searchFilter.limit,
      });
      const whereCondition = {};
      await this.searchCriteria.map((eachCriteria) => {
        whereCondition[Object.keys(eachCriteria)] = eachCriteria[Object.keys(eachCriteria)];
        return whereCondition;
      });
      const count = await app.Dealer.count(whereCondition);
      return callback(null, { dealers, count });
    } catch (error) {
      return callback(error);
    }
  }

  /**
   * Preparing the query conditions for the search filter.
   * @param  {function} callback  callback
   * @return {object} query conditions
   * @author Jagajeevan
   */
  prepareSearchCriteria() {
    try {
      if (this.searchFilter.zoneIds && this.searchFilter.zoneIds.length) {
        this.searchCriteria.push({ zone_id: { inq: this.searchFilter.zoneIds } });
      }
      if (this.searchFilter.stateIds && this.searchFilter.stateIds.length) {
        this.searchCriteria.push({ state_id: { inq: this.searchFilter.stateIds } });
      }
      if (this.searchFilter.cityIds && this.searchFilter.cityIds.length) {
        this.searchCriteria.push({ city_id: { inq: this.searchFilter.cityIds } });
      }
      if (this.searchFilter.categoryIds && this.searchFilter.categoryIds.length) {
        this.searchCriteria.push({ dealer_category_id: { inq: this.searchFilter.categoryIds } });
      }
      return this.searchCriteria;
    } catch (error) {
      throw error;
    }
  }

  /**
   * To fetch all financiers and get association with a dealer.
   *
   * @param {Function} callback                 function
   * @author Jaiyashree Subramanian
   */
  async getDealerFinancier(callback) {
    try {
      const dealerObj = await app.Dealer.findById(this.dealerId);
      if (!dealerObj) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.DEALER.NOT_FOUND));
      }
      const financierList = await this.getFinanciersUpdated(dealerObj);
      return callback(null, financierList);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * To update all financiers associated to a dealer by deleting
   * all existing associatiomns and creating new relation.
   *
   * @param {[Object]} dealerFinanciers         dealer financiers
   * @param {Function} callback                          function
   * @author Jaiyashree Subramanian
   */
  async updateFinancier(dealerFinancierList, callback) {
    try {
      const dealerObj = await app.Dealer.findById(this.dealerId);
      if (!dealerObj) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.DEALER.NOT_FOUND));
      }
      await app.DealerFinancier.destroyAll({ dealer_id: this.dealerId });
      let financierList = [];
      if (dealerFinancierList.length > 0) {
        let i = 1;
        const dealerFinanciers = await dealerFinancierList.map((financier) => {
          const dealerFinancier = {};
          dealerFinancier.financier_id = financier.id;
          dealerFinancier.dealer_id = this.dealerId;
          dealerFinancier.city_id = dealerObj.city_id;
          dealerFinancier.manufacturer_id = dealerObj.manufacturer_id;
          dealerFinancier.order = i;
          dealerFinancier.is_manufacturer_financier = false;
          if (lodash.hasIn(financier, 'is_manufacturer')) {
            dealerFinancier.is_manufacturer_financier = financier.is_manufacturer;
          }
          i += 1;
          return dealerFinancier;
        });
        await app.DealerFinancier.create(dealerFinanciers);
      }
      financierList = await this.getFinanciersUpdated(dealerObj);
      return callback(null, financierList);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * Get all financiers for dealer
   * @param  {object} dealerObj                    dealer-object
   * @param  {function} callback                        callback
   * @author Jaiyashree Subramanian
   */
  async getFinanciersUpdated(dealerObj) {
    this.dealerObj = dealerObj;
    try {
      let params = [this.dealerObj.manufacturer_id, this.dealerObj.country_id];
      this.whereClause = ` AND mfo.country_id = $2
      AND mfo.zone_id = $3 AND mfo.state_id = $4 AND mfo.city_id = $5 `;
      params = params.concat([this.dealerObj.zone_id, this.dealerObj.state_id,
        this.dealerObj.city_id]);
      this.joinCondition = ` AND mf.country_id = $2 AND ( (mf.zone_id = $3 AND
        mf.state_id = $4 AND mf.city_id = $5) OR (mf.zone_id = $3 AND mf.state_id = $4
        AND mf.city_id IS NULL) OR (mf.zone_id = $3 AND mf.state_id IS NULL AND mf.city_id IS NULL)
        OR (mf.zone_id IS NULL AND mf.state_id IS NULL AND mf.city_id IS NULL) )`;
      const financiersQuery = `SELECT financiers.*, financiers.image_url, financiers.logo_url,
          mfo.order as order, mfo.manufacturer_id, mfo.financier_id, mfo.country_id as assigned_country_id,
          mfo.zone_id as assigned_zone_id, mfo.state_id as assigned_state_id, mfo.city_id as assigned_city_id,
          mf.country_id, mf.zone_id, mf.state_id, mf.city_id from manufacturer_financier_orders mfo
        INNER JOIN manufacturer_financiers mf ON mf.manufacturer_id = mfo.manufacturer_id
          AND mf.financier_id =  mfo.financier_id ${this.joinCondition} INNER JOIN financiers ON
          financiers.id = mfo.financier_id WHERE mfo.manufacturer_id = $1 ${this.whereClause} ORDER BY mfo.order ASC
      `;
      const manufacturerFinanciers = await new Promise((resolve, reject) => {
        loopback.dataSources.postgres.connector.query(financiersQuery, params, (err, result) => {
          if (err) reject(new InstabikeError(err));
          resolve(result);
        });
      });
      const manufacturerFinancierIds = lodash.map(manufacturerFinanciers, 'financier_id');
      const associatedFinanciers = await app.DealerFinancier.find({
        where: { dealer_id: this.dealerId },
        order: 'order ASC',
        include: { relation: 'financier' },
      });
      const assocFinancierIds = lodash.map(associatedFinanciers, 'financier_id');
      const associatedResult = [];
      associatedFinanciers.map((eachDealerFinancier) => {
        const financierObj = eachDealerFinancier.financier();
        if (manufacturerFinancierIds.indexOf(eachDealerFinancier.financier_id) < 0) {
          financierObj.is_manufacturer = false;
        } else {
          financierObj.is_manufacturer = true;
        }
        financierObj.order = eachDealerFinancier.order;
        associatedResult.push(financierObj);
        return true;
      });
      associatedResult.sort((a, b) => (a.order - b.order));
      const manufacturerResult = [];
      /* eslint no-param-reassign: ["error", { "props": false }] */
      manufacturerFinanciers.map((eachManuFinancier) => {
        if (assocFinancierIds.indexOf(eachManuFinancier.financier_id) < 0) {
          eachManuFinancier.is_manufacturer = true;
          manufacturerResult.push(eachManuFinancier);
        }
        return true;
      });
      manufacturerResult.sort((a, b) => (a.order - b.order));
      const dealerFinanciers = manufacturerResult.concat(associatedResult);
      const allFinancierIds = manufacturerFinancierIds.concat(assocFinancierIds);
      const allFinanciers = await app.Financier.find({
        where: { id: { nin: allFinancierIds } },
      });
      return { dealerFinanciers, financiers: allFinanciers };
    } catch (error) {
      throw new InstabikeError(error);
    }
  }

  // async getFinancier(dealerObj) {
  //   this.dealerObj = dealerObj;
  //   const manufacturerFinancier = await app.ManufacturerFinancierOrder.find({
  //     where: { city_id: this.dealerObj.city_id },
  //     order: 'order ASC',
  //     include: { relation: 'financier' },
  //   });
  //   const dealerFinancier = await app.DealerFinancier.find({
  //     where: {
  //       dealer_id: this.dealerId,
  //     },
  //     order: 'order ASC',
  //     include: { relation: 'financier' },
  //   });
  //   const dealerFinanciers = [];
  //   if (dealerFinancier.length) {
  //     await new Promise(async (resolve, reject) => {
  //       dealerFinancier.map((financier) => {
  //         if (!financier) {
  //           reject(new InstabikeError(ErrorConstants.FINANCIER.LEAD.NOT_FOUND));
  //         }
  //         const availableManuFin = lodash.findIndex(
  //           manufacturerFinancier,
  //           { financier_id: financier.financier_id },
  //         );
  //         let fin;
  //         if (availableManuFin >= 0) {
  //           fin = manufacturerFinancier[availableManuFin].toJSON().financier;
  //           fin.is_manufacturer = true;
  //           manufacturerFinancier.splice(availableManuFin, 1);
  //         } else {
  //           fin = financier.toJSON().financier;
  //           fin.is_manufacturer = false;
  //         }
  //         resolve(dealerFinanciers.push(fin));
  //         return true;
  //       });
  //     });
  //   }
  //   await manufacturerFinancier.map((financier) => {
  //     const fin = financier.toJSON().financier;
  //     fin.is_manufacturer = true;
  //     dealerFinanciers.push(fin);
  //     return true;
  //   });
  //   const financierIds = await dealerFinanciers.map(financier =>
  //     financier.id);
  //   const financiers = await app.Financier.find({
  //     where: { id: { nin: financierIds } },
  //   });
  //   return { dealerFinanciers, financiers };
  // }

  /**
   * Get all vehicles with their price based on the dealer id.
   * @param  {object}   dealerManager
   * @param  {function} callback
   * @return {object} object containing vehicle with price
   * @author Jagajeevan
   */
  async getAllVehicles(callback) {
    const dealer = await app.Dealer.findById(this.dealerId);
    try {
      const vehicles =
        await app.Vehicle.find({
          include: {
            relation: 'prices',
            scope: {
              where: { dealer_id: this.dealerId },
              order: 'onroad_price ASC',
              limit: 1,
            },
          },
          where: { manufacturer_id: dealer.manufacturer_id, is_active: true },
          order: 'type DESC',
        });
      return callback(null, vehicles);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
 * Update the dealership details along
 * with dealer manager details for the particular
 * dealer manager
 * @param  {object}   dealerObj
 * @param  {string}   userId
 * @param  {object}   dealerManager
 * @param  {object}   currentUser
 * @param  {function} callback
 * @return {object} DealerUser
 * @author shahul hameed b
 */
  async updateDealerWithManager(dealerObj, userId, dealerManager, currentUser, callback) {
    try {
      if (currentUser.user_type_id !== this.dealerId && (!userId === dealerManager.id)) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.USER.TRY_AGAIN));
      }
      this.dealer = await app.Dealer.findById(this.dealerId);
      if (!dealerObj) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.DEALER.NOT_FOUND));
      }
      const managerObj = await app.Users.findOne({
        where: {
          id: userId,
          manager_id: null,
          user_type_id: this.dealerId,
          user_type_name: constants.USER_TYPE_NAMES.DEALER,
        },
      });
      if (!managerObj) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.USER.NOT_EXIST));
      }
      await app.Dealer.upsert(dealerObj);
      await app.Users.upsert(dealerManager);
      const dealership = await this.getDealershipWithManager();
      return callback(null, dealership);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * Get details of the dealer by id.
   *
   * @param {function} callback
   * @author Ajaykkumar Rajendran
   */
  async getDetails(callback) {
    try {
      const dealership = await this.getDealershipWithManager();
      return callback(null, dealership);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  async getDealershipWithManager() {
    try {
      const dealer = await app.Dealer.findOne({
        where: { id: this.dealerId },
        include: ['state', 'zone', 'city', 'region', 'dealer_category', 'manufacturer'],
        fields: ['id', 'name', 'email', 'address_line_1', 'address_line_2', 'pincode', 'location',
          'landline_no', 'mobile_no', 'state_id', 'zone_id', 'city_id', 'region_id',
          'dealer_category_id', 'manufacturer_id', 'monday_friday_start', 'monday_friday_end',
          'saturday_start', 'saturday_end', 'sunday_start', 'sunday_end', 'weekly_holiday'],
      });
      const managers = await app.Users.find({
        where: {
          user_type_name: 'Dealer',
          user_type_id: this.dealerId,
          manager_id: null,
        },
      });
      dealer.managers = managers;
      return dealer;
    } catch (e) {
      throw new InstabikeError(e);
    }
  }

  /**
   * get non mandatory accessories for a vehicle
   * w.r.t dealer
   * @param  {string}  vehicleId
   * @return {object} dealerAccessory
   * @author shahul hameed b
   */
  async getNonMandatoryAccessories(vehicleId) {
    const accessories = await app.DealerAccessory.find({
      where: {
        dealer_id: this.dealerId,
        vehicle_id: vehicleId,
        is_mandatory: false,
        is_available: true,
      },
      order: 'name ASC',
    });
    return accessories;
  }

  /**
   * getManadatoryAccessories for a vehicles
   * w.r.t dealer
   * @param  {string}  vehicleId
   * @return {object} dealerAccessory
   * @author shahul hameed b
   */
  async getManadatoryAccessories(vehicleId) {
    const accessories = await app.DealerAccessory.find({
      where: {
        dealer_id: this.dealerId,
        vehicle_id: vehicleId,
        is_mandatory: true,
        is_available: true,
      },
      order: 'name ASC',
    });
    return accessories;
  }

  /**
   * Get all targets of a dealer based on the given date filter
   * @param  {object} filter                  filter data
   * @param  {function} callback                 function
   * @return {[object]} targets           list of targets
   * @author Jaiyashree Subramanian
   */
  async getTargetByDate(filter, callback) {
    try {
      const fromDate = new Date(filter.fromDate);
      fromDate.setDate(fromDate.getDate() - 1);
      const toDate = new Date(filter.toDate);
      toDate.setDate(toDate.getDate() + 1);
      const targets = await app.ManufacturerTarget.find({
        where: {
          and: [
            { dealer_id: this.dealerId },
            { is_special_target: false },
            { target_from_date: { between: [fromDate, toDate] } },
            { target_to_date: { between: [fromDate, toDate] } },
          ],
        },
        order: 'target_from_date ASC',
      });
      return callback(null, targets);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * Get key and value for vehicles, variants and variant colors
   * @param  {Function} callback
   * @return {Vehivles}
   * @author Ponnuvel G
   */
  async getVehiclesKeyValue(callback) {
    try {
      const dealerVehicles = await app.VehiclePrice.find({ where: { dealer_id: this.dealerId }, fields: ['vehicle_id'] });
      const vechileIds = lodash.map(dealerVehicles, 'vehicle_id');
      const vehicles = await app.Vehicle.find({
        where: { id: { inq: vechileIds } },
        fields: ['id', 'name'],
        include: {
          relation: 'variants',
          scope: {
            fields: ['id', 'name'],
            include: { relation: 'colors', scope: { fields: ['id', 'color', 'color_codes'] } },
          },
        },
        order: 'type DESC',
      });
      return callback(null, vehicles);
    } catch (e) {
      return callback(new InstabikeError(e));
    }
  }

  /**
   * Get all the members under the dealer
   * @param  {Function} callback
   * @return {[Users]}
   * @author Ponnuvel G
   */
  async getUsersKeyValue(currentUser, callback) {
    this.currentUser = currentUser;
    try {
      const dealerUserIds = await this.getDealerUserIds();
      const users = await app.Users.find({
        where: {
          and: [
            { id: { inq: dealerUserIds } },
            { user_type_id: this.dealerId },
            { is_active: true },
          ],
        },
        fields: ['id', 'first_name', 'last_name', 'is_active'],
      });
      return callback(null, users);
    } catch (e) {
      return callback(new InstabikeError(e));
    }
  }

  /**
   * get all team members
   * @param  {Users}   currentUser
   * @param  {function} callback
   * @return {Users} object containing key as userid and
   * value as userobject with role
   * @author Jagajeevan
   */
  async getSalesTeamMembers(currentUser, callback) {
    try {
      this.currentUser = currentUser;
      const managerUserObj = await app.Users.findById(this.currentUser.id);
      if (!managerUserObj) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.USER.NOT_EXIST));
      }
      const dealerUserIds = await this.getDealerUserIds();
      const salesMembersObj = await app.Users.find({
        where: {
          and: [
            { id: { inq: dealerUserIds } },
            { id: { nin: [this.currentUser.id] } },
            { is_active: true },
          ],
        },
        include: [{
          relation: 'user_role',
          scope: { fields: ['role_id'], include: { relation: 'role', scope: { fields: ['name'] } } },
        },
        {
          relation: 'manager', scope: { fields: ['first_name', 'last_name'] },
        }],
      });
      return callback(null, salesMembersObj);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * get Vehicles Summary
   * @param  {object}   filter
   * @param  {Function} callback
   * @return {Array}
   * @author vishesh
   */
  async getVehiclesSummary(filter, callback) {
    this.filter = filter;
    const start = moment().startOf('month');
    const end = moment().endOf('day');
    try {
      const summary = {};
      const dealer = await app.Dealer.findOne({ where: { id: this.dealerId } });
      if (!dealer) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.DEALER.NOT_FOUND));
      }
      const filterObj = filter;
      filterObj.vehicleIdFilter = '';
      if (filter.vehicleIds && filter.vehicleIds.length) {
        filterObj.vehicleIdFilter = ' and v.id in (';
        for (let i = 0; i < filter.vehicleIds.length; i += 1) {
          if (i === filter.vehicleIds.length - 1) {
            filterObj.vehicleIdFilter += `'${filter.vehicleIds[i]}') `;
          } else {
            filterObj.vehicleIdFilter += `'${filter.vehicleIds[i]}',`;
          }
        }
      }
      const vehicles = await this.getVehiclesByDealer();
      filterObj.start = filterObj.start ? filterObj.start : start;
      filterObj.end = filterObj.end ? filterObj.end : end;
      summary.unitsSold = await this.getUnitsSold();
      summary.leadsCreated = await this.getleadsCreated();
      summary.ridesBooked = await this.getTestRidesBooked();
      const summaryArray = [];
      for (let i = 0; i < vehicles.length; i += 1) {
        summaryArray[i] = vehicles[i];
        summaryArray[i].unitsSold = !summary.unitsSold[vehicles[i].id] ? 0 :
          summary.unitsSold[vehicles[i].id][0].units_sold;
        summaryArray[i].leadsCreated = !summary.leadsCreated[vehicles[i].id] ? 0 :
          summary.leadsCreated[vehicles[i].id][0].leads_created;
        summaryArray[i].ridesBooked = !summary.ridesBooked[vehicles[i].id] ? 0 :
          summary.ridesBooked[vehicles[i].id][0].rides_booked;
      }
      return callback(null, summaryArray);
    } catch (e) {
      return callback(new InstabikeError(e));
    }
  }

  async getVehiclesByDealer() {
    let getVehiclesQuery = `select v.id, v.name, v.image_url from dealers d
      inner join manufacturers m on m.id = d.manufacturer_id
      inner join  vehicles v on m.id = v.manufacturer_id
      where (d.id = $1)`;
    let params = [this.dealerId];
    if (this.filter.vehicleIds && this.filter.vehicleIds.length) {
      const queryString = StringUtils.generateInClause(2, this.filter.vehicleIds);
      getVehiclesQuery += ` and v.id in (${queryString})`;
      params = params.concat(this.filter.vehicleIds);
    }
    return new Promise((resolve, reject) => {
      loopback.dataSources.postgres.connector.query(getVehiclesQuery, params, (err, result) => {
        if (err) {
          return reject(new InstabikeError(err));
        }
        return resolve(result);
      });
    });
  }

  async getUnitsSold() {
    let unitsSoldQuery = `select v.*, count(l.id) as units_sold from leads l
      inner join lead_details ld on l.id = ld.lead_id
      inner join vehicles v on ld.vehicle_id = v.id
      where (l.is_invoiced = true) and (l.dealer_id = $1) and (ld.vehicle_status = 600)
      and (l.invoiced_on::timestamp::date BETWEEN $2 AND $3)`;
    let params = [this.dealerId, this.filter.start, this.filter.end];
    if (this.filter.vehicleIds && this.filter.vehicleIds.length) {
      const queryString = StringUtils.generateInClause(4, this.filter.vehicleIds);
      unitsSoldQuery += ` and v.id in (${queryString})`;
      params = params.concat(this.filter.vehicleIds);
    }
    unitsSoldQuery += ' group By v.id';
    return new Promise((resolve, reject) => {
      loopback.dataSources.postgres.connector.query(unitsSoldQuery, params, (err, result) => {
        if (err) {
          return reject(new InstabikeError(err));
        }
        return resolve(lodash.groupBy(result, 'id'));
      });
    });
  }

  async getTestRidesBooked() {
    let testRideBookedQuery = `select v.*, count(ld.id) as rides_booked from
      lead_details ld inner join vehicles v on ld.vehicle_id = v.id
      where (ld.dealer_id = $1) and (ld.test_ride_on::timestamp::date BETWEEN $2 AND $3)`;
    let params = [this.dealerId, this.filter.start, this.filter.end];
    if (this.filter.vehicleIds && this.filter.vehicleIds.length) {
      const queryString = StringUtils.generateInClause(4, this.filter.vehicleIds);
      testRideBookedQuery += ` and v.id in (${queryString})`;
      params = params.concat(this.filter.vehicleIds);
    }
    testRideBookedQuery += ' group By v.id';
    return new Promise((resolve, reject) => {
      loopback.dataSources.postgres.connector.query(testRideBookedQuery, params, (err, result) => {
        if (err) {
          return reject(new InstabikeError(err));
        }
        return resolve(lodash.groupBy(result, 'id'));
      });
    });
  }

  async getleadsCreated() {
    let leadsCreatedQuery = `select v.*, count(ld.id) as leads_created from
      lead_details ld inner join vehicles v on ld.vehicle_id = v.id
      where (ld.dealer_id = $1)
      and (ld.created_at::timestamp::date BETWEEN $2 AND $3)`;
    let params = [this.dealerId, this.filter.start, this.filter.end];
    if (this.filter.vehicleIds && this.filter.vehicleIds.length) {
      const queryString = StringUtils.generateInClause(4, this.filter.vehicleIds);
      leadsCreatedQuery += ` and v.id in (${queryString})`;
      params = params.concat(this.filter.vehicleIds);
    }
    leadsCreatedQuery += ' group By v.id';
    return new Promise((resolve, reject) => {
      loopback.dataSources.postgres.connector.query(leadsCreatedQuery, params, (err, result) => {
        if (err) {
          return reject(new InstabikeError(err));
        }
        return resolve(lodash.groupBy(result, 'id'));
      });
    });
  }

  static async getTodaysFollowups(userIds) {
    const dayStart = moment().startOf('day');
    const end = moment().endOf('day');
    return app.Lead.find({
      where: {
        and: [
          { assigned_to: { inq: userIds } },
          {
            or: [
              { next_followup_on: { between: [dayStart, end] } },
              { last_followup_on: { between: [dayStart, end] } },
            ],
          },
        ],
      },
      fields: [
        'assigned_to',
        'category',
      ],
    });
  }

  static async getTodaysFollowupsDone(userIds) {
    const dayStart = moment().startOf('day');
    const end = moment().endOf('day');
    return app.Lead.find({
      where: {
        assigned_to: { inq: userIds },
        last_followup_on: { between: [dayStart, end] },
      },
      fields: [
        'assigned_to',
        'category'],
    });
  }

  static async getTodaysLeadsCreated(userIds) {
    const dayStart = moment().startOf('day');
    const end = moment().endOf('day');
    return app.Lead.find({
      where: {
        assigned_to: { inq: userIds },
        created_at: { between: [dayStart, end] },
      },
      fields: 'assigned_to',
    });
  }

  static async getTodaysMonthlyUnitsInvoiced(userIds) {
    const start = moment().startOf('month');
    const end = moment().endOf('day');
    return app.Lead.find({
      where: {
        assigned_to: { inq: userIds },
        invoiced_on: { between: [start, end] },
      },
      fields: 'assigned_to',
    });
  }

  static async getDealerTargets(userIds) {
    const start = moment().startOf('month').toDate();
    const end = moment().endOf('month').toDate();
    return app.DealerTarget.find({
      where: {
        and: [
          { dealer_id: this.dealer_id },
          { from_date: { gte: start } },
          { to_date: { lte: end } },
          { dealer_sales_id: { inq: userIds } },
        ],
      },
      fields: ['dealer_sales_id', 'target_value'],
    });
  }

  /**
   * get team performance
   * @param  {Function} callback
   * @return {Array}
   * @author vishesh
   */
  async getTeamPerformance(callback) {
    try {
      const response = {};
      const userIds = await this.getDealerUserIds();
      const userObjs = await app.Users.find({
        where: {
          id: {
            inq: userIds,
          },
        },
        fields: ['first_name', 'id'],
        include: {
          relation: 'user_role',
          scope: {
            include: 'role',
          },
        },
      });
      response.target = await DealerService.getDealerTargets(userIds);
      response.followup = await DealerService.getTodaysFollowups(userIds);
      response.followupDone = await DealerService.getTodaysFollowupsDone(userIds);
      response.leadsCreated = await DealerService.getTodaysLeadsCreated(userIds);
      response.monthlyUnitsInvoiced = await DealerService.getTodaysMonthlyUnitsInvoiced(userIds);
      response.incentive = await this.getDealerSalesIncentive();
      response.target = lodash.groupBy(response.target, 'dealer_sales_id');
      response.followup = lodash.groupBy(response.followup, 'assigned_to');
      response.monthlyUnitsInvoiced = lodash.groupBy(response.monthlyUnitsInvoiced, 'assigned_to');
      response.leadsCreated = lodash.groupBy(response.leadsCreated, 'assigned_to');
      response.followupDone = lodash.groupBy(response.followupDone, 'assigned_to');
      response.incentive = lodash.groupBy(response.incentive, 'userid');
      const summary = DealerService.formatPerformanceResponse(userIds, response, userObjs);
      return callback(null, summary);
    } catch (e) {
      return callback(new InstabikeError(e));
    }
  }

  static formatPerformanceResponse(userIds, response, userObjs) {
    const summary = [];
    for (let i = 0; i < userIds.length; i += 1) {
      summary[i] = {};
      summary[i].leadsCreated = response.leadsCreated[userObjs[i].id] ?
        response.leadsCreated[userObjs[i].id].length : 0;
      summary[i].monthlyTargets = 0;
      if (response.target[userObjs[i].id] && response.target[userObjs[i].id].length) {
        for (let j = 0; j < response.target[userObjs[i].id].length; j += 1) {
          summary[i].monthlyTargets += response.target[userObjs[i].id][j].target_value;
        }
      }
      summary[i].monthlyUnitsInvoiced = response.monthlyUnitsInvoiced[userObjs[i].id] ?
        response.monthlyUnitsInvoiced[userObjs[i].id].length : 0;
      summary[i].followupDone = response.followupDone[userObjs[i].id] ?
        response.followupDone[userObjs[i].id].length : 0;
      summary[i].user = userObjs[i];
      if (response.followup[userObjs[i].id]) {
        summary[i].followup = lodash.groupBy(response.followup[userObjs[i].id], 'category');
      } else {
        summary[i].followup = 0;
      }
      summary[i].monthlyIncentives = 0;
      if (response.incentive[userObjs[i].id] && response.incentive[userObjs[i].id].length) {
        for (let j = 0; j < response.incentive[userObjs[i].id].length; j += 1) {
          if (response.incentive[userObjs[i].id][j].target <
            response.incentive[userObjs[i].id][j].achived) {
            summary[i].monthlyIncentives +=
              parseInt(response.incentive[userObjs[i].id][j].incentive, 10);
          }
        }
      }
    }
    return summary;
  }

  /**
   * To get dealer targets summary for current month based on dealer id.
   *
   * @param {Object}    filter                      filter data
   * @param  {Function} callback                    callback
   * @return {Function} callback                    callback
   * @author Ajaykkumar Rajendran
   */
  async getTargetSummary(filter, callback) {
    try {
      const dealerUserIds = await this.getDealerUserIds('Target');
      let params = [this.dealerId, new Date(filter.fromDate).toISOString(),
        new Date(filter.toDate).toISOString()];
      let invoicedParams = [this.dealerId, new Date(filter.fromDate).toISOString(),
        new Date(filter.toDate).toISOString()];
      let targetQuery = `SELECT distinct(name), dt.vehicle_type,
        SUM(target_value) as dealer_target
        from dealer_targets dt WHERE dt.dealer_id = $1
        and dt.from_date >= $2 and dt.to_date <= $3`;
      let invoicedQuery = `select count(*) filter (where v.type = 0) as bike,
        count(*) filter (where v.type = 1) as scooter from leads l
        inner join lead_details ld on l.id = ld.lead_id and ld.vehicle_status = 600
        inner join vehicles v on ld.vehicle_id = v.id
        where (l.is_invoiced = true)
        and (l.dealer_id = $1)
        and (l.invoiced_on::timestamp::date BETWEEN $2 AND $3)`;
      if (dealerUserIds.length > 0) {
        const queryString = StringUtils.generateInClause(4, dealerUserIds);
        targetQuery += ` and dt.dealer_sales_id in (${queryString})`;
        params = params.concat(dealerUserIds);
      }
      if (!this.verifyRole('DEALER_MANAGER')) {
        const queryString = StringUtils.generateInClause(4, dealerUserIds);
        invoicedQuery += ` and (l.assigned_to in (${queryString}))`;
        invoicedParams = invoicedParams.concat(dealerUserIds);
      }
      targetQuery += ' group by name,dt.vehicle_type';
      let targets = await new Promise((resolve, reject) => {
        loopback.dataSources.postgres.connector.query(targetQuery, params, (err, dealerTarget) => {
          if (err) reject(new InstabikeError(err));
          resolve(dealerTarget);
        });
      });
      const invoiced = await new Promise((resolve, reject) => {
        loopback.dataSources.postgres.connector.query(
          invoicedQuery,
          invoicedParams, (err, result) => {
            if (err) reject(new InstabikeError(err));
            resolve(result);
          },
        );
      });
      if (targets.length > 0 && invoiced.length > 0) {
        const invoice = invoiced[0];
        targets.map((target, i) => {
          if (targets[i].vehicle_type === 0) {
            targets[i].sold_count = invoice.bike;
          }
          if (targets[i].vehicle_type === 1) {
            targets[i].sold_count = invoice.scooter;
          }
          return targets;
        });
      }
      if (this.verifyRole('DEALER_MANAGER')) {
        const manufacturerTargets = await this.getManufacturersTarget(filter);
        if (manufacturerTargets.length > 0) {
          if (targets.length > 0) {
            targets.map((target, i) => {
              const manufacturerTarget =
              lodash.find(manufacturerTargets, { vehicle_type: target.vehicle_type });
              targets[i].manufacturer_target = manufacturerTarget.manufacturer_target;
              return target;
            });
          } else {
            targets = manufacturerTargets;
          }
        }
      }
      return callback(null, targets);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  async getManufacturersTarget(filter) {
    const params = [this.dealerId, new Date(filter.fromDate).toISOString(),
      new Date(filter.toDate).toISOString()];
    const query = `select mt.vehicle_type, mt.target as manufacturer_target
      from manufacturer_targets mt WHERE mt.dealer_id = $1
      and mt.target_from_date >= $2 and mt.target_to_date <= $3
      group by mt.vehicle_type, mt.target`;
    const targets = await new Promise((resolve, reject) => {
      loopback.dataSources.postgres.connector.query(query, params, (err, dealerTarget) => {
        if (err) reject(new InstabikeError(err));
        resolve(dealerTarget);
      });
    });
    return targets;
  }

  /**
   * To get leads summary for present day.
   *
   * @param  {Function} callback                    callback
   * @return {Function} callback                    callback
   * @author Ajaykkumar Rajendran
   */
  async getLeadsSummary(callback) {
    try {
      const results = [];
      let resultObj = {};
      const dealerUserIds = await this.getDealerUserIds();
      if (dealerUserIds.length !== 0) {
        const queries = this.buildLeadsCountQuery(dealerUserIds);
        await Promise.all(queries.map(async (queryObj) => {
          await new Promise((resolve, reject) => {
            loopback.dataSources.postgres.connector.query(
              queryObj.query, queryObj.params,
              (err, dealerTarget) => {
                if (err) {
                  reject(new InstabikeError(err));
                }
                results.push(dealerTarget[0]);
                resolve(dealerTarget);
              },
            );
          });
        }));
      }
      lodash.map(results, (result) => {
        resultObj = Object.assign(resultObj, result);
      });
      resultObj.incentive_amount = await this.calculateIncentive(dealerUserIds);
      return callback(null, resultObj);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * Calculate Incentive for the sales executive
   * @return {Promise} incentive
   * @author Ponnuvel G
   */
  async calculateIncentive(dealerUserIds) {
    const start = moment().startOf('month').toDate().toISOString();
    const end = moment().endOf('month').toDate().toISOString();
    const startDay = moment().startOf('month').format('YYYY-MM-DD');
    const endDay = moment().endOf('month').format('YYYY-MM-DD');
    let incentives = [];
    for (let i = 0; i < dealerUserIds.length; i += 1) {
      const params = [this.dealerId, startDay, endDay, start, end, this.dealerId];
      params.push(dealerUserIds[i]);
      const query = `select v.type, SUM(dv.incentive_amount) as incentive,
        dt.target_value as target, count(1) as achived from leads l
        inner join lead_details ld on l.id = ld.lead_id and ld.vehicle_status = 600
        inner join vehicles v on v.id = ld.vehicle_id
        inner join dealer_vehicles dv on ld.vehicle_id = dv.vehicle_id and dv.dealer_id = $1
        inner join dealer_targets dt on dt.dealer_sales_id = l.assigned_to and
        dt.vehicle_type = v.type and dt.from_date::date = $2 and dt.to_date::date = $3
        where l.invoiced_on::timestamp between $4 and $5 and l.dealer_id = $6
        and l.assigned_to = $7 and l.is_invoiced = true group by v.type, dt.target_value`;
      const result = await new Promise((resolve, reject) => {
        loopback.dataSources.postgres.connector.query(query, params, (err, res) => {
          if (err) {
            reject(new InstabikeError(err));
          }
          resolve(res);
        });
      });
      incentives = incentives.concat(result);
    }
    let amount = 0;
    incentives.map((incentive) => {
      if (incentive.target < incentive.achived) {
        amount += parseInt(incentive.incentive, 10);
      }
      return amount;
    });
    return amount;
  }

  buildLeadsCountQuery(dealerUserIds) {
    this.queries = [];
    const startTime = moment.utc().startOf('day').toISOString();
    const endTime = moment.utc().endOf('day').toISOString();
    const currentTime = moment().format();
    const queryString = StringUtils.generateInClause(3, dealerUserIds);
    const overdueLeadsQueryString = StringUtils.generateInClause(2, dealerUserIds);
    let pendingLeadParams = [currentTime, endTime];
    let pendingLeadsQuery = `SELECT count(1) FILTER
      (where next_followup_on::timestamp BETWEEN $1 AND $2`;
    pendingLeadsQuery += ` and assigned_to in (${queryString})) as pending_leads from leads`;
    pendingLeadParams = pendingLeadParams.concat(dealerUserIds);
    this.queries.push({ query: pendingLeadsQuery, params: pendingLeadParams });
    let overdueLeadsParams = [currentTime];
    let overdueLeadsQuery = 'select count(1) FILTER (where next_followup_on::timestamp < $1';
    overdueLeadsQuery += ` and assigned_to in (${overdueLeadsQueryString})) as overdue_leads from leads`;
    overdueLeadsParams = overdueLeadsParams.concat(dealerUserIds);
    this.queries.push({ query: overdueLeadsQuery, params: overdueLeadsParams });
    let scheduledTestRideParams = [startTime, endTime];
    let scheduledTestRideQuery = `SELECT count(1) AS scheduled_test_ride from leads l
      INNER JOIN lead_details ld ON ld.lead_id = l.id WHERE ld.test_ride_on::timestamp
      BETWEEN $1 AND $2 AND ld.test_ride_status = 200 AND ld.is_deleted = false`;
    scheduledTestRideQuery += ` and l.assigned_to in (${queryString})`;
    scheduledTestRideParams = scheduledTestRideParams.concat(dealerUserIds);
    this.queries.push({ query: scheduledTestRideQuery, params: scheduledTestRideParams });
    let inProgressTestRideParams = [startTime, endTime];
    let inProgressTestRideQuery = `SELECT count(1) AS inprogress_test_ride from leads l
      INNER JOIN lead_details ld ON ld.lead_id = l.id WHERE ld.test_ride_on
      BETWEEN $1 AND $2 AND ld.test_ride_status = 300 AND ld.is_deleted = false`;
    inProgressTestRideQuery += ` and l.assigned_to in (${queryString})`;
    inProgressTestRideParams = inProgressTestRideParams.concat(dealerUserIds);
    this.queries.push({ query: inProgressTestRideQuery, params: inProgressTestRideParams });
    let completedTestRideParams = [startTime, endTime];
    let completedTestRideQuery = `SELECT count(1) AS completed_test_ride from leads l
      INNER JOIN lead_details ld ON ld.lead_id = l.id WHERE ld.test_ride_on::timestamp
      BETWEEN $1 AND $2 AND ld.test_ride_status = 400 AND ld.is_deleted = false`;
    completedTestRideQuery += ` and l.assigned_to in (${queryString})`;
    completedTestRideParams = completedTestRideParams.concat(dealerUserIds);
    this.queries.push({ query: completedTestRideQuery, params: completedTestRideParams });
    return this.queries;
  }

  /**
   * To update the user details based on the user id.
   *
   * @param  {string}   userId  user Id
   * @param  {object}   updatedUser   old user data
   * @param  {string}   salesRole sales user role
   * @param  {function} callback  callback
   * @author Jagajeevan
   */
  async updateSalesMemberHead(userId, updatedUser, salesHeadRole, dealerManagerUser, callback) {
    if (!dealerManagerUser) {
      return callback(new InstabikeError(ErrorConstants.ERRORS.DEALER.MANAGER_NOT_FOUND));
    }
    try {
      const userRole = await FilterUtil.getRole(salesHeadRole);
      this.userId = userId;
      const dealerSales =
        await this.updateSalesWithRole(userRole, updatedUser);
      return callback(null, dealerSales);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * update the user data based on the user id.
   *
   * @param  {string}  userId user id
   * @param  {object}  roleName role name to be updated
   * @return {object}  user users object
   * @author Jagajeevan
   */
  async updateSalesWithRole(roleName, updateUser) {
    try {
      const existingUser = await app.Users.find({
        where: {
          and: [
            {
              or: [
                { mobile_no: { regexp: `/${updateUser.mobile_no}/i` } },
                { email: { regexp: `/${updateUser.email}/i` } },
              ],
            },
            { id: { neq: updateUser.id }, user_type_name: updateUser.user_type_name },
          ],
        },
      });
      if (existingUser.length) {
        throw new InstabikeError(ErrorConstants.ERRORS.USER.EMAIL_MOBILE_ALREADY_EXIST);
      }
      const role = await app.Roles.findOne({ where: { name: roleName } });
      if (!role) {
        throw new InstabikeError(ErrorConstants.ERRORS.ROLE.NOT_FOUND);
      }
      const user = await app.Users.upsert(updateUser);
      await app.UserRole.upsertWithWhere({ user_id: this.userId }, { role_id: role.id });
      return user;
    } catch (error) {
      throw (new InstabikeError(error));
    }
  }

  /**
   * To get a list of financier sales-executives and team-leads assigned to
   * this dealership by financier-is and dealer-id
   *
   * @param  {string}  financierId           id of the financier-selected
   * @param  {function} callback                                 callback
   * @return {function} callback                                 callback
   * @author Jaiyashree Subramanian
   */
  async getExecutivesAssociated(financierId, callback) {
    this.financierId = financierId;
    try {
      const financierDealers = await app.FinancierDealer.find({
        where: {
          financier_id: this.financierId,
          dealer_id: this.dealerId,
          from_date: { lte: new Date() },
          to_date: null,
          user_id: { neq: null },
          financier_team_id: { neq: null },
        },
        include: 'user',
      });
      return callback(null, financierDealers);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * Get Financier Interest Details based on the Lead input criteria
   * @param  {Object}   filter It has lead income, domicile and down payment details
   * @param  {Function} callback
   * @return {List} financier EMI Details
   * @author Ponnuvel G
   */
  async getFinancierInterestDetails(filter, callback) {
    this.filter = filter;
    try {
      const dealer = await app.Dealer.findById(this.dealerId);
      if (!dealer) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.DEALER.NOT_FOUND));
      }
      const proformaInvoice = await this.getProformaInvoiceDetails();
      const financiers = await this.findFinancierInterestDetails(dealer, proformaInvoice);
      const financiersEmiDetails = await this.calculateEmiDetails(financiers, proformaInvoice);
      return callback(null, financiersEmiDetails);
    } catch (e) {
      return callback(new InstabikeError(e));
    }
  }

  /**
   * Get proforma invoice details
   * @return {Object} proforma invoice Details
   * @author Ponnuvel G
   */
  async getProformaInvoiceDetails() {
    try {
      const proformaInvoiceDetails = await app.ProformaInvoice.findById(
        this.filter.proforma_invoice_id,
        {
          include: ['proforma_invoice_offer', 'proforma_invoice_other_charges',
            'lead', 'lead_detail',
            {
              relation: 'vehicle_price',
              scope: { include: { relation: 'vehicle_insurances' } },
            },
            { relation: 'proforma_invoice_accessory', scope: { include: ['dealer_accessory'] } },
          ],
        },
      );
      return proformaInvoiceDetails;
    } catch (e) {
      throw new InstabikeError(ErrorConstants.ERROR.INVOICE.NOT_FOUND);
    }
  }

  /**
   * Calculate EMI Details
   * @param  {List} financiers
   * @param  {Number} price
   * @param  {Number} downPayment
   * @return {List} financierEmiDetails
   * @author Ponnuvel G
   */
  async calculateEmiDetails(financiers, proformaInvoice) {
    this.financiersEmiDetails = [];
    const financiersEmiDetails = [];
    let accessories = 0;
    proformaInvoice.proforma_invoice_accessory().map((accessory) => {
      accessories += parseInt(accessory.dealer_accessory().price, 10);
      return accessories;
    });
    let offers = 0;
    proformaInvoice.proforma_invoice_offer().map((offer) => {
      offers += parseInt(offer.amount, 10);
      return offers;
    });
    let otherCharges = 0;
    proformaInvoice.proforma_invoice_other_charges().map((charges) => {
      otherCharges += parseInt(charges.amount, 10);
      return otherCharges;
    });
    const exchangeVehicle = await app.ExchangeVehicle.findOne({
      where: {
        proforma_invoice_id: proformaInvoice.id,
        status: constants.STATUS.ACTIVE,
      },
    });
    if (exchangeVehicle) {
      offers += parseInt(exchangeVehicle.quoted_value, 10);
    }
    // const leadDetail = proformaInvoice.lead_detail();
    const vehiclePrice = proformaInvoice.vehicle_price();
    // let onroadPrice = parseInt(vehiclePrice.onroad_price, 10);
    const insurances = {};
    vehiclePrice.vehicle_insurances().map((insurance) => {
      if (insurance.validity) {
        insurances[`${insurance.type}_${insurance.validity}`] = insurance.amount;
      } else {
        insurances[insurance.type] = insurance.amount;
      }
      return insurances;
    });
    // let insuranceAmount = insurances.tp_premium_5 + insurances.compulsory_pa_cover_1;
    // if (leadDetail.od_premium_validity === 1) {
    //   insuranceAmount += insurances.od_premium_1;
    // }
    // if (leadDetail.od_premium_validity === 5) {
    //   insuranceAmount += insurances.od_premium_5;
    // }
    // if (leadDetail.zero_depreciation) {
    //   insuranceAmount += insurances.zero_depreciation;
    // }
    // if (leadDetail.extended_warranty) {
    //   onroadPrice += parseInt(vehiclePrice.extented_warranty, 10);
    // }
    // onroadPrice += insuranceAmount;
    financiers.map((financier) => {
      const financierEmiDetail = {};
      // let deductable = parseInt(financier.down_payment, 10) - offers;
      // deductable += (accessories + otherCharges);
      financierEmiDetail.id = financier.id;
      financierEmiDetail.name = financier.name;
      financierEmiDetail.down_payment = parseInt(financier.down_payment, 10);
      financierEmiDetail.loan_amount = parseInt(vehiclePrice.onroad_price, 10);
      financierEmiDetail.tenure = financier.tenure;
      financierEmiDetail.advance_emi = financier.advance_emi;
      financierEmiDetail.emi = financier.emi;
      financierEmiDetail.interest_percentage = financier.rate_of_interest ? financier.rate_of_interest : ' ';
      financiersEmiDetails.push(financierEmiDetail);
      return financiersEmiDetails;
    });
    return financiersEmiDetails;
  }

  /**
   * Find financier interest details based on the lead search criteria
   * @return {List} FinancierInterestDetail
   * @author Ponnuvel G
   */
  async findFinancierInterestDetails(dealer, proformaInvoice) {
    await this.updateDealerFinancier(dealer);
    const query = `select df.financier_id as id, f.name, fid.down_payment,
      fid.tenure, fid.advance_emi, fid.rate_of_interest, fid.emi from dealer_financiers as df
      inner join financiers as f on df.financier_id = f.id
      inner join financier_interest_details as fid on df.financier_id = fid.financier_id
      where df.dealer_id = $1 and fid.dealer_id = $1
      and fid.tenure between $2 and $3
      and fid.advance_emi = $4 and fid.vehicle_id = $5
      and fid.variant_id = $6 order by df.order asc`;
    const params = [this.dealerId, this.filter.tenure_from, this.filter.tenure_to,
      this.filter.advance_emi, proformaInvoice.vehicle_price().vehicle_id,
      proformaInvoice.vehicle_price().variant_id];
    return new Promise((resolve, reject) => {
      loopback.dataSources.postgres.connector.query(query, params, (err, result) => {
        if (err) {
          return reject(new InstabikeError(err));
        }
        return resolve(result);
      });
    });
  }

  /**
   * Add exchange vehicle for a lead
   * @param {string}   dealerId
   * @param {string}   leadId
   * @param {ExchangeVehicle}   exchangeVehicle
   * @param {Function} callback
   * @author Ponnuvel G
   */
  async addExchangeVehicle(leadId, exchangeVehicle, callback) {
    this.exchangeVehicle = exchangeVehicle;
    try {
      const dealer = await app.Dealer.findById(this.dealerId);
      if (!dealer) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.DEALER.NOT_FOUND));
      }
      const lead = await app.Lead.findById(leadId);
      if (!lead) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.LEAD.NOT_FOUND));
      }
      const isVehicleExist = await app.ExchangeVehicle.find({
        where: {
          lead_id: leadId,
          status: constants.STATUS.ACTIVE,
          proforma_invoice_id: exchangeVehicle.proforma_invoice_id,
        },
      });
      if (isVehicleExist.length > 0) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.EXCHANGE_VEHICLE.LIMIT_EXCEED));
      }
      this.exchangeVehicle.status = constants.STATUS.ACTIVE;
      this.exchangeVehicle.dealer_id = this.dealerId;
      this.exchangeVehicle.dealer_sales_id = this.currentUser.id;
      this.exchangeVehicle.lead_id = leadId;
      const vehicle = await app.ExchangeVehicle.create(this.exchangeVehicle);
      return callback(null, vehicle);
    } catch (e) {
      return callback(new InstabikeError(e));
    }
  }

  /**
   * Update exchange vehicle for a lead
   * @param {string}   dealerId
   * @param {string}   leadId
   * @param {ExchangeVehicle}   exchangeVehicle
   * @param {Function} callback
   * @author Ponnuvel G
   */
  async updateExchangeVehicle(leadId, exchangeVehicle, callback) {
    this.exchangeVehicle = exchangeVehicle;
    try {
      const dealer = await app.Dealer.findById(this.dealerId);
      if (!dealer) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.DEALER.NOT_FOUND));
      }
      const lead = await app.Lead.findById(leadId);
      if (!lead) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.LEAD.NOT_FOUND));
      }
      const isVehicleExist = await app.ExchangeVehicle.findById(exchangeVehicle.id);
      if (!isVehicleExist) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.EXCHANGE_VEHICLE.NOT_FOUND));
      }
      const vehicle = await app.ExchangeVehicle.upsert(this.exchangeVehicle);
      return callback(null, vehicle);
    } catch (e) {
      return callback(new InstabikeError(e));
    }
  }

  /**
   * Get exchange vehicle for a lead
   * @param {string}   dealerId
   * @param {string}   leadId
   * @param {Function} callback
   * @author Ponnuvel G
   */
  async getExchangeVehicle(leadId, proformaInvoiceId, callback) {
    try {
      const dealer = await app.Dealer.findById(this.dealerId);
      if (!dealer) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.DEALER.NOT_FOUND));
      }
      const lead = await app.Lead.findById(leadId);
      if (!lead) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.LEAD.NOT_FOUND));
      }
      let vehicle = await app.ExchangeVehicle.findOne({
        where: {
          lead_id: leadId,
          status: constants.STATUS.ACTIVE,
          proforma_invoice_id: proformaInvoiceId,
        },
      });
      vehicle = (!vehicle) ? {} : vehicle;
      return callback(null, vehicle);
    } catch (e) {
      return callback(new InstabikeError(e));
    }
  }

  /**
   * Get Manufacturer
   * @param  {Function} callback
   * @return {List} List of Manufacturers
   */
  async getManufacturers(callback) {
    this.manufacturers = [];
    this.manufacturers = await new Promise((resolve, reject) => {
      postgresDs.query(
        `SELECT DISTINCT (manufacturer) FROM exchange_vehicles_lookup
        ORDER BY manufacturer ASC`,
        (err, manufacturers) => {
          if (err) reject(new InstabikeError(err));
          resolve(manufacturers);
        },
      );
    });
    return callback(null, this.manufacturers);
  }

  /**
   * Get Vehicles
   * @param  {Objcet}   filter
   * @param  {Function} callback
   * @return {List} List of Vehicles
   */
  async getVehicles(filter, callback) {
    this.filter = filter;
    const vehicles = await new Promise((resolve, reject) => {
      postgresDs.query(
        `SELECT DISTINCT (vehicle) FROM exchange_vehicles_lookup
        WHERE manufacturer = $1`, [this.filter.manufacturer],
        (err, result) => {
          if (err) reject(new InstabikeError(err));
          resolve(result);
        },
      );
    });
    return callback(null, vehicles);
  }

  /**
   * Get Exchange Vehicle Lookup
   * @param  {Object}   filter
   * @param  {Function} callback
   * @return {ExchangeVehicleLookup}
   */
  async getPrice(filter, callback) {
    this.filter = filter;
    try {
      let price = await app.ExchangeVehicleLookup.findOne({
        where: {
          manufacturer: this.filter.manufacturer,
          vehicle: this.filter.vehicle,
          model: this.filter.model,
          km_used_from: { lt: this.filter.km_used },
          km_used_to: { gte: this.filter.km_used },
        },
      });
      if (!price) {
        price = {};
      }
      return callback(null, price);
    } catch (e) {
      return callback(new InstabikeError(e));
    }
  }

  /**
   * Get dealer executives sales incentive
   * @return {Promise} incentives
   * @author Ponnuvel G
   */
  async getDealerSalesIncentive() {
    const start = moment().startOf('month').toDate().toISOString();
    const end = moment().endOf('month').toDate().toISOString();
    const startDay = moment().startOf('month').format('YYYY-MM-DD');
    const endDay = moment().endOf('month').format('YYYY-MM-DD');
    const params = [this.dealerId, startDay, endDay, start, end, this.dealerId];
    const query = `select l.assigned_to as userid, v.type, SUM(dv.incentive_amount) as incentive,
      dt.target_value as target, count(1) as achived from leads l
      inner join lead_details ld on l.id = ld.lead_id and ld.vehicle_status = 600
      inner join vehicles v on v.id = ld.vehicle_id
      inner join dealer_vehicles dv on ld.vehicle_id = dv.vehicle_id and dv.dealer_id = $1
      inner join dealer_targets dt on dt.dealer_sales_id = l.assigned_to and
      dt.vehicle_type = v.type and dt.from_date::date = $2 and dt.to_date::date = $3
      where l.invoiced_on::timestamp between $4 and $5 and l.dealer_id = $6
      and l.is_invoiced = true group by v.type, dt.target_value, l.assigned_to`;
    const incentives = await new Promise((resolve, reject) => {
      loopback.dataSources.postgres.connector.query(query, params, (err, res) => {
        if (err) {
          reject(new InstabikeError(err));
        }
        return resolve(res);
      });
    });
    return incentives;
  }

  /**
   * update dealer financiers
   * @author Jagajeevan
   */
  async updateDealerFinancier(dealer) {
    const dealerFinancierList = await this.getFinanciersUpdated(dealer);
    await app.DealerFinancier.destroyAll({ dealer_id: this.dealerId });
    if (dealerFinancierList.dealerFinanciers.length > 0) {
      let i = 1;
      const dealerFinanciers = await dealerFinancierList.dealerFinanciers.map((financier) => {
        const dealerFinancier = {};
        dealerFinancier.financier_id = financier.id;
        dealerFinancier.dealer_id = this.dealerId;
        dealerFinancier.city_id = dealer.city_id;
        dealerFinancier.manufacturer_id = dealer.manufacturer_id;
        dealerFinancier.order = i;
        dealerFinancier.is_manufacturer_financier = false;
        if (lodash.hasIn(financier, 'is_manufacturer')) {
          dealerFinancier.is_manufacturer_financier = financier.is_manufacturer;
        }
        i += 1;
        return dealerFinancier;
      });
      await app.DealerFinancier.create(dealerFinanciers);
    }
  }

  /**
   * Create proforma invoice as a HTML and convert to PDF and send mail to lead
   * @param  {String}   proformaInvoiceId
   * @param  {Object}   filter
   * @param  {Function} callback
   * @return {String} HTML string to print
   */
  async makePrint(proformaInvoiceId, filter, callback) {
    try {
      const date = moment().utcOffset(330).format('DD-MM-YYYY');
      let dealer = await app.Dealer.findById(this.dealerId, {
        include: ['state', 'zone', 'city', 'region'],
      });
      if (!dealer) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.DEALER.NOT_FOUND));
      }
      dealer = dealer.toJSON();
      let proformaInvoice = await app.ProformaInvoice.findById(proformaInvoiceId, {
        include: ['proforma_invoice_offer', 'proforma_invoice_other_charges', 'lead', 'lead_detail',
          {
            relation: 'vehicle_price',
            scope: { include: { relation: 'vehicle_insurances' } },
          },
          {
            relation: 'proforma_invoice_accessory',
            scope: { include: { relation: 'dealer_accessory' } },
          }],
      });
      if (!proformaInvoice) {
        throw new InstabikeError(ErrorConstants.ERROR.INVOICE.NOT_FOUND);
      }
      proformaInvoice = proformaInvoice.toJSON();
      const manufacturer = await app.Manufacturer.findById(dealer.manufacturer_id);
      const lead = await app.Lead.findById(proformaInvoice.lead_id);
      const leadDetail = await app.LeadDetail.findById(proformaInvoice.lead_detail_id);
      const vehicle = await app.Vehicle.findById(leadDetail.vehicle_id);
      const variant = await app.Variant.findById(leadDetail.variant_id);
      const color = await app.VariantColour.findById(leadDetail.variant_colour_id);
      const allAccessories = await this.getManadatoryAccessories(vehicle.id);
      proformaInvoice.proforma_invoice_accessory.map((dealerAccesory) => {
        allAccessories.push(dealerAccesory.dealer_accessory);
        return allAccessories;
      });
      const accessories = [];
      let accessoryPrice = 0;
      allAccessories.map((dealerAccesory) => {
        accessoryPrice += dealerAccesory.price;
        const accessory = {};
        accessory.name = dealerAccesory.name;
        accessory.price = dealerAccesory.price;
        accessories.push(accessory);
        return accessories;
      });
      if (accessories.length > 0) {
        accessories.push({ name: 'Total', price: accessoryPrice });
      }
      const vehiclePrice = proformaInvoice.vehicle_price;
      const insurances = {};
      vehiclePrice.vehicle_insurances.map((insurance) => {
        if (insurance.validity) {
          insurances[`${insurance.type}_${insurance.validity}`] = insurance.amount;
        } else {
          insurances[insurance.type] = insurance.amount;
        }
        return insurances;
      });
      /* let insuranceAmount = insurances.tp_premium_5 + insurances.compulsory_pa_cover_1;
      if (leadDetail.od_premium_validity === 1) {
        insuranceAmount += insurances.od_premium_1;
      }
      if (leadDetail.od_premium_validity === 5) {
        insuranceAmount += insurances.od_premium_5;
      }
      if (leadDetail.zero_depreciation) {
        insuranceAmount += insurances.zero_depreciation;
      } */
      const insuranceAmount = leadDetail.total_insurance_amount;
      insurances.total_premium = insuranceAmount;
      let grandTotal = 0;
      const price = [];
      price.push({ name: 'Ex - Showroom Price', price: vehiclePrice.ex_showroom_price });
      price.push({
        name: 'Road Tax & Other charges',
        price: (vehiclePrice.road_safety_tax + vehiclePrice.rto_charges),
      });
      // price.push({ name: 'Registration / Red Cross / Flag Day',
      // price: vehiclePrice.rto_charges });
      price.push({ name: 'Insurance', price: insuranceAmount });
      grandTotal = vehiclePrice.ex_showroom_price + vehiclePrice.road_safety_tax +
        vehiclePrice.rto_charges + insuranceAmount;
      const otherCharges = [];
      otherCharges.push({ name: 'Accessories', price: accessoryPrice });
      grandTotal += accessoryPrice;
      let onRoadPrice = vehiclePrice.ex_showroom_price + vehiclePrice.rto_charges +
        insuranceAmount;
      if (leadDetail.extended_warranty) {
        price.push({ name: 'Extended Warranty', price: vehiclePrice.extented_warranty });
        grandTotal += vehiclePrice.extented_warranty;
        onRoadPrice += vehiclePrice.extented_warranty;
      } else {
        price.push({ name: 'Extended Warranty', price: 0 });
      }
      proformaInvoice.proforma_invoice_other_charges.map((charges) => {
        grandTotal += charges.amount;
        otherCharges.push({ name: `${charges.name} (+)`, price: charges.amount });
        return otherCharges;
      });
      proformaInvoice.proforma_invoice_offer.map((offer) => {
        grandTotal -= offer.amount;
        otherCharges.push({ name: `${offer.name} (-)`, price: offer.amount });
        return otherCharges;
      });
      const registrationDocuments = ['Aadhaar Card', 'Driving Licence', 'LIC Policy', 'PAN Card',
        'Passport', 'Passport Size Photographs (5 Nos)', 'Voter ID / Ration Card'];
      const financialDocumentsFirst = [
        { name: 'Aadhaar Card', key: 'aadhaar_card', is_checked: false },
        { name: 'PAN card', key: 'pan_card', is_checked: false },
        { name: 'Photos', key: 'passport_size_photograph', is_checked: false },
        { name: 'Bank Statement (Last 3 months)', key: 'bank_statement', is_checked: false },
        { name: 'Cheque Leaf', key: 'cheque_leaf', is_checked: false },
        { name: 'Credit Card Statement', key: 'credit_card_statement', is_checked: false },
        { name: 'Driving Licence', key: 'driving_licence', is_checked: false },
        { name: 'EB Card', key: 'eb_card', is_checked: false },
        { name: 'Employee ID Card', key: 'employee_id_card', is_checked: false },
        { name: 'Form 16', key: 'form_16', is_checked: false },
      ];
      const financialDocumentsSecond = [
        { name: 'HR Letter', key: 'hr_letter', is_checked: false },
        { name: 'IT Returns - Latest', key: 'it_returns_latest', is_checked: false },
        { name: 'LIC Policy', key: 'lic_policy', is_checked: false },
        { name: 'Passport', key: 'passport', is_checked: false },
        { name: 'Ration Card', key: 'ration_card', is_checked: false },
        { name: 'Rental Agreement', key: 'rental_agreement', is_checked: false },
        { name: 'Salary Slip', key: 'salary_slip', is_checked: false },
        { name: 'Utility Bills', key: 'utility_bills', is_checked: false },
        { name: 'Voter ID', key: 'voter_id', is_checked: false },
      ];
      const salesExecitive = await app.Users.findById(lead.assigned_to);
      const exchangeVehicle = await app.ExchangeVehicle.findOne({
        where: { proforma_invoice_id: proformaInvoice.id, lead_id: lead.id, status: 'Active' },
      });
      if (exchangeVehicle && exchangeVehicle.quoted_value) {
        grandTotal -= exchangeVehicle.quoted_value;
      }
      let financier = await app.FinancierLead.findOne({
        where: { lead_id: lead.id, lead_detail_id: leadDetail.id, status: { lte: 521 } },
        include: 'financier',
      });
      if (financier) {
        financier = financier.toJSON();
        financialDocumentsFirst.map((doc, i) => {
          if (lodash.includes(financier.documents, doc.key)) {
            financialDocumentsFirst[i].is_checked = true;
          }
          return doc;
        });
        financialDocumentsSecond.map((doc, i) => {
          if (lodash.includes(financier.documents, doc.key)) {
            financialDocumentsSecond[i].is_checked = true;
          }
          return doc;
        });
      }

      const invoice = dot.process({ path: (`${__dirname}/../views`) });
      this.output = invoice.proforma_invoice({
        date,
        manufacturer,
        dealer,
        lead,
        vehicle,
        variant,
        color,
        proformaInvoice,
        accessories,
        price,
        onRoadPrice,
        insurances,
        otherCharges,
        grandTotal,
        registrationDocuments,
        financialDocumentsFirst,
        financialDocumentsSecond,
        salesExecitive,
        leadDetail,
        exchangeVehicle,
        financier,
      });
      if (filter.is_email) {
        vehicle.dealershipName = dealer.name;
        let brochure = {};
        if (vehicle.brochure_url) {
          brochure = await ImageProcessor.downloadPdf(vehicle);
        }
        this.sendEmail(vehicle, filter, brochure);
      }
      return callback(null, { html: this.output });
    } catch (e) {
      return callback(new InstabikeError(e));
    }
  }

  /**
   * To send vehicle brochure to the mail ID
   * @param  {String}  vehicleId
   * @param  {String}  dealerId
   * @param  {Object}  filter
   * @return {Promise} email status
   * @author Lingareddy S
   */
  async sendBrocher(vehicleId, dealerId, filter, callback) {
    try {
      const dealer = await app.Dealer.findById(dealerId);
      if (!dealer) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.DEALER.NOT_FOUND));
      }

      const vehicle = await app.Vehicle.findById(vehicleId);
      if (!vehicle) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.VEHICLE.NOT_FOUND));
      }

      let brochure = {};
      if (filter.is_email) {
        vehicle.dealershipName = dealer.name;

        if (vehicle.brochure_url) {
          brochure = await ImageProcessor.downloadPdf(vehicle);
        }
        this.sendBrocherEmail(vehicle, filter, brochure, callback);
      }

      return callback(null, { html: brochure });
    } catch (e) {
      return callback(new InstabikeError(e));
    }
  }

  /**
   * To frame email message content
   * @param  {Object}  vehicle
   * @param  {String}  dealerId
   * @author Lingareddy S
   */
  async sendBrocherEmail(vehicle, filter, brochure, callback) {
    try {
      return new Promise((resolve) => {
        const template = dot.template(constants.NOTIFICATION.BROCHER_SEND);
        const message = template(vehicle);
        const attachments = [];
        if (brochure.Filename) {
          attachments.push(brochure);
        }
        const res = ExternalServiceProviders.sendFileByEmail(
          filter.email, message, attachments,
          constants.SUBJECT.BROCHER_SEND,
        );
        return resolve(res);
      });
    } catch (e) {
      return callback(new InstabikeError(e));
    }
  }

  /**
   * Convert HTML string to PDF stream
   * Convert PFD Stream to buffer
   * Convert Buffer to base 64 string and send mail
   * @param  {Users}  user
   * @return {Promise} email status
   */
  async sendEmail(vehicle, filter, brochure) {
    return new Promise((resolve, reject) => {
      wkhtmltopdf(this.output, { pageSize: 'A4' }, async (err, stream) => {
        streamToBuffer(stream, async (error, buffer) => {
          if (error) return reject(error);
          const template = dot.template(constants.NOTIFICATION.PROFORMA_INVOICE);
          const message = template(vehicle);
          const attachments = [];
          const attachment = {};
          attachment['Content-Type'] = constants.CONTENT_TYPE.APPLICATION_PDF;
          attachment.Filename = 'proforma_invoice.pdf';
          attachment.Content = buffer.toString('base64');
          attachments.push(attachment);
          if (brochure.Filename) {
            attachments.push(brochure);
          }
          const res = await ExternalServiceProviders.sendFileByEmail(
            filter.email, message, attachments,
            constants.SUBJECT.PROFORMA_INVOICE,
          );

          return resolve(res);
        });
      });
    });
  }

  /**
   * Create proforma invoice as a HTML and convert to PDF and send mail to lead
   * @param  {String}   proformaInvoiceId
   * @param  {Object}   filter
   * @param  {Function} callback
   * @return {String} HTML string to print
   */
  async sendProformaInvoiceSMS(proformaInvoiceId, filter, callback) {
    try {
      let dealer = await app.Dealer.findById(this.dealerId);
      if (!dealer) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.DEALER.NOT_FOUND));
      }
      dealer = dealer.toJSON();
      let proformaInvoice = await app.ProformaInvoice.findById(proformaInvoiceId, {
        include: ['proforma_invoice_offer', 'proforma_invoice_other_charges', 'lead', 'lead_detail',
          {
            relation: 'vehicle_price',
            scope: { include: { relation: 'vehicle_insurances' } },
          },
          {
            relation: 'proforma_invoice_accessory',
            scope: { include: { relation: 'dealer_accessory' } },
          }],
      });
      if (!proformaInvoice) {
        throw new InstabikeError(ErrorConstants.ERROR.INVOICE.NOT_FOUND);
      }
      proformaInvoice = proformaInvoice.toJSON();
      const lead = await app.Lead.findById(proformaInvoice.lead_id);
      const leadDetail = await app.LeadDetail.findById(proformaInvoice.lead_detail_id);
      const vehicle = await app.Vehicle.findById(leadDetail.vehicle_id);
      const variant = await app.Variant.findById(leadDetail.variant_id);
      const allAccessories = await this.getManadatoryAccessories(vehicle.id);
      proformaInvoice.proforma_invoice_accessory.map((dealerAccesory) => {
        allAccessories.push(dealerAccesory.dealer_accessory);
        return allAccessories;
      });
      let accessoryPrice = 0;
      allAccessories.map((dealerAccesory) => { accessoryPrice += dealerAccesory.price; });
      const vehiclePrice = proformaInvoice.vehicle_price;
      const insurances = {};
      vehiclePrice.vehicle_insurances.map((insurance) => {
        if (insurance.validity) {
          insurances[`${insurance.type}_${insurance.validity}`] = insurance.amount;
        } else {
          insurances[insurance.type] = insurance.amount;
        }
        return insurances;
      });
      const insuranceAmount = leadDetail.total_insurance_amount;
      insurances.total_premium = insuranceAmount;
      let grandTotal = 0;
      const exShowroomPrice = vehiclePrice.ex_showroom_price;
      grandTotal = vehiclePrice.ex_showroom_price + vehiclePrice.road_safety_tax +
        vehiclePrice.rto_charges + insuranceAmount;
      grandTotal += accessoryPrice;
      if (leadDetail.extended_warranty) {
        grandTotal += vehiclePrice.extented_warranty;
      }
      proformaInvoice.proforma_invoice_other_charges.map((charges) => {
        grandTotal += charges.amount;
      });
      proformaInvoice.proforma_invoice_offer.map((offer) => {
        grandTotal -= offer.amount;
      });
      const exchangeVehicle = await app.ExchangeVehicle.findOne({
        where: { proforma_invoice_id: proformaInvoice.id, lead_id: lead.id, status: 'Active' },
      });
      if (exchangeVehicle && exchangeVehicle.quoted_value) {
        grandTotal -= exchangeVehicle.quoted_value;
      }
      const mobileTemplate = dot.template(constants.NOTIFICATION.PROFORMA_SMS);
      const mobileMsg = mobileTemplate({
        exShowroomPrice,
        grandTotal,
        rtoCharges: vehiclePrice.rto_charges,
        vehicleName: vehicle.name,
        variantName: variant.name,
      });
      const message = [{ mobile: lead.mobile_number, message: mobileMsg }];
      await ExternalServiceProviders.sendSms(message);
      return callback(null, 'SMS Sent Successfully');
    } catch (e) {
      return callback(new InstabikeError(e));
    }
  }

  /**
   * Get Roles under the module dealer
   * @param  {Function} callback
   * @return {Array} List of roles
   */
  async getRoles(callback) {
    this.roles = [];
    try {
      this.roles = await app.Roles.find({ where: { module: constants.USER_TYPE_NAMES.DEALER } });
      return callback(null, this.roles);
    } catch (e) {
      return callback(new InstabikeError(e));
    }
  }

  /**
   * Send Lead Report for give date range and email
   * @param  {Object}   filter
   * @param  {Function} callback
   * @return {Promise} - Report status
   */
  async sendLeadReport(filter, callback) {
    try {
      const leads = await this.getLeads(filter);
      const followUps = await this.getFollowUps(filter);
      if (leads.length === 0 && followUps.length === 0) {
        return callback(null, { message: 'No Leads and Followup Found' });
      }
      const leadOpts = {
        fields: ['S.No', 'Date of Visit', 'Time of Visit', 'Executive Name', 'Source of Enquiry', 'Pincode',
          'Title', 'Prospect Name', 'Mobile Number', 'Vehicle', 'Variant', 'Color', 'Status',
          'Date of Invoice', 'Lost Reason', 'Test Ride Opted', 'Test Ride Date', 'Test Ride Time',
          'Test Ride Status', 'Exchange Vehicle Opted', 'Vehicle Make', 'Vehicle Model', 'Year of Manufacturer',
          'Exchange Value', 'finance_opted', 'financier_name', 'loan_amount', 'tenure', 'Follow-up Scheduled',
          'Follow_up_date', 'Follow_up_time', 'Comments'],
      };
      const followUpOpts = {
        fields: ['S.No', 'Date of Followup', 'Completed on Date', 'Followup Completed', 'Date of Creation',
          'Time of Creation', 'Name of DSE', 'Source of Enquiry', 'Pincode', 'Title of theProspect',
          'Name of the Prospect', 'Mobile Number', 'Number of Enquiries', 'Product Enquired', 'Variant',
          'Color', 'Lead Status', 'Remarks', 'Next Follow-up Scheduled', 'Date of Next Follow-up',
          'Time of Next Follow-up', 'No of follow-up done'],
      };
      const leadCSV = json2csv(leads, leadOpts);
      const leadEncoded = base64.encode(leadCSV);
      const template = dot.template(constants.NOTIFICATION.DEALER_INSTANT_REPORT);
      const notification = {};
      notification.date = `${moment(filter.from).add(330, 'm').format('DD-MMM-YYYY')} `;
      notification.from = `${moment(filter.from).add(330, 'm').format('h:mm')}` +
        `${moment(filter.from).add(330, 'm').format('a')}`;
      notification.till = `${moment(filter.to).add(330, 'm').format('DD-MMM-YYYY')} `;
      notification.to = `${moment(filter.to).add(330, 'm').format('h:mm')}` +
        `${moment(filter.to).add(330, 'm').format('a')}`;
      const message = template(notification);
      const attachments = [];
      const leadAttachment = {};
      leadAttachment.ContentType = constants.CONTENT_TYPE.TEXT_PLAIN;
      leadAttachment.Filename = 'Leads-Report.csv';
      leadAttachment.Base64Content = leadEncoded;
      attachments.push(leadAttachment);
      const followUpCSV = json2csv(followUps, followUpOpts);
      const followUpEncoded = base64.encode(followUpCSV);
      const followUpAttachment = {};
      followUpAttachment.ContentType = constants.CONTENT_TYPE.TEXT_PLAIN;
      followUpAttachment.Filename = 'Follow-Up-Report.csv';
      followUpAttachment.Base64Content = followUpEncoded;
      attachments.push(followUpAttachment);
      await ExternalServiceProviders.sendReportByEmail(
        filter.email, message, attachments,
        constants.SUBJECT.DEALER_INSTANT_REPORT,
      );
      return callback(null, { message: 'Report Sent' });
    } catch (e) {
      return callback(new InstabikeError(e));
    }
  }

  /**
   * Get Leads between the date range under the dealer
   * @param  {Object}  filter
   * @return {Promise} list of leads
   */
  async getLeads(filter) {
    const from = moment(filter.from).utc();
    const to = moment(filter.to).utc();
    const query = reportQueries.LEAD_REPORT_QUERY;
    const params = [this.dealerId, from, to];
    const leads = await new Promise((resolve, reject) => {
      postgresDs.query(query, params, (err, res) => {
        if (err) {
          reject(new InstabikeError(err));
        }
        return resolve(res);
      });
    });
    return leads;
  }

  /**
   * Get followUps between the date range under the dealer
   * @param  {Object}  filter
   * @return {Promise} list of followUps
   */
  async getFollowUps(filter) {
    const from = moment(filter.from).utc();
    const to = moment(filter.to).utc();
    const query = reportQueries.FOLLOWUP_REPORT_QUERY;
    const params = [this.dealerId, from, to];
    const leads = await new Promise((resolve, reject) => {
      postgresDs.query(query, params, (err, res) => {
        if (err) {
          reject(new InstabikeError(err));
        }
        return resolve(res);
      });
    });
    return leads;
  }

  /**
   * Update Password with old password verification
   * @param  {String}   userId
   * @param  {Object}   credentials - new and old password
   * @param  {Function} callback
   * @return {Users}
   * @author Ponnuvel G
   */
  async updatePassword(userId, value, callback) {
    try {
      const { key } = value;
      const dealer = await app.Dealer.findById(this.dealerId);
      if (!dealer) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.DEALER.NOT_FOUND));
      }
      let user = await app.Users.findById(userId);
      if (!user) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.USER.INVALID));
      }
      const credentials = JSON.parse(Buffer.from(key, 'base64').toString('ascii'));
      if (credentials.oldPassword === credentials.newPassword) {
        throw new InstabikeError(ErrorConstants.ERRORS.USER.SAME_PASSWORD);
      }
      const isMatch = await user.hasPassword(credentials.oldPassword);
      if (!isMatch) {
        throw new InstabikeError(ErrorConstants.ERRORS.USER.INVALID_PASSWORD);
      }
      user.password = credentials.newPassword;
      user = await app.Users.upsert(user);
      const accessToken = await app.AccessToken.create({ userId: user.id, ttl: 1800 });
      return callback(null, { accessToken });
    } catch (e) {
      return callback(new InstabikeError(e));
    }
  }

  /**
   * Validate if the vehicle details already exists or not
   * @param {Vehicle} vehicle
   * @param {Users} currentUser
   * @param {Function} callback
   */
  async validateDealerVehicle(vehicle, currentUser, callback) {
    try {
      if (this.dealerId !== currentUser.user_type_id) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.USER.TRY_AGAIN));
      }
      const existingVehicle = await app.DealerVehicle.find({
        where: {
          dealer_id: vehicle.dealer_id,
          vehicle_id: vehicle.vehicle_id,
        },
      });
      if (existingVehicle.length && !vehicle.id) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.VEHICLE.ALREADY_EXISTS));
      }
      return callback();
    } catch (e) {
      return callback(new InstabikeError(e));
    }
  }

  /**
   * Get vehicle properties based dealer manufacturer
   * Its used for Vehicle comparision
   * @param {Function} callback
   * @returns {List} CompareVehicleLookup
   * @author Ponnuvel G
   */
  async getVehicleProperties(callback) {
    if (this.dealerId !== this.currentUser.user_type_id) {
      return callback(new InstabikeError(ErrorConstants.ERRORS.USER.TRY_AGAIN));
    }
    const dealer = await app.Dealer.findById(this.dealerId);
    if (!dealer) {
      return callback(new InstabikeError(ErrorConstants.ERRORS.DEALER.NOT_FOUND));
    }
    const properties = await app.CompareVehicleLookup.find({
      where: { manufacturer_id: dealer.manufacturer_id },
      order: 'group_order asc',
    });
    return callback(null, properties);
  }
};
