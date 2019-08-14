const AuditUtil = require('../utils/audit-utils');
const InstabikeError = require('../error/instabike_error');
const ErrorConstants = require('../utils/constants/error_constants');

module.exports = (DealerAccessory) => {
  const dealerAccessory = DealerAccessory;
  /**
   * Updates the log field values
   * @param  {Object}   ctx       database context of the model instance
   * @param  {Function} callback                                callback
   * @author Jaiyashree Subramanian
   */
  dealerAccessory.observe('before save', (ctx, next) => {
    const auditUtil = new AuditUtil();
    auditUtil.persistInstanceUpdatedAt('DealerAccessory', ctx, next);
  });

  dealerAccessory.beforeRemote('patchOrCreate', (context, modelInstance, next) => {
    if (context.args.data.dealer_id === context.res.locals.user.user_type_id) {
      next();
    } else {
      next(new InstabikeError(ErrorConstants.ERRORS.USER.TRY_AGAIN));
    }
  });
};
