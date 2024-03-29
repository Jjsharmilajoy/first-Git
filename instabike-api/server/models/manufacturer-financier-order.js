const AuditUtil = require('../utils/audit-utils');

module.exports = (ManufacturerFinancierOrder) => {
  const manufacturerFinancierOrder = ManufacturerFinancierOrder;
  /**
   * Updates the log field values
   * @param  {Object}   ctx       database context of the model instance
   * @param  {Function} callback                                callback
   * @author Jaiyashree Subramanian
   */
  manufacturerFinancierOrder.observe('before save', (ctx, next) => {
    const auditUtil = new AuditUtil();
    auditUtil.persistInstanceUpdatedAt('ManufacturerFinancierOrder', ctx, next);
  });
};
