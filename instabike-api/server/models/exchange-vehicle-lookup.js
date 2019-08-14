const AuditUtil = require('../utils/audit-utils');
const DealerService = require('../services/dealer_service');

module.exports = (ExchangeVehicleLookup) => {
  const exchangeVehicleLookup = ExchangeVehicleLookup;
  /**
   * Updates the log field values
   * @param  {Object}   ctx       database context of the model instance
   * @param  {Function} callback                                callback
   * @author Jaiyashree Subramanian
   */
  exchangeVehicleLookup.observe('before save', (ctx, next) => {
    const auditUtil = new AuditUtil();
    auditUtil.persistInstanceUpdatedAt('FinancialDocument', ctx, next);
  });

  exchangeVehicleLookup.remoteMethod('getManufacturers', {
    description: 'Get List of Manufacturers',
    accepts: [],
    http: { path: '/manufacturers', verb: 'GET' },
    returns: { arg: 'manufacturers', type: ['string'], root: true },
  });

  /**
   * Get Manufacturers
   * @param  {Function} callback
   * @return {List} List of Manufacturer
   */
  exchangeVehicleLookup.getManufacturers = (callback) => {
    const dealerService = new DealerService();
    dealerService.getManufacturers(callback);
  };

  exchangeVehicleLookup.remoteMethod('getVehicles', {
    description: 'Get List of Manufacturer\'s Vehicles',
    accepts: [
      {
        arg: 'filter', type: 'object', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/vehicles', verb: 'POST' },
    returns: { arg: 'vehicles', type: ['string'], root: true },
  });

  /**
   * Get Vehicles
   * @param  {Object}   filter
   * @param  {Function} callback
   * @return {List} List of Variants
   */
  exchangeVehicleLookup.getVehicles = (filter, callback) => {
    const dealerService = new DealerService();
    dealerService.getVehicles(filter, callback);
  };

  exchangeVehicleLookup.remoteMethod('getPrice', {
    description: 'Get Price',
    accepts: [
      {
        arg: 'filter', type: 'object', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/price', verb: 'POST' },
    returns: { arg: 'variants', type: 'ExchangeVehicleLookup', root: true },
  });

  /**
   * Get ExchangeVehicleLookup
   * @param  {Object}   filter
   * @param  {Function} callback
   * @return {ExchangeVehicleLookup}
   */
  exchangeVehicleLookup.getPrice = (filter, callback) => {
    const dealerService = new DealerService();
    dealerService.getPrice(filter, callback);
  };
};
