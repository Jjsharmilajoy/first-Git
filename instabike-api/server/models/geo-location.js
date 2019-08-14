const AuditUtil = require('../utils/audit-utils');

module.exports = (GeoLocation) => {
  const geoLocation = GeoLocation;
  /**
   * Updates the log field values
   * @param  {Object}   ctx       database context of the model instance
   * @param  {Function} callback                                callback
   * @author Jaiyashree Subramanian
   */
  geoLocation.observe('before save', (ctx, next) => {
    const auditUtil = new AuditUtil();
    auditUtil.persistInstanceUpdatedAt('GeoLocation', ctx, next);
  });
};
