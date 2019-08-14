const AuditUtil = require('../utils/audit-utils');

module.exports = (Accessory) => {
  const accessory = Accessory;
  /**
   * Updates the log field values
   * @param  {Object}   ctx       database context of the model instance
   * @param  {Function} callback                                callback
   * @author Jaiyashree Subramanian
   */
  accessory.observe('before save', (ctx, next) => {
    const auditUtil = new AuditUtil();
    auditUtil.persistInstanceUpdatedAt('Accessory', ctx, next);
  });
};
