const AuditUtil = require('../utils/audit-utils');

module.exports = (DealerCategory) => {
  const dealerCategory = DealerCategory;
  /**
   * Updates the log field values
   * @param  {Object}   ctx       database context of the model instance
   * @param  {Function} callback                                callback
   * @author Jaiyashree Subramanian
   */
  dealerCategory.observe('before save', (ctx, next) => {
    const auditUtil = new AuditUtil();
    auditUtil.persistInstanceUpdatedAt('DealerCategory', ctx, next);
  });
};
