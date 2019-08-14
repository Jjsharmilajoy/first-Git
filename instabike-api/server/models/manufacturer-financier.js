const AuditUtil = require('../utils/audit-utils');

module.exports = (ManufacturerFinancier) => {
  const manufacturerFinancier = ManufacturerFinancier;
  /**
   * Updates the log field values
   * @param  {Object}   ctx       database context of the model instance
   * @param  {Function} callback                                callback
   * @author Jaiyashree Subramanian
   */
  manufacturerFinancier.observe('before save', (ctx, next) => {
    const auditUtil = new AuditUtil();
    auditUtil.persistInstanceUpdatedAt('ManufacturerFinancier', ctx, next);
  });
};
