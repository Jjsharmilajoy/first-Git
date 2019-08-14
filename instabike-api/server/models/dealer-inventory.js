const AuditUtil = require('../utils/audit-utils');
const DealerInventoryService = require('../services/dealer_inventory_service');
const InstabikeError = require('../error/instabike_error');
const ErrorConstants = require('../utils/constants/error_constants');

module.exports = (DealerInventory) => {
  const dealerInventory = DealerInventory;
  /**
   * Updates the log field values
   * @param  {Object}   ctx       database context of the model instance
   * @param  {Function} callback                                callback
   * @author Jaiyashree Subramanian
   */
  dealerInventory.observe('before save', (ctx, next) => {
    const auditUtil = new AuditUtil();
    auditUtil.persistInstanceUpdatedAt('DealerInventory', ctx, next);
  });

  dealerInventory.remoteMethod('vehicleInventoryDetails', {
    description: 'To get Vehicle Inventory Details based on vehicle-id and dealer-id',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      { arg: 'dealerId', type: 'string', required: true },
      { arg: 'vehicleId', type: 'string', required: true },
    ],
    http: { path: '/dealer/:dealerId/vehicle/:vehicleId/vehicleInventoryDetails', verb: 'get' },
    returns: { arg: 'incentiveOffers', type: '[DealerVehicle]', root: true },
  });

  /**
   * Getting the incentive amount based on the dealer and vehicle id.
   * @param  {string}   dealerId
   * @param  {string}   vehicleId
   * @param  {Function} callback
   * @return {object}   custom object containing the vehicle and dealer vehicle
   * @author Jagajeevan
   */
  dealerInventory.vehicleInventoryDetails = (ctx, dealerId, vehicleId, callback) => {
    const dealerInventoryService = new DealerInventoryService(dealerId);
    dealerInventoryService.getVehicleInventoryDetails(vehicleId, ctx.res.locals.user, callback);
  };

  /**
   * Hook method to check the dealer manager belongs to the dealer
   *
   * @param  {object}   context
   * @param  {object}   modelInstance
   * @param  {Function} next
   * @author Ajaykkumar Rajendran
   */
  dealerInventory.beforeRemote('patchOrCreate', (context, modelInstance, next) => {
    if (context.args.data.dealer_id === context.res.locals.user.user_type_id) {
      next();
    } else {
      next(new InstabikeError(ErrorConstants.ERRORS.USER.TRY_AGAIN));
    }
  });

  dealerInventory.remoteMethod('getStocks', {
    description: 'To get stocks based on variant-id and dealer-id',
    accepts: [
      { arg: 'dealerId', type: 'string', required: true },
      { arg: 'variantId', type: 'string', required: true },
    ],
    http: { path: '/variants/:variantId/dealer/:dealerId/getStocks', verb: 'get' },
    returns: { arg: 'stocks', type: 'object', root: true },
  });

  /**
   * Get the vehicle stocks based on the dealer, vaiant color and variant id.
   *
   * @param  {string}   dealerId                dealer id
   * @param  {string}   variantId               variant id
   * @param  {function} callback                callback
   * @author Ajaykkumar Rajendran
   */
  dealerInventory.getStocks = (dealerId, variantId, callback) => {
    const dealerInventoryService = new DealerInventoryService(dealerId);
    dealerInventoryService.getStocks(variantId, callback);
  };

  dealerInventory.remoteMethod('updateStocks', {
    description: 'To update stocks',
    accepts: [
      {
        arg: 'data', type: 'array', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/updateStocks', verb: 'post' },
    returns: { arg: 'stocks', type: 'object', root: true },
  });

  /**
   * Update the vehicle stocks based on the dealer, vaiant color and variant id.
   *
   * @param  {array}   data                     data
   * @param  {function} callback                callback
   * @author Ajaykkumar Rajendran
   */
  dealerInventory.updateStocks = (data, callback) => {
    const dealerInventoryService = new DealerInventoryService();
    dealerInventoryService.updateStocks(data, callback);
  };
};
