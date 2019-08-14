const AuditUtil = require('../utils/audit-utils');

module.exports = (FinancierBranch) => {
  const financierBranch = FinancierBranch;
  /**
   * Updates the log field values
   * @param  {Object}   ctx       database context of the model instance
   * @param  {Function} callback                                callback
   * @author Jaiyashree Subramanian
   */
  financierBranch.observe('before save', (ctx, next) => {
    const auditUtil = new AuditUtil();
    auditUtil.persistInstanceUpdatedAt('FinancierBranch', ctx, next);
  });
};
