const AuditUtil = require('../utils/audit-utils');
const LeadService = require('../services/lead_service.js');

module.exports = (LostReason) => {
  const lostReason = LostReason;
  /**
   * Updates the log field values
   * @param  {Object}   ctx       database context of the model instance
   * @param  {Function} callback                                callback
   * @author Jaiyashree Subramanian
   */
  lostReason.observe('before save', (ctx, next) => {
    const auditUtil = new AuditUtil();
    auditUtil.persistInstanceUpdatedAt('LostReason', ctx, next);
  });

  lostReason.remoteMethod('getLostReasons', {
    description: 'To get all possible lost reasons',
    accepts: [],
    http: { path: '/list', verb: 'get' },
    returns: { arg: 'msg', type: '[LostReason]', root: true },
  });

  lostReason.getLostReasons = (callback) => {
    const leadService = new LeadService();
    leadService.getLostReasons(callback);
  };
};
