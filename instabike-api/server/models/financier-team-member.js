const AuditUtil = require('../utils/audit-utils');

module.exports = (FinancierTeamMember) => {
  const financierTeamMember = FinancierTeamMember;
  /**
   * Updates the log field values
   * @param  {Object}   ctx       database context of the model instance
   * @param  {Function} callback                                callback
   * @author Jaiyashree Subramanian
   */
  financierTeamMember.observe('before save', (ctx, next) => {
    const auditUtil = new AuditUtil();
    auditUtil.persistInstanceUpdatedAt('FinancierTeamMember', ctx, next);
  });
};
