const AuditUtil = require('../utils/audit-utils');

module.exports = (UserRole) => {
  const userRole = UserRole;
  /**
   * Updates the log field values
   * @param  {Object}   ctx       database context of the model instance
   * @param  {Function} callback                                callback
   * @author Jaiyashree Subramanian
   */
  userRole.observe('before save', (ctx, next) => {
    const auditUtil = new AuditUtil();
    auditUtil.persistInstanceUpdatedAt('UserRole', ctx, next);
  });
};
