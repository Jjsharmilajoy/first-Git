const AuditUtil = require('../utils/audit-utils');

module.exports = (DealerSalesIncentive) => {
  const dealerSalesIncentive = DealerSalesIncentive;
  /**
   * Updates the log field values
   * @param  {Object}   ctx       database context of the model instance
   * @param  {Function} callback                                callback
   * @author Jaiyashree Subramanian
   */
  dealerSalesIncentive.observe('before save', (ctx, next) => {
    const auditUtil = new AuditUtil();
    auditUtil.persistInstanceUpdatedAt('DealerSalesIncentive', ctx, next);
  });
};
