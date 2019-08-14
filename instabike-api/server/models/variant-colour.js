const AuditUtil = require('../utils/audit-utils');

module.exports = (VariantColour) => {
  const variantColour = VariantColour;
  /**
   * Updates the log field values
   * @param  {Object}   ctx       database context of the model instance
   * @param  {Function} callback                                callback
   * @author Jaiyashree Subramanian
   */
  variantColour.observe('before save', (ctx, next) => {
    const auditUtil = new AuditUtil();
    auditUtil.persistInstanceUpdatedAt('VariantColour', ctx, next);
  });
};
