/**
 * Base class extended by other services consisting the generic methods like:
 * login, create a new user, generate a series of month, get any user detail,
 * create a new user, update a user, send sms, validating accesstoken.
 */

// import dependencies
const lodash = require('lodash');

// import files
const loopback1 = require('../server.js');
const InstabikeError = require('../error/instabike_error');
const ErrorConstants = require('../utils/constants/error_constants');
const constants = require('../utils/constants/userConstants');
const ExternalServiceProviders = require('../utils/external_services_providers');
const DateUtils = require('../utils/date_utils');

const postgresDsConnector = loopback1.dataSources.postgres.connector;
const app = loopback1.dataSources.postgres.models;

/**
 * @author Ramanavel Selvaraju
 */
module.exports = class BaseService {
  constructor(currentUser) {
    this.currentUser = currentUser;
  }
  registerChild(child) {
    this.child = child;
  }

  /**
   * To persist a new user and associate with corresponding role
   * by finding id of the given role by name, and creating a new user if
   * not exist and associate to the role.
   *
   * @param  {string}  roleName                role name to sign-up as
   * @param  {object}  newUser                   new user data to save
   * @return {object}  user                               users object
   * @author Jaiyashree Subramanian
   */
  async createUser(roleName, newUser) {
    this.roleName = roleName;
    this.newUser = newUser;
    if (this.newUser.email) {
      this.newUser.email = this.newUser.email.toLowerCase();
    }
    try {
      this.role = await app.Roles.findOne({ where: { name: this.roleName } });
      if (!this.role) {
        throw new InstabikeError(ErrorConstants.ERRORS.ROLE.NOT_FOUND);
      }
      await this.validateSplCharsInUserNames(this.newUser);
      this.users = await app.Users.findOrCreate({
        where: {
          and: [
            { mobile_no: this.newUser.mobile_no }, { user_type_name: this.newUser.user_type_name },
          ],
        },
      }, this.newUser);
      await app.UserRole.findOrCreate(
        { where: { and: [{ user_id: this.users[0].id }, { role_id: this.role.id }] } },
        {
          user_id: this.users[0].id,
          role_id: this.role.id,
          principalType: 'USER',
          principalId: this.users[0].id,
        },
      );
      return this.users[0];
    } catch (error) {
      throw (new InstabikeError(error));
    }
  }

  /**
   * Login as a user
   * Validate user, user password and role
   * After successful validation, retrun accesstoken
   *
   * @return {object} accessToken
   * @author Jaiyashree Subramanian
   */
  async login(userType) {
    try {
      const credentials = JSON.parse(Buffer.from(this.credentials.key, 'base64').toString('ascii'));
      const condition = [{ is_active: true }, { user_type_name: userType }];
      if (credentials.mobile_no) {
        condition.push({ mobile_no: credentials.mobile_no });
      } else {
        condition.push({ email: credentials.email.toLowerCase() });
      }
      const users = await app.Users.find({
        where: { and: condition },
        include: {
          relation: 'user_role',
          scope: {
            fields: ['role_id'],
            include: { relation: 'role', scope: { fields: ['name'] } },
          },
        },
      });
      if (!users || !users.length) {
        throw new InstabikeError(ErrorConstants.ERRORS.USER.INVALID);
      }
      if (users.length > 1) {
        throw new InstabikeError(ErrorConstants.ERRORS.USER.MULTPLE_USERS_FOUND);
      }
      [this.user] = users;
      const isMatch = await this.user.hasPassword(credentials.password);
      if (!isMatch) {
        throw new InstabikeError(ErrorConstants.ERRORS.USER.INVALID);
      }
      if (!lodash.includes(this.roles, this.user.toJSON().user_role[0].role.name)) {
        throw new InstabikeError(ErrorConstants.ERRORS.USER.UNAUTHORIZED);
      }
      if (userType === constants.USER_TYPE_NAMES.DEALER) {
        let tokens = await this.getAccessTokens();
        if (tokens.length && !credentials.force_login) {
          throw new InstabikeError(ErrorConstants.ERRORS.USER.SESSION_EXIST);
        }
        if (credentials.force_login) {
          await Promise.all(tokens.map(async token => {
            await app.AccessToken.destroyAll({ accesstoken_id: token.id });
            await app.AccessToken.destroyById(token.id);
          }));
        }
      }
      const accessToken = await app.AccessToken.create({ userId: this.user.id, ttl: 1800 });
      const documentToken = await app.AccessToken.create({
        userId: this.user.id,
        ttl: 1800,
        accesstoken_id: accessToken.id,
        scopes: '["download"]',
      });
      return { accessToken, documentToken, user: this.user };
    } catch (error) {
      throw new InstabikeError(error);
    }
  }

  /**
   * get the tokens whose session exists
   *
   * @return {array} accessTokens
   * @author Pavithra Sivasubramanian
   */
  async getAccessTokens() {
    const params = [this.user.id];
    let query = `select * from accesstoken at where userid = $1 and 
      (SELECT extract(epoch from (NOW() - at.created )) < at.ttl);`;
    let result = await new Promise((resolve, reject) => {
      postgresDsConnector.query(query, params, (err, res) => {
        if (err) reject(new InstabikeError(err));
        return resolve(res);
      });
    });
    return result;
  }

  /**
   * update the user data based on the user id.
   *
   * @param  {string}  userId user id
   * @param  {object}  roleName role name to be updated
   * @return {object}  user users object
   * @author Jagajeevan
   */
  async updateUser() {
    try {
      const userExist = await app.Users.findOne({ where: { id: this.user.id } });
      if (!userExist) {
        throw new InstabikeError(ErrorConstants.ERRORS.USER.NOT_EXIST);
      }
      this.user.is_new = false;
      await this.validateSplCharsInUserNames(this.newUser);
      return await app.Users.upsert(this.user);
    } catch (error) {
      throw (new InstabikeError(error));
    }
  }

  /**
   * create lead using lead object
   * @param  {object}  lead
   * @param  {string}  leadType
   * @return {object}  lead
   * @author shahul hameed b
   */
  async createLead(lead) {
    this.lead = lead;
    try {
      const userObj = await app.Users.findOne({ where: { id: this.lead.user_id } });
      if (!userObj) {
        throw new InstabikeError(ErrorConstants.ERRORS.USER.NOT_EXIST);
      } else {
        const leadObj = await app.Lead.create(this.lead);
        return leadObj;
      }
    } catch (error) {
      throw new InstabikeError(error);
    }
  }

  /**
   * Get the dealer user id based on heirarchy
   * @param  {string} purpose
   * @return {array}  dealerUserIds
   * @author Ramanavel Selvaraju
   */
  getDealerUserIds(purpose) {
    return new Promise(async (resolve, reject) => {
      try {
        let condition;
        const resultArray = [];
        const currentMonthDates = DateUtils.getCurrentMonthDates(new Date());
        const fromDate = new Date(currentMonthDates.from_date);
        const toDate = new Date(currentMonthDates.to_date);
        toDate.setDate(toDate.getDate() + 1);
        this.dealerId = this.dealerId ? this.dealerId : this.currentUser.user_type_id;
        if (this.verifyRole('DEALER_MANAGER')) {
          condition = [{ user_type_id: this.dealerId }, {
            or: [{ is_active: true }, {
              and: [{ is_active: false }, {
                updated_at: { between: [fromDate, toDate] },
              }],
            }],
          }];
          (purpose === 'Target') && condition.push({ manager_id: { neq: null } });
        } else if (this.verifyRole('DEALER_TEAM_HEAD')) {
          condition = [{ user_type_id: this.dealerId }, { manager_id: this.currentUser.id },
            { is_active: true }];
          resultArray.push(this.currentUser.id);
        } else if (this.verifyRole('DEALER_SALES')) {
          resolve([this.currentUser.id]);
        } else {
          reject(new InstabikeError(ErrorConstants.ERRORS.COMMMON.AUTHORIZATION_REQUIRED));
        }
        const dealerUsers = await app.Users.find({
          where: { and: condition }, fields: { id: true },
        });
        const dealerUserIds = lodash.map(dealerUsers, 'id');
        resolve(lodash.concat(resultArray, lodash.map(dealerUserIds)));
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Get all the user ids in the reporting-to heirarchy
   * @param {userId} string     user-id
   * @return {array}  userIds
   * @author Jaiyashree Subramanian
   */
  getDealerReportingIds(userId, userTypeId, userTypeName) {
    this.userId = userId;
    let dealerUserIds = [userId];
    return new Promise(async (resolve, reject) => {
      try {
        let resultArray = [];
        let users = [];
        let managerIds = [];
        const user = await app.Users.findById(userId);
        managerIds.push(user.manager_id);
        if (user.manager_id) {
          resultArray.push(user);
          for (let i = 0; i < 10; i += 1) {
            users = await app.Users.find({
              where: {
                user_type_id: userTypeId,
                user_type_name: userTypeName,
                id: { inq: managerIds },
              },
            });
            if (!users.length) {
              break;
            } else {
              i = 0;
              managerIds = lodash.map(lodash.reject(users, ['manager_id', null]), 'manager_id');
            }
            resultArray = resultArray.concat(users);
          }
          dealerUserIds = lodash.map(resultArray, 'id');
        }
        resolve(dealerUserIds);
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
  * To check the current user role.
   * @param  {string} RoleName
   * @return {boolean}
   * @author Ramanavel Selvaraju
   */
  verifyRole(roleName) {
    const userRoles = this.currentUser.user_role();
    const matchedRoles = userRoles.filter(userRole => userRole.role().name === roleName);
    return matchedRoles.length > 0;
  }

  /**
   * Save Lead Activity
   * @param  {Lead}  newLead Lead to be update
   * @param  {Lead}  existingLead Existing lead
   * @param  {string}  doneBy Activity done by
   * @param  {string}  type Type of activity
   * @param  {string}  comment
   * @return {LeadActivity}
   * @author Ponnuvel G
   */
  async saveActivity(newLead, existingLead, doneBy, type, comment, financierId, leadDetailId) {
    try {
      this.leadActivity = {};
      this.leadActivity.lead_id = newLead.id;
      this.leadActivity.type = type;
      this.leadActivity.done_by = doneBy;
      this.leadActivity.comment = comment;
      this.leadActivity.financier_id = financierId;
      this.leadActivity.lead_detail_id = leadDetailId;
      this.assignFromAndTo(newLead, existingLead, type);
      const leadActivity = await app.LeadActivity.create(this.leadActivity);
      return leadActivity;
    } catch (e) {
      throw new InstabikeError(e);
    }
  }

  /**
   * Assign from and to for Lead Activity
   * @param  {Lead} newLead Lead to be update
   * @param  {Lead} existingLead Existing lead
   * @param  {string} type Type of activity
   * @author Ponnuvel G
   */
  assignFromAndTo(newLead, existingLead, type) {
    switch (type) {
      case constants.ACTIVITY.LEAD_CREATED:
        this.leadActivity.move_to = newLead.category;
        break;
      case constants.ACTIVITY.CHANGE_CATEGORY:
        this.leadActivity.move_from = existingLead.category;
        this.leadActivity.move_to = newLead.category;
        break;
      case constants.ACTIVITY.LEAD_TRANSFERED:
        this.leadActivity.move_from = existingLead.assigned_to;
        this.leadActivity.move_to = newLead.assigned_to;
        break;
      case constants.ACTIVITY.FOLLOWUP_DONE:
      case constants.ACTIVITY.COMMENTS_ADDED:
      case constants.ACTIVITY.FOLLOWUP_SCHEDULED:
      case constants.ACTIVITY.LOST:
      case constants.ACTIVITY.INVOICED:
      case constants.ACTIVITY.TEST_RIDE_SCHEDULED:
      case constants.ACTIVITY.TEST_RIDE_RESCHEDULED:
      case constants.ACTIVITY.TEST_RIDE_STARTED:
      case constants.ACTIVITY.TEST_RIDE_COMPLETED:
      case constants.ACTIVITY.TEST_RIDE_CANCELLED:
      case constants.ACTIVITY.VEHICLE_BOOKED:
        this.leadActivity.move_to = newLead.category;
        break;
      case constants.ACTIVITY.FINANCE_SELECTED:
      case constants.ACTIVITY.FINANCE_LEAD_LOST:
        this.leadActivity.move_from = newLead.assigned_to;
        this.leadActivity.move_to = existingLead.assigned_to;
        break;
      case constants.ACTIVITY.FINANCE_APPROVED:
        this.leadActivity.move_to = existingLead.assigned_to;
        break;
      default:
        break;
    }
  }

  /**
   * To check if a accessToken to reset password is valid or expired
   *
   * @param  {string} accessToken    accessToken to check
   * @return {function} callback                 callback
   * @author Jaiyashree Subramanian
   */
  async validateAccessToken(accessToken, callback) {
    this.accessToken = accessToken;
    try {
      const accessTokenObj = await app.AccessToken.findById(accessToken);
      if (!accessTokenObj) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.TOKEN.NOT_FOUND));
      }
      const elapsedSeconds = (Date.now() - accessTokenObj.created.getTime()) / 1000;
      return callback(null, { isValid: elapsedSeconds < accessTokenObj.ttl });
    } catch (e) {
      return callback(new InstabikeError(e));
    }
  }

  /**
   * To check and return user-data with designation(role) associated
   *
   * @param  {string} userId                      user-id
   * @return {function} callback                 callback
   * @author Jaiyashree Subramanian
   */
  async getUserDetail(userId, callback) {
    this.userId = userId;
    try {
      const users = await app.Users.find({
        where: { id: this.userId },
        include: [
          'manager', {
            relation: 'user_role',
            scope: {
              fields: ['role_id'],
              include: { relation: 'role', scope: { fields: ['name'] } },
            },
          },
        ],
      });
      if (!users || !users.length) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.USER.NOT_EXIST));
      }
      return callback(null, { user: users[0] });
    } catch (e) {
      return callback(new InstabikeError(e));
    }
  }

  /**
   * Get the financier user id based on heirarchy
   * @param  {string} purpose
   * @return {array}  financierUserIds
   * @author Jagajeevan
   */
  getFinancierUserIds() {
    return new Promise(async (resolve, reject) => {
      try {
        let condition;
        const resultArray = [];
        this.financierId = this.financierId ? this.financierId : this.currentUser.user_type_id;
        if (this.verifyRole('FINANCIER_CITY_HEAD')) {
          condition = [{ user_type_id: this.financierId }, { is_active: true }];
        } else if (this.verifyRole('FINANCIER_TEAM_HEAD')) {
          condition = [{ user_type_id: this.financierId }, { manager_id: this.currentUser.id },
            { is_active: true }];
          resultArray.push(this.currentUser.id);
        } else if (this.verifyRole('FINANCIER_SALES')) {
          resolve([this.currentUser.id]);
        } else {
          reject(new InstabikeError(ErrorConstants.ERRORS.COMMMON.AUTHORIZATION_REQUIRED));
        }
        const financierUsers = await app.Users.find({
          where: { and: condition }, fields: { id: true },
        });
        const financierIds = lodash.map(financierUsers, 'id');
        resolve(lodash.concat(resultArray, lodash.map(financierIds)));
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Save Financier Lead Activity
   * @param  {Lead}  newLead Lead to be update
   * @param  {Lead}  existingLead Existing lead
   * @param  {string}  doneBy Activity done by
   * @param  {string}  type Type of activity
   * @param  {string}  comment
   * @return {LeadActivity}
   * @author Jagajeevan
   */
  async saveFinancierActivity(newLead, existingLead, doneBy, type, comment, logType) {
    try {
      this.leadActivity = {};
      this.leadActivity.financier_lead_id = newLead.id;
      this.leadActivity.done_by = doneBy;
      this.leadActivity.comment = comment;
      if (logType) {
        switch (existingLead.status) {
          case constants.FINANCIER_LEAD_STATUS.ACTIVE:
            this.leadActivity.move_from = constants.ACTIVITY.ACTIVE;
            break;
          case constants.FINANCIER_LEAD_STATUS.DISBURSEMENT_PENDING:
            this.leadActivity.move_from = constants.ACTIVITY.DISBURSEMENT_PENDING;
            break;
          case constants.FINANCIER_LEAD_STATUS.CONVERSION:
            this.leadActivity.move_from = constants.ACTIVITY.CONVERSION;
            break;
          case constants.FINANCIER_LEAD_STATUS.LOST:
            this.leadActivity.move_from = constants.ACTIVITY.LOST;
            break;
          default:
            break;
        }
        this.leadActivity.type = logType;
        this.leadActivity.move_to = type;
      } else {
        if (type === constants.ACTIVITY.LEAD_ASSIGNED ||
          type === constants.ACTIVITY.LEAD_TRANSFERED) {
          this.leadActivity.move_to = newLead.assigned_to;
        }
        this.leadActivity.type = type;
      }
      const leadActivity = await app.LeadActivity.create(this.leadActivity);
      return leadActivity;
    } catch (e) {
      throw new InstabikeError(e);
    }
  }

  /**
   * To check and delete all document tokens belonging-to a accessToken before
   * being logged out
   *
   * @param  {object} context                            http-context
   * @param  {object} data                                       data
   * @param {function} callback                              callback
   * @return {function} callback                             callback
   * @author Jaiyashree Subramanian
   */
  async beforeLogout(context, data, callback) {
    this.data = data;
    try {
      await app.AccessToken.destroyAll({
        accesstoken_id: context.req.accessToken.id,
      });
      return callback(null, context, data);
    } catch (e) {
      return callback(new InstabikeError(e));
    }
  }

  /**
   * Send Notification
   * @param  {Array}  messages
   * @return {Object}
   */
  async send(messages) {
    this.messages = messages;
    try {
      const response = await ExternalServiceProviders.sendSms(messages);
      return response;
    } catch (e) {
      throw new InstabikeError(e);
    }
  }

  generateMonthSeries(inputs) {
    this.inputs = inputs;
    return `SELECT date_series,
      to_char(date_series,'Mon') as month_series, extract(year FROM date_series) as year_series
      FROM generate_series($1, $2, interval '1 month') as date_series
    `;
  }

  /* Send existing OTP if generated already but not yet validated or create new and send
   * @param  {Function} callback
   * @return {Object} sending status message
   */
  async changeMobileNumberWithOTP(mobNo, callback) {
    try {
      const mobileObj = JSON.parse(Buffer.from(mobNo.key, 'base64').toString('ascii'));
      const mobileNum = mobileObj.mobileNo;
      this.mobileNum = mobileNum || 0;
      const mobValidate = await this.mobilePhoneValidation();
      if (!mobValidate) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.VALIDATION.MOBILE_NUMBER));
      }
      const user = await app.Users.findById(this.user.id);
      if (!user) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.USER.INVALID));
      }
      if (user.mobile_no === mobileNum) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.USER.INVALID));
      }
      await user.updateAttributes({ temp_mobile_no: mobileNum });
      const response = await ExternalServiceProviders.sendOtp(mobileNum);
      return callback(null, response);
    } catch (e) {
      return callback(new InstabikeError(e));
    }
  }

  /**
   * Validate OTP and remove the validated OTP
   * @param  {Object}   token
   * @param  {Function} callback
   * @return {Object} Objcet contains boolean, is verified or not
   */
  async setMobileNumberAfterValidation(mPinObj, callback) {
    this.pinObj = mPinObj;
    try {
      const pinObj = JSON.parse(Buffer.from(mPinObj.key, 'base64').toString('ascii'));
      const response = await ExternalServiceProviders.validateOtp(
        pinObj.pinId,
        pinObj.pin,
      );
      if (!response.verified) {
        return callback(null, response);
      }
      const user = await app.Users.findById(this.user.id);
      const mobileNo = user.temp_mobile_no;
      await user.updateAttributes({ mobile_no: mobileNo, temp_mobile_no: null });
      return callback(null, user);
    } catch (e) {
      return callback(new InstabikeError(e));
    }
  }

  /**
   * Validate user first name and last name
   * @param  {Object}   users
   * @return {Boolean} boolean, is verified or not
   */
  /* eslint class-methods-use-this: ["error", { "exceptMethods": [
  "validateSplCharsInUserNames"] }] */
  validateSplCharsInUserNames(user) {
    // eslint-disable-next-line
    const regex = /^([\s\.]?[a-zA-Z]+)+$/;
    if (user.first_name) {
      if (!regex.test(user.first_name)) {
        throw new InstabikeError(ErrorConstants.ERRORS.USER.NAME_SPL_CHARS);
      }
    }
    if (user.last_name) {
      if (!regex.test(user.last_name)) {
        throw new InstabikeError(ErrorConstants.ERRORS.USER.NAME_SPL_CHARS);
      }
    }
    return true;
  }

  mobilePhoneValidation() {
    if (this.mobileNum.startsWith('6') || this.mobileNum.startsWith('7') ||
      this.mobileNum.startsWith('8') || this.mobileNum.startsWith('9')) {
      if (this.mobileNum.length === 10) {
        return true;
      }
    }
    return false;
  }

  emailValidation(email) {
    this.email = email;
    if (this.email) {
      // eslint-disable-next-line
      const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (emailRegex.test(String(this.email).toLowerCase())) {
        return true;
      }
    }
    return false;
  }
};
