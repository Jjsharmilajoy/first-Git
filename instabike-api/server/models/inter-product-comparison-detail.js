const AuditUtil = require('../utils/audit-utils');

module.exports = (InterProductComparisonDetail) => {
  const interProductComparisonDetail = InterProductComparisonDetail;
  /**
   * Updates the log field values
   * @param  {Object}   ctx       database context of the model instance
   * @param  {Function} callback                                callback
   * @author Jaiyashree Subramanian
   */
  interProductComparisonDetail.observe('before save', (ctx, next) => {
    const auditUtil = new AuditUtil();
    auditUtil.persistInstanceUpdatedAt('InterProductComparisonDetail', ctx, next);
  });
};
