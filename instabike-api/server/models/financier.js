const AuditUtil = require('../utils/audit-utils');
const FinancierService = require('../services/financier_service');
const constants = require('../utils/constants/userConstants');
const FinancierTargetService = require('../services/financier_target_service');
const CustomerService = require('../services/customer_service');

module.exports = (Financier) => {
  const financier = Financier;
  /**
   * Updates the log field values
   * @param  {Object}   ctx       database context of the model instance
   * @param  {Function} callback                                callback
   * @author Jaiyashree Subramanian
   */
  financier.observe('before save', (ctx, next) => {
    const auditUtil = new AuditUtil();
    auditUtil.persistInstanceUpdatedAt('Financier', ctx, next);
  });

  financier.remoteMethod('financierLogin', {
    description: 'To login as a financier user',
    accepts: [
      {
        arg: 'credentials', type: 'Object', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/login', verb: 'post' },
    returns: { arg: 'response', type: Object, root: true },
  });

  financier.financierLogin = (credentials, callback) => {
    const financierService = new FinancierService();
    financierService.financierLogin(credentials, callback);
  };

  financier.remoteMethod('createSalesMemberHead', {
    description: 'To create a new sales-member-head',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      { arg: 'financierId', type: 'string', required: true },
      {
        arg: 'financierTeamHead', type: 'Users', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:financierId/salesMemberHead/create', verb: 'post' },
    returns: { arg: 'msg', type: 'object', root: true },
  });

  financier.createSalesMemberHead = (ctx, financierId, financierTeamHead, callback) => {
    const financierService = new FinancierService(financierId, ctx.res.locals.user);
    financierService.createFinancierMember(financierTeamHead, 'financier_team_head', callback);
  };

  financier.remoteMethod('createSalesMember', {
    description: 'To create a new sales-member',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      { arg: 'financierId', type: 'string', required: true },
      {
        arg: 'financierSales', type: 'Users', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:financierId/salesMember/create', verb: 'post' },
    returns: { arg: 'msg', type: 'object', root: true },
  });

  financier.createSalesMember = (ctx, financierId, financierSales, callback) => {
    const financierService = new FinancierService(financierId, ctx.res.locals.user);
    financierService.createFinancierMember(financierSales, 'financier_sales', callback);
  };

  financier.remoteMethod('addSalesMemberToTeam', {
    description: 'To add a sales-member to a team',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      { arg: 'financierId', type: 'string', required: true },
      { arg: 'financierTeamId', type: 'string', required: true },
      {
        arg: 'newMembers', type: 'NewTeamMember', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:financierId/teams/:financierTeamId/newMember', verb: 'post' },
    returns: { arg: 'msg', type: 'object', root: true },
  });

  financier.addSalesMemberToTeam =
    (ctx, financierId, financierTeamId, newMembers, callback) => {
      const financierService = new FinancierService(financierId, ctx.res.locals.user);
      financierService.addSalesMemberToTeam(
        financierTeamId,
        newMembers.teamMembers,
        newMembers.dealerIds,
        'financier_sales',
        ctx.res.locals.user,
        callback,
      );
    };

  financier.remoteMethod('forgotPassword', {
    description: 'To get a new password-reset link on clicking forgot-password',
    accepts: [
      {
        arg: 'email', type: 'string', required: true,
      },
    ],
    http: { path: '/forgotPassword', verb: 'GET' },
    returns: { arg: 'response', type: 'Object', root: true },
  });

  financier.forgotPassword = (email, callback) => {
    const financierService = new FinancierService();
    financierService.forgotPassword(email, constants.USER_TYPE_NAMES.FINANCIER, callback);
  };

  financier.remoteMethod('getBranchDetail', {
    description: 'To get branch details with financier-id and user-id',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      { arg: 'financierId', type: 'string', required: true },
      { arg: 'userId', type: 'string', required: true },
    ],
    http: { path: '/:financierId/Users/:userId/homeBranch', verb: 'GET' },
    returns: { arg: 'response', type: 'Object', root: true },
  });

  financier.getBranchDetail = (ctx, financierId, userId, callback) => {
    const financierService = new FinancierService(financierId);
    financierService.getFinancierBranch(ctx.res.locals.user, callback);
  };

  financier.remoteMethod('getUnassignedDealerFinanciers', {
    description: 'To get unassigned dealer-financiers',
    accepts: [
      { arg: 'financierId', type: 'string', required: true },
      { arg: 'userId', type: 'string', required: true },
    ],
    http: { path: '/:financierId/Users/:userId/dealers/unassigned', verb: 'GET' },
    returns: { arg: 'response', type: 'Object', root: true },
  });

  financier.getUnassignedDealerFinanciers = (financierId, userId, callback) => {
    const financierService = new FinancierService(financierId);
    financierService.getUnassignedDealerFinanciers(userId, callback);
  };

  financier.remoteMethod('getFinancierDealersOfUser', {
    description: 'To get dealer-financier of a user by user-id',
    accepts: [
      { arg: 'financierId', type: 'string', required: true },
      { arg: 'userId', type: 'string', required: true },
    ],
    http: { path: '/:financierId/Users/:userId/dealers', verb: 'GET' },
    returns: { arg: 'response', type: 'Object', root: true },
  });

  financier.getFinancierDealersOfUser = (financierId, userId, callback) => {
    const financierService = new FinancierService(financierId);
    financierService.getFinancierDealersOfUser(userId, callback);
  };

  financier.remoteMethod('getUnassignedFinancierTL', {
    description: 'To get unassigned financier-team-heads',
    accepts: [
      { arg: 'financierId', type: 'string', required: true },
      { arg: 'userId', type: 'string', required: true },
      {
        arg: 'filter', type: 'AutocompleteUsers', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:financierId/Users/:userId/teamLeads/unassigned', verb: 'POST' },
    returns: { arg: 'response', type: ['Users'], root: true },
  });

  financier.getUnassignedFinancierTL = (financierId, userId, filter, callback) => {
    const financierService = new FinancierService(financierId);
    financierService.getUnassignedFinancierTL(userId, filter, callback);
  };

  financier.remoteMethod('getUnassignedFinancierSales', {
    description: 'To get unassigned financier-sales-person',
    accepts: [
      { arg: 'financierId', type: 'string', required: true },
      { arg: 'userId', type: 'string', required: true },
      {
        arg: 'filter', type: 'AutocompleteUsers', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:financierId/Users/:userId/salesExecutives/unassigned', verb: 'POST' },
    returns: { arg: 'response', type: ['Users'], root: true },
  });

  financier.getUnassignedFinancierSales = (financierId, userId, filter, callback) => {
    const financierService = new FinancierService(financierId);
    financierService.getUnassignedFinancierSales(userId, filter, callback);
  };

  financier.remoteMethod('createTeam', {
    description: 'To create a new financier-team',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      { arg: 'financierId', type: 'string', required: true },
      { arg: 'userId', type: 'string', required: true },
      {
        arg: 'financierTeam', type: 'object', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:financierId/Users/:userId/createTeam', verb: 'POST' },
    returns: { arg: 'response', type: 'Object', root: true },
  });

  financier.createTeam = (ctx, financierId, userId, financierTeam, callback) => {
    const financierService = new FinancierService(financierId, ctx.res.locals.user);
    financierService.createTeam(userId, financierTeam, callback);
  };

  financier.remoteMethod('getTeamsOfCityHead', {
    description: 'To get all teams belonging to a city-head',
    accepts: [
      { arg: 'financierId', type: 'string', required: true },
      { arg: 'userId', type: 'string', required: true },
    ],
    http: { path: '/:financierId/Users/:userId/teams', verb: 'GET' },
    returns: { arg: 'response', type: 'Object', root: true },
  });

  financier.getTeamsOfCityHead = (financierId, userId, callback) => {
    const financierService = new FinancierService(financierId);
    financierService.getTeamsOfCityHead(userId, callback);
  };

  financier.remoteMethod('getTeamByOwnerId', {
    description: 'To team details by using owner-id',
    accepts: [
      { arg: 'financierId', type: 'string', required: true },
      { arg: 'userId', type: 'string', required: true },
    ],
    http: { path: '/:financierId/Users/:userId/myTeam', verb: 'GET' },
    returns: { arg: 'response', type: 'Object', root: true },
  });

  financier.getTeamByOwnerId = (financierId, userId, callback) => {
    const financierService = new FinancierService(financierId);
    financierService.getTeamByOwnerId(userId, callback);
  };

  financier.remoteMethod('getMembersTargetCompletion', {
    description: 'Get targets completion based on dealer',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      { arg: 'financierId', type: 'string', required: true },
      { arg: 'financierTeamId', type: 'string', required: true },
    ],
    http: { path: '/:financierId/teams/:financierTeamId/memberTarget', verb: 'GET' },
    returns: { arg: 'dealer', type: 'object', root: true },
  });

  financier.getMembersTargetCompletion = (ctx, financierId, financierTeamId, callback) => {
    const financierTargetService = new FinancierTargetService(financierId, ctx.res.locals.user);
    financierTargetService.getMembersTargetCompletion(financierTeamId, callback);
  };

  financier.remoteMethod('getTeamsTargetCompletion', {
    description: 'Get targets completion based on dealer',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      { arg: 'financierId', type: 'string', required: true },
    ],
    http: { path: '/:financierId/teamsTarget', verb: 'GET' },
    returns: { arg: 'dealer', type: 'object', root: true },
  });

  financier.getTeamsTargetCompletion = (ctx, financierId, callback) => {
    const financierTargetService = new FinancierTargetService(financierId, ctx.res.locals.user);
    financierTargetService.getTeamsTargetCompletion(ctx.res.locals.user.city_id, callback);
  };

  financier.remoteMethod('createLead', {
    description: ['Create Financier Lead'],
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      { arg: 'financierId', type: 'string', required: true },
      {
        arg: 'lead', type: 'FinancierLead', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:financierId/lead/create', verb: 'POST' },
    returns: { arg: 'response', type: 'FinancierLead', root: true },
  });

  /**
   * Create Financier Lead
   * @param  {string}   financierId
   * @param  {FinancierLead}   lead
   * @param  {Function} callback
   * @return {FinancierLead} financier lead
   */
  financier.createLead = (ctx, financierId, lead, callback) => {
    const financierService = new FinancierService(financierId, ctx.res.locals.user);
    financierService.createLead(lead, callback);
  };

  financier.remoteMethod('checkNextMonthMemberTarget', {
    accepts: [
      { arg: 'financierId', type: 'string', required: true },
      { arg: 'financierTeamId', type: 'string', required: true },
    ],
    http: { path: '/:financierId/teams/:financierTeamId/nextMonthTarget/available', verb: 'GET' },
    returns: { arg: 'response', type: 'Boolean', root: true },
  });

  financier.checkNextMonthMemberTarget = (financierId, financierTeamId, callback) => {
    const financierTargetService = new FinancierTargetService(financierId);
    financierTargetService.checkNextMonthMemberTarget(financierTeamId, callback);
  };

  financier.remoteMethod('checkNextMonthTeamTarget', {
    description: 'Get targets completion based on dealer',
    accepts: [
      { arg: 'financierId', type: 'string', required: true },
      { arg: 'userId', type: 'string', required: true },
    ],
    http: { path: '/:financierId/Users/:userId/nextMonthTarget/available', verb: 'GET' },
    returns: { arg: 'response', type: 'Boolean', root: true },
  });

  financier.checkNextMonthTeamTarget = (financierId, userId, callback) => {
    const financierTargetService = new FinancierTargetService(financierId);
    financierTargetService.checkNextMonthTeamTarget(userId, callback);
  };

  financier.remoteMethod('getUserPerformanceSummary', {
    description: 'To get user performance summary by using user id',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      { arg: 'financierId', type: 'string', required: true },
      { arg: 'userId', type: 'string', required: true },
      {
        arg: 'filter', type: 'DateFilter', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:financierId/Users/:userId/performance', verb: 'POST' },
    returns: { arg: 'response', type: 'object', root: true },
  });

  financier.getUserPerformanceSummary = (ctx, financierId, userId, filter, callback) => {
    const financierService = new FinancierService(financierId, ctx.res.locals.user);
    financierService.getUserPerformanceSummary(userId, filter, callback);
  };

  financier.remoteMethod('getCityHeadSummary', {
    description: 'To get city performance summary by using city-user id',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      { arg: 'financierId', type: 'string', required: true },
      { arg: 'userId', type: 'string', required: true },
      {
        arg: 'filter', type: 'DateFilter', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:financierId/Users/:userId/overallSummary', verb: 'POST' },
    returns: { arg: 'response', type: 'object', root: true },
  });

  financier.getCityHeadSummary = (ctx, financierId, userId, filter, callback) => {
    const financierService = new FinancierService(financierId, ctx.res.locals.user);
    financierService.getCityHeadSummary(userId, filter, callback);
  };

  financier.remoteMethod('getTeamSummary', {
    description: 'To get team performance summary by using team id',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      { arg: 'financierId', type: 'string', required: true },
      { arg: 'teamId', type: 'string', required: true },
      {
        arg: 'filter', type: 'DateFilter', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:financierId/teams/:teamId/summary', verb: 'POST' },
    returns: { arg: 'response', type: 'object', root: true },
  });

  financier.getTeamSummary = (ctx, financierId, teamId, filter, callback) => {
    const financierService = new FinancierService(financierId, ctx.res.locals.user);
    financierService.getTeamSummary(teamId, filter, callback);
  };

  financier.remoteMethod('getAllTeamsPerformance', {
    description: 'To get performance grouped by team ',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      { arg: 'financierId', type: 'string', required: true },
      { arg: 'userId', type: 'string', required: true },
      {
        arg: 'filter', type: 'DateFilter', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:financierId/Users/:userId/teams/performance', verb: 'POST' },
    returns: { arg: 'response', type: 'FinancierTeam', root: true },
  });

  financier.getAllTeamsPerformance = (ctx, financierId, userId, filter, callback) => {
    const financierService = new FinancierService(financierId, ctx.res.locals.user);
    financierService.getAllTeamsPerformance(userId, filter, callback);
  };

  financier.remoteMethod('getMonthlyPerformanceOfTeam', {
    description: 'To get monthly-performance of team using team-id',
    accepts: [
      { arg: 'financierId', type: 'string', required: true },
      { arg: 'teamId', type: 'string', required: true },
      {
        arg: 'filter', type: 'DateFilter', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:financierId/teams/:teamId/monthlyPerformance', verb: 'POST' },
    returns: { arg: 'response', type: 'object', root: true },
  });

  financier.getMonthlyPerformanceOfTeam = (financierId, teamId, filter, callback) => {
    const financierService = new FinancierService(financierId);
    financierService.getMonthlyPerformanceOfTeam(teamId, filter, callback);
  };

  financier.remoteMethod('getLeadSummaryBasedOnMembers', {
    description: 'To get lead summary based on members',
    accepts: [
      { arg: 'financierId', type: 'string', required: true },
      { arg: 'teamId', type: 'string', required: true },
      {
        arg: 'filter', type: 'DateAndMemberFilter', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:financierId/teams/:teamId/leadSummary', verb: 'POST' },
    returns: { arg: 'response', type: 'Users', root: true },
  });

  financier.getLeadSummaryBasedOnMembers = (financierId, teamId, filter, callback) => {
    const financierService = new FinancierService(financierId);
    financierService.getLeadSummaryBasedOnMembers(teamId, filter, callback);
  };

  financier.remoteMethod('getLeadSummaryBasedOnTeams', {
    description: 'To get lead summary based on teams',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      { arg: 'financierId', type: 'string', required: true },
      {
        arg: 'filter', type: 'DateAndTeamFilter', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:financierId/overall/leadSummary', verb: 'POST' },
    returns: { arg: 'response', type: 'FinancierTeam', root: true },
  });

  financier.getLeadSummaryBasedOnTeams = (ctx, financierId, filter, callback) => {
    const financierService = new FinancierService(financierId);
    financierService.getLeadSummaryBasedOnTeams(ctx.res.locals.user.id, filter, callback);
  };

  financier.remoteMethod('getInterestDetails', {
    description: 'To get interest detail using financier-id',
    accepts: [
      { arg: 'financierId', type: 'string', required: true },
    ],
    http: { path: '/:financierId/interestDetails', verb: 'GET' },
    returns: { arg: 'response', type: 'Financier', root: true },
  });

  /**
   * Get financier with interest details
   * @param  {String}   financierId
   * @param  {Function} callback
   * @return {Financier} financier
   * @author Ponnuvel G
   */
  financier.getInterestDetails = (financierId, callback) => {
    const financierService = new FinancierService(financierId);
    financierService.getInterestDetails(callback);
  };

  financier.remoteMethod('getLeadSummaryBasedOnDealers', {
    description: 'To get lead summary based on dealership within a team',
    accepts: [
      { arg: 'financierId', type: 'string', required: true },
      { arg: 'teamId', type: 'string', required: true },
      {
        arg: 'filter', type: 'DateFilter', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:financierId/teams/:teamId/dealers/leadSummary', verb: 'POST' },
    returns: { arg: 'response', type: 'Dealer', root: true },
  });

  financier.getLeadSummaryBasedOnDealers = (financierId, teamId, filter, callback) => {
    const financierService = new FinancierService(financierId);
    financierService.getLeadSummaryBasedOnDealers(teamId, filter, callback);
  };

  financier.remoteMethod('getDealershipPerformanceBySales', {
    description: 'To get dealership performance by sales-user',
    accepts: [
      { arg: 'financierId', type: 'string', required: true },
      { arg: 'userId', type: 'string', required: true },
      {
        arg: 'filter', type: 'DateFilter', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:financierId/Users/:userId/dealershipPerformance', verb: 'POST' },
    returns: { arg: 'response', type: 'Dealer', root: true },
  });

  financier.getDealershipPerformanceBySales = (financierId, userId, filter, callback) => {
    const financierService = new FinancierService(financierId);
    financierService.getDealershipPerformanceBySales(userId, filter, callback);
  };

  financier.remoteMethod('getDealershipMonthlyReport', {
    description: 'To get dealership based monthly sales report',
    accepts: [
      { arg: 'financierId', type: 'string', required: true },
      { arg: 'dealerId', type: 'string', required: true },
      {
        arg: 'filter', type: 'DateFilter', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:financierId/Dealers/:dealerId/monthlySummary', verb: 'POST' },
    returns: { arg: 'response', type: 'object', root: true },
  });

  financier.getDealershipMonthlyReport = (financierId, dealerId, filter, callback) => {
    const financierService = new FinancierService(financierId);
    financierService.getDealershipMonthlyReport(dealerId, filter, callback);
  };

  financier.remoteMethod('getDealershipLeadEffectiveness', {
    description: 'To get dealership lead effectiveness based on filter',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      { arg: 'financierId', type: 'string', required: true },
      {
        arg: 'filter', type: 'DealershipLeadEffectiveness', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:financierId/dealership/leadEffectiveness', verb: 'POST' },
    returns: { arg: 'response', type: 'Dealer', root: true },
  });

  financier.getDealershipLeadEffectiveness = (ctx, financierId, filter, callback) => {
    const financierService = new FinancierService(financierId);
    financierService.getDealershipLeadEffectiveness(ctx.res.locals.user, filter, callback);
  };

  /**
   * To get a list of financier sales-executives and team-leads assigned to
   * this dealership by financier-is and dealer-id
   *
   * @param  {string}  financierId                             financier-id
   * @param  {string} financierTeamId                     financier-team-id
   * @param  {function} callback                                   callback
   * @author Jaiyashree Subramanian
   */
  financier.remoteMethod('getExecutivesAssociated', {
    description: 'Get list-of executives and team-heads associated to the dealership',
    accepts: [
      { arg: 'financierId', type: 'string', required: true },
      { arg: 'financierTeamId', type: 'string', required: true },
    ],
    http: { path: '/:financierId/team/:financierTeamId/users', verb: 'GET' },
    returns: { arg: 'salesExecutives', type: 'object', root: true },
  });

  financier.getExecutivesAssociated = (financierId, financierTeamId, callback) => {
    const financierService = new FinancierService(financierId);
    financierService.getExecutivesAssociated(financierTeamId, callback);
  };

  financier.remoteMethod('getActiveIncentive', {
    description: 'To get active incentive rate',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      { arg: 'financierId', type: 'string', required: true },
    ],
    http: { path: '/:financierId/activeIncentive', verb: 'GET' },
    returns: { arg: 'lead', type: 'FinancierIncentive', root: true },
  });

  financier.getActiveIncentive = (ctx, financierId, callback) => {
    const financierTargetService = new FinancierTargetService(financierId, ctx.res.locals.user);
    financierTargetService.getActiveIncentive(callback);
  };

  financier.remoteMethod('updateFinancierIncentive', {
    description: 'To update incentive rate of a financier',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      { arg: 'financierId', type: 'string', required: true },
      {
        arg: 'financierIncentive', type: 'FinancierIncentive', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:financierId/incentives/update', verb: 'POST' },
    returns: { arg: 'lead', type: 'FinancierIncentive', root: true },
  });

  financier.updateFinancierIncentive = (ctx, financierId, financierIncentive, callback) => {
    const financierTargetService = new FinancierTargetService(financierId, ctx.res.locals.user);
    financierTargetService.updateFinancierIncentive(financierIncentive, callback);
  };

  financier.remoteMethod('getRoles', {
    description: 'To get all financier roles',
    accepts: [],
    http: { path: '/roles', verb: 'GET' },
    returns: { arg: 'roles', type: ['Roles'], root: true },
  });

  /**
   * Get list of roles under the dealer
   * @param  {Function} callback
   * @return {Array} List of roles
   */
  financier.getRoles = (callback) => {
    const financierService = new FinancierService();
    financierService.getRoles(callback);
  };

  financier.remoteMethod('sendCredentials', {
    description: 'To send credentials to a financier user',
    accepts: [
      { arg: 'financierId', type: 'string', required: true },
      { arg: 'userId', type: 'string', required: true },
    ],
    http: { path: '/:financierId/user/:userId/sendCredentials', verb: 'put' },
    returns: { arg: 'msg', type: 'string', root: true },
  });

  /**
   * Send Credentials to Financier executives
   * @param  {String}   financierId
   * @param  {String}   userId
   * @param  {Function} callback
   * @return {Object}
   * @author Ponnuvel G
   */
  financier.sendCredentials = (financierId, userId, callback) => {
    const customerService = new CustomerService(userId);
    customerService.sendFinancierCredentials(callback);
  };

  financier.remoteMethod('createFinancierUser', {
    description: 'To create a financier user',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      { arg: 'financierId', type: 'string', required: true },
      {
        arg: 'data', type: 'Users', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:financierId/addUser', verb: 'POST' },
    returns: { arg: 'response', type: 'Users', root: true },
  });

  financier.createFinancierUser = (ctx, financierId, data, callback) => {
    const financierService = new FinancierService(financierId, ctx.res.locals.user);
    financierService.createFinancierMember(data, data.role, callback);
  };

  financier.remoteMethod('deleteFinancierUser', {
    description: 'To delete a financier user',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      { arg: 'userId', type: 'string', required: true },
    ],
    http: { path: '/members/:userId', verb: 'DELETE' },
    returns: { arg: 'response', type: 'string', root: true },
  });

  financier.deleteFinancierUser = (ctx, userId, callback) => {
    const financierService = new FinancierService(ctx.res.locals.user.user_type_id);
    financierService.deleteFinancierUser(userId, callback);
  };

  financier.remoteMethod('getFinancierUsers', {
    description: 'To get all financier users based on filter',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      { arg: 'roleName', type: 'string', required: true },
      {
        arg: 'filter', type: 'FinancierIncentive', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/active-users/:roleName', verb: 'POST' },
    returns: { arg: 'response', type: 'Users', root: true },
  });

  financier.getFinancierUsers = (ctx, roleName, filter, callback) => {
    const financierService =
      new FinancierService(ctx.res.locals.user.user_type_id, ctx.res.locals.user);
    financierService.getFinancierUsersList(roleName, filter, callback);
  };
};
