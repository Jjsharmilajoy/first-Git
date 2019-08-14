const CustomerService = require('../services/customer_service');
const FinancierService = require('../services/financier_service');
const GeoUtils = require('../utils/geoUtils');
const AuditUtil = require('../utils/audit-utils');

module.exports = (User) => {
  const user = User;

  user.on('dataSourceAttached', () => {
    delete user.validations.email;
  });

  /**
   * Updates the log field values
   * @param  {Object}   ctx       database context of the model instance
   * @param  {Function} callback                                callback
   * @author Jaiyashree Subramanian
   */
  user.observe('before save', (ctx, next) => {
    const auditUtil = new AuditUtil();
    auditUtil.persistInstanceUpdatedAt('User', ctx, next);
  });

  /**
   * To find the user from the accessToken generated after login
   *
   * @param  {Context} ctx [Context object to get accessToken]
   * @param  {accessToken} accessToken [accessToken]
   * @param  {next} next
   * @return {next} next
   * @author JaiyaShree Subramanian
   */
  User.beforeRemote('logout', (context, data, next) => {
    const customerService = new CustomerService();
    customerService.beforeLogout(context, data, next);
  });

  User.beforeRemote('prototype.patchAttributes', (context, modelInstance, next) => {
    const financierService = new FinancierService();
    financierService.validateFinancierUser(context.args.data, next);
  });

  user.remoteMethod('customerMobExists', {
    description: 'To check whether a given customer mobile number already exist',
    accepts: [
      { arg: 'phone_no', type: 'string', required: true },
    ],
    http: { path: '/customers/:phone_no/exists', verb: 'get' },
    returns: { arg: 'msg', type: { exists: Boolean }, root: true },
  });

  user.customerMobExists = (phoneNo, callback) => {
    const customerService = new CustomerService();
    customerService.customerMobExists(phoneNo, callback);
  };

  user.remoteMethod('getCityByIp', {
    description: 'To get city based on requested system IP',
    accepts: [
      { arg: 'ctx', type: 'geo_locations', http: { source: 'context' } },
    ],
    http: { path: '/customers/getCityByIp', verb: 'get' },
    returns: { arg: 'msg', type: 'object', root: true },
  });

  // For getting the City based on the User Ip
  user.getCityByIp = (ctx, callback) => {
    GeoUtils.getCityByIp(ctx.req.connection.remoteAddress, callback);
  };

  user.remoteMethod('geoFencingByPincode', {
    description: 'To get geo-fencing based Pincode',
    accepts: [
      { arg: 'pin_code', type: 'string', required: true },
    ],
    http: { path: '/customers/:pin_code/getDealersByGeoFencing', verb: 'get' },
    returns: { arg: 'geo', type: 'object', root: true },
  });

  // Getting the lat and lng based on geo fencing radius
  user.geoFencingByPincode = (pinCode, callback) => {
    GeoUtils.getGeoPointsByPincode(pinCode, (err, data) => {
      if (err) {
        callback(err);
      }
      // getting the dealers based on 5 kms radius via the latitude and longitude
      const customerService = new CustomerService();
      customerService.getDealersByLatLng(data, callback);
    });
  };

  user.remoteMethod('createCustomer', {
    description: 'To create a new customer',
    accepts: [
      {
        arg: 'newUser', type: 'Users', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/register', verb: 'post' },
    returns: { arg: 'msg', type: 'Users', root: true },
  });

  user.createCustomer = (newUser, callback) => {
    const customerService = new CustomerService();
    customerService.createCustomer(newUser, callback);
  };

  user.remoteMethod('updateCustomer', {
    description: 'To update a customer detail based on ID',
    accepts: [
      { arg: 'userId', type: 'string', required: true },
      {
        arg: 'userObj', type: 'Users', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:userId', verb: 'put' },
    returns: { arg: 'user', type: 'Users', root: true },
  });

  user.updateCustomer = (userId, userObj, callback) => {
    const customerService = new CustomerService(userId, userObj);
    customerService.updateCustomer(callback);
  };

  user.remoteMethod('updatePassword', {
    description: 'To update customer password',
    accepts: [
      { arg: 'context', type: 'object', http: { source: 'context' } },
      { arg: 'userId', type: 'string', required: true },
      { arg: 'newPassword', type: 'string', required: true },
    ],
    http: { path: '/:userId/resetPassword' },
    returns: { arg: 'response', type: 'Object', root: true },
  });

  user.updatePassword = (context, userId, newPassword, callback) => {
    const currentUser = context.res.locals.user;
    const customerService = new CustomerService(userId, currentUser);
    customerService.updatePassword(newPassword, callback);
  };

  user.remoteMethod('validateAccessToken', {
    description: 'To validate access-token',
    accepts: [
      { arg: 'accessToken', type: 'string', required: true },
    ],
    http: { path: '/passwordToken/:accessToken/validate' },
    returns: { arg: 'response', type: 'Object', root: true },
  });

  user.validateAccessToken = (accessToken, callback) => {
    const financierService = new FinancierService();
    financierService.validateAccessToken(accessToken, callback);
  };

  user.remoteMethod('getUserDetail', {
    description: 'To get user details based on user-id',
    accepts: [
      { arg: 'userId', type: 'string', required: true },
    ],
    http: { path: '/:userId/detail' },
    returns: { arg: 'response', type: 'Users', root: true },
  });

  user.getUserDetail = (userId, callback) => {
    const financierService = new FinancierService();
    financierService.getUserDetail(userId, callback);
  };

  user.remoteMethod('sendOtp', {
    description: 'To send OTP to a user based on user-id',
    accepts: [
      { arg: 'userId', type: 'string', required: true },
      {
        arg: 'userObj', type: 'Object', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:userId/otp/send', verb: 'POST' },
    returns: { arg: 'response', type: 'Object', root: true },
  });

  /**
   * Send OTP
   * @param  {String}   userId
   * @param  {Function} callback
   * @return {Object} sending status message
   */
  user.sendOtp = (userId, userObj, callback) => {
    const customerService = new CustomerService(userId);
    customerService.sendOtp(userObj, callback);
  };

  user.remoteMethod('changeMobileNumberWithOTP', {
    description: 'To send OTP to currently logged-in user',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      {
        arg: 'mobileNo', type: 'Object', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/changeMobileNumber', verb: 'POST' },
    returns: { arg: 'response', type: 'Object', root: true },
  });

  /**
   * Send OTP
   * @param  {String}   userId
   * @param  {Function} callback
   * @return {Object} sending status message
   */
  user.changeMobileNumberWithOTP = (ctx, mobileNo, callback) => {
    const customerService = new CustomerService(null, ctx.res.locals.user);
    customerService.changeMobileNumberWithOTP(mobileNo, callback);
  };

  user.remoteMethod('setMobileNumberAfterValidation', {
    description: 'To validate OTP to a user based on user-id and value entered',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      {
        arg: 'pinObj', type: 'Object', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/resetMobile/validate', verb: 'POST' },
    returns: { arg: 'response', type: 'Object', root: true },
  });

  /**
   * Validate OTP
   * @param  {String}   userId
   * @param  {Object}   tokenObj
   * @param  {Function} callback
   * @return {Object} Object contains boolean, is verified or not
   */
  user.setMobileNumberAfterValidation = (ctx, pinObj, callback) => {
    const customerService = new CustomerService(null, ctx.res.locals.user);
    customerService.setMobileNumberAfterValidation(pinObj, callback);
  };

  user.remoteMethod('validateOtp', {
    description: 'To validate OTP to a user based on user-id and value entered',
    accepts: [
      { arg: 'userId', type: 'string', required: true },
      {
        arg: 'pinObj', type: 'Object', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:userId/otp/validate', verb: 'POST' },
    returns: { arg: 'response', type: 'Object', root: true },
  });

  /**
   * Validate OTP
   * @param  {String}   userId
   * @param  {Object}   tokenObj
   * @param  {Function} callback
   * @return {Object} Object contains boolean, is verified or not
   */
  user.validateOtp = (userId, pinObj, callback) => {
    const customerService = new CustomerService(userId);
    customerService.validateOtp(pinObj, callback);
  };

  user.remoteMethod('resendOtp', {
    description: 'To resend OTP to a user based on user-id ',
    accepts: [
      { arg: 'userId', type: 'string', required: true },
      {
        arg: 'pinObj', type: 'Object', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:userId/otp/resend', verb: 'POST' },
    returns: { arg: 'response', type: 'Object', root: true },
  });

  /**
   * Resend OTP
   * @param  {String}   userId
   * @param  {Object}   tokenObj
   * @param  {Function} callback
   * @return {Object}
   */
  user.resendOtp = (userId, pinObj, callback) => {
    const customerService = new CustomerService(userId);
    customerService.resendOtp(pinObj, callback);
  };

  /**
   * To send mail while update Email
   * @author Jagajeevan
   */
  user.remoteMethod('resetEmail', {
    description: 'To reset email of a current requested user based on context',
    accepts: [
      { arg: 'context', type: 'object', http: { source: 'context' } },
      {
        arg: 'email', type: 'string', required: true,
      },
      { arg: 'req', type: 'object', http: { source: 'req' } },
    ],
    http: { path: '/resetEmail', verb: 'post' },
    returns: { arg: 'response', type: 'Object', root: true },
  });

  user.resetEmail = (context, email, req, callback) => {
    const currentUser = context.res.locals.user;
    const customerService = new CustomerService(currentUser.id);
    customerService.resetEmail(req, email, callback);
  };

  /**
   * To update the user email
   * @author Jagajeevan
   */
  user.remoteMethod('updateEmail', {
    description: 'To update email of a current requested user based on context',
    accepts: [
      { arg: 'req', type: 'object', http: { source: 'req' } },
    ],
    http: { path: '/updateEmail', verb: 'GET' },
    accessScopes: ['reset-email'],
    returns: { arg: 'response', type: 'Object', root: true },
  });

  user.updateEmail = (req, callback) => {
    const customerService = new CustomerService();
    customerService.updateEmail(req.headers, callback);
  };
};
