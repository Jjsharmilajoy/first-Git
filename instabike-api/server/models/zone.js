const AuditUtil = require('../utils/audit-utils');
const ManufacturerService = require('../services/manufacturer_service');

module.exports = (Zone) => {
  const zone = Zone;
  /**
   * Updates the log field values
   * @param  {Object}   ctx       database context of the model instance
   * @param  {Function} callback                                callback
   * @author Jaiyashree Subramanian
   */
  zone.observe('before save', (ctx, next) => {
    const auditUtil = new AuditUtil();
    auditUtil.persistInstanceUpdatedAt('Zone', ctx, next);
  });

  zone.remoteMethod('getStatesByZone', {
    description: 'To get states based on zone-filter',
    accepts: [
      {
        arg: 'filter', type: 'object', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/states', verb: 'POST' },
    returns: { arg: 'states', type: ['State'], root: true },
  });

  zone.getStatesByZone = (filter, callback) => {
    const manufacturerService = new ManufacturerService();
    manufacturerService.getStatesByZone(filter.zoneIds, filter.countryId, callback);
  };

  zone.remoteMethod('getCities', {
    description: 'To get cities based on zone-filter',
    accepts: [
      {
        arg: 'filter', type: 'object', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/cities', verb: 'POST' },
    returns: { arg: 'cities', type: ['City'], root: true },
  });

  zone.getCities = (filter, callback) => {
    const manufacturerService = new ManufacturerService();
    manufacturerService.getCities(filter.zoneIds, filter.stateIds, filter.countryId, callback);
  };
};
