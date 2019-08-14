/**
 * Customer/Lead module related functions such as :
 * checking if mobile number already exist, create new customer, update a new customer,
 * update password, send otp, validate otp, update email, send credentials through email/mobile
 */

// import dependencies
const dot = require('dot');

// import files
const BaseService = require('../services/base_service');
const loopback = require('../server.js');
const constants = require('../utils/constants/userConstants');
const InstabikeError = require('../error/instabike_error');
const ErrorConstants = require('../utils/constants/error_constants');
const PasswordUtils = require('../utils/password_utils');
const ExternalServiceProviders = require('../utils/external_services_providers');
const FilterUtil = require('../utils/filter_utils');

const app = loopback.dataSources.postgres.models;

/**
 * @author Ramanavel Selvaraju
 */
/* eslint class-methods-use-this: ["error",
  { "exceptMethods": ["updateEmail"] }] */
module.exports = class CustomerService extends BaseService {
  constructor(id, user) {
    super();
    this.id = id;
    this.user = user;
  }

  /**
   * Gets the user info by mobile number and the user tyepe as "Customer"
   *
   * @param  {String}   phone_no
   * @param  {Function} callback
   * @author Ramanavel Selvaraju
   */
  async customerMobExists(phoneNo, callback) {
    this.phoneNo = phoneNo;
    const user = await app.Users.findOne({
      where: {
        user_type_name: constants.USER_TYPE_NAMES.CUSTOMER,
        mobile_no: this.phoneNo,
      },
    });
    if (!user) {
      return callback(null, { exist: false });
    }
    return callback(null, { exist: true });
  }

  /**
   * To persist a new customer and associate with corresponding role
   * by finding CUSTOMER role id, and creating a new customer if
   * not exist and associate to the role and returns
   * the accessToken of the user created.
   *
   * @param  {object} newUser               new customer data
   * @param  {function} callback                     callback
   * @return {function} callback                     callback
   * @author Jaiyashree Subramanian
   */
  async createCustomer(newUser, callback) {
    this.newUser = newUser;
    try {
      this.newUser.user_type_name = constants.USER_TYPE_NAMES.CUSTOMER;
      const ifExist = await app.Users.findOne({
        where:
        {
          and: [
            { mobile_no: this.newUser.mobile_no },
            { user_type_name: constants.USER_TYPE_NAMES.CUSTOMER },
          ],
        },
      });
      if (ifExist) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.USER.EXIST));
      }
      // todo for password creation
      this.newUser.password = this.newUser.mobile_no;
      const user = await this.createUser(await FilterUtil.getRole('customer'), this.newUser);
      const accessToken = await app.AccessToken.create({ userId: user.id, ttl: 1800 });
      return callback(null, accessToken);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * update the customer object based on the
   * userobject input.
   * @param  {string}   userId
   * @param  {object}   userObj
   * @param  {Function} callback
   * @return {Function}
   * @author shahul hameed b
   */
  async updateCustomer(callback) {
    try {
      const user = await this.updateUser();
      return callback(null, user);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * Update user password if the user login first time
   *
   * @param  {Users}   user
   * @param  {String}   password new password
   * @param  {Function} callback
   * @return {Promise}
   * @author Ponnuvel G
   */
  async updatePassword(password, callback) {
    try {
      if (!this.user) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.USER.INVALID));
      }
      if (!this.user.is_new) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.USER.NOT_NEW));
      }
      const isMatch = await this.user.hasPassword(password);
      if (isMatch) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.USER.SAME_PASSWORD));
      }
      this.user.password = password;
      this.user.is_new = false;
      const userObj = await app.Users.upsert(this.user);
      this.user = await app.Users.findOne({
        where: { id: userObj.id },
        include: {
          relation: 'user_role',
          scope: {
            fields: ['role_id'],
            include: { relation: 'role', scope: { fields: ['name'] } },
          },
        },
      });
      const accessToken = await app.AccessToken.create({ userId: this.user.id, ttl: 1800 });
      const documentToken = await app.AccessToken.create({
        userId: this.user.id,
        ttl: 1800,
        accesstoken_id: accessToken.id,
        scopes: '["download"]',
      });
      const returnObj = { accessToken, documentToken, user: this.user };
      return callback(null, returnObj);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * send credentials via mobile and email
   * service for the given user
   * @param  {function} callback
   * @return {function} success or failure message
   */
  async sendCredentials(callback) {
    try {
      const user = await app.Users.findById(this.user.id);
      if (!(this.user && this.user.mobile_no && user)) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.USER.INVALID));
      }
      const userObj = {
        name: user.first_name,
        user_name: this.user.mobile_no,
        password: PasswordUtils.generatePassword(),
      };
      const emailTemplate = dot.template(constants.NOTIFICATION.CREDENTIALS);
      const emailMsg = emailTemplate(userObj);
      const emailStatus = await ExternalServiceProviders.sendByEmail(
        this.user.email,
        emailMsg, constants.SUBJECT.CREDENTIALS,
      );
      const mobileTemplate = dot.template(constants.NOTIFICATION.PASSWORD);
      const mobileMsg = mobileTemplate(userObj);
      const message = [{ mobile: user.mobile_no, message: mobileMsg }];
      await ExternalServiceProviders.sendSms(message);
      this.user.password = userObj.password;
      this.user.is_credential_send = true;
      this.user.is_new = true;
      await app.Users.upsert(this.user);
      return callback(null, { emailStatus });
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * Send Credentials to Financier executives
   * @param  {String}   financierId
   * @param  {String}   userId
   * @param  {Function} callback
   * @return {Object}
   * @author Ponnuvel G
   */
  async sendFinancierCredentials(callback) {
    try {
      const user = await app.Users.findById(this.id);
      if (!user) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.USER.INVALID));
      }
      const userObj = {
        name: user.first_name,
        user_name: user.email,
        password: PasswordUtils.generatePassword(),
        site_url: process.env.SITE_URL,
      };
      const emailTemplate = dot.template(constants.NOTIFICATION.FIN_CREDENTIALS);
      const emailMsg = emailTemplate(userObj);
      const emailStatus = await ExternalServiceProviders.sendByEmail(
        user.email,
        emailMsg, constants.SUBJECT.CREDENTIALS,
      );
      const mobileTemplate = dot.template(constants.NOTIFICATION.PASSWORD);
      const mobileMsg = mobileTemplate(userObj);
      const message = [{ mobile: user.mobile_no, message: mobileMsg }];
      await ExternalServiceProviders.sendSms(message);
      user.password = userObj.password;
      user.is_credential_send = true;
      user.is_new = true;
      await app.Users.upsert(user);
      return callback(null, { emailStatus });
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * Send existing OTP if generated already but not yet validated or create new and send
   * @param  {Function} callback
   * @return {Object} sending status message
   */
  async sendOtp(userObj, callback) {
    try {
      const user = await app.Users.findById(this.id);
      if (!user) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.USER.INVALID));
      }
      let mobileNo = user.mobile_no;
      if (userObj.mobile_no) {
        mobileNo = userObj.mobile_no;
      }
      const response = await ExternalServiceProviders.sendOtp(mobileNo);
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
  async validateOtp(pinObj, callback) {
    this.pinObj = pinObj;
    try {
      const response = await ExternalServiceProviders.validateOtp(
        pinObj.pinId,
        pinObj.pin,
      );
      return callback(null, response);
    } catch (e) {
      return callback(new InstabikeError(e));
    }
  }

  /**
   * Resend OTP
   * @param  {Object}   pinObj
   * @param  {Function} callback
   * @return {Object} Resend Status
   */
  async resendOtp(pinObj, callback) {
    this.pinObj = pinObj;
    try {
      const response = await ExternalServiceProviders.resendOtp(pinObj.pinId);
      return callback(null, response);
    } catch (e) {
      return callback(new InstabikeError(e));
    }
  }

  /**
   * To update user with a the new email and send email
   *
   * @param  {string}   email      email of the user to send
   * @param  {string}   userType   user type name - Manufacturer
   * @param  {function} callback   callback
   * @author Jagajeevan
   */
  async resetEmail(req, email, callback) {
    try {
      const emailValidate = await this.emailValidation(email);
      if (!emailValidate) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.VALIDATION.EMAIL));
      }
      const user = await app.Users.findOne({
        where: {
          id: this.id,
        },
      });
      if (!user) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.USER.INVALID));
      }
      const isUserExist = await app.Users.findOne({
        where: {
          email,
          user_type_name: user.user_type_name,
        },
      });
      if (isUserExist) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.USER.EMAIL_ALREADY_EXIST));
      }
      await app.Users.upsertWithWhere({ id: user.id }, { temp_email: email });
      const accessToken = await app.AccessToken.create({
        userId: user.id,
        ttl: 3600,
        scopes: ['reset-email'],
        accesstoken_id: req.accessToken.id,
      });
      const url = `${process.env.SITE_URL}/reset-email?access_token=${accessToken.id}`;
      const emailTemplate = dot.template(constants.NOTIFICATION.EMAIL_RESET);
      const emailMsg = emailTemplate({ name: user.first_name, url });
      const emailStatus = await ExternalServiceProviders.sendByEmail(
        user.temp_email, emailMsg,
        constants.SUBJECT.EMAIL_RESET,
      );
      return callback(null, { message: emailStatus });
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * To update user with a the new email
   *
   * @param  {string}   accessToken
   * @param  {function} callback
   * @author Jagajeevan
   */
  async updateEmail(header, callback) {
    try {
      const accessToken = await app.AccessToken.findOne({
        where: {
          id: header.authorization,
        },
      });
      if (!accessToken) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.USER.INVALID));
      }
      const user = await app.Users.findOne({
        where: {
          id: accessToken.userId,
        },
      });
      if (!user) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.USER.INVALID));
      }
      const users = await app.Users.upsertWithWhere({ id: user.id }, { email: user.temp_email });
      return callback(null, { message: users });
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }
};
