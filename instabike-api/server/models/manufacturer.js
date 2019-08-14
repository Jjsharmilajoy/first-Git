const AuditUtil = require('../utils/audit-utils');
const DealerService = require('../services/dealer_service.js');
const ManufacturerService = require('../services/manufacturer_service');
const CustomerService = require('../services/customer_service');

module.exports = (Manufacturer) => {
  const manufacturer = Manufacturer;
  /**
   * Updates the log field values
   * @param  {Object}   ctx       database context of the model instance
   * @param  {Function} callback                                callback
   * @author Jaiyashree Subramanian
   */
  manufacturer.observe('before save', (ctx, next) => {
    const auditUtil = new AuditUtil();
    auditUtil.persistInstanceUpdatedAt('Manufacturer', ctx, next);
  });

  manufacturer.remoteMethod('getZonesByCountry', {
    description: 'To get possible zones for a country based on country-id',
    accepts: [
      { arg: 'manufacturerId', type: 'string', required: true },
      {
        arg: 'filter', type: 'object', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:manufacturerId/allZones', verb: 'POST' },
    returns: { arg: 'states', type: ['State'], root: true },
  });

  manufacturer.getZonesByCountry = (manufacturerId, filter, callback) => {
    const manufacturerService = new ManufacturerService(manufacturerId);
    manufacturerService.getZonesByCountry(filter.countryId, callback);
  };


  manufacturer.remoteMethod('dealers', {
    description: 'To get dealers based on the filter applied',
    accepts: [
      { arg: 'manufacturerId', type: 'string', required: true },
      {
        arg: 'searchOption', type: 'object', http: { source: 'body' }, required: false,
      },
    ],
    http: { path: '/:manufacturerId/dealers/', verb: 'POST' },
    returns: { arg: 'dealerList', type: 'object', root: true },
  });

  /**
   * get list of dealers based on manufacturer id, zone, state and city
   * @param  {string}   manufacturerId
   * @param  {object}   searchFilter
   * @param  {Function} callback
   * @return {[Dealer]} list of dealers object
   * @author Jagajeevan
   */
  manufacturer.dealers = (manufacturerId, searchFilter, callback) => {
    const dealerService = new DealerService();
    dealerService.getDealers(manufacturerId, searchFilter, callback);
  };

  manufacturer.remoteMethod('manufacturerLogin', {
    description: 'To get dealers based on the filter applied',
    accepts: [
      {
        arg: 'credentials', type: 'object', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/login', verb: 'post' },
    returns: { arg: 'msg', type: 'object', root: true },
  });

  manufacturer.manufacturerLogin = (credentials, callback) => {
    const manufacturerService = new ManufacturerService();
    manufacturerService.manufacturerLogin(credentials, callback);
  };

  manufacturer.remoteMethod('updatePassword', {
    description: 'To update old password with a new one',
    accepts: [
      { arg: 'context', type: 'object', http: { source: 'context' } },
      { arg: 'newPassword', type: 'string', required: true },
    ],
    http: { path: '/resetPassword' },
    returns: { arg: 'response', type: 'AccessToken', root: true },
  });

  manufacturer.updatePassword = (context, newPassword, callback) => {
    const currentUser = context.res.locals.user;
    const customerService = new CustomerService(currentUser.id, currentUser);
    customerService.updatePassword(newPassword, callback);
  };

  manufacturer.remoteMethod('updateManufacturerDetail', {
    description: 'To update manufacturer detail',
    accepts: [
      { arg: 'manufacturerId', type: 'string', required: true },
      {
        arg: 'userManufacturer', type: 'object', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:manufacturerId/updateDetail' },
    returns: { arg: 'response', type: 'object', root: true },
  });

  manufacturer.updateManufacturerDetail = (manufacturerId, userManufacturer, callback) => {
    const manufacturerService = new ManufacturerService();
    manufacturerService.updateDetail(
      manufacturerId, userManufacturer.userObj,
      userManufacturer.manufacturerObj,
      callback,
    );
  };

  manufacturer.remoteMethod('getManufacturerFinancier', {
    description: 'To get manufacturer financiers',
    accepts: [
      { arg: 'context', type: 'object', http: { source: 'context' } },
      { arg: 'manufacturerId', type: 'string', required: true },
    ],
    http: { path: '/:manufacturerId/financiers', verb: 'GET' },
    returns: {
      arg: 'manufacturerFinanciers', type: 'Object', root: true,
    },
  });

  manufacturer.getManufacturerFinancier = (context, manufacturerId, callback) => {
    const currentUser = context.res.locals.user;
    const manufacturerService = new ManufacturerService(manufacturerId, currentUser);
    manufacturerService.getManufacturerFinancier(callback);
  };

  manufacturer.remoteMethod('updateManufacturerFinancier', {
    description: 'To update manufacturer financiers',
    accepts: [
      { arg: 'context', type: 'object', http: { source: 'context' } },
      { arg: 'manufacturerId', type: 'string', required: true },
      {
        arg: 'manufacturerFinanciers', type: 'object', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:manufacturerId/updateFinancier' },
    returns: { arg: 'response', type: 'ManufacturerFinancier', root: true },
  });

  manufacturer
    .updateManufacturerFinancier = (context, manufacturerId, manufacturerFinanciers, callback) => {
      const currentUser = context.res.locals.user;
      const manufacturerService = new ManufacturerService(manufacturerId, currentUser);
      manufacturerService.updateFinancier(
        manufacturerFinanciers.updateList,
        manufacturerFinanciers.deleteList,
        callback,
      );
    };

  manufacturer.remoteMethod('getManufacturer', {
    description: 'To get manufacturer by slug',
    accepts: [
      { arg: 'slug', type: 'string', required: true },
    ],
    http: { path: '/byslug/:slug', verb: 'post' },
    returns: { arg: 'response', type: Manufacturer, root: true },
  });

  manufacturer.getManufacturer = (slug, callback) => {
    const manufacturerService = new ManufacturerService();
    manufacturerService.getManufacturer(slug, callback);
  };

  manufacturer.remoteMethod('getManufacturerDetail', {
    description: 'To get manufacturer detail by ID',
    accepts: [
      { arg: 'context', type: 'object', http: { source: 'context' } },
      { arg: 'manufacturerId', type: 'string', required: true },
    ],
    http: { path: '/:manufacturerId/detail', verb: 'GET' },
    returns: { arg: 'response', type: 'Manufacturer', root: true },
  });

  manufacturer.getManufacturerDetail = (context, manufacturerId, callback) => {
    const currentUser = context.res.locals.user;
    const manufacturerService = new ManufacturerService(manufacturerId, currentUser);
    manufacturerService.getManufacturerDetail(callback);
  };

  manufacturer.remoteMethod('getProductSales', {
    description: 'Get the sales count for current financial year',
    accepts: [
      { arg: 'context', type: 'object', http: { source: 'context' } },
      { arg: 'manufacturerId', type: 'string', required: true },
      { arg: 'date', type: 'date', required: true },
    ],
    http: { path: '/:manufacturerId/vehicles/sales', verb: 'POST' },
    returns: { arg: 'response', type: 'Manufacturer', root: true },
  });

  manufacturer.getProductSales = (context, manufacturerId, date, callback) => {
    const currentUser = context.res.locals.user;
    const manufacturerService = new ManufacturerService(manufacturerId, currentUser);
    manufacturerService.getProductSales(date, callback);
  };

  manufacturer.remoteMethod('getDealersNearBy', {
    description: 'Get the dealers near the manufacturer location',
    accepts: [
      {
        arg: 'filter', type: 'object', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:manufacturerId/dealers/nearBy', verb: 'POST' },
    returns: { arg: 'response', type: 'Manufacturer', root: true },
  });

  manufacturer.getDealersNearBy = (filter, callback) => {
    const manufacturerService = new ManufacturerService(filter.manufacturerId);
    manufacturerService.getDealersNearBy(filter, callback);
  };

  manufacturer.remoteMethod('getTargetCompletion', {
    description: 'Get the target completion based on dealer category',
    accepts: [
      { arg: 'context', type: 'object', http: { source: 'context' } },
      {
        arg: 'filter', type: 'object', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:manufacturerId/dealers/targetCompletion', verb: 'POST' },
    returns: { arg: 'response', type: 'Manufacturer', root: true },
  });

  manufacturer.getTargetCompletion = (context, filter, callback) => {
    const currentUser = context.res.locals.user;
    const manufacturerService = new ManufacturerService(filter.manufacturerId, currentUser);
    manufacturerService.getTargetCompletion(filter, callback);
  };

  manufacturer.remoteMethod('getFinancierDealersNearBy', {
    description: 'Get the dealers near the financier location',
    accepts: [
      {
        arg: 'filter', type: 'Object', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:manufacturerId/financier/:financierId/dealers/nearBy', verb: 'POST' },
    returns: { arg: 'response', type: 'Manufacturer', root: true },
  });

  manufacturer.getFinancierDealersNearBy = (filter, callback) => {
    const manufacturerService = new ManufacturerService(filter.manufacturerId);
    manufacturerService.getFinancierDealersNearBy(filter, callback);
  };

  manufacturer.remoteMethod('getFinancierDealershipCount', {
    description: 'Get the financier associated dealers count',
    accepts: [
      { arg: 'manufacturerId', type: 'string', required: true },
      { arg: 'financierId', type: 'string', required: true },
    ],
    http: { path: '/:manufacturerId/financier/:financierId/dealershipCount', verb: 'GET' },
    returns: { arg: 'response', type: 'Manufacturer', root: true },
  });

  manufacturer.getFinancierDealershipCount = (manufacturerId, financierId, callback) => {
    const manufacturerService = new ManufacturerService(manufacturerId);
    manufacturerService.getFinancierDealershipCount(financierId, callback);
  };

  manufacturer.remoteMethod('getDealersCountByCategory', {
    description: 'Get the number of dealerships available for each category',
    accepts: [
      { arg: 'manufacturerId', type: 'string', required: true },
      {
        arg: 'filter', type: 'DealerCountByCategory', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:manufacturerId/dealerShip/count', verb: 'post' },
    returns: { arg: 'lead', type: 'Lead', root: true },
  });

  manufacturer.getDealersCountByCategory = (manufacturerId, filter, callback) => {
    const manufacturerService = new ManufacturerService(manufacturerId);
    manufacturerService.getDealersCountByCategory(filter, callback);
  };

  manufacturer.remoteMethod('getTopPerformingDealers', {
    description: 'Get the top performing dealers',
    accepts: [
      { arg: 'manufacturerId', type: 'string', required: true },
      {
        arg: 'filter', type: 'Object', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:manufacturerId/dealers/topDealers', verb: 'POST' },
    returns: { arg: 'response', type: 'Manufacturer', root: true },
  });

  manufacturer.getTopPerformingDealers = (manufacturerId, filter, callback) => {
    const manufacturerService = new ManufacturerService(manufacturerId);
    manufacturerService.getTopPerformingDealers(filter, callback);
  };

  manufacturer.remoteMethod('getDealerSalesEffectiveness', {
    description: 'Get dealer sales effectiveness based on dealer-id and applied filter',
    accepts: [
      { arg: 'manufacturerId', type: 'string', required: true },
      { arg: 'dealerId', type: 'string', required: true },
      {
        arg: 'filter', type: 'DealerSalesEffectiveness', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:manufacturerId/dealer/:dealerId/salesEffectiveness', verb: 'post' },
    returns: { arg: 'lead', type: 'Lead', root: true },
  });

  manufacturer.getDealerSalesEffectiveness = (manufacturerId, dealerId, filter, callback) => {
    const manufacturerService = new ManufacturerService(manufacturerId);
    manufacturerService.getDealerSalesEffectiveness(dealerId, filter, callback);
  };

  manufacturer.remoteMethod('getConversionRate', {
    description: 'Get the dealers conversion rate for the year and per month',
    accepts: [
      {
        arg: 'filter', type: 'Object', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:manufacturerId/dealers/conversionRate', verb: 'POST' },
    returns: { arg: 'response', type: 'Manufacturer', root: true },
  });

  manufacturer.getConversionRate = (filter, callback) => {
    const manufacturerService = new ManufacturerService(filter.manufacturerId);
    manufacturerService.getConversionRate(filter, callback);
  };

  manufacturer.remoteMethod('getActiveLeads', {
    description: 'Get the active leads list',
    accepts: [
      { arg: 'manufacturerId', type: 'string', required: true },
      {
        arg: 'filter', type: 'ActiveLeads', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:manufacturerId/activeLeads', verb: 'POST' },
    returns: { arg: 'response', type: 'Manufacturer', root: true },
  });

  manufacturer.getActiveLeads = (manufacturerId, filter, callback) => {
    const manufacturerService = new ManufacturerService(manufacturerId);
    manufacturerService.getActiveLeads(filter, callback);
  };

  manufacturer.remoteMethod('getInvoicedLeadAnalysis', {
    description: 'Get the dealers conversion rate for the year and per month',
    accepts: [
      { arg: 'manufacturerId', type: 'string', required: true },
      {
        arg: 'filter', type: 'Object', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:manufacturerId/leads/invoicedAnalysis', verb: 'POST' },
    returns: { arg: 'response', type: 'Manufacturer', root: true },
  });

  manufacturer.getInvoicedLeadAnalysis = (manufacturerId, filter, callback) => {
    const manufacturerService = new ManufacturerService(manufacturerId);
    manufacturerService.getInvoicedLeadAnalysis(filter, callback);
  };

  manufacturer.remoteMethod('lostAnalysis', {
    description: 'Get lead - lost analysis based on reasons',
    accepts: [
      { arg: 'manufacturerId', type: 'string', required: true },
      {
        arg: 'filter', type: 'LeadsLostAnalysis', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:manufacturerId/lostAnalysis', verb: 'POST' },
    returns: { arg: 'response', type: 'Manufacturer', root: true },
  });

  manufacturer.lostAnalysis = (manufacturerId, filter, callback) => {
    const manufacturerService = new ManufacturerService(manufacturerId);
    manufacturerService.getLeadsLostAnalysis(filter, callback);
  };

  manufacturer.remoteMethod('getLeadsList', {
    description: 'Get lead - list based on filter',
    accepts: [
      { arg: 'manufacturerId', type: 'string', required: true },
      {
        arg: 'filter', type: 'LeadsCountByStatus', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:manufacturerId/leads', verb: 'POST' },
    returns: { arg: 'response', type: 'Manufacturer', root: true },
  });

  manufacturer.getLeadsList = (manufacturerId, filter, callback) => {
    const manufacturerService = new ManufacturerService(manufacturerId);
    manufacturerService.getLeadList(filter, callback);
  };

  manufacturer.remoteMethod('getRoles', {
    description: 'Get all manufacturer-roles',
    accepts: [],
    http: { path: '/roles', verb: 'GET' },
    returns: { arg: 'roles', type: ['Roles'], root: true },
  });

  /**
   * Get list of roles under the manufacturer
   * @param  {Function} callback
   * @return {Array} List of roles
   */
  manufacturer.getRoles = (callback) => {
    const manufacturerService = new ManufacturerService();
    manufacturerService.getRoles(callback);
  };

  manufacturer.remoteMethod('getVehicleProperties', {
    description: 'Get vehicle properties by Manufacturer',
    accepts: [
      { arg: 'ctx', type: 'object', http: { source: 'context' } },
      { arg: 'manufacturerId', type: 'string', required: true },
    ],
    http: { path: '/:manufacturerId/vehicle/properties', verb: 'GET' },
    returns: { arg: 'response', type: ['CompareVehicleLookup'], root: true },
  });

  /**
   * Get vehicle properties based dealer manufacturer
   * Its used for Vehicle comparision
   * @param {Objcet} ctx
   * @param {String} dealerId
   * @param {Function} callback
   * @returns {List} CompareVehicleLookup
   * @author Ponnuvel G
   */
  manufacturer.getVehicleProperties = (ctx, manufacturerId, callback) => {
    const manufacturerService = new ManufacturerService(manufacturerId, ctx.res.locals.user);
    manufacturerService.getVehicleProperties(callback);
  };
};
