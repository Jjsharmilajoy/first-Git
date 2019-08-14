const AuditUtil = require('../utils/audit-utils');

module.exports = (Error) => {
  const error = Error;
  /**
   * Updates the log field values
   * @param  {Object}   ctx       database context of the model instance
   * @param  {Function} callback                                callback
   */
  error.observe('before save', (ctx, next) => {
    const auditUtil = new AuditUtil();
    auditUtil.persistInstanceUpdatedAt('Error', ctx, next);
  });
};
