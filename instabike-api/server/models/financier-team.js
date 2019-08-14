const AuditUtil = require('../utils/audit-utils');
const FinancierService = require('../services/financier_service');
const FinancierTeamService = require('../services/financier_team_service');

module.exports = (FinancierTeam) => {
  const financierTeam = FinancierTeam;
  /**
   * Updates the log field values
   * @param  {Object}   ctx       database context of the model instance
   * @param  {Function} callback                                callback
   * @author Jaiyashree Subramanian
   */
  financierTeam.observe('before save', (ctx, next) => {
    const auditUtil = new AuditUtil();
    auditUtil.persistInstanceUpdatedAt('FinancierTeam', ctx, next);
  });

  financierTeam.remoteMethod('createFinancierTeam', {
    description: 'To create a new financier-team and associate executives',
    accepts: [
      { arg: 'context', type: 'object', http: { source: 'context' } },
      {
        arg: 'teamDetail', type: 'Object', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/', verb: 'POST' },
    returns: { arg: 'dealer', type: 'object', root: true },
  });

  financierTeam.createFinancierTeam = (context, teamDetail, callback) => {
    const financierService = new FinancierService();
    const financierCityHead = context.res.locals.user;
    financierService.createFinancierTeam(teamDetail, financierCityHead, callback);
  };

  financierTeam.remoteMethod('getTeamMembersByTeamId', {
    description: 'To get team-members list by team-id',
    accepts: [
      { arg: 'context', type: 'object', http: { source: 'context' } },
      {
        arg: 'teamObj', type: 'Object', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/members', verb: 'POST' },
    returns: { arg: 'response', type: 'FinancierTeamMember', root: true },
  });

  financierTeam.getTeamMembersByTeamId = (context, teamObj, callback) => {
    const currentUser = context.res.locals.user;
    const financierTeamService = new FinancierTeamService(null, currentUser);
    financierTeamService.getTeamMembersByTeamIds(teamObj, callback);
  };

  financierTeam.remoteMethod('getTeamDetail', {
    description: 'To get team-detail by team-id',
    accepts: [
      { arg: 'context', type: 'object', http: { source: 'context' } },
      { arg: 'id', type: 'string', required: true },
    ],
    http: { path: '/:id/detail', verb: 'GET' },
    returns: { arg: 'response', type: 'FinancierDealer', root: true },
  });

  financierTeam.getTeamDetail = (context, id, callback) => {
    const currentUser = context.res.locals.user;
    const financierTeamService = new FinancierTeamService(id, currentUser);
    financierTeamService.getTeamDetail(callback);
  };

  financierTeam.remoteMethod('getDealersUnassignedToSales', {
    description: 'To get unassigned dealership to any sales user',
    accepts: [{ arg: 'id', type: 'string', required: true }],
    http: { path: '/:id/members/dealers/unassigned', verb: 'GET' },
    returns: { arg: 'response', type: 'Boolean', root: true },
  });

  financierTeam.getDealersUnassignedToSales = (id, callback) => {
    const financierTeamService = new FinancierTeamService(id);
    financierTeamService.getDealersUnassignedToSales(callback);
  };

  financierTeam.remoteMethod('getDealershipLeadEffectiveness', {
    description: 'To get dealership lead-effectivenesss',
    accepts: [
      { arg: 'financierTeamId', type: 'string', required: true },
      {
        arg: 'filter', type: 'DateFilter', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:financierTeamId/dealership/leadEffectiveness', verb: 'POST' },
    returns: { arg: 'response', type: 'Dealer', root: true },
  });

  /**
   * To get team-based dealership lead-effectiveness across team members
   *
   * @param  {string} financierTeamId                  financier-team-id
   * @param  {object} filter                               date - filter
   * @param  {object} Dealer
   * @author Jaiyashree Subramanian
   */
  financierTeam.getDealershipLeadEffectiveness = (financierTeamId, filter, callback) => {
    const financierTeamService = new FinancierTeamService(financierTeamId, null);
    financierTeamService.getDealershipLeadEffectiveness(filter, callback);
  };

  financierTeam.remoteMethod('getDealershipMemberSummary', {
    description: 'To get dealership member lead summary',
    accepts: [
      { arg: 'context', type: 'object', http: { source: 'context' } },
      { arg: 'financierTeamId', type: 'string', required: true },
      { arg: 'dealerId', type: 'string', required: true },
      {
        arg: 'filter', type: 'DateFilter', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:financierTeamId/dealers/:dealerId/memberSummary', verb: 'POST' },
    returns: { arg: 'response', type: 'Dealer', root: true },
  });

  /**
   * To get team-based dealership lead-effectiveness across team members
   *
   * @param  {string} financierTeamId                  financier-team-id
   * @param  {object} filter                               date - filter
   * @param  {object} Dealer
   * @author Jaiyashree Subramanian
   */
  financierTeam
    .getDealershipMemberSummary = (context, financierTeamId, dealerId, filter, callback) => {
      const currentUser = context.res.locals.user;
      const financierTeamService = new FinancierTeamService(financierTeamId, currentUser);
      financierTeamService.getDealershipMemberSummary(dealerId, filter, callback);
    };

  financierTeam.remoteMethod('changeDealershipUser', {
    description: 'To change financier user assigned to a dealership',
    accepts: [
      { arg: 'context', type: 'object', http: { source: 'context' } },
      { arg: 'financierTeamId', type: 'string', required: true },
      { arg: 'dealerId', type: 'string', required: true },
      {
        arg: 'newUser', type: 'Users', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:financierTeamId/dealers/:dealerId/assignedUser/update', verb: 'PUT' },
    returns: { arg: 'response', type: 'Dealer', root: true },
  });

  /**
   * To change a assigned-user for a dealership associated to financier-team
   *
   * @param  {string} financierTeamId                  financier-team-id
   * @param  {object} dealerId                                 dealer-id
   * @param  {object} newUser                                 new - user
   * @param  {function} callback                                callback
   * @author Jaiyashree Subramanian
   */
  financierTeam
    .changeDealershipUser = (context, financierTeamId, dealerId, newUser, callback) => {
      const currentUser = context.res.locals.user;
      const financierTeamService = new FinancierTeamService(financierTeamId, currentUser);
      financierTeamService.changeDealershipUser(dealerId, newUser, callback);
    };

  financierTeam.remoteMethod('getLeadSummaryBasedOnDealership', {
    description: 'To get dealership based lead-summary',
    accepts: [
      { arg: 'financierTeamId', type: 'string', required: true },
      { arg: 'dealerId', type: 'string', required: true },
      {
        arg: 'filter', type: 'DateFilter', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:financierTeamId/dealers/:dealerId/leadSummary', verb: 'POST' },
    returns: { arg: 'response', type: 'Users', root: true },
  });

  /**
   * To get lead summary for a dealer associated to financier-team
   *
   * @param  {string} financierTeamId                  financier-team-id
   * @param  {string} dealerId                                 dealer-id
   * @param  {object} filter                                 date-filter
   * @param  {function} callback                                callback
   * @author Sundar P
   */
  financierTeam.getLeadSummaryBasedOnDealership = (financierTeamId, dealerId, filter, callback) => {
    const financierTeamService = new FinancierTeamService(financierTeamId);
    financierTeamService.getLeadSummaryBasedOnDealership(dealerId, filter, callback);
  };

  financierTeam.remoteMethod('deleteTeamMember', {
    description: 'To delete a member from team',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      { arg: 'financierTeamId', type: 'string', required: true },
      { arg: 'userId', type: 'string', required: true },
    ],
    http: { path: '/:financierTeamId/members/:userId/markDeleted', verb: 'PUT' },
    returns: { arg: 'response', type: 'Dealer', root: true },
  });

  /**
   * To delete team-member from team if not assigned to any dealership
   *
   * @param  {string} financierTeamId                financier-team-id
   * @param  {string} userId                            team-member-id
   * @author Jaiyashree Subramanian
   */
  financierTeam.deleteTeamMember = (ctx, financierTeamId, userId, callback) => {
    const financierTeamService = new FinancierTeamService(financierTeamId, ctx.res.locals.user);
    financierTeamService.deleteTeamMember(userId, callback);
  };

  financierTeam.remoteMethod('getDealershipMonthlyReport', {
    description: 'To get dealership monthly report',
    accepts: [
      { arg: 'financierTeamId', type: 'string', required: true },
      { arg: 'dealerId', type: 'string', required: true },
      {
        arg: 'filter', type: 'DateFilter', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:financierTeamId/Dealers/:dealerId/monthlySummary', verb: 'POST' },
    returns: { arg: 'response', type: 'object', root: true },
  });

  financierTeam.getDealershipMonthlyReport = (financierTeamId, dealerId, filter, callback) => {
    const financierTeamService = new FinancierTeamService(financierTeamId);
    financierTeamService.getDealershipMonthlyReport(dealerId, filter, callback);
  };
};
