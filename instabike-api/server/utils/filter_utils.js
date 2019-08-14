// import statements
const loopback = require('../server.js');
const lodash = require('lodash');
const InstabikeError = require('../error/instabike_error');
const ErrorConstants = require('../utils/constants/error_constants');

const app = loopback.dataSources.postgres.models;

/**
 * Filter Option Utility
 * @author Jagajeevan S
 */
module.exports = class FilterUtil {
  /**
   * Checks if the zone id is present or not
   * @param  {Function} callback
   * @return {object} zone_id query conditions
   * @author Jagajeevan
   */
  static validateZoneId(searchFilter) {
    return (searchFilter.zone_id) ? { zone_id: searchFilter.zone_id } : null;
  }

  /**
   * Checks if the state id is present or not, if present means need to check for zone id
   * @param  {Function} callback
   * @return {object} state_id query conditions
   * @author Jagajeevan
   */
  static validateStateId(searchFilter) {
    if (searchFilter.state_id) {
      if (searchFilter.zone_id) return { state_id: searchFilter.state_id };
      throw new InstabikeError(ErrorConstants.ERRORS.DEALER.ZONE_NOT_FOUND);
    }
    return null;
  }

  /**
   * Checks if the city id is present or not, if present means need to check for state id
   * @param  {Function} callback
   * @return {object} zone_id query conditions
   * @author Jagajeevan
   */
  static validateCityId(searchFilter) {
    if (searchFilter.city_id) {
      if (searchFilter.state_id) return { city_id: searchFilter.city_id };
      throw new InstabikeError(ErrorConstants.ERRORS.DEALER.STATE_NOT_FOUND);
    }
    return null;
  }

  /**
   * Get roles based on the role key
   * @param  {String} role
   * @return {Arra|String}
   */
  static async getRole(role) {
    let roleName = null;
    let roles = [];
    try {
      if (!global.roles) {
        global.roles = await app.Roles.find();
      }
    } catch (e) {
      throw new InstabikeError(e);
    }
    if (global.roles.length > 0) {
      switch (role) {
        case 'dealer_sales':
          roleName = (lodash.find(global.roles, { name: 'DEALER_SALES' })).name;
          break;
        case 'dealer_team_head':
          roleName = (lodash.find(global.roles, { name: 'DEALER_TEAM_HEAD' })).name;
          break;
        case 'financier_team_head':
          roleName = (lodash.find(global.roles, { name: 'FINANCIER_TEAM_HEAD' })).name;
          break;
        case 'financier_sales':
          roleName = (lodash.find(global.roles, { name: 'FINANCIER_SALES' })).name;
          break;
        case 'customer':
          roleName = (lodash.find(global.roles, { name: 'CUSTOMER' })).name;
          break;
        case 'dealer_roles':
          roles = (lodash.filter(global.roles, { module: 'Dealer' }));
          roleName = lodash.map(roles, 'name');
          break;
        case 'manufacturer_roles':
          roles = (lodash.filter(global.roles, { module: 'Manufacturer' }));
          roleName = lodash.map(roles, 'name');
          break;
        case 'financier_roles':
          roles = (lodash.filter(global.roles, { module: 'Financier' }));
          roleName = lodash.map(roles, 'name');
          break;
        default:
      }
    }
    return roleName;
  }
};
