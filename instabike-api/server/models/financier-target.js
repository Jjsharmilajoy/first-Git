const AuditUtil = require('../utils/audit-utils');
const FinancierTargetService = require('../services/financier_target_service');

module.exports = (FinancierTarget) => {
  const financierTarget = FinancierTarget;
  /**
   * Updates the log field values
   * @param  {Object}   ctx       database context of the model instance
   * @param  {Function} callback                                callback
   * @author Jaiyashree Subramanian
   */
  financierTarget.observe('before save', (ctx, next) => {
    const auditUtil = new AuditUtil();
    auditUtil.persistInstanceUpdatedAt('FinancierTarget', ctx, next);
  });

  /**
   * Hook method to insert active incentive for each new target created
   * or when incentive-eligibility is changed
   *
   * @param  {object}   context
   * @param  {object}   modelInstance
   * @param  {Function} next
   * @author Jaiyashree Subramanian
   */
  financierTarget.beforeRemote('patchOrCreate', (context, modelInstance, next) => {
    const financierTargetService = new FinancierTargetService(null, context.res.locals.user);
    if (context.args && context.args.data && !context.args.data.id) {
      financierTargetService.beforeCreateTarget(context.args.data, next);
    } else {
      financierTargetService.beforeUpdateTarget(context.args.data, next);
    }
  });

  financierTarget.remoteMethod('getTargetCompletion', {
    description: 'Get targets completion based on teams',
    accepts: [
      { arg: 'context', type: 'object', http: { source: 'context' } },
      { arg: 'financierId', type: 'string', required: true },
      {
        arg: 'filter', type: 'DateFilter', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:financierId/targetCompletion', verb: 'POST' },
    returns: { arg: 'response', type: 'object', root: true },
  });

  financierTarget.getTargetCompletion = (context, financierId, filter, callback) => {
    const currentUser = context.res.locals.user;
    const financierTargetService = new FinancierTargetService(financierId, currentUser);
    financierTargetService.getTargetCompletion(filter, callback);
  };

  financierTarget.remoteMethod('getSalesPerformance', {
    description: 'Get Sales Performance based on teams',
    accepts: [
      { arg: 'context', type: 'object', http: { source: 'context' } },
      { arg: 'financierId', type: 'string', required: true },
      {
        arg: 'filter', type: 'DateFilter', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:financierId/salesPerformance', verb: 'POST' },
    returns: { arg: 'response', type: 'object', root: true },
  });

  financierTarget.getSalesPerformance = (context, financierId, filter, callback) => {
    const currentUser = context.res.locals.user;
    const financierTargetService = new FinancierTargetService(financierId, currentUser);
    financierTargetService.getTeamSalesPerformance(filter, callback);
  };

  /**
   * Hook method to send mail if the target or incentive is updated
   * @param  {object}   context
   * @param  {object}   responseObject
   * @param  {Function} next
   * @author Jagajeevan
   */
  financierTarget.afterRemote('patchOrCreate', (ctx, responseObject, next) => {
    const currentUser = ctx.res.locals.user;
    const financierTargetService = new FinancierTargetService(null, currentUser);
    financierTargetService.sendEmailForTargets(ctx, responseObject, next);
  });
};
