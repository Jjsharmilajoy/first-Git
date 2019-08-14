const AuditUtil = require('../utils/audit-utils');

module.exports = (DealerMetric) => {
  const dealerMetric = DealerMetric;
  /**
   * Updates the log field values
   * @param  {Object}   ctx       database context of the model instance
   * @param  {Function} callback                                callback
   * @author Jaiyashree Subramanian
   */
  dealerMetric.observe('before save', (ctx, next) => {
    const auditUtil = new AuditUtil();
    auditUtil.persistInstanceUpdatedAt('DealerMetric', ctx, next);
  });
};
