const AuditUtil = require('../utils/audit-utils');

module.exports = (CompareVehicleLookup) => {
  const compareVehicleLookup = CompareVehicleLookup;
  /**
   * Updates the log field values
   * @param  {Object}   ctx       database context of the model instance
   * @param  {Function} callback                                callback
   * @author Jaiyashree Subramanian
   */
  compareVehicleLookup.observe('before save', (ctx, next) => {
    const auditUtil = new AuditUtil();
    auditUtil.persistInstanceUpdatedAt('CompareVehicleLookup', ctx, next);
  });
};
