const AuditUtil = require('../utils/audit-utils');

module.exports = (ExchangeVehicle) => {
  const exchangeVehicle = ExchangeVehicle;
  /**
   * Updates the log field values
   * @param  {Object}   ctx       database context of the model instance
   * @param  {Function} callback                                callback
   * @author Jaiyashree Subramanian
   */
  exchangeVehicle.observe('before save', (ctx, next) => {
    const auditUtil = new AuditUtil();
    auditUtil.persistInstanceUpdatedAt('ExchangeVehicle', ctx, next);
  });
};
