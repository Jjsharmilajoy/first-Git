const AuditUtil = require('../utils/audit-utils');

module.exports = (DealerOffer) => {
  const dealerOffer = DealerOffer;
  /**
   * Updates the log field values
   * @param  {Object}   ctx       database context of the model instance
   * @param  {Function} callback                                callback
   * @author Jaiyashree Subramanian
   */
  dealerOffer.observe('before save', (ctx, next) => {
    const auditUtil = new AuditUtil();
    auditUtil.persistInstanceUpdatedAt('DealerOffer', ctx, next);
  });
};
