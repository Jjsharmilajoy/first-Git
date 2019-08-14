const AuditUtil = require('../utils/audit-utils');

module.exports = (VehicleReview) => {
  const vehicleReview = VehicleReview;
  /**
   * Updates the log field values
   * @param  {Object}   ctx       database context of the model instance
   * @param  {Function} callback                                callback
   * @author Jaiyashree Subramanian
   */
  vehicleReview.observe('before save', (ctx, next) => {
    const auditUtil = new AuditUtil();
    auditUtil.persistInstanceUpdatedAt('VehicleReview', ctx, next);
  });
};
