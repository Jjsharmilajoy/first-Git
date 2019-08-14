const AuditUtil = require('../utils/audit-utils');

module.exports = (ProformaInvoiceOffer) => {
  const proformaInvoiceOffer = ProformaInvoiceOffer;
  /**
   * Updates the log field values
   * @param  {object}   ctx       database context of the model instance
   * @param  {function} callback                                callback
   * @author Shahul hameed
   */
  proformaInvoiceOffer.observe('before save', (ctx, next) => {
    const auditUtil = new AuditUtil();
    auditUtil.persistInstanceUpdatedAt('ProformaInvoiceOffer', ctx, next);
  });
};
