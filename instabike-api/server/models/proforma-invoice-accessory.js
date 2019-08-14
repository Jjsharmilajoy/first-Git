const AuditUtil = require('../utils/audit-utils');

module.exports = (ProformaInvoiceAccessory) => {
  const proformaInvoiceAccessory = ProformaInvoiceAccessory;
  /**
   * Updates the log field values
   * @param  {object}   ctx       database context of the model instance
   * @param  {function} callback                                callback
   * @author Shahul hameed
   */
  proformaInvoiceAccessory.observe('before save', (ctx, next) => {
    const auditUtil = new AuditUtil();
    auditUtil.persistInstanceUpdatedAt('ProformaInvoiceAccessory', ctx, next);
  });
};
