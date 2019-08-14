const AuditUtil = require('../utils/audit-utils');

module.exports = (DealerFinancier) => {
  const dealerFinancier = DealerFinancier;
  /**
   * Updates the log field values
   * @param  {Object}   ctx       database context of the model instance
   * @param  {Function} callback                                callback
   * @author Jaiyashree Subramanian
   */
  dealerFinancier.observe('before save', (ctx, next) => {
    const auditUtil = new AuditUtil();
    auditUtil.persistInstanceUpdatedAt('DealerFinancier', ctx, next);
  });
};
