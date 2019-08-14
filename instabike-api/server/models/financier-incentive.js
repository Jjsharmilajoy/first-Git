const AuditUtil = require('../utils/audit-utils');

module.exports = (FinancierIncentive) => {
  const financierIncentive = FinancierIncentive;
  /**
   * Updates the log field values
   * @param  {Object}   ctx       database context of the model instance
   * @param  {Function} callback                                callback
   * @author Jaiyashree Subramanian
   */
  financierIncentive.observe('before save', (ctx, next) => {
    const auditUtil = new AuditUtil();
    auditUtil.persistInstanceUpdatedAt('FinancierIncentive', ctx, next);
  });
};
