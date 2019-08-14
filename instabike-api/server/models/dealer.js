const DealerService = require('../services/dealer_service');
const VehicleService = require('../services/vehicle_service');
const TestRideService = require('../services/test_ride_service');
const AuditUtil = require('../utils/audit-utils');
const InstabikeError = require('../error/instabike_error');
const ErrorConstants = require('../utils/constants/error_constants');
const DealerInventoryService = require('../services/dealer_inventory_service');
const CustomerService = require('../services/customer_service');

module.exports = (Dealer) => {
  const dealer = Dealer;
  /**
   * Updates the log field values
   * @param  {Object}   ctx       database context of the model instance
   * @param  {Function} callback                                callback
   * @author Jaiyashree Subramanian
   */
  dealer.observe('before save', (ctx, next) => {
    const auditUtil = new AuditUtil();
    auditUtil.persistInstanceUpdatedAt('Dealer', ctx, next);
  });

  dealer.remoteMethod('associateVehicle', {
    description: 'To associate vehicle to dealer using vehicle-id and dealer-id',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      { arg: 'dealerId', type: 'string', required: true },
      { arg: 'vechileId', type: 'string', required: true },
    ],
    http: { path: '/:dealerId/vehicles/:vechileId/associate', verb: 'post' },
    returns: { arg: 'msg', type: 'object', root: true },
  });

  dealer.associateVehicle = (ctx, dealerId, vechileId, callback) => {
    const dealerService = new DealerService(dealerId);
    dealerService.associateVehicle(vechileId, ctx.res.locals.user.id, callback);
  };

  dealer.remoteMethod('updateCustomer', {
    description: 'To update a customer detail using customer-id and dealer-id',
    accepts: [
      { arg: 'dealerId', type: 'string', required: true },
      { arg: 'customerId', type: 'string', required: true },
      {
        arg: 'customer', type: 'Users', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:dealerId/customer/:customerId', verb: 'put' },
    returns: { arg: 'msg', type: 'object', root: true },
  });

  dealer.updateCustomer = (dealerId, customerId, customer, callback) => {
    const dealerService = new DealerService(dealerId);
    dealerService.updateCustomer(customerId, customer, callback);
  };

  dealer.remoteMethod('createLead', {
    description: 'To create a new lead for dealer using dealer-id',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      { arg: 'dealerId', type: 'string', required: true },
      {
        arg: 'lead', type: 'Lead', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:dealerId/lead/create', verb: 'post' },
    returns: { arg: 'msg', type: 'Lead', root: true },
  });

  dealer.createLead = (ctx, dealerId, lead, callback) => {
    const dealerService = new DealerService(dealerId);
    dealerService.createNewLead(lead, ctx.res.locals.user, callback);
  };

  /**
   * Hook method to check the dealer manager belongs to the dealer
   * @param  {object}   context
   * @param  {object}   modelInstance
   * @param  {Function} next
   * @author Ponnuvel G
   */
  dealer.beforeRemote('getLeadDetails', (context, modelInstance, next) => {
    if (context.args.dealerId === context.res.locals.user.user_type_id) {
      next();
    } else {
      next(new InstabikeError(ErrorConstants.ERRORS.USER.TRY_AGAIN));
    }
  });

  /**
   * Hook method to check the dealer manager belongs to the dealer
   * @param  {object}   context
   * @param  {object}   modelInstance
   * @param  {Function} next
   * @author Ponnuvel G
   */
  dealer.beforeRemote('updateLead', (context, modelInstance, next) => {
    if (context.args.dealerId === context.res.locals.user.user_type_id) {
      next();
    } else {
      next(new InstabikeError(ErrorConstants.ERRORS.USER.TRY_AGAIN));
    }
  });

  dealer.remoteMethod('allSalesMember', {
    description: 'To get all sales members of a specific dealer using dealer-id',
    accepts: [
      { arg: 'dealerId', type: 'string', required: true },
    ],
    http: { path: '/:dealerId/allMembers', verb: 'get' },
    returns: { arg: 'msg', type: 'object', root: true },
  });

  dealer.allSalesMember = (dealerId, callback) => {
    const dealerService = new DealerService(dealerId);
    dealerService.getAllSalesMember(callback);
  };

  dealer.remoteMethod('createSalesMember', {
    description: 'To create a sales members for specific dealer using dealer-id',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      { arg: 'dealerId', type: 'string', required: true },
      {
        arg: 'dealerSales', type: 'Users', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:dealerId/salesMember/create', verb: 'post' },
    returns: { arg: 'msg', type: 'object', root: true },
  });

  dealer.createSalesMember = (ctx, dealerId, dealerSales, callback) => {
    const dealerService = new DealerService(dealerId);
    dealerService.createSales(dealerSales, 'dealer_sales', ctx.res.locals.user, callback);
  };

  dealer.remoteMethod('createSalesMemberHead', {
    description: 'To create a sales-member-head for specific dealer using dealer-id',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      { arg: 'dealerId', type: 'string', required: true },
      {
        arg: 'dealerSales', type: 'Users', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:dealerId/salesMemberHead/create', verb: 'post' },
    returns: { arg: 'msg', type: 'object', root: true },
  });

  dealer.createSalesMemberHead = (ctx, dealerId, dealerSales, callback) => {
    const dealerService = new DealerService(dealerId);
    dealerService.createSales(dealerSales, 'dealer_team_head', ctx.res.locals.user, callback);
  };

  dealer.remoteMethod('getSalesMemberById', {
    description: 'To create a sales-member using user-id',
    accepts: [
      { arg: 'userId', type: 'string', required: true },
    ],
    http: { path: '/:userId/salesMember/get', verb: 'get' },
    returns: { arg: 'msg', type: 'object', root: true },
  });

  dealer.getSalesMemberById = (userId, callback) => {
    const dealerService = new DealerService();
    dealerService.getSalesMemberById(userId, callback);
  };

  dealer.remoteMethod('updateSalesMember', {
    description: 'To update a sales-member using user-id',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      { arg: 'userId', type: 'string', required: true },
      {
        arg: 'dealer_sales', type: 'Users', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:userId/salesMember/update', verb: 'put' },
    returns: { arg: 'msg', type: 'object', root: true },
  });

  dealer.updateSalesMember = (ctx, userId, dealerSales, callback) => {
    const dealerService = new DealerService();
    dealerService.updateSalesMember(
      userId, dealerSales, 'dealer_sales',
      ctx.res.locals.user, callback,
    );
  };

  dealer.remoteMethod('updateSalesMemberHead', {
    description: 'To update a sales-member-head using user-id',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      { arg: 'userId', type: 'string', required: true },
      {
        arg: 'dealer_sales', type: 'Users', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:userId/salesMemberHead/update', verb: 'put' },
    returns: { arg: 'msg', type: 'object', root: true },
  });

  dealer.updateSalesMemberHead = (ctx, userId, dealerSales, callback) => {
    const dealerService = new DealerService();
    dealerService.updateSalesMemberHead(
      userId, dealerSales, 'dealer_team_head',
      ctx.res.locals.user, callback,
    );
  };

  dealer.remoteMethod('deleteSalesMember', {
    description: 'To delete a sales-member using user-id',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      { arg: 'userId', type: 'string', required: true },
    ],
    http: { path: '/:userId/salesMember/delete', verb: 'del' },
    returns: { arg: 'msg', type: 'object', root: true },
  });

  dealer.deleteSalesMember = (ctx, userId, callback) => {
    const dealerService = new DealerService();
    dealerService.deleteSalesMember(userId, ctx.res.locals.user, callback);
  };

  dealer.remoteMethod('showAllAccessories', {
    description: 'To get all accessories of a dealer with filter-conditions using dealer-id',
    accepts: [
      { arg: 'dealerId', type: 'string', required: true },
      {
        arg: 'dataFilter', type: 'object', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:dealerId/accessories/getAll', verb: 'POST' },
    returns: { arg: 'msg', type: 'object', root: true },
  });

  dealer.showAllAccessories = (dealerId, dataFilter, callback) => {
    const dealerService = new DealerService(dealerId);
    dealerService.showAllAccessories(dataFilter, callback);
  };

  dealer.remoteMethod('associateAccessories', {
    description: 'To associate accessories to a dealer using dealer-id and vehicle-id',
    accepts: [
      { arg: 'dealerId', type: 'string', required: true },
      { arg: 'vehicleId', type: 'string', required: true },
      {
        arg: 'dealerAccessories', type: ['DealerAccessory'], http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:dealerId/vehicle/:vehicleId/accessories/associate', verb: 'POST' },
    returns: { arg: 'msg', type: 'object', root: true },
  });

  dealer.associateAccessories = (dealerId, vehicleId, dealerAccessories, callback) => {
    const dealerService = new DealerService(dealerId);
    dealerService.associateAccessories(dealerAccessories, vehicleId, callback);
  };

  dealer.remoteMethod('directReportingMembers', {
    description: 'To get direct reporting members using dealer-id',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      { arg: 'dealerId', type: 'string', required: true },
    ],
    http: { path: '/:dealerId/directReportingMembers', verb: 'get' },
    returns: { arg: 'users', type: '[Users]', root: true },
  });

  /**
   * To get the list of direct reporting members
   * for dealer sales member.
   * @param  {string}   dealerId
   * @param  {function} callback
   * @return {[User]}   list of suboridinates user object
   */
  dealer.directReportingMembers = (ctx, dealerId, callback) => {
    const dealerService = new DealerService(dealerId);
    dealerService.getDirectReportingMembers(ctx.res.locals.user, callback);
  };

  dealer.remoteMethod('testRideVehicles', {
    accepts: [
      { arg: 'dealerId', type: 'string', required: true },
    ],
    description: ['Find vehicles for test ride based on {dealerId}'],
    http: { path: '/:dealerId/testRideVehicles', verb: 'get' },
    returns: { arg: 'vehicles', type: '[Vehicle]', root: true },
  });

  /**
   * get list of vehicles for test ride
   * based on dealer id
   * @param  {string}   dealerId
   * @param  {Function} callback
   * @return {[object]} list of vehicle object
   * @author shahul hameed b
   */
  dealer.testRideVehicles = (dealerId, callback) => {
    const testRideService = new TestRideService(dealerId);
    testRideService.getVehicles(callback);
  };

  dealer.remoteMethod('allSalesTeamMember', {
    description: 'To get all sales members using dealer-id',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      { arg: 'dealerId', type: 'string', required: true },
    ],
    http: { path: '/:dealerId/teamMembers', verb: 'get' },
    returns: { arg: 'users', type: '[Users]', root: true },
  });

  /**
   * get all team leads and their respective
   * suboridinates based on the dealer manager.
   * @param  {string}   dealerId
   * @param  {object}   user
   * @param  {Function} callback
   * @return {object}   object containing key as userid and
   * value as userobject with role
   */
  dealer.allSalesTeamMember = (ctx, dealerId, callback) => {
    const dealerService = new DealerService(dealerId);
    dealerService.getAllSalesTeamMember(ctx.res.locals.user, callback);
  };

  /**
   * Hook method to check the dealer manager belongs to the dealer
   * @param  {object}   context
   * @param  {object}   modelInstance
   * @param  {Function} next
   * @author Jagajeevan
   */
  dealer.beforeRemote('patchOrCreate', (context, modelInstance, next) => {
    if (context.args.data.id === context.res.locals.user.user_type_id) {
      next();
    } else {
      next(new InstabikeError(ErrorConstants.ERRORS.USER.TRY_AGAIN));
    }
  });

  dealer.remoteMethod('dealerLogin', {
    description: 'To login as a dealer user',
    accepts: [
      {
        arg: 'credentials', type: 'Object', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/login', verb: 'post' },
    returns: { arg: 'response', type: Object, root: true },
  });

  dealer.dealerLogin = (credentials, callback) => {
    const dealerService = new DealerService();
    dealerService.dealerLogin(credentials, callback);
  };

  dealer.remoteMethod('inventoryDetails', {
    description: 'To get inventory details by using dealer-id',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      { arg: 'dealerId', type: 'string', required: true },
    ],
    http: { path: '/:dealerId/inventoryDetails', verb: 'get' },
    returns: { arg: 'inventory', type: '[DealerInventoryDetail]', root: true },
  });

  /**
   * Getting the dealer inventory details based on the dealer id.
   * @param  {string}   dealerId
   * @param  {Function} callback
   * @return {object}   custom object containing the dealer inventory
   * @author Jagajeevan
   */
  dealer.inventoryDetails = (ctx, dealerId, callback) => {
    const dealerInventoryService = new DealerInventoryService(dealerId);
    dealerInventoryService.getInventoryDetails(ctx.res.locals.user, callback);
  };

  dealer.remoteMethod('getDealerFinancier', {
    description: 'To get dealer-financiers by using dealer-id',
    accepts: [
      { arg: 'dealerId', type: 'string', required: true },
    ],
    http: { path: '/:dealerId/financiers', verb: 'GET' },
    returns: {
      arg: 'financierList', type: 'Object', root: true,
    },
  });

  dealer.getDealerFinancier = (dealerId, callback) => {
    const dealerService = new DealerService(dealerId);
    dealerService.getDealerFinancier(callback);
  };

  dealer.remoteMethod('updateDealerFinancier', {
    description: 'To update dealer-financiers by using dealer-id',
    accepts: [
      { arg: 'dealerId', type: 'string', required: true },
      {
        arg: 'dealerFinanciers', type: ['DealerFinancier'], http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:dealerId/updateFinancier', verb: 'POST' },
    returns: { arg: 'response', type: 'DealerFinancier', root: true },
  });

  dealer.updateDealerFinancier = (dealerId, dealerFinanciers, callback) => {
    const dealerService = new DealerService(dealerId);
    dealerService.updateFinancier(dealerFinanciers, callback);
  };

  dealer.remoteMethod('vehicleDetail', {
    description: 'To get details of a vehicle using dealer-id, vehicle-id and variant-id',
    accepts: [
      { arg: 'dealerId', type: 'string', required: true },
      { arg: 'vehicleId', type: 'string', required: true },
      { arg: 'variantId', type: 'string', required: true },
    ],
    http: { path: '/:dealerId/vehicle/:vehicleId/variant/:variantId/vehicleDetail', verb: 'get' },
    returns: { arg: 'vehicleDetail', type: '[VehiclePrice]', root: true },
  });

  /**
   * get vehicle detail with price and color
   * information for specified dealer,vehicle
   * and variant.
   * @param  {string}   dealerId
   * @param  {string}   vehicleId
   * @param  {string}   variantId
   * @param  {function} callback
   * @return {[VehiclePrice]} vehicle price along
   * with variant and color.
   * @author shahul hameed b
   */
  dealer.vehicleDetail = (dealerId, vehicleId, variantId, callback) => {
    const vehicleService = new VehicleService(vehicleId, null, variantId);
    vehicleService.getVariantDetail(dealerId, callback);
  };

  dealer.remoteMethod('sendCredentials', {
    description: 'To send new credentials to a dealer-user',
    accepts: [
      { arg: 'dealerId', type: 'string', required: true },
      { arg: 'userId', type: 'string', required: true },
      {
        arg: 'userObj', type: 'Users', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:dealerId/user/:userId/sendCredentials', verb: 'put' },
    returns: { arg: 'msg', type: 'string', root: true },
  });

  /**
   * check whether the logged in manager user dealerId
   * and send dealerId matches. so that the manager
   * belongs to particular dealer can send credentials
   */
  dealer.beforeRemote('sendCredentials', (context, unused, next) => {
    const { dealerId } = context.args;
    if (context.res.locals.user.user_type_id !== dealerId) {
      next(new InstabikeError(ErrorConstants.ERRORS.USER.INVALID));
    }
    next();
  });

  /**
   * send credentials to the respective user using
   * mobilenumber and email
   * @param  {string}   dealerId
   * @param  {string}   userId
   * @param  {Users}   userObj
   * @param  {function} callback
   * @return {object} success or failure message
   * @author shahul hameed b
   */
  dealer.sendCredentials = (dealerId, userId, userObj, callback) => {
    const customerService = new CustomerService(userId, userObj);
    customerService.sendCredentials(callback);
  };

  /**
   * check whether the logged in manager user dealerId
   * and send dealerId matches. so that the manager
   * belongs to particular dealer can send credentials
   */
  dealer.beforeRemote('allVehicles', (context, unused, next) => {
    const { dealerId } = context.args;
    if (context.res.locals.user.user_type_id !== dealerId) {
      next(new InstabikeError(ErrorConstants.ERRORS.USER.INVALID));
    }
    next();
  });

  dealer.remoteMethod('allVehicles', {
    description: 'To get all vehicles available at a dealership using dealer-id',
    accepts: [
      { arg: 'dealerId', type: 'string', required: true },
    ],
    http: { path: '/:dealerId/allVehicles', verb: 'get' },
    returns: { arg: 'vehicle', type: '[VehicleWithPrice]', root: true },
  });

  /**
   * Getting the vehicles with its price
   * @param  {string}   dealerId
   * @param  {Function} callback
   * @return {object}   custom object containing the vehicles with price
   * @author Jagajeevan
   */
  dealer.allVehicles = (dealerId, callback) => {
    const dealerService = new DealerService(dealerId);
    dealerService.getAllVehicles(callback);
  };

  dealer.remoteMethod('updateDealerWithManager', {
    description: 'To update dealership and manager details using dealer-id and manager-id',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      { arg: 'dealerId', type: 'string', required: true },
      { arg: 'userId', type: 'string', required: true },
      {
        arg: 'dealerUser', type: 'DealerUser', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:dealerId/user/:userId/updateDealerWithManager', verb: 'put' },
    returns: { arg: 'dealerUser', type: 'DealerUser', root: true },

  });

  /**
 * Update the dealership details along
 * with dealer manager details for the particular
 * dealer manager
 * @param  {string}   dealerId
 * @param  {string}   userId
 * @param  {object}   dealerObj
 * @param  {object}   user
 * @param  {function} callback
 * @return {object}  DealerUser
 * @author shahul hameed b
 */
  dealer.updateDealerWithManager = (ctx, dealerId, userId, dealerUser, callback) => {
    const dealerService = new DealerService(dealerId);
    dealerService.updateDealerWithManager(
      dealerUser.dealer, userId, dealerUser.user,
      ctx.res.locals.user, callback,
    );
  };

  dealer.remoteMethod('variantInventoryDetail', {
    description: 'To get details of a variant using dealer-id, vehicle-id and variant-id',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      { arg: 'dealerId', type: 'string', required: true },
      { arg: 'vehicleId', type: 'string', required: true },
      { arg: 'variantId', type: 'string', required: true },
    ],
    http: { path: '/:dealerId/vehicle/:vehicleId/variant/:variantId/variantInventoryDetail', verb: 'get' },
    returns: { arg: 'vehicleDetail', type: '[DealerInventory]', root: true },
  });

  /**
   * Get inventory details for specified dealer, vehicle and variant
   * @param  {string}   dealerId
   * @param  {string}   vehicleId
   * @param  {string}   variantId
   * @param  {function} callback
   * @return {[DealerInventory]}
   * @author Jagajeevan
   */
  dealer.variantInventoryDetail = (ctx, dealerId, vehicleId, variantId, callback) => {
    const dealerInventoryService = new DealerInventoryService(dealerId);
    dealerInventoryService.getVariantInventoryDetail(
      ctx.res.locals.user, vehicleId,
      variantId, callback,
    );
  };

  dealer.remoteMethod('getDetails', {
    description: 'To get details of a dealer using dealer-id',
    accepts: [
      { arg: 'dealerId', type: 'string', required: true },
    ],
    http: { path: '/:dealerId/details', verb: 'get' },
    returns: { arg: 'dealer', type: 'Dealer', root: true },
  });

  /**
   * Get the details of the dealer by dealer id.
   *
   * @param  {string}   dealerId                           dealer id
   * @param  {Function} callback                           callback
   * @author Ajaykkumar Rajendran
   */
  dealer.getDetails = (dealerId, callback) => {
    const dealerService = new DealerService(dealerId);
    dealerService.getDetails(callback);
  };

  dealer.remoteMethod('getTargetByDate', {
    description: 'To get manufacturer-targets of a dealer using dealer-id for given filter',
    accepts: [
      { arg: 'dealerId', type: 'string', required: true },
      {
        arg: 'filter', type: 'ManufacturerTagetByDate', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:dealerId/targetDetail', verb: 'POST' },
    returns: { arg: 'dealer', type: 'Dealer', root: true },
  });

  /**
   * To get dealer target by dealer-id based on filter
   *
   * @param  {string} dealerId                  dealer id
   * @param  {object} filter                filter object
   * @param  {Function} callback                 callback
   * @author Jaiyashree Subramanian
   */
  dealer.getTargetByDate = (dealerId, filter, callback) => {
    const dealerService = new DealerService(dealerId);
    dealerService.getTargetByDate(filter, callback);
  };

  dealer.remoteMethod('getVehiclesKeyValue', {
    accepts: [
      { arg: 'dealerId', type: 'string', required: true },
    ],
    description: ['Get list of vehicles available in the vehicle price'],
    http: { path: '/:dealerId/vehicles/keyvalue', verb: 'GET' },
    returns: { arg: 'dealer', type: '[Vehicle]', root: true },
  });

  /**
   * Get key and value for Vehicles, Variants and Variant colors
   * @param  {string}   dealerId
   * @param  {Function} callback
   * @return {Vehicles}
   * @author Ponnuvel G
   */
  dealer.getVehiclesKeyValue = (dealerId, callback) => {
    const dealerService = new DealerService(dealerId);
    dealerService.getVehiclesKeyValue(callback);
  };

  dealer.remoteMethod('getUsersKeyValue', {
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      { arg: 'dealerId', type: 'string', required: true },
    ],
    description: ['Get list of dealer members based of role'],
    http: { path: '/:dealerId/users/keyvalue', verb: 'GET' },
    returns: { arg: 'assignees', type: '[Users]', root: true },
  });

  /**
   * Get all the members under the dealer
   * @param  {string}   dealerId
   * @param  {Function} callback
   * @return {[Users]}
   * @author Ponnuvel G
   */
  dealer.getUsersKeyValue = (ctx, dealerId, callback) => {
    const dealerService = new DealerService(dealerId);
    dealerService.getUsersKeyValue(ctx.res.locals.user, callback);
  };

  dealer.remoteMethod('salesTeamMembers', {
    description: 'To get sales team members of a given dealer-id',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      { arg: 'dealerId', type: 'string', required: true },
    ],
    http: { path: '/:dealerId/salesTeamMembers', verb: 'get' },
    returns: { arg: 'users', type: '[Users]', root: true },
  });

  /**
   * get all the sales team members.
   * @param  {string}   dealerId
   * @param  {Function} callback
   * @return {Users}   object containing userobject with role
   * @author Jagajeevan
   */
  dealer.salesTeamMembers = (ctx, dealerId, callback) => {
    const dealerService = new DealerService(dealerId);
    dealerService.getSalesTeamMembers(ctx.res.locals.user, callback);
  };

  dealer.remoteMethod('getVehiclesSummary', {
    accepts: [
      { arg: 'dealerId', type: 'string', required: true },
      {
        arg: 'filter', type: 'object', http: { source: 'body' }, required: true,
      },
    ],
    description: ['Get list of dealer members based of role'],
    http: { path: '/:dealerId/vehicles/summary', verb: 'post' },
    returns: { arg: 'summary', type: ['VehicleSummary'], root: true },
  });

  /**
   * get Vehicles Summary
   * @param  {string}   dealerId
   * @param  {object}   filter
   * @param  {Function} callback
   * @return {Array}
   * @author vishesh
   */
  dealer.getVehiclesSummary = (dealerId, filter, callback) => {
    const dealerService = new DealerService(dealerId);
    dealerService.getVehiclesSummary(filter, callback);
  };

  dealer.remoteMethod('getTeamPerformance', {
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
    ],
    description: ['Get team performance'],
    http: { path: '/:dealerId/teamPerformance', verb: 'get' },
    returns: { arg: 'summary', type: ['TeamPerformance'], root: true },
  });

  /**
   * get team performance
   * @param  {Function} callback
   * @return {Array}
   * @author vishesh
   */
  dealer.getTeamPerformance = (ctx, callback) => {
    const dealerService = new DealerService(ctx.res.locals.user.user_type_id, ctx.res.locals.user);
    dealerService.getTeamPerformance(callback);
  };

  dealer.remoteMethod('getTargetSummary', {
    description: 'Get targets summary based on dealer',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      {
        arg: 'filter', type: 'object', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:dealerId/targetSummary', verb: 'POST' },
    returns: { arg: 'dealer', type: 'object', root: true },
  });

  /**
   * To get dealer targets summary for current month based on dealer id.
   *
   * @param  {Function} callback                    callback
   * @return {Function} callback                    callback
   * @author Ajaykkumar Rajendran
   */
  dealer.getTargetSummary = (ctx, filter, callback) => {
    const dealerService = new DealerService(ctx.res.locals.user.user_type_id, ctx.res.locals.user);
    dealerService.getTargetSummary(filter, callback);
  };

  dealer.remoteMethod('getLeadsSummary', {
    description: 'Get targets summary based on dealer',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
    ],
    http: { path: '/:dealerId/leadSummary', verb: 'GET' },
    returns: { arg: 'dealer', type: 'object', root: true },
  });

  /**
   * To get leads summary for present day.
   *
   * @param  {Function} callback                    callback
   * @return {Function} callback                    callback
   * @author Ajaykkumar Rajendran
   */
  dealer.getLeadsSummary = (ctx, callback) => {
    const dealerService = new DealerService(ctx.res.locals.user.user_type_id, ctx.res.locals.user);
    dealerService.getLeadsSummary(callback);
  };

  dealer.remoteMethod('getExecutivesAssociated', {
    description: 'Get list-of executives and team-heads associated to the dealership',
    accepts: [
      { arg: 'dealerId', type: 'string', required: true },
      { arg: 'financierId', type: 'string', required: true },
    ],
    http: { path: '/:dealerId/Financiers/:financierId/salesExecutives', verb: 'GET' },
    returns: { arg: 'salesExecutives', type: 'object', root: true },
  });

  dealer.getExecutivesAssociated = (dealerId, financierId, callback) => {
    const dealerService = new DealerService(dealerId);
    dealerService.getExecutivesAssociated(financierId, callback);
  };

  dealer.remoteMethod('getFinancierInterestDetails', {
    description: 'Get financier interest details',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      { arg: 'dealerId', type: 'string', required: true },
      {
        arg: 'filter', type: 'object', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:dealerId/financiers/interestDetails', verb: 'POST' },
    returns: { arg: 'Financier', type: ['Financier'], root: true },
  });

  /**
   * Get financier interest details
   * @param  {string}   dealerId
   * @param  {Object}   filter
   * @param  {Function} callback
   * @return {List} Financier EMI Details
   */
  dealer.getFinancierInterestDetails = (ctx, dealerId, filter, callback) => {
    const dealerService = new DealerService(dealerId, ctx.res.locals.user);
    dealerService.getFinancierInterestDetails(filter, callback);
  };

  dealer.remoteMethod('addExchangeVehicle', {
    description: 'Add Exchange Vehicle',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      { arg: 'dealerId', type: 'string', required: true },
      { arg: 'leadId', type: 'string', required: true },
      {
        arg: 'exchangeVehicle', type: 'ExchangeVehicle', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:dealerId/lead/:leadId/exchangeVehicle', verb: 'POST' },
    returns: { arg: 'exchangeVehicle', type: 'ExchangeVehicle', root: true },
  });

  /**
   * Add exchange vehicle for a lead
   * @param {string}   dealerId
   * @param {string}   leadId
   * @param {ExchangeVehicle}   exchangeVehicle
   * @param {Function} callback
   * @author Ponnuvel G
   */
  dealer.addExchangeVehicle = (ctx, dealerId, leadId, exchangeVehicle, callback) => {
    const dealerService = new DealerService(dealerId, ctx.res.locals.user);
    dealerService.addExchangeVehicle(leadId, exchangeVehicle, callback);
  };

  dealer.remoteMethod('updateExchangeVehicle', {
    description: 'Update Exchange Vehicle',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      { arg: 'dealerId', type: 'string', required: true },
      { arg: 'leadId', type: 'string', required: true },
      {
        arg: 'exchangeVehicle', type: 'ExchangeVehicle', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:dealerId/lead/:leadId/exchangeVehicle', verb: 'PUT' },
    returns: { arg: 'exchangeVehicle', type: 'ExchangeVehicle', root: true },
  });

  /**
   * Update exchange vehicle
   * @param {string}   dealerId
   * @param {string}   leadId
   * @param {ExchangeVehicle}   exchangeVehicle
   * @param {Function} callback
   * @author Ponnuvel G
   */
  dealer.updateExchangeVehicle = (ctx, dealerId, leadId, exchangeVehicle, callback) => {
    const dealerService = new DealerService(dealerId, ctx.res.locals.user);
    dealerService.updateExchangeVehicle(leadId, exchangeVehicle, callback);
  };

  dealer.remoteMethod('getExchangeVehicle', {
    description: 'Get Exchange Vehicle',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      { arg: 'dealerId', type: 'string', required: true },
      { arg: 'leadId', type: 'string', required: true },
      { arg: 'proformaInvoiceId', type: 'string', required: true },
    ],
    http: { path: '/:dealerId/lead/:leadId/proformaInvoice/:proformaInvoiceId/exchangeVehicle', verb: 'GET' },
    returns: { arg: 'exchangeVehicle', type: 'ExchangeVehicle', root: true },
  });

  /**
   * Get exchange vehicle
   * @param {string}   dealerId
   * @param {string}   leadId
   * @param {Function} callback
   * @author Ponnuvel G
   */
  dealer.getExchangeVehicle = (ctx, dealerId, leadId, proformaInvoiceId, callback) => {
    const dealerService = new DealerService(dealerId, ctx.res.locals.user);
    dealerService.getExchangeVehicle(leadId, proformaInvoiceId, callback);
  };

  dealer.remoteMethod('makePrint', {
    description: 'To make a proforma-invoice print-out',
    accepts: [
      { arg: 'dealerId', type: 'string', required: true },
      { arg: 'proformaInvoiceId', type: 'string', required: true },
      {
        arg: 'filter', type: 'Object', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:dealerId/proformaInvoice/:proformaInvoiceId/print', verb: 'POST' },
    returns: { arg: 'response', type: 'Object', root: true },
  });

  /**
   * Make HTML to print or mail as PDF
   * @param  {String}   dealerId
   * @param  {String}   proformaInvoiceId
   * @param  {Object}   filter
   * @param  {Function} callback
   * @return {Object} Object contains HTML string to print
   */
  dealer.makePrint = (dealerId, proformaInvoiceId, filter, callback) => {
    const dealerService = new DealerService(dealerId);
    dealerService.makePrint(proformaInvoiceId, filter, callback);
  };

  dealer.remoteMethod('sendBrocher', {
    description: 'To make a proforma-invoice print-out',
    accepts: [
      { arg: 'vehicle_id', type: 'string', required: true },
      { arg: 'dealer_id', type: 'string', required: true },
      {
        arg: 'filter', type: 'Object', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:dealer_id/vehicle/:vehicle_id/sendBrocher', verb: 'POST' },
    returns: { arg: 'response', type: 'Object', root: true },
  });

  /**
   * Send Vehicle Brochure
   * @param  {String}   vehicleId
   * @param  {String}   dealerId
   * @param  {Object}   filter
   * @param  {Function} callback
   * @return {Object} email status
   * @author Lingareddy S
   */
  dealer.sendBrocher = (vehicleId, dealerId, filter, callback) => {
    const dealerService = new DealerService(vehicleId);
    dealerService.sendBrocher(vehicleId, dealerId, filter, callback);
  };

  dealer.remoteMethod('sendProformaInvoiceSMS', {
    description: 'To send a proforma-invoice price-breakdown as a SMS to lead',
    accepts: [
      { arg: 'dealerId', type: 'string', required: true },
      { arg: 'proformaInvoiceId', type: 'string', required: true },
      {
        arg: 'filter', type: 'Object', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:dealerId/proformaInvoice/:proformaInvoiceId/sendSMS', verb: 'POST' },
    returns: { arg: 'response', type: 'Object', root: true },
  });

  /**
   * To generate and send a proforma-invoice price-breakdown as a SMS to lead
   * @param  {String}   dealerId
   * @param  {String}   proformaInvoiceId
   * @param  {Object}   filter
   * @param  {Function} callback
   * @return {String}   Message status - sent/failed
   */
  dealer.sendProformaInvoiceSMS = (dealerId, proformaInvoiceId, filter, callback) => {
    const dealerService = new DealerService(dealerId);
    dealerService.sendProformaInvoiceSMS(proformaInvoiceId, filter, callback);
  };

  dealer.remoteMethod('getRoles', {
    description: 'To get all dealer-roles',
    accepts: [],
    http: { path: '/roles', verb: 'GET' },
    returns: { arg: 'roles', type: ['Roles'], root: true },
  });

  /**
   * Get list of roles under the dealer
   * @param  {Function} callback
   * @return {Array} List of roles
   */
  dealer.getRoles = (callback) => {
    const dealerService = new DealerService();
    dealerService.getRoles(callback);
  };

  dealer.remoteMethod('sendLeadReport', {
    description: 'To send lead report to dealer-user',
    accepts: [
      { arg: 'dealerId', type: 'string', required: true },
      {
        arg: 'filter', type: 'Object', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:dealerId/leadReport', verb: 'POST' },
    returns: { arg: 'response', type: 'Object', root: true },
  });

  /**
   * Send Lead Report
   * @param  {String}   dealerId
   * @param  {Objcet}   filter
   * @param  {Function} callback
   * @return {Object} - Report Status
   */
  dealer.sendLeadReport = (dealerId, filter, callback) => {
    const dealerService = new DealerService(dealerId);
    dealerService.sendLeadReport(filter, callback);
  };

  dealer.remoteMethod('updatePassword', {
    description: 'To update password of a dealer-user',
    accepts: [
      { arg: 'dealerId', type: 'string', required: true },
      { arg: 'userId', type: 'string', required: true },
      {
        arg: 'credentials', type: 'Object', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:dealerId/user/:userId/updatePassword', verb: 'POST' },
    returns: { arg: 'response', type: 'Object', root: true },
  });

  /**
   * Update Password with old password verification
   * @param  {String}   dealerId
   * @param  {String}   userId
   * @param  {Object}   credentials - new and old password
   * @param  {Function} callback
   * @return {Users}
   * @author Ponnuvel G
   */
  dealer.updatePassword = (dealerId, userId, credentials, callback) => {
    const dealerService = new DealerService(dealerId);
    dealerService.updatePassword(userId, credentials, callback);
  };

  dealer.remoteMethod('getVehicleProperties', {
    description: 'Get compare vehicle properties by Manufacturer',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      { arg: 'dealerId', type: 'string', required: true },
    ],
    http: { path: '/:dealerId/vehicle/properties', verb: 'GET' },
    returns: { arg: 'response', type: ['CompareVehicleLookup'], root: true },
  });

  /**
   * Get vehicle properties based dealer manufacturer
   * Its used for Vehicle comparision
   * @param {Objcet} ctx
   * @param {String} dealerId
   * @param {Function} callback
   * @returns {List} CompareVehicleLookup
   * @author Ponnuvel G
   */
  dealer.getVehicleProperties = (ctx, dealerId, callback) => {
    const dealerService = new DealerService(dealerId, ctx.res.locals.user);
    dealerService.getVehicleProperties(callback);
  };
};
