const AuditUtil = require('../utils/audit-utils');
const InstabikeError = require('../error/instabike_error');
const ErrorConstants = require('../utils/constants/error_constants');

module.exports = (VehiclePrice) => {
  const vehiclePrice = VehiclePrice;
  /**
   * Updates the log field values
   * @param  {Object}   ctx       database context of the model instance
   * @param  {Function} callback                                callback
   * @author Jaiyashree Subramanian
   */
  vehiclePrice.observe('before save', (ctx, next) => {
    const auditUtil = new AuditUtil();
    auditUtil.persistInstanceUpdatedAt('VehiclePrice', ctx, next);
  });

  /**
   * Hook method to check the dealer manager belongs to the dealer
   *
   * @param  {object}   context
   * @param  {object}   modelInstance
   * @param  {Function} next
   * @author Ajaykkumar Rajendran
   */
  vehiclePrice.beforeRemote('patchOrCreate', (context, modelInstance, next) => {
    const dealerManagerUser = context.res.locals.user;
    if (context.args.data.dealer_id === dealerManagerUser.user_type_id) {
      next();
    } else {
      next(new InstabikeError(ErrorConstants.ERRORS.USER.TRY_AGAIN));
    }
  });
};
