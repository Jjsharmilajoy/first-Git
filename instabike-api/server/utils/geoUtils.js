// import statements
const loopback = require('../server.js');
const geocoder = require('google-geocoder');
const InstabikeError = require('../error/instabike_error');
const ErrorConstants = require('../utils/constants/error_constants');
const GLOBAL_CONSTANTS = require('../utils/constants/global');

const app = loopback.dataSources.postgres.models;

/**
 * @author Jagajeevan
 */
module.exports = class GeoUtils {
  /**
   * Gets the city based on the Ip location
   * @param  {String}   ipAddress
   * @param  {Function} callback
   * @author Jagajeevan
   */
  static async getCityByIp(ipAddress, callback) {
    try {
      const ipHash = GeoUtils.getIPHash(ipAddress);
      const geoLocation = await app.GeoLocation.findOne(GeoUtils.getQueryParam(ipHash));

      if (!geoLocation || geoLocation.city_name === '-') {
        const geoData =
          await app.GeoLocation.findOne(this.getQueryParam(GLOBAL_CONSTANTS.DEFAULT_IP_HASH));
        callback(null, geoData);
      }
      callback(null, geoLocation);
    } catch (error) {
      callback(new InstabikeError(error));
    }
  }

  /**
   * Gets the lat and lng based on the pincode via google geo location api
   * @param  {String}   pinCode
   * @param  {Function} callback
   * @author Jagajeevan
   */
  static getGeoPointsByPincode(pinCode, callback) {
    const geo = geocoder({ key: process.env.GEO_API });
    geo.find(pinCode, (err, res) => {
      if (err || !res.length) {
        callback(new InstabikeError(ErrorConstants.ERRORS.GEOLOCATION.INVALID_PINCODE));
      } else {
        callback(null, { lat: res[0].location.lat, lng: res[0].location.lng });
      }
    });
  }

  /**
   * Prepares the query parmas for getting the city name via ip hash
   * @param  {integer}   ipHash
   */
  static getQueryParam(ipHash) {
    return {
      fields: { id: false },
      where: { ip_from: { lte: ipHash } },
      order: 'ip_from DESC',
    };
  }

  /**
   * Converts the ip_address to integer
   * @param  {String}   ip_address
   */
  static getIPHash(ipAddress) {
    const ip = ipAddress.split('.');
    return ((((((+ip[0]) * 256) + (+ip[1])) * 256) + (+ip[2])) * 256) + (+ip[3]);
  }
};
