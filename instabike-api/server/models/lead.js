const AuditUtil = require('../utils/audit-utils');
const LeadService = require('../services/lead_service.js');
const LeadActivityService = require('../services/lead_activity_service.js');
const ProformaInvoiceService = require('../services/proforma_invoice_service.js');

module.exports = (Lead) => {
  const lead = Lead;
  /**
   * Updates the log field values
   * @param  {Object}   ctx       database context of the model instance
   * @param  {Function} callback                                callback
   * @author Jaiyashree Subramanian
   */
  lead.observe('before save', (ctx, next) => {
    const auditUtil = new AuditUtil();
    auditUtil.persistInstanceUpdatedAt('Lead', ctx, next);
  });

  lead.beforeRemote('prototype.patchAttributes', (context, modelInstance, next) => {
    const currentUser = context.res.locals.user;
    const leadActivityService = new LeadActivityService(context.args.data.id);
    leadActivityService.saveLeadActivity(context.args.data, currentUser, next);
  });

  lead.remoteMethod('fetchLeadsByStatus', {
    description: 'To fetch leads-list based on status',
    accepts: [
      { arg: 'context', type: 'object', http: { source: 'context' } },
      { arg: 'leadStatus', type: 'string', required: true },
      {
        arg: 'leadReason', type: 'string', required: true, http: { source: 'query' },
      },
      {
        arg: 'limit', type: 'string', http: { source: 'query' }, required: true,
      },
      {
        arg: 'skip', type: 'string', http: { source: 'query' }, required: true,
      },
    ],
    http: { path: '/status/:leadStatus', verb: 'GET' },
    returns: { arg: 'lead', type: 'LeadWithDetail', root: true },
  });

  lead.fetchLeadsByStatus = (context, leadStatus, leadReason, limit, skip, callback) => {
    const leadService = new LeadService(null, null, context.res.locals.user);
    leadService.fetchLeadsByStatus(leadStatus, leadReason, limit, skip, callback);
  };

  lead.remoteMethod('createNewLead', {
    description: 'To create a new lead for the corresponding logged-in dealer',
    accepts: [
      { arg: 'context', type: 'object', http: { source: 'context' } },
      { arg: 'leadObj', type: 'Lead', required: true },
    ],
    http: { path: '/create', verb: 'post' },
    returns: { arg: 'lead', type: 'Lead', root: true },
  });

  lead.createNewLead = (context, leadObj, callback) => {
    const leadService = new LeadService(null, leadObj);
    leadService.createNewLead(context.res.locals.user, callback);
  };

  lead.remoteMethod('getLeadsCountByStatus', {
    description: 'To get leads count based on status and the filter applied',
    accepts: [
      { arg: 'context', type: 'object', http: { source: 'context' } },
      {
        arg: 'filter', type: 'LeadsCountByStatus', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/statusCount', verb: 'post' },
    returns: { arg: 'lead', type: 'Lead', root: true },
  });

  lead.getLeadsCountByStatus = (context, filter, callback) => {
    const leadService = new LeadService(null, null, context.res.locals.user);
    leadService.getLeadsCountByStatus(filter, callback);
  };

  lead.remoteMethod('fetchLeadsByFilter', {
    description: 'To get leads based on the filter applied',
    accepts: [
      { arg: 'context', type: 'object', http: { source: 'context' } },
      {
        arg: 'filterObject', type: 'LeadsListByStatus', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/filter', verb: 'post' },
    returns: { arg: 'msg', type: 'object', root: true },
  });

  lead.fetchLeadsByFilter = (context, filterObject, callback) => {
    const leadService = new LeadService(null, null, context.res.locals.user);
    leadService.fetchLeadsByFilter(filterObject, callback);
  };

  lead.remoteMethod('priceBreakDown', {
    description: 'To get price breakdown for a specific lead and lead-detail',
    accepts: [
      { arg: 'leadId', type: 'string', required: true },
      { arg: 'leadDetailId', type: 'string', required: true },
    ],
    http: { path: '/:leadId/leadDetail/:leadDetailId/priceBreakDown', verb: 'GET' },
    returns: { arg: 'proformaInvoice', type: 'ProformaInvoiceDetail', root: true },
  });

  /**
   * get price break down for the specified vehicle
   * for lead and proformainvoice will be generated
   * based on this.
   * @param  {string}   leadId       [description]
   * @param  {string}   leadDetailId [description]
   * @param  {Function} callback     [description]
   * @return {object}   ProformaInvoiceDetail
   * @author shahul hameed b
   */
  lead.priceBreakDown = (leadId, leadDetailId, callback) => {
    const proformaInvoiceService = new ProformaInvoiceService(null, leadId, leadDetailId);
    proformaInvoiceService.getPriceBreakDown(callback);
  };

  lead.remoteMethod('getInShowroomLeadsByToday', {
    description: 'To get the in-showroom leads list based on logged-in user',
    accepts: [
      { arg: 'context', type: 'object', http: { source: 'context' } },
    ],
    http: { path: '/inShowroom', verb: 'GET' },
    returns: { arg: 'leads', type: 'LeadsByCategory', root: true },
  });

  /**
   * get leads created in showroom by today
   * @param  {Function} callback
   * @return {object}   leads
   * @author Vishesh Sagar
   */
  lead.getInShowroomLeadsByToday = (context, callback) => {
    const leadService = new LeadService(null, null, context.res.locals.user);
    leadService.getInShowroomLeadsByToday(callback);
  };

  lead.remoteMethod('getDetails', {
    description: 'To get complete detail of the lead by using lead-id',
    accepts: [
      { arg: 'context', type: 'object', http: { source: 'context' } },
      { arg: 'leadId', type: 'string', required: true },
    ],
    http: { path: '/:leadId', verb: 'GET' },
    returns: { arg: 'lead', type: ['LeadWithDetail'], root: true },
  });

  /**
   * Get Lead and Lead Details
   * @param  {string}   leadId
   * @param  {Function} callback
   * @return {Lead}
   * @author Ponnuvel G
   */
  lead.getDetails = (context, leadId, callback) => {
    const leadService = new LeadService(leadId, null, context.res.locals.user);
    leadService.getDetails(callback);
  };

  lead.remoteMethod('leadDetail', {
    accepts: [
      { arg: 'context', type: 'object', http: { source: 'context' } },
      { arg: 'leadId', type: 'string', required: true },
      {
        arg: 'leadDetail', type: 'LeadDetail', http: { source: 'body' }, required: true,
      },
    ],
    description: ['Create Lead Details'],
    http: { path: '/:leadId/leadDetail', verb: 'POST' },
    returns: { arg: 'response', type: 'LeadDetail', root: true },
  });

  /**
   * Create LeadDetail
   * @param  {string}   leadId
   * @param  {LeadDetail}   leadDetail
   * @param  {Function} callback
   * @return {LeadDetail}
   * @author Ponnuvel G
   */
  lead.leadDetail = (context, leadId, leadDetail, callback) => {
    const leadService = new LeadService(leadId);
    leadService.leadDetail(leadDetail, context.res.locals.user, callback);
  };

  lead.remoteMethod('lost', {
    accepts: [
      { arg: 'context', type: 'object', http: { source: 'context' } },
      { arg: 'leadId', type: 'string', required: true },
      { arg: 'lostReasonId', type: 'string', required: true },
      {
        arg: 'lostReason', type: 'object', required: false, http: { source: 'body' },
      },
    ],
    description: ['Change the lead and lead vehicle status as Lost'],
    http: { path: '/:leadId/lostReason/:lostReasonId', verb: 'PUT' },
    returns: { arg: 'response', type: ['LeadWithDetail'], root: true },
  });

  /**
   * Change the lead and lead vehicle status as lost
   * @param  {string}   leadId
   * @param  {Function} callback
   * @return {LeadWithDetail}
   * @author Ponnuvel G
   */
  lead.lost = (context, leadId, lostReasonId, lostReason, callback) => {
    const leadService = new LeadService(leadId);
    leadService.markAsLost(context.res.locals.user, lostReasonId, lostReason.text, callback);
  };

  lead.remoteMethod('getFollowupLeadsByToday', {
    accepts: [
      { arg: 'context', type: 'object', http: { source: 'context' } },
    ],
    description: ['Get list of leads need to be follow up today'],
    http: { path: '/followup/today', verb: 'GET' },
    returns: { arg: 'followps', type: 'LeadsByFollowup', root: true },
  });

  /**
   * Get leads based on the followup needs to be done today
   * @param  {Function} callback
   * @return {LeadsByFollowup}
   * @author Ponnuvel G
   */
  lead.getFollowupLeadsByToday = (context, callback) => {
    const leadService = new LeadService(null, null, context.res.locals.user);
    leadService.getFollowupLeadsByToday(callback);
  };

  lead.remoteMethod('getFollowupDoneLeadsByToday', {
    accepts: [
      { arg: 'context', type: 'object', http: { source: 'context' } },
    ],
    description: ['Get list of leads followup done by today'],
    http: { path: '/followup/done', verb: 'GET' },
    returns: { arg: 'followps', type: 'LeadsByCategory', root: true },
  });

  /**
   * Get leads based on the followup done by today
   * @param  {Function} callback
   * @return {LeadsByCategory}
   * @author Ponnuvel G
   */
  lead.getFollowupDoneLeadsByToday = (context, callback) => {
    const leadService = new LeadService(null, null, context.res.locals.user);
    leadService.getFollowupDoneLeadsByToday(callback);
  };

  lead.remoteMethod('getLeadsCountByToday', {
    description: 'To get leads count created today based on current status',
    accepts: [
      { arg: 'context', type: 'object', http: { source: 'context' } },
    ],
    http: { path: '/type/count', verb: 'GET' },
    returns: { arg: 'count', type: 'LeadsCountByToday', root: true },
  });

  /**
   * get leads created count by today
   * @param  {Function} callback
   * @return {LeadsCountByToday}
   * @author Ponnuvel G
   */
  lead.getLeadsCountByToday = (context, callback) => {
    const leadService = new LeadService(null, null, context.res.locals.user);
    leadService.getLeadsCountByToday(callback);
  };

  lead.remoteMethod('getFollowupCountByToday', {
    description: 'To get number of follow-ups to be taken today',
    accepts: [
      { arg: 'context', type: 'object', http: { source: 'context' } },
    ],
    http: { path: '/followup/count', verb: 'GET' },
    returns: { arg: 'count', type: 'FollowupCountByToday', root: true },
  });

  /**
   * Get leads follow need to be done and done by today
   * @param  {Function} callback
   * @return {FollowupCountByToday}
   * @author Ponnuvel G
   */
  lead.getFollowupCountByToday = (context, callback) => {
    const leadService = new LeadService(null, null, context.res.locals.user);
    leadService.getFollowupCountByToday(callback);
  };

  lead.remoteMethod('scheduleFollowup', {
    accepts: [
      { arg: 'context', type: 'object', http: { source: 'context' } },
      {
        arg: 'followup', type: 'FollowUp', http: { source: 'body' }, required: true,
      },
      {
        arg: 'leadId', type: 'string', required: true,
      },
    ],
    description: ['schedule a follow-up'],
    http: { path: '/:leadId/followup', verb: 'post' },
    returns: { arg: 'followup', type: 'FollowUp', root: true },
  });

  /**
   * schedule a follow-up
   * @param  {object} followup
   * @param  {string} leadId
   * @param  {Function} callback
   * @return {FollowUp}
   * @author Vishesh G
   */
  lead.scheduleFollowup = (context, followup, leadId, callback) => {
    const leadService = new LeadService(leadId, null, context.res.locals.user);
    leadService.scheduleFollowup(followup, callback);
  };

  lead.remoteMethod('markFollowupComplete', {
    accepts: [
      { arg: 'context', type: 'object', http: { source: 'context' } },
      {
        arg: 'followup', type: 'object', http: { source: 'body' }, required: true,
      },
      {
        arg: 'followupId', type: 'string', required: true,
      },
      {
        arg: 'leadId', type: 'string', required: true,
      },
    ],
    description: ['mark Followup Complete'],
    http: { path: '/:leadId/followup/:followupId', verb: 'PUT' },
    returns: { arg: 'response', type: 'object', root: true },
  });

  /**
   * mark Followup Complete
   * @param  {object} followup
   * @param  {string} followupId
   * @param  {string} leadId
   * @param  {Function} callback
   * @return {FollowUp}
   * @author Vishesh G
   */
  lead.markFollowupComplete = (context, followup, followupId, leadId, callback) => {
    const leadService = new LeadService(leadId, null, context.res.locals.user);
    leadService.markFollowupComplete(followup, followupId, callback);
  };

  lead.remoteMethod('getActivity', {
    description: 'To get complete activity of a lead by using lead-id',
    accepts: [
      { arg: 'leadId', type: 'string', required: true },
    ],
    http: { path: '/:leadId/activities', verb: 'GET' },
    returns: { arg: 'activities', type: 'LeadActivityDetail', root: true },
  });

  /**
   * Get Lead Activity
   * @param  {string}   leadId
   * @param  {Function} callback
   * @return {[type]}
   * @author Ponnuvel G
   */
  lead.getActivity = (leadId, callback) => {
    const leadActivityService = new LeadActivityService(leadId);
    leadActivityService.getActivity(callback);
  };

  lead.remoteMethod('addCommentToLead', {
    accepts: [
      { arg: 'context', type: 'object', http: { source: 'context' } },
      {
        arg: 'leadActivity', type: 'LeadActivity', http: { source: 'body' }, required: true,
      },
      {
        arg: 'leadId', type: 'string', required: true,
      },
    ],
    description: ['add comment to lead'],
    http: { path: '/:leadId/comment', verb: 'POST' },
    returns: { arg: 'leadActivity', type: 'LeadActivity', root: true },
  });

  /**
   * add comment to lead
   * @param  {LeadActivity} leadActivity
   * @param  {string} leadId
   * @param  {Function} callback
   * @return {LeadActivity}
   * @author Vishesh s
   */
  lead.addCommentToLead = (context, leadActivity, leadId, callback) => {
    const leadService = new LeadService(leadId, null, context.res.locals.user);
    leadService.addCommentToLead(leadActivity, callback);
  };

  lead.remoteMethod('getMonthlySummary', {
    accepts: [
      { arg: 'context', type: 'object', http: { source: 'context' } },
    ],
    description: ['get monthly summary of leads'],
    http: { path: '/monthlySummary/count', verb: 'GET' },
    returns: { arg: 'response', type: 'object', root: true },
  });

  /**
   * get monthly summary of leads
   * @param  {Function} callback
   * @return {object}
   * @author Vishesh s
   */
  lead.getMonthlySummary = (context, callback) => {
    const leadService = new LeadService(null, null, context.res.locals.user);
    leadService.getMonthlySummary(callback);
  };

  lead.remoteMethod('updateLeadVehicleStatusAsLost', {
    accepts: [
      { arg: 'context', type: 'object', http: { source: 'context' } },
      { arg: 'leadId', type: 'string', required: true },
      { arg: 'leadDetailId', type: 'string', required: true },
      {
        arg: 'saveLead', type: 'object', required: true, http: { source: 'body' },
      },
    ],
    description: ['update all the lead details vehicle status except the lead detail id as lost'],
    http: { path: '/:leadId/leadDetail/:leadDetailId/invoiced', verb: 'PUT' },
    returns: { arg: 'msg', type: 'string', root: true },
  });

  /**
   * update all the lead details vehicle status as lost
   * @param  {string} leadId
   * @param  {string} leadDetailId
   * @param  {Function} callback
   * @return {LeadDetail}
   * @author Jagajeevan
   */
  lead.updateLeadVehicleStatusAsLost = (context, leadId, leadDetailId, saveLead, callback) => {
    const leadService = new LeadService(leadId, null, context.res.locals.user);
    leadService.updateLeadVehicleStatusAsLost(leadDetailId, saveLead, callback);
  };

  lead.remoteMethod('updateLeadVehicleAsDeleted', {
    accepts: [
      { arg: 'context', type: 'object', http: { source: 'context' } },
      {
        arg: 'leadId', type: 'string', required: true,
      },
      {
        arg: 'leadDetailId', type: 'string', required: true,
      },
    ],
    description: ['update lead details vehicle as deleted'],
    http: { path: '/:leadId/leadDetailId/:leadDetailId', verb: 'PUT' },
    returns: { arg: 'leadDetails', type: 'LeadDetail', root: true },
  });

  /**
   * update all the lead details vehicle status as lost
   * @param  {string} leadId
   * @param  {string} leadDetailId
   * @param  {Function} callback
   * @return {LeadDetail}
   * @author Jagajeevan
   */
  lead.updateLeadVehicleAsDeleted = (context, leadId, leadDetailId, callback) => {
    const leadService = new LeadService(leadId, null, context.res.locals.user);
    leadService.updateLeadVehicleAsDeleted(leadId, leadDetailId, callback);
  };

  /**
   * Hook method to return the lead data after the update
   * @param  {object}   context
   * @param  {object}   modelInstance
   * @param  {Function} next
   * @author Jagajeevan
   */
  lead.afterRemote('prototype.patchAttributes', (ctx, responseObject, next) => {
    const leadService = new LeadService(ctx.args.data.id);
    leadService.getLeadDetails(ctx, next);
  });

  lead.remoteMethod('updateTargetAchievedForNewSales', {
    accepts: [
      { arg: 'context', type: 'object', http: { source: 'context' } },
      {
        arg: 'leadId', type: 'string', required: true,
      },
      {
        arg: 'dealerSalesId', type: 'string', required: true,
      },
    ],
    description: ['update lead assignee'],
    http: { path: '/:leadId/assignedTo/:dealerSalesId', verb: 'GET' },
    returns: { arg: 'lead', type: 'Lead', root: true },
  });

  /**
   * Update the lead assignee and target.
   *
   * @param  {string} leadId
   * @param  {string} dealerSalesId
   * @param  {Function} callback
   * @author Ajaykkumar Rajendran
   */
  lead.updateTargetAchievedForNewSales = (context, leadId, dealerSalesId, callback) => {
    const leadService = new LeadService(leadId, null, context.res.locals.user);
    leadService.updateTargetAchievedForNewSales(dealerSalesId, callback);
  };

  lead.remoteMethod('updateLead', {
    description: 'To update a lead by using lead-properties',
    accepts: [
      { arg: 'context', type: 'object', http: { source: 'context' } },
      { arg: 'leadId', type: 'string', required: true },
      {
        arg: 'leadObj', type: 'Lead', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:leadId/update', verb: 'put' },
    returns: { arg: 'lead', type: 'Lead', root: true },
  });

  lead.updateLead = (context, leadId, leadObj, callback) => {
    const leadService = new LeadService(leadId, leadObj, context.res.locals.user);
    leadService.updateLead(callback);
  };
};
