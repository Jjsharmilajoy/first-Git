const AuditUtil = require('../utils/audit-utils');

module.exports = (FollowUp) => {
  const followUp = FollowUp;
  /**
   * Updates the log field values
   * @param  {Object}   ctx       database context of the model instance
   * @param  {Function} callback                                callback
   * @author Jaiyashree Subramanian
   */
  followUp.observe('before save', (ctx, next) => {
    const auditUtil = new AuditUtil();
    auditUtil.persistInstanceUpdatedAt('FollowUp', ctx, next);
  });
};
