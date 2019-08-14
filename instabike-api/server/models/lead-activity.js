const AuditUtil = require('../utils/audit-utils');

module.exports = (LeadActivity) => {
  const leadActivity = LeadActivity;
  /**
   * Updates the log field values
   * @param  {Object}   ctx       database context of the model instance
   * @param  {Function} callback                                callback
   * @author Jaiyashree Subramanian
   */
  leadActivity.observe('before save', (ctx, next) => {
    const auditUtil = new AuditUtil();
    auditUtil.persistInstanceUpdatedAt('LeadActivity', ctx, next);
  });
};
