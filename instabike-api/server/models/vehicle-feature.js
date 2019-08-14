const AuditUtil = require('../utils/audit-utils');

module.exports = (VehicleFeature) => {
  const vehicleFeature = VehicleFeature;
  /**
   * Updates the log field values
   * @param  {Object}   ctx       database context of the model instance
   * @param  {Function} callback                                callback
   * @author Jaiyashree Subramanian
   */
  vehicleFeature.observe('before save', (ctx, next) => {
    const auditUtil = new AuditUtil();
    auditUtil.persistInstanceUpdatedAt('VehicleFeature', ctx, next);
  });
};
