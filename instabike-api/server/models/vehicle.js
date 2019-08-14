const VehicleService = require('../services/vehicle_service');
const AuditUtil = require('../utils/audit-utils');

module.exports = (Vehicle) => {
  const vehicle = Vehicle;
  /**
   * Updates the log field values
   * @param  {Object}   ctx       database context of the model instance
   * @param  {Function} callback                                callback
   * @author Jaiyashree Subramanian
   */
  vehicle.observe('before save', (ctx, next) => {
    const auditUtil = new AuditUtil();
    auditUtil.persistInstanceUpdatedAt('Vehicle', ctx, next);
  });

  Vehicle.remoteMethod('similarVehicles', {
    description: 'To get list of similar vehicles based on vehicle-id',
    accepts: [
      { arg: 'context', type: 'object', http: { source: 'context' } },
      {
        arg: 'vehicleIds', type: ['string'], http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/similarVehicles', verb: 'POST' },
    returns: { arg: 'msg', type: [Vehicle], root: true },
  });

  /**
   * Get Similar Vehicles
   * @param  {List}   vehicleIds
   * @param  {Function} callback
   * @return {List}
   */
  vehicle.similarVehicles = (context, vehicleIds, callback) => {
    const vehicleService = new VehicleService();
    const currentUser = context.res.locals.user;
    vehicleService.findSimilarVehicles(currentUser, vehicleIds, callback);
  };

  vehicle.remoteMethod('threeSixtyDegree', {
    description: 'To get three-sixty-degree images based on vehicle-id',
    accepts: [
      { arg: 'vehicleId', type: 'string', required: true },
    ],
    http: { path: '/:vehicleId/threeSixtyDegree', verb: 'get' },
    returns: { arg: 'threeSixty', type: '[VehicleGallery]', root: true },
  });

  /**
   * get list of vehicle gallery Object
   * which holds the set of images to
   * produce 360 degree view for a vehicle.
   * @param  {string}   vehicleId
   * @param  {function} callback
   * @return {[VehicleGallery]}
   */
  vehicle.threeSixtyDegree = (vehicleId, callback) => {
    const vehicleService = new VehicleService(vehicleId);
    vehicleService.getThreeSixtyDegree(callback);
  };

  /**
   * filter to get only id and name of a variant for
   * the related vehicle id.
   * @type {Object}
   */
  vehicle.beforeRemote('prototype.__get__variants', (ctx, modelInstance, next) => {
    ctx.args.filter = { fields: { id: true, name: true } };
    next();
  });

  vehicle.remoteMethod('getVehiclePrice', {
    description: 'To get vehicle price detail based on delaer-id and variant-id',
    accepts: [
      { arg: 'vehicleId', type: 'string', required: true },
      { arg: 'variantId', type: 'string', required: true },
      { arg: 'dealerId', type: 'string', required: true },
    ],
    http: { path: '/:vehicleId/variants/:variantId/dealer/:dealerId/price', verb: 'get' },
    returns: { arg: 'vehiclePrice', type: 'VehiclePrice', root: true },
  });

  /**
   * Get the vehicle price based on the dealer and variant id.
   *
   * @param  {string}   vehicleId               vehicle id
   * @param  {string}   dealerId                dealer id
   * @param  {string}   variantId               variant id
   * @param  {function} callback                callback
   * @author Ajaykkumar Rajendran
   */
  vehicle.getVehiclePrice = (vehicleId, variantId, dealerId, callback) => {
    const vehicleService = new VehicleService(vehicleId);
    vehicleService.getVehiclePrice(dealerId, variantId, callback);
  };

  vehicle.remoteMethod('getVehicleDetail', {
    description: 'To get vehicle detail based on vehicle-id',
    accepts: [
      { arg: 'context', type: 'object', http: { source: 'context' } },
      { arg: 'vehicleId', type: 'string', required: true },
    ],
    http: { path: '/:vehicleId/detail', verb: 'get' },
    returns: { arg: 'msg', type: '[VehicleDetail]', root: true },
  });

  vehicle.getVehicleDetail = (context, vehicleId, callback) => {
    const vehicleService = new VehicleService(vehicleId);
    const currentUser = context.res.locals.user;
    vehicleService.getVehicleDetail(currentUser, callback);
  };

  /**
   * Search vehicle based on the manufacturer id, search options.
   *
   * @param {string} manufacturerId           manufacturer id
   * @param {string} dealerId                 dealer id
   * @param {Object} searchFilter             search Option
   * @author Jagajeevan
   */
  Vehicle.remoteMethod('searchVehicle', {
    description: 'To search for vehicles based on applied filter',
    accepts: [
      { arg: 'context', type: 'object', http: { source: 'context' } },
      { arg: 'manufacturerId', type: 'string', required: true },
      { arg: 'dealerId', type: 'string', required: true },
      {
        arg: 'searchOption', type: 'object', http: { source: 'body' }, required: false,
      },
    ],
    http: { path: '/manufacturer/:manufacturerId/dealer/:dealerId/searchVehicle', verb: 'POST' },
    returns: { arg: 'vehicles', type: '[VehicleDetail]', root: true },
  });

  vehicle.searchVehicle = (context, manufacturerId, dealerId, searchOption, callback) => {
    const vehicleService = new VehicleService();
    const currentUser = context.res.locals.user;
    vehicleService.searchVehicle(manufacturerId, dealerId, searchOption, currentUser, callback);
  };

  vehicle.remoteMethod('getVehicleInsurance', {
    description: 'To get vehicle-insurance detail based on variant-id and dealer-id',
    accepts: [
      { arg: 'vehicleId', type: 'string', required: true },
      { arg: 'variantId', type: 'string', required: true },
      { arg: 'dealerId', type: 'string', required: true },
    ],
    http: { path: '/:vehicleId/variants/:variantId/dealer/:dealerId/insurance', verb: 'get' },
    returns: { arg: 'vehicleInsurances', type: ['VehicleInsurance'], root: true },
  });

  /**
   * Get Vehicle Insurance details based on the variant under the dealer
   * @param  {String}   vehicleId
   * @param  {String}   variantId
   * @param  {String}   dealerId
   * @param  {Function} callback
   * @return {Array} - VehicleInsurance
   * @author Ponnuvel G
   */
  vehicle.getVehicleInsurance = (vehicleId, variantId, dealerId, callback) => {
    const vehicleService = new VehicleService(vehicleId);
    vehicleService.getVehicleInsurance(dealerId, variantId, callback);
  };

  vehicle.remoteMethod('updateVehicleInsurance', {
    description: 'To update vehicle-insurance detail based on variant-id and dealer-id',
    accepts: [
      { arg: 'vehicleId', type: 'string', required: true },
      { arg: 'variantId', type: 'string', required: true },
      { arg: 'dealerId', type: 'string', required: true },
      {
        arg: 'insuranceData', type: 'object', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:vehicleId/variants/:variantId/dealer/:dealerId/insurance', verb: 'put' },
    returns: { arg: 'vehicleInsurances', type: ['VehicleInsurance'], root: true },
  });

  /**
   * Update Vehicle Insurance details based on the variant under the dealer
   * @param  {String}   vehicleId
   * @param  {String}   variantId
   * @param  {String}   dealerId
   * @param  {Array}    insurances
   * @param  {Function} callback
   * @return {Array} - VehicleInsurance
   * @author Ponnuvel G
   */
  vehicle.updateVehicleInsurance =
    (vehicleId, variantId, dealerId, insuranceData, callback) => {
      const vehicleService = new VehicleService(vehicleId);
      vehicleService.updateVehicleInsurance(
        dealerId,
        variantId,
        insuranceData.isInsuranceSplit,
        insuranceData.insurances,
        callback,
      );
    };
  Vehicle.remoteMethod('updatePrefered', {
    description: 'To make vehicles  prefered based on dealer-id',
    accepts: [
      {
        arg: 'vehicleId', type: 'string', required: true,
      },
      {
        arg: 'dealerId', type: 'string', required: true,
      },
    ],
    http: { path: '/:vehicleId/dealer/:dealerId/updatePrefered', verb: 'POST' },
    returns: { arg: 'response', type: 'Object', root: true },
  });
  //  Update prefered vehicles based on dealer id and Vehicle Id
  vehicle.updatePrefered = (vehicleId, dealerId, callback) => {
    const vehicleService = new VehicleService(vehicleId);
    vehicleService.updatePreferedVehicle(vehicleId, dealerId, callback);
  };
};
