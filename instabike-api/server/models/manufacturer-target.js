const AuditUtil = require('../utils/audit-utils');

module.exports = (ManufacturerTarget) => {
  const manufacturerTarget = ManufacturerTarget;
  /**
   * Updates the log field values
   * @param  {Object}   ctx       database context of the model instance
   * @param  {Function} callback                                callback
   * @author Jaiyashree Subramanian
   */
  manufacturerTarget.observe('before save', (ctx, next) => {
    const auditUtil = new AuditUtil();
    auditUtil.persistInstanceUpdatedAt('ManufacturerTarget', ctx, next);
  });
};
