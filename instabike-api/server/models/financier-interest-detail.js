const AuditUtil = require('../utils/audit-utils');

module.exports = (FinancierInterestDetail) => {
  const financierInterestDetail = FinancierInterestDetail;
  /**
   * Updates the log field values
   * @param  {Object}   ctx       database context of the model instance
   * @param  {Function} callback                                callback
   * @author Ponnuvel G
   */
  financierInterestDetail.observe('before save', (ctx, next) => {
    const auditUtil = new AuditUtil();
    auditUtil.persistInstanceUpdatedAt('Financier', ctx, next);
  });
};
