const AuditUtil = require('../utils/audit-utils');

module.exports = (SimilarVehicle) => {
  const similarVehicles = SimilarVehicle;
  /**
   * Updates the log field values
   * @param  {Object}   ctx       database context of the model instance
   * @param  {Function} callback                                callback
   * @author Jaiyashree Subramanian
   */
  similarVehicles.observe('before save', (ctx, next) => {
    const auditUtil = new AuditUtil();
    auditUtil.persistInstanceUpdatedAt('SimilarVehicle', ctx, next);
  });
};
