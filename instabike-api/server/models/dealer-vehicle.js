const AuditUtil = require('../utils/audit-utils');
const DealerService = require('../services/dealer_service');

module.exports = (DealerVehicle) => {
  const dealerVehicle = DealerVehicle;
  /**
   * Updates the log field values
   * @param  {Object}   ctx       database context of the model instance
   * @param  {Function} callback                                callback
   * @author Jaiyashree Subramanian
   */
  dealerVehicle.observe('before save', (ctx, next) => {
    const auditUtil = new AuditUtil();
    auditUtil.persistInstanceUpdatedAt('DealerVehicle', ctx, next);
  });

  /**
   * Hook method to check the dealer manager belongs to the dealer
   * @param  {object}   context
   * @param  {object}   modelInstance
   * @param  {Function} next
   * @author Jagajeevan
   */
  dealerVehicle.beforeRemote('patchOrCreate', (context, modelInstance, next) => {
    const dealerService = new DealerService(context.args.data.dealer_id);
    dealerService.validateDealerVehicle(context.args.data, context.res.locals.user, next);
  });
};
