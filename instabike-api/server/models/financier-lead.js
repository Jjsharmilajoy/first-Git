const AuditUtil = require('../utils/audit-utils');
const FinancierLeadService = require('../services/financier_lead_service.js');
const LeadActivityService = require('../services/lead_activity_service.js');
const FinancierTargetService = require('../services/financier_target_service.js');

module.exports = (FinancierLead) => {
  const financierLead = FinancierLead;
  /**
   * Updates the log field values
   * @param  {Object}   ctx       database context of the model instance
   * @param  {Function} callback                                callback
   * @author Jaiyashree Subramanian
   */
  financierLead.observe('before save', (ctx, next) => {
    const auditUtil = new AuditUtil();
    auditUtil.persistInstanceUpdatedAt('FinancierLead', ctx, next);
  });

  financierLead.remoteMethod('fetchFinancierLeadsByStatus', {
    description: 'To get list of financier-leads by status and filter',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      { arg: 'leadStatus', type: 'string', required: true },
      {
        arg: 'filterObject', type: 'Object', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/status/:leadStatus', verb: 'POST' },
    returns: { arg: 'lead', type: 'FinancierLeadWithDetail', root: true },
  });

  financierLead.fetchFinancierLeadsByStatus = (ctx, leadStatus, filterObject, callback) => {
    const financierLeadService = new FinancierLeadService(null, null, ctx.res.locals.user);
    financierLeadService.fetchFinancierLeadsByStatus(leadStatus, filterObject, callback);
  };

  financierLead.remoteMethod('financierLeadCountByStatus', {
    description: 'To get count of financier-leads by status and filter',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      {
        arg: 'filter', type: 'object', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/statusCount', verb: 'post' },
    returns: { arg: 'lead', type: 'object', root: true },
  });

  financierLead.financierLeadCountByStatus = (ctx, filter, callback) => {
    const financierLeadService = new FinancierLeadService(null, null, ctx.res.locals.user);
    financierLeadService.financierLeadCountByStatus(filter, callback);
  };

  financierLead.remoteMethod('getFinancierLeadDetails', {
    description: 'To get details of financier-leads by id',
    accepts: [
      { arg: 'id', type: 'string', required: true },
    ],
    http: { path: '/:id', verb: 'GET' },
    returns: { arg: 'lead', type: 'FinancierLeadWithDetail', root: true },
  });

  /**
   * Get Lead and Lead Details
   * @param  {string}   id
   * @param  {Function} callback
   * @return {object}
   * @author Jagajeevan
   */
  financierLead.getFinancierLeadDetails = (id, callback) => {
    const financierLeadService = new FinancierLeadService(id);
    financierLeadService.getFinancierLeadDetails(callback);
  };

  financierLead.beforeRemote('prototype.patchAttributes', (context, modelInstance, next) => {
    const leadActivityService = new LeadActivityService(context.args.data.id);
    leadActivityService.saveFinancierLeadActivity(context.args.data, context.res.locals.user, next);
  });

  financierLead.remoteMethod('fetchLeadsByFilter', {
    description: 'To get financier-leads by filter',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      {
        arg: 'filterObject', type: 'Object', http: { source: 'body' }, required: true,
      },
      {
        arg: 'req', type: 'Object', http: { source: 'req' }, required: true,
      },
    ],
    http: { path: '/filter', verb: 'post' },
    returns: { arg: 'lead', type: 'object', root: true },
  });

  financierLead.fetchLeadsByFilter = (ctx, filterObject, req, callback) => {
    const financierLeadService = new FinancierLeadService(null, null, ctx.res.locals.user);
    financierLeadService.fetchLeadsByFilter(filterObject, req.headers, callback);
  };

  financierLead.remoteMethod('getActivity', {
    description: 'To get financier-lead-activity by financier-lead-id',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      { arg: 'id', type: 'string', required: true },
    ],
    http: { path: '/:id/activities', verb: 'GET' },
    returns: { arg: 'activities', type: 'FinancierLeadActivityDetail', root: true },
  });

  /**
   * Get Lead Activity
   * @param  {string}   leadId
   * @param  {Function} callback
   * @return {[type]}
   * @author Jagajeevan
   */
  financierLead.getActivity = (ctx, id, callback) => {
    const leadActivityService = new LeadActivityService(null, ctx.res.locals.user);
    leadActivityService.getFinancierLeadActivity(id, callback);
  };

  financierLead.remoteMethod('addCommentToLead', {
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      {
        arg: 'leadActivity', type: 'LeadActivity', http: { source: 'body' }, required: true,
      },
      {
        arg: 'id', type: 'string', required: true,
      },
    ],
    description: ['add comment to financier lead'],
    http: { path: '/:id/comment', verb: 'POST' },
    returns: { arg: 'leadActivity', type: 'FinancierLeadActivityDetail', root: true },
  });

  /**
 * add comment to lead
 * @param  {LeadActivity} leadActivity
 * @param  {string} id
 * @param  {Function} callback
 * @return {LeadActivity}
 * @author Jagajeevan
 */
  financierLead.addCommentToLead = (ctx, leadActivity, id, callback) => {
    const financierLeadService = new FinancierLeadService(id, null, ctx.res.locals.user);
    financierLeadService.addCommentToLead(leadActivity, callback);
  };

  financierLead.remoteMethod('scheduleFollowup', {
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      {
        arg: 'followup', type: 'FollowUp', http: { source: 'body' }, required: true,
      },
      {
        arg: 'id', type: 'string', required: true,
      },
    ],
    description: ['schedule a follow-up for financier lead'],
    http: { path: '/:id/followup', verb: 'post' },
    returns: { arg: 'followup', type: 'FollowUp', root: true },
  });

  /**
   * schedule a follow-up
   * @param  {object} followup
   * @param  {string} leadId
   * @param  {Function} callback
   * @return {FollowUp}
   * @author Jagajeevan
   */
  financierLead.scheduleFollowup = (ctx, followup, id, callback) => {
    const financierLeadService = new FinancierLeadService(id, null, ctx.res.locals.user);
    financierLeadService.scheduleFollowup(followup, callback);
  };

  /**
   * Hook method to update sales & team targets, while lead is converted
   * @param  {object}   context
   * @param  {object}   responseObject
   * @param  {Function} next
   * @author Jagajeevan
   */
  financierLead.afterRemote('prototype.patchAttributes', (ctx, responseObject, next) => {
    const financierTargetService = new FinancierTargetService(null, ctx.res.locals.user);
    financierTargetService.updateMonthlyTargets(ctx, responseObject, next);
  });
};
