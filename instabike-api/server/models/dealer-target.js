const AuditUtil = require('../utils/audit-utils');
const DealerTargetService = require('../services/dealer_target_service');

module.exports = (DealerTarget) => {
  const dealerTarget = DealerTarget;
  /**
   * Updates the log field values
   * @param  {Object}   ctx       database context of the model instance
   * @param  {Function} callback                                callback
   * @author Jaiyashree Subramanian
   */
  dealerTarget.observe('before save', (ctx, next) => {
    const auditUtil = new AuditUtil();
    auditUtil.persistInstanceUpdatedAt('DealerTarget', ctx, next);
  });

  dealerTarget.remoteMethod('getTargetDetails', {
    description: 'To get target details based on surrent logged-in user',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
    ],
    http: { path: '/details', verb: 'GET' },
    returns: { arg: 'dealer', type: 'object', root: true },
  });

  /**
   * To get dealer target by dealer-id based on filter
   *
   * @param  {string} dealerId                  dealer id
   * @param  {Function} callback                 callback
   * @author Ramanavel Selvaraju
   */
  dealerTarget.getTargetDetails = (ctx, callback) => {
    const dealerTargetService = new DealerTargetService(
      ctx.res.locals.user.user_type_id,
      ctx.res.locals.user,
    );
    dealerTargetService.getTargetDetails(null, callback);
  };

  dealerTarget.remoteMethod('getNames', {
    description: 'Get dealer targets by dealer id',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
    ],
    http: { path: '/', verb: 'GET' },
    returns: { arg: 'dealer', type: 'object', root: true },
  });

  dealerTarget.getNames = (ctx, callback) => {
    const dealerTargetService = new DealerTargetService(ctx.res.locals.user.user_type_id);
    dealerTargetService.getNames(callback);
  };

  dealerTarget.remoteMethod('getTargetCompletion', {
    description: 'Get targets completion based on dealer',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
    ],
    http: { path: '/dealers/:dealerId/target', verb: 'GET' },
    returns: { arg: 'dealer', type: 'object', root: true },
  });

  dealerTarget.getTargetCompletion = (ctx, callback) => {
    const dealerTargetService = new DealerTargetService(
      ctx.res.locals.user.user_type_id,
      ctx.res.locals.user,
    );
    dealerTargetService.getTargetCompletion(callback);
  };

  dealerTarget.remoteMethod('updateDealerTarget', {
    description: 'Update dealer sales targets',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      { arg: 'dealerSalesId', type: 'string', required: true },
      {
        arg: 'data', type: 'array', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/dealerSales/:dealerSalesId/updateTarget', verb: 'POST' },
    returns: { arg: 'dealer', type: 'object', root: true },
  });

  dealerTarget.updateDealerTarget = (ctx, dealerSalesId, data, callback) => {
    const dealerTargetService = new DealerTargetService(
      ctx.res.locals.user.user_type_id,
      ctx.res.locals.user,
    );
    dealerTargetService.updateDealerTarget(dealerSalesId, data, callback);
  };
};
