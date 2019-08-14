const AuditUtil = require('../utils/audit-utils');

module.exports = (Roles) => {
  const roles = Roles;
  /**
   * Updates the log field values
   * @param  {Object}   ctx       database context of the model instance
   * @param  {Function} callback                                callback
   * @author Jaiyashree Subramanian
   */
  roles.observe('before save', (ctx, next) => {
    const auditUtil = new AuditUtil();
    auditUtil.persistInstanceUpdatedAt('Roles', ctx, next);
  });
};
