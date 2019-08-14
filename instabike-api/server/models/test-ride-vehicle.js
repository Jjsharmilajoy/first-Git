const AuditUtil = require('../utils/audit-utils');

module.exports = (TestRideVehicle) => {
  const testRideVehicle = TestRideVehicle;
  /**
   * Updates the log field values
   * @param  {Object}   ctx       database context of the model instance
   * @param  {Function} callback                                callback
   * @author Jaiyashree Subramanian
   */
  testRideVehicle.observe('before save', (ctx, next) => {
    const auditUtil = new AuditUtil();
    auditUtil.persistInstanceUpdatedAt('TestRideVehicle', ctx, next);
  });
};
