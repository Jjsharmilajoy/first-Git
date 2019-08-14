const AuditUtil = require('../utils/audit-utils');

module.exports = (Variant) => {
  const variant = Variant;
  /**
   * Updates the log field values
   * @param  {Object}   ctx       database context of the model instance
   * @param  {Function} callback                                callback
   * @author Jaiyashree Subramanian
   */
  variant.observe('before save', (ctx, next) => {
    const auditUtil = new AuditUtil();
    auditUtil.persistInstanceUpdatedAt('Variant', ctx, next);
  });
};
