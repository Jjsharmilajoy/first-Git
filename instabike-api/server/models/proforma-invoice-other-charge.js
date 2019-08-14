const AuditUtil = require('../utils/audit-utils');

module.exports = (ProformaInvoiceOtherCharge) => {
  const proformaInvoiceOtherCharge = ProformaInvoiceOtherCharge;
  /**
   * Updates the log field values
   * @param  {object}   ctx       database context of the model instance
   * @param  {function} callback                                callback
   * @author Shahul hameed
   */
  proformaInvoiceOtherCharge.observe('before save', (ctx, next) => {
    const auditUtil = new AuditUtil();
    auditUtil.persistInstanceUpdatedAt('ProformaInvoiceOffer', ctx, next);
  });
};
