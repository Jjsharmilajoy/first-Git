const AuditUtil = require('../utils/audit-utils');
const LeadDetailService = require('../services/lead_detail_service');

module.exports = (LeadDetail) => {
  const leadDetail = LeadDetail;
  /**
   * Updates the log field values
   * @param  {Object}   ctx       database context of the model instance
   * @param  {Function} callback                                callback
   * @author Jaiyashree Subramanian
   */
  leadDetail.observe('before save', (ctx, next) => {
    const auditUtil = new AuditUtil();
    auditUtil.persistInstanceUpdatedAt('LeadDetail', ctx, next);
  });

  leadDetail.remoteMethod('updateLeadDetail', {
    description: 'Upate Lead Details',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      { arg: 'id', type: 'string', required: true },
      {
        arg: 'leadDetail', type: 'LeadDetail', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:id', verb: 'PUT' },
    returns: { arg: 'leadDetail', type: 'LeadDetail', root: true },
  });

  /**
   * Update Lead Details
   * @param  {String}   id
   * @param  {LeadDetail}   leadDetails
   * @param  {Function} callback
   * @return {LeadDetail}
   */
  leadDetail.updateLeadDetail = (ctx, id, leadDetails, callback) => {
    const leadDetailService = new LeadDetailService(
      id, ctx.res.locals.user.user_type_id, null,
      ctx.res.locals.user,
    );
    leadDetailService.updateLeadDetail(leadDetails, callback);
  };

  leadDetail.remoteMethod('currentWeekSlots', {
    description: 'Get current week slots',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      { arg: 'dealerId', type: 'string', required: true },
      { arg: 'vehicleId', type: 'string', required: true },
    ],
    http: { path: '/dealer/:dealerId/vehicle/:vehicleId', verb: 'GET' },
    returns: { arg: 'slots', type: 'TestRideWeeklySlot', root: true },
  });

  /**
   * To get the current week test ride slots and its availability
   *
   * @param  {String} dealerId
   * @param  {String} vehicleId
   * @return {Function} callback
   * @author Jagajeevan
   */
  leadDetail.currentWeekSlots = (ctx, dealerId, vehicleId, callback) => {
    const leadDetailService = new LeadDetailService(null, dealerId, vehicleId);
    leadDetailService.getCurrentWeekSlots(ctx.res.locals.user, callback);
  };

  leadDetail.remoteMethod('slotsByDate', {
    description: 'Get vehicle slots by date',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      { arg: 'dealerId', type: 'string', required: true },
      { arg: 'vehicleId', type: 'string', required: true },
      {
        arg: 'dataFilter', type: 'object', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/dealer/:dealerId/vehicle/:vehicleId', verb: 'POST' },
    returns: { arg: 'slots', type: 'TestRideDailySlot', root: true },
  });

  /**
   * To get the current week test ride slots and its availability
   *
   * @param  {String} dealerId
   * @param  {String} vehicleId
   * @return {Function} callback
   * @author Jagajeevan
   */
  leadDetail.slotsByDate = (ctx, dealerId, vehicleId, dataFilter, callback) => {
    const leadDetailService = new LeadDetailService(null, dealerId, vehicleId);
    leadDetailService.slotsByDate(dataFilter, ctx.res.locals.user, callback);
  };

  leadDetail.remoteMethod('fetchTestRideByStatus', {
    description: 'Get test ride data by status',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      { arg: 'status', type: 'string', required: true },
      {
        arg: 'dataFilter', type: 'object', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/status/:status', verb: 'POST' },
    returns: { arg: 'slots', type: 'LeadWithLeadDetail', root: true },
  });

  /**
   * To get the current week test ride slots and its availability
   *
   * @param  {String} dealerId
   * @param  {String} vehicleId
   * @return {Function} callback
   * @author Jagajeevan
   */
  leadDetail.fetchTestRideByStatus = (ctx, status, dataFilter, callback) => {
    const leadDetailService = new LeadDetailService(null, ctx.res.locals.user.user_type_id);
    leadDetailService.getTestRideVehiclesByStatus(
      status, dataFilter, ctx.res.locals.user,
      callback,
    );
  };

  leadDetail.remoteMethod('testRideCount', {
    description: 'To get test-ride count based on filter',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      {
        arg: 'filter', type: 'Object', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/testRideCount', verb: 'post' },
    returns: { arg: 'count', type: 'FinancierLeadCountByStatus', root: true },
  });

  leadDetail.testRideCount = (ctx, filter, callback) => {
    const leadDetailService = new LeadDetailService(null, ctx.res.locals.user.user_type_id);
    leadDetailService.getTestRideCount(filter, ctx.res.locals.user, callback);
  };

  leadDetail.remoteMethod('bookTestRide', {
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      {
        arg: 'id', type: 'string', required: true,
      },
      {
        arg: 'leadDetail', type: 'object', required: true, http: { source: 'body' },
      },
    ],
    description: ['update the lead details test ride vehicle status'],
    http: { path: '/:id/bookTestRide', verb: 'PUT' },
    returns: { arg: 'leadDetails', type: 'string', root: true },
  });

  /**
   * update the lead details test ride vehicle status
   * @param  {string} leadDetailId
   * @return {LeadDetail}
   * @param  {Function} callback
   * @author Jagajeevan
   */
  leadDetail.bookTestRide = (ctx, id, leadDetails, callback) => {
    const leadDetailService = new LeadDetailService(
      null, ctx.res.locals.user.user_type_id, null,
      ctx.res.locals.user,
    );
    leadDetailService.updateTestRideVehicleStatus(id, leadDetails, callback);
  };

  leadDetail.remoteMethod('deleteLeadDetail', {
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      {
        arg: 'id', type: 'string', required: true,
      },
    ],
    description: ['soft delete lead detail'],
    http: { path: '/:id/delete', verb: 'PUT' },
    returns: { arg: 'leadDetails', type: 'string', root: true },
  });

  /**
   * Hook method to check the delete api
   * @param  {object}   context
   * @param  {object}   modelInstance
   * @param  {Function} next
   * @author Jagajeevan
   */
  leadDetail.deleteLeadDetail = (ctx, id, callback) => {
    const leadDetailService = new LeadDetailService(
      null, ctx.res.locals.user.user_type_id, null,
      ctx.res.locals.user,
    );
    leadDetailService.updateLeadDetailAsDeleted(id, callback);
  };
};
