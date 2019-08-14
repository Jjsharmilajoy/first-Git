const AuditUtil = require('../utils/audit-utils');
const FinancierService = require('../services/financier_service');

module.exports = (FinancierDealer) => {
  const financierDealer = FinancierDealer;
  /**
   * Updates the log field values
   * @param  {Object}   ctx       database context of the model instance
   * @param  {Function} callback                                callback
   * @author Jaiyashree Subramanian
   */
  financierDealer.observe('before save', (ctx, next) => {
    const auditUtil = new AuditUtil();
    auditUtil.persistInstanceUpdatedAt('FinancierDealer', ctx, next);
  });

  /**
   * Hook method to insert active incentive for each new target created
   *
   * @param  {object}   context
   * @param  {object}   modelInstance
   * @param  {Function} next
   * @author Jaiyashree Subramanian
   */
  financierDealer.beforeRemote('patchOrCreate', (context, modelInstance, next) => {
    if (context.args && context.args.data && context.args.data.id) {
      const financierService = new FinancierService();
      financierService.beforeUpdateDealer(context.args.data, next);
    } else {
      next();
    }
  });
};
