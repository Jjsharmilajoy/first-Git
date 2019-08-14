const AuditUtil = require('../utils/audit-utils');

module.exports = (VehicleGallery) => {
  const vehicleGallery = VehicleGallery;
  /**
   * Updates the log field values
   * @param  {Object}   ctx       database context of the model instance
   * @param  {Function} callback                                callback
   * @author Jaiyashree Subramanian
   */
  vehicleGallery.observe('before save', (ctx, next) => {
    const auditUtil = new AuditUtil();
    auditUtil.persistInstanceUpdatedAt('VehicleGallery', ctx, next);
  });
};
