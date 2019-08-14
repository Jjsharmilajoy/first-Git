/**
 * Manufacturer services: this service handles methods such as manufacturer login,
 * update manufacturer detail, get manufacturer financiers, update financiers, get manufacturer
 * details, get product sales, get dealers near-by, get target completion, get financier-dealers
 * near-by, get financier dealership count, get dealership count by category, get top performing
 * dealer, get dealership sales effectiveness, get convertion rate, get active leads, get
 * lost analysis and get leads list based on filter.
 */

// import dependencies
const lodash = require('lodash');

// import files
const loopback = require('../server.js');
const BaseService = require('../services/base_service');
const constants = require('../utils/constants/userConstants');
const InstabikeError = require('../error/instabike_error');
const ErrorConstants = require('../utils/constants/error_constants');
const DateUtils = require('../utils/date_utils');
const StringUtils = require('../utils/string_utils');
const FilterUtil = require('../utils/filter_utils');

const app = loopback.dataSources.postgres.models;
const postgresDs = loopback.dataSources.postgres;

/**
 * @author Mohammed Mahroof
 */
module.exports = class ManufacturerService extends BaseService {
  constructor(manufacturerId, currentUser) {
    super();
    this.currentUser = currentUser;
    this.manufacturerId = manufacturerId;
  }

  /**
   * Login for Manufacturer
   * Validate and return accesstoken
   *
   * @param  {Object} credentials      user credentials to login
   * @param  {Function} callback                        callback
   * @return {Function} callback                        callback
   * @author Mohammed Mahroof
   */
  async manufacturerLogin(credentials, callback) {
    this.credentials = credentials;
    this.roles = await FilterUtil.getRole('manufacturer_roles');
    try {
      const accessToken = await this.login(constants.USER_TYPE_NAMES.MANUACTURER);
      return callback(null, accessToken);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * To update details of manufacturer and manufacturer-manager.
   *
   * @param {String} manufacturerId               Id of the user
   * @param {Object} userObj            manufacturer-user object
   * @param {Object} manufacturerObj                 user object
   * @param {Function} callback                         function
   * @author Jaiyashree Subramanian
   */
  async updateDetail(manufacturerId, userObj, manufacturerObj, callback) {
    this.manufacturerId = manufacturerId;
    try {
      const result = {};
      if (manufacturerObj) {
        result.manufacturer = await app.Manufacturer.upsertWithWhere({
          id: this.manufacturerId,
        }, manufacturerObj);
      }
      if (userObj) {
        result.user = await app.Users.upsertWithWhere({ id: userObj.id }, userObj);
        result.accessToken = await app.AccessToken.create({ userId: result.user.id, ttl: 1800 });
      }
      return callback(null, result);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * To fetch all financiers and get association with manufacturer.
   *
   * @param {String} manufacturerId       Id of the user
   * @param {Function} callback                 function
   * @author Jaiyashree Subramanian
   */
  async getManufacturerFinancier(callback) {
    try {
      const manufacturer = await app.Manufacturer.findOne({
        where: { id: this.manufacturerId },
      });
      if (!manufacturer) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.MANUFACTURER.NOT_FOUND));
      }
      let manufacturerFinanciers = [];
      if (this.verifyRole('MANUFACTURER_COUNTRY_HEAD')) {
        manufacturerFinanciers = await this.getFinanciersForRoles('MANUFACTURER_COUNTRY_HEAD', callback);
      } else if (this.verifyRole('MANUFACTURER_ZONE_HEAD')) {
        manufacturerFinanciers = await this.getFinanciersForRoles('MANUFACTURER_ZONE_HEAD', callback);
      } else if (this.verifyRole('MANUFACTURER_STATE_HEAD')) {
        manufacturerFinanciers = await this.getFinanciersForRoles('MANUFACTURER_STATE_HEAD', callback);
      } else if (this.verifyRole('MANUFACTURER_CITY_HEAD')) {
        manufacturerFinanciers = await this.getFinanciersForRoles('MANUFACTURER_CITY_HEAD', callback);
      }
      const financierIds = await manufacturerFinanciers.map(manufacturerFinancier =>
        manufacturerFinancier.financier_id);
      const financiers = await app.Financier.find({
        where: { id: { nin: financierIds } },
      });
      return callback(null, { manufacturerFinanciers, financiers });
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * To construct manufacturer-financier query based on current role and return
   * associated financiers in the entier-hierarchy
   *
   * @param {String} roleCheck                                  role to compare
   * @param {Function} callback                                        function
   * @author Jaiyashree Subramanian
   */
  async getFinanciersForRoles(roleCheck, callback) {
    try {
      this.whereClause = '';
      let params = [this.manufacturerId, this.currentUser.country_id];
      if (roleCheck === 'MANUFACTURER_COUNTRY_HEAD') {
        this.whereClause = ` AND mfo.country_id = $2
        AND mfo.zone_id IS NULL AND mfo.state_id IS NULL AND mfo.city_id IS NULL `;
        this.joinCondition = ` AND mf.country_id = $2
        AND mf.zone_id IS NULL AND mf.state_id IS NULL AND mf.city_id IS NULL `;
      } else if (roleCheck === 'MANUFACTURER_ZONE_HEAD') {
        this.whereClause = ` AND mfo.country_id = $2
        AND mfo.zone_id = $3 AND mfo.state_id IS NULL AND mfo.city_id IS NULL `;
        params.push(this.currentUser.zone_id);
        this.joinCondition = ` AND mf.country_id = $2
        AND ( (mf.zone_id = $3 AND mf.state_id IS NULL AND mf.city_id IS NULL)
        OR (mf.zone_id IS NULL AND mf.state_id IS NULL AND mf.city_id IS NULL) )`;
      } else if (roleCheck === 'MANUFACTURER_STATE_HEAD') {
        this.whereClause = ` AND mfo.country_id = $2
        AND mfo.zone_id = $3 AND mfo.state_id = $4 AND mfo.city_id IS NULL `;
        params = params.concat([this.currentUser.zone_id, this.currentUser.state_id]);
        this.joinCondition = ` AND mf.country_id = $2
        AND ( (mf.zone_id = $3 AND mf.state_id = $4 AND mf.city_id IS NULL)
        OR (mf.zone_id = $3 AND mf.state_id IS NULL AND mf.city_id IS NULL)
        OR (mf.zone_id IS NULL AND mf.state_id IS NULL AND mf.city_id IS NULL) )`;
      } else if (roleCheck === 'MANUFACTURER_CITY_HEAD') {
        this.whereClause = ` AND mfo.country_id = $2
        AND mfo.zone_id = $3 AND mfo.state_id = $4 AND mfo.city_id = $5 `;
        params = params.concat([this.currentUser.zone_id, this.currentUser.state_id,
          this.currentUser.city_id]);
        this.joinCondition = ` AND mf.country_id = $2
        AND ( (mf.zone_id = $3 AND mf.state_id = $4 AND mf.city_id = $5)
        OR (mf.zone_id = $3 AND mf.state_id = $4 AND mf.city_id IS NULL)
        OR (mf.zone_id = $3 AND mf.state_id IS NULL AND mf.city_id IS NULL)
        OR (mf.zone_id IS NULL AND mf.state_id IS NULL AND mf.city_id IS NULL) )`;
      }
      const financiersQuery = `
        SELECT financiers.*, financiers.image_url, financiers.logo_url,
          mfo.order as order, mfo.manufacturer_id, mfo.financier_id ,
          mfo.country_id as assigned_country_id, mfo.zone_id as assigned_zone_id,
          mfo.state_id as assigned_state_id, mfo.city_id as assigned_city_id,
          mf.country_id, mf.zone_id, mf.state_id, mf.city_id from manufacturer_financier_orders mfo
        INNER JOIN manufacturer_financiers mf ON mf.manufacturer_id = mfo.manufacturer_id
          AND mf.financier_id =  mfo.financier_id ${this.joinCondition}
        INNER JOIN financiers ON financiers.id = mfo.financier_id
        WHERE mfo.manufacturer_id = $1 ${this.whereClause} ORDER BY mfo.order ASC
      `;
      const manufacturerFinanciers = await new Promise((resolve, reject) => {
        postgresDs.connector.query(financiersQuery, params, (err, result) => {
          if (err) reject(new InstabikeError(err));
          resolve(result);
        });
      });
      return manufacturerFinanciers;
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * To update all financiers associated to a manufacturer by deleting all
   * existing associatiomns and creating new relation.
   *
   * @param {[Object]} manufacturerFinanciers         manufacturer financiers
   * @param {[String]} deleteList          financiers-ids to be un-associated
   * @param {Function} callback                                      function
   * @author Jaiyashree Subramanian
   */
  async updateFinancier(manufacturerFinanciers, deleteList, callback) {
    try {
      const newObject = {
        manufacturer_id: this.manufacturerId,
      };
      const currentUserCondition = {
        manufacturer_id: this.manufacturerId,
        country_id: this.currentUser.country_id ? this.currentUser.country_id : null,
        zone_id: this.currentUser.zone_id ? this.currentUser.zone_id : null,
        state_id: this.currentUser.state_id ? this.currentUser.state_id : null,
        city_id: this.currentUser.city_id ? this.currentUser.city_id : null,
      };
      let findCondition = {};
      const roleCheck = this.getRoleBasedCondition(this.currentUser);
      this.currentRole = roleCheck.roleName;
      if (roleCheck.roleName === 'MANUFACTURER_COUNTRY_HEAD') {
        newObject.country_id = this.currentUser.country_id;
        findCondition = {
          and: [{ country_id: this.currentUser.country_id }, { zone_id: null },
            { state_id: null }, { city_id: null }],
        };
      }
      if (roleCheck.roleName === 'MANUFACTURER_ZONE_HEAD') {
        newObject.country_id = this.currentUser.country_id;
        newObject.zone_id = this.currentUser.zone_id;
        findCondition = this.getZoneFinanciers();
      }
      if (roleCheck.roleName === 'MANUFACTURER_STATE_HEAD') {
        newObject.country_id = this.currentUser.country_id;
        newObject.zone_id = this.currentUser.zone_id;
        newObject.state_id = this.currentUser.state_id;
        findCondition = this.getStateFinanciers();
      }
      if (roleCheck.roleName === 'MANUFACTURER_CITY_HEAD') {
        newObject.country_id = this.currentUser.country_id;
        newObject.zone_id = this.currentUser.zone_id;
        newObject.state_id = this.currentUser.state_id;
        newObject.city_id = this.currentUser.city_id;
        findCondition = this.getCityFinanciers();
      }
      await app.ManufacturerFinancierOrder.destroyAll(currentUserCondition);
      for (let i = 0; i < deleteList.length; i += 1) {
        newObject.financier_id = deleteList[i];
        await app.ManufacturerFinancier.destroyAll(newObject);
      }
      for (let i = 0; i < manufacturerFinanciers.length; i += 1) {
        const manufacturerFinancierObj = manufacturerFinanciers[i];
        manufacturerFinancierObj.manufacturer_id = this.manufacturerId;
        manufacturerFinancierObj.country_id = newObject.country_id;
        manufacturerFinancierObj.zone_id = newObject.zone_id;
        manufacturerFinancierObj.state_id = newObject.state_id;
        manufacturerFinancierObj.city_id = newObject.city_id;
        let seachCondition = [{ manufacturer_id: this.manufacturerId },
          { financier_id: manufacturerFinancierObj.financier_id }];
        newObject.financier_id = manufacturerFinancierObj.financier_id;
        seachCondition = seachCondition.concat(findCondition.and);
        const oldManufacturerFinancier =
          await app.ManufacturerFinancier.findOne({ where: { and: seachCondition } });
        if (!oldManufacturerFinancier) {
          await this.createDependentManufacturerFinanciers(
            manufacturerFinancierObj.financier_id,
            callback,
          );
          await app.ManufacturerFinancier.create(newObject);
        }
      }
      const manufacturerFinancierList =
        await app.ManufacturerFinancierOrder.create(manufacturerFinanciers);
      return callback(null, manufacturerFinancierList);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * To create dependent tables based on the current-role of the manufacturer-user
   *
   * @param {string} financierId                                      financier-Id
   * @param {Function} callback                                           function
   * @author Jaiyashree Subramanian
   */
  async createDependentManufacturerFinanciers(financierId, callback) {
    try {
      if (this.currentRole === 'MANUFACTURER_COUNTRY_HEAD') {
        const condition = [{ country_id: this.currentUser.country_id }];
        await this.createZoneFinanciers(financierId, callback);
        await this.createStateFinanciers(financierId, condition, callback);
        await this.createCityFinanciers(financierId, condition, callback);
      } else if (this.currentRole === 'MANUFACTURER_ZONE_HEAD') {
        const condition = [{ country_id: this.currentUser.country_id },
          { zone_id: this.currentUser.zone_id }];
        await this.createStateFinanciers(financierId, condition, callback);
        await this.createCityFinanciers(financierId, condition, callback);
      } else if (this.currentRole === 'MANUFACTURER_STATE_HEAD') {
        const condition = [{ country_id: this.currentUser.country_id },
          { zone_id: this.currentUser.zone_id }, { state_id: this.currentUser.state_id }];
        await this.createCityFinanciers(financierId, condition, callback);
      }
      return true;
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * To associate financiers to a manufacturer zone
   *
   * @param {string} financierId         financier-Id
   * @param {Function} callback              function
   * @author Jaiyashree Subramanian
   */
  async createZoneFinanciers(financierId, callback) {
    try {
      const zones = await app.Zone.find({
        where: {
          and: [{ manufacturer_id: this.manufacturerId },
            { country_id: this.currentUser.country_id }],
        },
      });
      const promises = zones.map(async (zoneObj) => {
        const newZoneFinancier = await app.ManufacturerFinancierOrder.upsertWithWhere({
          financier_id: financierId,
          zone_id: zoneObj.id,
          state_id: null,
          city_id: null,
        }, {
          manufacturer_id: this.manufacturerId,
          financier_id: financierId,
          country_id: zoneObj.country_id,
          zone_id: zoneObj.id,
          state_id: null,
          city_id: null,
          order: 200,
        });
        return newZoneFinancier;
      });
      const zoneFinanciers = await Promise.all(promises);
      return zoneFinanciers;
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * To associate financiers to a manufacturer state
   *
   * @param {string} financierId           financier-Id
   * @param {Object} condition          state-condition
   * @param {Function} callback                function
   * @author Jaiyashree Subramanian
   */
  async createStateFinanciers(financierId, condition, callback) {
    try {
      const states = await app.State.find({
        where: {
          and: condition,
        },
      });
      const promises = states.map(async (stateObj) => {
        const newStateFinancier = await app.ManufacturerFinancierOrder.upsertWithWhere({
          financier_id: financierId,
          country_id: stateObj.country_id,
          zone_id: stateObj.zone_id,
          state_id: stateObj.id,
          city_id: null,
        }, {
          manufacturer_id: this.manufacturerId,
          financier_id: financierId,
          country_id: stateObj.country_id,
          zone_id: stateObj.zone_id,
          state_id: stateObj.id,
          city_id: null,
          order: 200,
        });
        return newStateFinancier;
      });
      const stateFinanciers = await Promise.all(promises);
      return stateFinanciers;
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * To associate financiers to a manufacturer city
   *
   * @param {string} financierId           financier-Id
   * @param {Object} condition          city-condition
   * @param {Function} callback                function
   * @author Jaiyashree Subramanian
   */
  async createCityFinanciers(financierId, condition, callback) {
    try {
      const cites = await app.City.find({
        where: {
          and: condition,
        },
      });
      const promises = cites.map(async (cityObj) => {
        const newCityFinancier = await app.ManufacturerFinancierOrder.upsertWithWhere({
          financier_id: financierId,
          country_id: cityObj.country_id,
          zone_id: cityObj.zone_id,
          state_id: cityObj.state_id,
          city_id: cityObj.id,
        }, {
          manufacturer_id: this.manufacturerId,
          financier_id: financierId,
          country_id: cityObj.country_id,
          zone_id: cityObj.zone_id,
          state_id: cityObj.state_id,
          city_id: cityObj.id,
          order: 200,
        });
        return newCityFinancier;
      });
      const cityFinanciers = await Promise.all(promises);
      return cityFinanciers;
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * To get the condition to fetch manufacturer-zone-financiers
   *
   * @return {Object} zoneCondition              zone-condition
   * @author Jaiyashree Subramanian
   */
  getZoneFinanciers() {
    try {
      return {
        and: [
          { country_id: this.currentUser.country_id },
          {
            or: [
              {
                and: [
                  { zone_id: this.currentUser.zone_id }, { state_id: null }, { city_id: null },
                ],
              },
              { and: [{ zone_id: null }] },
            ],
          },
        ],
      };
    } catch (error) {
      throw (new InstabikeError(error));
    }
  }

  /**
   * To get the condition to fetch manufacturer-state-financiers
   *
   * @return {Object} stateCondition              state-condition
   * @author Jaiyashree Subramanian
   */
  getStateFinanciers() {
    try {
      return {
        and: [
          { country_id: this.currentUser.country_id },
          {
            or: [
              {
                and: [
                  { zone_id: this.currentUser.zone_id },
                  { state_id: this.currentUser.state_id }, { city_id: null },
                ],
              },
              {
                and: [
                  { zone_id: this.currentUser.zone_id }, { state_id: null }, { city_id: null },
                ],
              },
              { and: [{ zone_id: null }] },
            ],
          },
        ],
      };
    } catch (error) {
      throw (new InstabikeError(error));
    }
  }

  /**
   * To get the condition to fetch manufacturer-city-financiers
   *
   * @return {Object} cityCondition              city-condition
   * @author Jaiyashree Subramanian
   */
  getCityFinanciers() {
    try {
      return {
        and: [
          { country_id: this.currentUser.country_id },
          {
            or: [
              {
                and: [
                  { zone_id: this.currentUser.zone_id },
                  { state_id: this.currentUser.state_id }, { city_id: this.currentUser.city_id },
                ],
              }, {
                and: [
                  { zone_id: this.currentUser.zone_id },
                  { state_id: this.currentUser.state_id }, { city_id: null },
                ],
              }, {
                and: [
                  { zone_id: this.currentUser.zone_id }, { state_id: null }, { city_id: null },
                ],
              }, { and: [{ zone_id: null }] },
            ],
          },
        ],
      };
    } catch (error) {
      throw (new InstabikeError(error));
    }
  }

  /**
   * Get manufacturer by slug
   * @param  {string}   slug
   * @param  {Function} callback
   * @return {Function}
   * @author Ponnuvel G
   */
  async getManufacturer(slug, callback) {
    this.slug = slug;
    try {
      const manufacturer = await app.Manufacturer.findOne({ where: { slug: this.slug } });
      return callback(null, manufacturer);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * To fetch manufacturer and manufacturer user detail
   *
   * @param {String} manufacturerId       Id of the user
   * @param {Function} callback                 function
   * @author Jaiyashree Subramanian
   */
  async getManufacturerDetail(callback) {
    try {
      const manufacturer = await app.Manufacturer.findOne({
        where: { id: this.manufacturerId },
      });
      const user = await app.Users.findOne({
        where: {
          and: [
            { id: this.currentUser.id },
            { user_type_id: this.manufacturerId },
            { user_type_name: constants.USER_TYPE_NAMES.MANUACTURER },
          ],
        },
        include: {
          relation: 'user_role',
          scope: {
            fields: ['role_id'],
            include: { relation: 'role', scope: { fields: ['id', 'name'] } },
          },
        },
      });
      return callback(null, { manufacturer, user });
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * To fetch all zones sorted by name for given country-id and manufacturer.
   *
   * @param {String} zoneIds                Id of the zones
   * @param {Function} callback                    function
   * @author Jaiyashree Subramanian
   */
  async getZonesByCountry(countryId, callback) {
    this.countryId = countryId;
    try {
      const whereCondition = { manufacturer_id: this.manufacturerId };
      if (countryId) {
        whereCondition.country_id = countryId;
      }
      const zones = await app.Zone.find({
        where: whereCondition,
        order: 'name ASC',
      });
      return callback(null, zones);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * To fetch all states sorted by name for given zone Ids.
   *
   * @param {String} zoneIds                Id of the zones
   * @param {Function} callback                    function
   * @author Jaiyashree Subramanian
   */
  async getStatesByZone(zoneIds, countryId, callback) {
    this.zoneIds = zoneIds;
    try {
      const whereCondition = {};
      if (this.zoneIds && this.zoneIds.length) {
        whereCondition.zone_id = { inq: this.zoneIds };
      }
      if (countryId) {
        whereCondition.country_id = countryId;
      }
      const states = await app.State.find({
        where: whereCondition,
        order: 'name ASC',
      });
      return callback(null, states);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * To fetch all cities sorted by name for given zone or state Ids.
   *
   * @param {String} zoneIds                Id of the zones
   * @param {String} stateIds              Id of the states
   * @param {Function} callback                    function
   * @author Jaiyashree Subramanian
   */
  async getCities(zoneIds, stateIds, countryId, callback) {
    this.zoneIds = zoneIds;
    try {
      const query = { and: [] };
      if (this.zoneIds && this.zoneIds.length) {
        query.and.push({ zone_id: { inq: this.zoneIds } });
      }
      if (stateIds && stateIds.length) {
        query.and.push({ state_id: { inq: stateIds } });
      }
      if (countryId) {
        query.and.push({ country_id: countryId });
      }
      const cities = await app.City.find({
        where: query,
        order: 'name ASC',
      });
      return callback(null, cities);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  getRoleBasedCondition(currentUser) {
    if (this.verifyRole('MANUFACTURER_COUNTRY_HEAD')) {
      return {
        searchColumn: 'country_id',
        searchValue: currentUser.country_id,
        roleName: 'MANUFACTURER_COUNTRY_HEAD',
      };
    }
    if (this.verifyRole('MANUFACTURER_ZONE_HEAD')) {
      return {
        searchColumn: 'zone_id',
        searchValue: currentUser.zone_id,
        roleName: 'MANUFACTURER_ZONE_HEAD',
      };
    }
    if (this.verifyRole('MANUFACTURER_STATE_HEAD')) {
      return {
        searchColumn: 'state_id',
        searchValue: currentUser.state_id,
        roleName: 'MANUFACTURER_STATE_HEAD',
      };
    }
    if (this.verifyRole('MANUFACTURER_CITY_HEAD')) {
      return {
        searchColumn: 'city_id',
        searchValue: currentUser.city_id,
        roleName: 'MANUFACTURER_CITY_HEAD',
      };
    }
    return { searchColumn: 'country_id', searchValue: currentUser.country_id };
  }

  /**
   * To fetch product sales count for the current financial year.
   *
   * @param {date} date                            date
   * @param {Function} callback                    callback
   * @author Ajaykkumar Rajendran
   */
  async getProductSales(date, callback) {
    try {
      const financialYear = DateUtils.getFinancialYearDates(date);
      const params = [financialYear.from_date, financialYear.to_date, this.manufacturerId];
      const roleCondition = this.getRoleBasedCondition(this.currentUser);
      params.push(roleCondition.searchValue);
      const query = `SELECT v.name, v.type, count(*) FILTER (where v.type = 0)
        AS bikes_sold, count(*) FILTER (where v.type = 1) AS scooter_sold FROM lead_details ld
        INNER JOIN vehicles v ON v.id = ld.vehicle_id
        INNER JOIN leads l ON l.id = ld.lead_id
        WHERE (ld.vehicle_status BETWEEN '600' AND '899')
        AND (ld.created_at::timestamp::date BETWEEN $1 AND $2)
        AND (l.${roleCondition.searchColumn} = $4)
        AND ld.manufacturer_id = $3 GROUP BY v.id`;
      const productSales = await new Promise((resolve, reject) => {
        loopback.dataSources.postgres.connector.query(query, params, (err, resultObj) => {
          if (err) {
            return reject(new InstabikeError(err));
          }
          return resolve(resultObj);
        });
      });
      return callback(null, productSales);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * To fetch all dealers near manufacturer location.
   *
   * @param {object} filter                        filter data
   * @param {Function} callback                    callback
   * @author Ajaykkumar Rajendran
   */
  async getDealersNearBy(filter, callback) {
    try {
      const dealers = await app.Dealer.find({
        where: {
          location: {
            near: filter.location,
            maxDistance: filter.radius,
            unit: 'kilometers',
          },
          manufacturer_id: this.manufacturerId,
        },
        fields: ['name', 'location', 'address_line_1', 'address_line_2'],
      });
      return callback(null, dealers);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * To get the sales performance of the dealers for the current financial year.
   *
   * @param {object} filter                        filter object
   * @param {Function} callback                    callback
   * @author Ajaykkumar Rajendran
   */
  async getTargetCompletion(filter, callback) {
    this.filter = filter;
    try {
      const queryObj = this.buildTargetCompletionQuery();
      const targets = await new Promise((resolve, reject) => {
        loopback.dataSources.postgres.connector.query(
          queryObj.query, queryObj.params,
          (err, resultObj) => {
            if (err) reject(new InstabikeError(err));
            resolve(resultObj);
          },
        );
      });
      return callback(null, targets);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  buildTargetCompletionQuery() {
    let params = [this.manufacturerId, this.filter.fromDate, this.filter.toDate];
    let query = `SELECT SUM(total_count) as total_count, SUM(target) as target,
      mt.target_from_date, mt.target_to_date, dc.name, dc.color_code dealer_category_color_code
      from manufacturer_targets mt
      INNER JOIN dealer_categories dc ON mt.dealer_category_id = dc.id
      WHERE mt.manufacturer_id = $1 AND (mt.target_from_date::timestamp::date
      BETWEEN $2 AND $3)`;
    if (!lodash.isEmpty(this.filter)) {
      if (this.filter.countryId) {
        params.push(this.filter.countryId);
        query += ` and mt.country_id = $${params.length} `;
      }
      if (this.filter.zoneIds && this.filter.zoneIds.length) {
        const queryString = StringUtils.generateInClause(
          params.length + 1,
          this.filter.zoneIds,
        );
        query += ` and mt.zone_id IN (${queryString}) `;
        params = params.concat(this.filter.zoneIds);
      }
      if (this.filter.stateIds && this.filter.stateIds.length) {
        const queryString = StringUtils.generateInClause(
          params.length + 1,
          this.filter.stateIds,
        );
        query += ` and mt.state_id IN (${queryString}) `;
        params = params.concat(this.filter.stateIds);
      }
      if (this.filter.cityIds && this.filter.cityIds.length) {
        const queryString = StringUtils.generateInClause(
          params.length + 1,
          this.filter.cityIds,
        );
        query += ` and mt.city_id IN (${queryString}) `;
        params = params.concat(this.filter.cityIds);
      }
      if (this.filter.dealerCategoryIds && this.filter.dealerCategoryIds.length) {
        const queryString = StringUtils.generateInClause(
          params.length + 1,
          this.filter.dealerCategoryIds,
        );
        query += ` and mt.dealer_category_id IN (${queryString}) `;
        params = params.concat(this.filter.dealerCategoryIds);
      }
    }
    query += ' GROUP BY dc.name, mt.target_from_date, mt.target_to_date, dc.color_code';
    return { query, params };
  }

  /**
   * To fetch all dealers near financier location.
   *
   * @param {object} filter                        filter data
   * @param {Function} callback                    callback
   * @author Ajaykkumar Rajendran
   */
  async getFinancierDealersNearBy(filter, callback) {
    const dealerIds = [];
    try {
      const dealerFinanciers = await app.DealerFinancier.find({
        where: {
          and: [{ financier_id: filter.financierId }, { manufacturer_id: this.manufacturerId }],
        },
      });
      await dealerFinanciers.map(async (dealerFinancierObj) => {
        dealerIds.push(dealerFinancierObj.dealer_id);
      });
      const dealers = await app.Dealer.find({
        where: {
          location: {
            near: filter.location,
            maxDistance: filter.radius,
            unit: 'kilometers',
          },
          id: { inq: dealerIds },
        },
        fields: ['name', 'location', 'address_line_1', 'address_line_2'],
      });
      return callback(null, dealers);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * To get the total dealer count and dealer associated with financier count.
   *
   * @param {string} financierId                   financierId
   * @param {Function} callback                    callback
   * @author Ajaykkumar Rajendran
   */
  async getFinancierDealershipCount(financierId, callback) {
    try {
      const totalDealersCount = await app.Dealer.count({ manufacturer_id: this.manufacturerId });
      const dealerFinanciersCount = await app.DealerFinancier.count({
        and: [{ manufacturer_id: this.manufacturerId }, { financier_id: financierId }],
      });
      return callback(null, { total: totalDealersCount, dealers_count: dealerFinanciersCount });
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * To fetch dealers count based on category for zone, state and city filter
   *
   * @param  {Object} filter                   filter object
   * @param  {Function} callback                    callback
   * @return {Function} callback                    callback
   * @author Jaiyashree Subramanian
   */
  async getDealersCountByCategory(filter, callback) {
    this.filter = filter;
    try {
      const query = this.prepareDealersCountQuery();
      const dealersCount = await new Promise((resolve, reject) => {
        postgresDs.connector.query(query, this.dealersCountParams, (err, resultObj) => {
          if (err) reject(new InstabikeError(err));
          return resolve(resultObj);
        });
      });
      return callback(null, dealersCount);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  prepareDealersCountQuery() {
    this.dealersCountParams = [
      this.manufacturerId,
    ];
    let query = `select dealer_categories.id as id, dealer_categories.name as name,
    count(dealers.id) as dealership_count from dealer_categories
    LEFT outer JOIN dealers on dealers.dealer_category_id = dealer_categories.id`;
    if (!lodash.isEmpty(this.filter)) {
      if (this.filter.countryId) {
        this.dealersCountParams.push(this.filter.countryId);
        query = `${query} AND country_id = $${this.dealersCountParams.length} `;
      }
      if (this.filter.zoneIds && this.filter.zoneIds.length) {
        const zoneIds = StringUtils.generateInClause(
          this.dealersCountParams.length + 1,
          this.filter.zoneIds,
        );
        this.dealersCountParams = this.dealersCountParams.concat(this.filter.zoneIds);
        query = `${query} AND zone_id IN (${zoneIds}) `;
      }
      if (this.filter.stateIds && this.filter.stateIds.length) {
        const stateIds = StringUtils.generateInClause(
          this.dealersCountParams.length + 1,
          this.filter.stateIds,
        );
        this.dealersCountParams = this.dealersCountParams.concat(this.filter.stateIds);
        query = `${query} AND state_id IN (${stateIds}) `;
      }
      if (this.filter.cityIds && this.filter.cityIds.length) {
        const cityIds = StringUtils.generateInClause(
          this.dealersCountParams.length + 1,
          this.filter.cityIds,
        );
        this.dealersCountParams = this.dealersCountParams.concat(this.filter.cityIds);
        query = `${query} AND city_id IN (${cityIds}) `;
      }
    }
    query = `${query} where dealer_categories.manufacturer_id  = $1 GROUP BY dealer_categories.id`;
    return query;
  }

  /**
   * To fetch top performing dealers based on the sales for current financial year.
   *
   * @param {object} filter                        filter data
   * @param {Function} callback                    callback
   * @author Ajaykkumar Rajendran
   */
  async getTopPerformingDealers(filter, callback) {
    this.filter = filter;
    try {
      const date = DateUtils.getFinancialYearDates(new Date(this.filter.date));
      const currentMonth = DateUtils.getCurrentMonthDates(new Date());
      const topDealers = this.buildTopPerformingDealersQuery(
        date.from_date,
        date.to_date, currentMonth.from_date, currentMonth.to_date,
      );
      const topPerformingList = await new Promise((resolve, reject) => {
        postgresDs.connector.query(topDealers.statement, topDealers.params, (err, result) => {
          if (err) reject(new InstabikeError(err));
          resolve(result);
        });
      });
      const count = await app.Dealer.count(topDealers.countCriteria);
      return callback(null, { dealers: topPerformingList, count });
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  buildTopPerformingDealersQuery(startDate, endDate, firstDayOfMonth, lastDayOfMonth) {
    this.filter.offset = (this.filter.pageNo - 1) * this.filter.limit;
    let params = [this.manufacturerId, startDate, endDate, firstDayOfMonth, lastDayOfMonth,
      this.filter.limit, this.filter.offset];
    let query = this.topPerformingDealers();
    let joinQuery = '';
    let inQuery = 'd.manufacturer_id = $1';
    const orderBy = ` ORDER BY ${this.filter.order_field} ${this.filter.order_by}`;
    const countCriteria = {};
    countCriteria.and = [{ manufacturer_id: this.manufacturerId }];
    if (!lodash.isEmpty(this.filter)) {
      if (this.filter.countryId) {
        countCriteria.and.push({ country_id: this.filter.countryId });
        const queryString = StringUtils.generateInClause(
          params.length + 1,
          [this.filter.countryId],
        );
        inQuery += ` and d.country_id IN (${queryString}) `;
        params = params.concat([this.filter.countryId]);
      }
      if (this.filter.zoneIds && this.filter.zoneIds.length) {
        countCriteria.and.push({ zone_id: { inq: this.filter.zoneIds } });
        const queryString = StringUtils.generateInClause(
          params.length + 1,
          this.filter.zoneIds,
        );
        inQuery += ` and d.zone_id IN (${queryString}) `;
        params = params.concat(this.filter.zoneIds);
      }
      if (this.filter.stateIds && this.filter.stateIds.length) {
        countCriteria.and.push({ state_id: { inq: this.filter.stateIds } });
        const queryString = StringUtils.generateInClause(
          params.length + 1,
          this.filter.stateIds,
        );
        inQuery += ` and d.state_id IN (${queryString}) `;
        params = params.concat(this.filter.stateIds);
      }
      if (this.filter.cityIds && this.filter.cityIds.length) {
        countCriteria.and.push({ city_id: { inq: this.filter.cityIds } });
        const queryString = StringUtils.generateInClause(
          params.length + 1,
          this.filter.cityIds,
        );
        inQuery += ` and d.city_id IN (${queryString}) `;
        params = params.concat(this.filter.cityIds);
      }
      if (this.filter.dealerCategoryIds && this.filter.dealerCategoryIds.length) {
        countCriteria.and.push({ dealer_category_id: { inq: this.filter.dealerCategoryIds } });
        const queryString = StringUtils.generateInClause(
          params.length + 1,
          this.filter.dealerCategoryIds,
        );
        inQuery += ` and d.dealer_category_id IN (${queryString}) `;
        params = params.concat(this.filter.dealerCategoryIds);
      }
      if (this.filter.vehicleIds && this.filter.vehicleIds.length) {
        const queryString = StringUtils.generateInClause(
          params.length + 1,
          this.filter.vehicleIds,
        );
        joinQuery += `INNER JOIN lead_details ld ON ld.vehicle_id IN (${queryString}) `;
        params = params.concat(this.filter.vehicleIds);
      }
      if (this.filter.searchValue && this.filter.searchValue !== '') {
        countCriteria.and.push({
          or: [
            { name: { regexp: `/${encodeURIComponent(this.filter.searchValue)}/i` } },
            { dealer_code: { regexp: `/${encodeURIComponent(this.filter.searchValue)}/i` } },
          ],
        });
        this.filter.newSearchValue = this.filter.searchValue.replace(/[^a-zA-Z0-9]/g, '\\$&');
        const queryString = StringUtils.generateInClause(
          params.length + 1,
          [`%${this.filter.searchValue}%`],
        );
        inQuery += ` and (d.name ILIKE ${queryString} or d.dealer_code ILIKE ${queryString}) `;
        params = params.concat([`%${this.filter.searchValue}%`]);
      }
      query = `${query} ${joinQuery} WHERE ${inQuery} GROUP BY d.id, dc.name, z.name, s.name,
        c.name LIMIT $6 OFFSET $7) temp ${orderBy}`;
    }
    return { statement: query, countCriteria, params };
  }

  topPerformingDealers(inputs) {
    this.inputs = inputs;
    return `SELECT id, dealer_name, dealer_category, dealer_zone, dealer_state, dealer_city,
    dealer_code, pincode, lead_year_count, YTD_conversion,lead_month_count, MTD_conversion,
    round(CASE WHEN
      (lead_month_count != 0) THEN
      ((MTD_conversion::numeric/lead_month_count::numeric)*100) ELSE 0 END) as MTD_conversion_percentage,
    round(CASE WHEN
      (lead_year_count != 0) THEN
      ((YTD_conversion::numeric/lead_year_count::numeric)*100) ELSE 0 END) as YTD_conversion_percentage from
    (SELECT d.name dealer_name, d.id id, d.dealer_code dealer_code, d.pincode pincode,
    (SELECT COUNT(1) FROM leads l WHERE l.dealer_id = d.id AND l.created_at::timestamp::date BETWEEN $2 AND
      $3) lead_year_count,
    (SELECT COUNT(1) FROM leads l WHERE l.dealer_id = d.id AND l.invoiced_on::timestamp::date BETWEEN $2 AND $3) YTD_conversion,
    (SELECT COUNT(1) FROM leads l WHERE l.dealer_id = d.id AND l.created_at::timestamp::date BETWEEN $4 AND
    $5) lead_month_count,
    (SELECT COUNT(1) FROM leads l WHERE l.dealer_id = d.id AND l.invoiced_on::timestamp::date BETWEEN $4 AND
    $5) MTD_conversion, dc.name dealer_category, z.name dealer_zone, s.name dealer_state, c.name dealer_city FROM dealers d
    inner join dealer_categories dc on dc.id = d.dealer_category_id
    inner join zones z on z.id = d.zone_id
    inner join states s on s.id = d.state_id
    inner join cities c on c.id = d.city_id`;
  }

  /**
   * To fetch dealers sales effectiveness based on product and dealer-id
   *
   * @param  {string} dealerId                     dealer id
   * @param  {Object} filter                   filter object
   * @param  {Function} callback                    callback
   * @return {Function} callback                    callback
   * @author Jaiyashree Subramanian
   */
  async getDealerSalesEffectiveness(dealerId, filter, callback) {
    this.filter = filter;
    this.dealerId = dealerId;
    try {
      const query = this.makeDealerEffectivenessQuery();
      const vehicleCount = await app.Vehicle.count({ manufacturer_id: this.manufacturerId });
      const dealersSalesEffectiveness = await new Promise((resolve, reject) => {
        postgresDs.connector.query(query, this.dealerEffecParams, (err, salesEffectiveness) => {
          if (err) reject(new InstabikeError(err));
          resolve(salesEffectiveness);
        });
      });
      return callback(null, { dealersSalesEffectiveness, count: vehicleCount });
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  makeDealerEffectivenessQuery() {
    this.filter.offset = (this.filter.pageNo - 1) * this.filter.limit;
    this.dealerEffecParams = [this.filter.fromDate, this.filter.toDate,
      this.filter.fromDate, this.filter.toDate, this.filter.limit, this.filter.offset];
    let query = `SELECT vehicle_name, vehicle_type, image_url,
      vehicle_sold_count, lead_count,
      round(CASE WHEN
        ( lead_count != 0) THEN
        ((vehicle_sold_count::numeric/lead_count::numeric)*100) ELSE 0 END) as conversion_percentage from
      (SELECT v.name vehicle_name, v.type vehicle_type, v.image_url image_url,
      SUM(CASE  WHEN (ld.created_at::timestamp::date BETWEEN $1 AND
      $2 AND ld.vehicle_status >= 600 AND ld.vehicle_status < 900) THEN 1 ELSE 0 END) vehicle_sold_count,
      SUM(CASE  WHEN (ld.created_at::timestamp::date BETWEEN $3 AND
      $4 AND ld.vehicle_id = v.id) THEN 1 ELSE 0 END) lead_count FROM vehicles v
      LEFT OUTER JOIN lead_details ld ON ld.vehicle_id = v.id `;
    if (this.dealerId) {
      query = `${query} AND ld.dealer_id = $${this.dealerEffecParams.length + 1} `;
      this.dealerEffecParams = this.dealerEffecParams.concat([this.dealerId]);
    }
    const builder = StringUtils.generateInClause(
      this.dealerEffecParams.length + 1,
      [this.manufacturerId],
    );
    this.dealerEffecParams = this.dealerEffecParams.concat([this.manufacturerId]);
    query = `${query} where v.manufacturer_id  = ${builder}
      GROUP BY v.id) temp ORDER BY ${this.filter.orderField} ${this.filter.orderBy}
      LIMIT $5 OFFSET $6`;
    return query;
  }

  /**
   * To get the conversion rate of the dealer for current financial year.
   *
   * @param {object} filter                        filter data
   * @param {Function} callback                    callback
   * @author Ajaykkumar Rajendran
   */
  async getConversionRate(filter, callback) {
    this.filter = filter;
    try {
      const query = this.buildConversionRateQuery(filter.fromDate, filter.toDate);
      const conversionPercentage = await new Promise((resolve, reject) => {
        loopback.dataSources.postgres.connector.query(query, this.params, (err, resultObj) => {
          if (err) {
            return reject(new InstabikeError(err));
          }
          return resolve(resultObj);
        });
      });
      return callback(null, conversionPercentage);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  buildConversionRateQuery(startDate, endDate) {
    let params = [this.manufacturerId, startDate, endDate];
    let whereClause = '';
    let joinQuery = '';
    let inquery = 'l.manufacturer_id = $1 ';
    let groupBy = `GROUP BY l.dealer_category_id, l.manufacturer_id ) temp on temp.dealer_category_id = dc.id
     where dc.manufacturer_id = $1`;
    if (!lodash.isEmpty(this.filter)) {
      if (this.filter.countryId) {
        const builder = StringUtils.generateInClause(
          params.length + 1,
          [this.filter.countryId],
        );
        params = params.concat([this.filter.countryId]);
        inquery += `and l.country_id = ${builder} `;
      }
      if (this.filter.zoneIds && this.filter.zoneIds.length) {
        const builder = StringUtils.generateInClause(
          params.length + 1,
          this.filter.zoneIds,
        );
        params = params.concat(this.filter.zoneIds);
        inquery += `and l.zone_id IN (${builder}) `;
      }
      if (this.filter.stateIds && this.filter.stateIds.length) {
        const builder = StringUtils.generateInClause(
          params.length + 1,
          this.filter.stateIds,
        );
        params = params.concat(this.filter.stateIds);
        inquery += `and l.state_id IN (${builder}) `;
      }
      if (this.filter.cityIds && this.filter.cityIds.length) {
        const builder = StringUtils.generateInClause(
          params.length + 1,
          this.filter.cityIds,
        );
        params = params.concat(this.filter.cityIds);
        inquery += ` and l.city_id IN (${builder}) `;
      }
      if (this.filter.dealerCategoryIds && this.filter.dealerCategoryIds.length) {
        const builder = StringUtils.generateInClause(
          params.length + 1,
          this.filter.dealerCategoryIds,
        );
        params = params.concat(this.filter.dealerCategoryIds);
        groupBy = ` ${groupBy} AND dc.id IN (${builder}) `;
      }
      if (this.filter.productIds && this.filter.productIds.length) {
        const builder = StringUtils.generateInClause(
          params.length + 1,
          this.filter.productIds,
        );
        params = params.concat(this.filter.productIds);
        joinQuery = ` INNER JOIN lead_details ld ON ld.lead_id = l.id AND
        ld.vehicle_id IN (${builder}) `;
      }
      whereClause = `WHERE ${inquery}`;
    }
    this.params = params;
    return this.conversionRate({
      joinQuery, whereClause, groupBy,
    });
  }

  conversionRate(inputs) {
    this.inputs = inputs;
    return ` SELECT dc.id, dc.name AS dealer_category_name,
    dc.color_code as dealer_category_color_code, temp.created_count,
    temp.invoiced_count from dealer_categories dc
    LEFT JOIN ( SELECT l.dealer_category_id,
    count(1) FILTER (where l.created_at::timestamp::date BETWEEN $2 AND $3) As created_count,
    count(1) FILTER (where l.created_at::timestamp::date BETWEEN $2 AND $3
    AND l.is_invoiced = true) As invoiced_count
    from leads l ${inputs.joinQuery} ${inputs.whereClause} ${inputs.groupBy}`;
  }

  /**
   * To fetch active leads count based on zone, state, city and category
   * filter from a given date for a given period
   *
   * @param  {Object} filter                   filter object
   * @param  {Function} callback                    callback
   * @return {Function} callback                    callback
   * @author Jaiyashree Subramanian
   */
  async getActiveLeads(filter, callback) {
    this.filter = filter;
    try {
      this.prepareFilters();
      this.prepareCountCondition();
      this.prepareWhereCondition('created_at');
      const countQuery = this.prepareCountQuery();
      const activeLeadsQuery = this.prepareActiveLeadsQuery();
      const leadsCount = await new Promise((resolve, reject) => {
        postgresDs.connector.query(countQuery, this.countParams, (err, count) => {
          if (err) reject(new InstabikeError(err));
          resolve(count.length ? count[0].count : 0);
        });
      });
      const activeLeads = await new Promise((resolve, reject) => {
        postgresDs.connector.query(activeLeadsQuery, this.whereParams, (err, result) => {
          if (err) reject(new InstabikeError(err));
          resolve(result);
        });
      });
      return callback(null, { activeLeads, count: leadsCount });
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  prepareFilters() {
    if (!lodash.isEmpty(this.filter)) {
      switch (this.filter.tabGroup) {
        case 'zone':
          this.filter.groupValue = 'zone_name';
          this.filter.groupField = 'zone_id';
          this.filter.groupTable = 'zones';
          break;
        case 'state':
          this.filter.groupValue = 'state_name';
          this.filter.groupField = 'state_id';
          this.filter.groupTable = 'states';
          break;
        case 'city':
          this.filter.groupValue = 'city_name';
          this.filter.groupField = 'city_id';
          this.filter.groupTable = 'cities';
          break;
        case 'dealerCategory':
          this.filter.groupValue = 'dealer_category_name';
          this.filter.groupField = 'dealer_category_id';
          this.filter.groupTable = 'dealer_categories';
          break;
        default:
          this.filter.groupValue = 'zone_name';
          this.filter.groupField = 'zone_id';
          this.filter.groupTable = 'zones';
          break;
      }
    }
  }

  prepareCountCondition() {
    let countCondition = 'WHERE manufacturer_id = $1';
    let params = [this.manufacturerId];
    if (!lodash.isEmpty(this.filter)) {
      if (this.filter.countryId) {
        const queryString =
          StringUtils.generateInClause(params.length + 1, [this.filter.countryId]);
        params = params.concat([this.filter.countryId]);
        countCondition += ` AND country_id = ${queryString}`;
      }
      if (this.filter.zoneIds && this.filter.zoneIds.length) {
        const queryString = StringUtils.generateInClause(params.length + 1, this.filter.zoneIds);
        params = params.concat(this.filter.zoneIds);
        countCondition += ` AND ${this.filter.groupTable === 'zones' ? 'id' : 'zone_id'}
          IN (${queryString})`;
      }
      if (this.filter.stateIds && this.filter.stateIds.length) {
        const queryString = StringUtils.generateInClause(params.length + 1, this.filter.stateIds);
        params = params.concat(this.filter.stateIds);
        countCondition += ` AND ${this.filter.groupTable === 'states' ? 'id' : 'state_id'}
          IN (${queryString})`;
      }
      if (this.filter.cityIds && this.filter.cityIds.length) {
        const queryString = StringUtils.generateInClause(params.length + 1, this.filter.cityIds);
        params = params.concat(this.filter.cityIds);
        countCondition += ` AND ${this.filter.groupTable === 'cities' ? 'id' : 'city_id'}
          IN (${queryString})`;
      }
      if (this.filter.groupTable === 'dealer_categories') {
        params = [];
        if (this.filter.dealerCategoryIds && this.filter.dealerCategoryIds.length) {
          const queryString =
            StringUtils.generateInClause(params.length + 1, this.filter.dealerCategoryIds);
          params = params.concat(this.filter.dealerCategoryIds);
          countCondition = ` WHERE id IN (${queryString})`;
        } else {
          const queryString =
            StringUtils.generateInClause(params.length + 1, [this.manufacturerId]);
          params = params.concat(this.manufacturerId);
          countCondition = `WHERE manufacturer_id = ${queryString}`;
        }
      }
    }
    this.countParams = params;
    this.countCondition = countCondition;
  }

  prepareWhereCondition(dateField) {
    let params = this.countParams;
    let whereCondition = `WHERE l.manufacturer_id = $${params.length + 1}`;
    params = params.concat(this.manufacturerId);
    let joinQuery = '';
    if (!lodash.isEmpty(this.filter)) {
      if (this.filter.fromDate && this.filter.toDate) {
        whereCondition += ` AND l.${dateField}::timestamp::date BETWEEN $${params.length + 1}
          AND $${params.length + 2} `;
        params = params.concat([this.filter.fromDate, this.filter.toDate]);
      }
      if (this.filter.countryId) {
        const countryString =
          StringUtils.generateInClause(params.length + 1, [this.filter.countryId]);
        params = params.concat([this.filter.countryId]);
        whereCondition += ` AND country_id IN (${countryString})`;
      }
      if (this.filter.zoneIds && this.filter.zoneIds.length) {
        const zoneString = StringUtils.generateInClause(params.length + 1, this.filter.zoneIds);
        params = params.concat(this.filter.zoneIds);
        whereCondition += ` AND zone_id IN (${zoneString})`;
      }
      if (this.filter.stateIds && this.filter.stateIds.length) {
        const stateString = StringUtils.generateInClause(params.length + 1, this.filter.stateIds);
        params = params.concat(this.filter.stateIds);
        whereCondition += ` AND state_id IN (${stateString})`;
      }
      if (this.filter.cityIds && this.filter.cityIds.length) {
        const cityString = StringUtils.generateInClause(params.length + 1, this.filter.cityIds);
        params = params.concat(this.filter.cityIds);
        whereCondition += ` AND city_id IN (${cityString})`;
      }
      if (this.filter.dealerCategoryIds && this.filter.dealerCategoryIds.length) {
        const dealerCategoryString =
          StringUtils.generateInClause(params.length + 1, this.filter.dealerCategoryIds);
        params = params.concat(this.filter.dealerCategoryIds);
        whereCondition += ` AND dealer_category_id IN (${dealerCategoryString})`;
      }
      if (this.filter.productIds && this.filter.productIds.length) {
        const productString =
        StringUtils.generateInClause(params.length + 1, this.filter.productIds);
        params = params.concat(this.filter.productIds);
        joinQuery = `INNER JOIN lead_details ld ON l.id = ld.lead_id
          AND vehicle_id IN (${productString})`;
      }
    }
    this.whereParams = params;
    this.whereCondition = whereCondition;
    this.joinQuery = joinQuery;
  }

  prepareCountQuery() {
    const query = `select count(id) from ${this.filter.groupTable} ${this.countCondition}`;
    return query;
  }

  prepareActiveLeadsQuery() {
    this.filter.offset = (this.filter.pageNo - 1) * this.filter.limit;
    this.whereParams = this.whereParams.concat([this.filter.limit, this.filter.offset]);
    let query = `SELECT count(1) AS total_leads, ${this.filter.groupField},
      count(1) FILTER (where is_invoiced = true)  AS converted_leads,
      count(1) FILTER (where category ILIKE 'HOT' AND l.is_lost=false AND is_invoiced=false)  AS hot_leads,
      count(1) FILTER (where category ILIKE 'WARM' AND l.is_lost=false AND is_invoiced=false)  AS warm_leads,
      count(1) FILTER (where category ILIKE 'NEW' AND l.is_lost=false AND is_invoiced=false)  AS fresh_leads,
      count(1) FILTER (where category ILIKE 'COLD' AND l.is_lost=false AND is_invoiced=false)  AS cold_leads from leads l
      ${this.joinQuery} ${this.whereCondition} GROUP BY ${this.filter.groupField}`;
    query = `select name tab_value, temp.*, round(CASE WHEN
      (total_leads != 0) THEN
      ((converted_leads::numeric/total_leads::numeric)*100) ELSE 0 END) as conversion_percentage
      from ${this.filter.groupTable} z LEFT JOIN ( ${query} ) temp on z.id = temp.${this.filter.groupField} ${this.countCondition}
      ORDER BY ${this.filter.orderField} ${this.filter.orderBy} LIMIT $${this.whereParams.length - 1}
      OFFSET $${this.whereParams.length}`;
    return query;
  }

  /**
   * To get the invoiced count of the lead for specific time period.
   *
   * @param {object} filter                        filter data
   * @param {Function} callback                    callback
   * @author Ajaykkumar Rajendran
   */
  async getInvoicedLeadAnalysis(filter, callback) {
    try {
      this.filter = filter;
      const query = this.buildInvoicedLeadAnalysis();
      const countQuery = this.prepareCountQuery();
      const invoicedLeads = await new Promise((resolve, reject) => {
        loopback.dataSources.postgres.connector.query(query, this.whereParams, (err, resultObj) => {
          if (err) {
            return reject(new InstabikeError(err));
          }
          return resolve(resultObj);
        });
      });
      const count = await new Promise((resolve, reject) => {
        postgresDs.connector.query(countQuery, this.countParams, (err, totalCount) => {
          if (err) reject(new InstabikeError(err));
          resolve(totalCount[0].count);
        });
      });
      return callback(null, { invoicedLeads, count });
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  buildInvoicedLeadAnalysis() {
    this.filter.offset = (this.filter.pageNo - 1) * this.filter.limit;
    this.prepareFilters();
    this.prepareCountCondition();
    this.prepareWhereCondition('invoiced_on');
    this.whereParams = this.whereParams.concat([this.filter.limit, this.filter.offset,
      this.filter.fromDate, this.filter.toDate]);
    return ` SELECT ${this.filter.groupTable}.name tab_value,
      temp.invoiced_count from ${this.filter.groupTable} LEFT JOIN( SELECT ${this.filter.groupField},
      count(1) FILTER (where l.invoiced_on::timestamp::date BETWEEN $${this.whereParams.length - 1} AND
      $${this.whereParams.length} AND l.is_invoiced=true ) as invoiced_count FROM leads l ${this.joinQuery} ${this.whereCondition}
      GROUP BY ${this.filter.groupField}) temp on ${this.filter.groupTable}.id = temp.${this.filter.groupField}
      ${this.countCondition} GROUP BY tab_value, temp.invoiced_count
      ORDER BY ${this.filter.orderField} ${this.filter.orderBy}
      LIMIT $${this.whereParams.length - 3} OFFSET $${this.whereParams.length - 2}
    `;
  }

  /**
   * To fetch lost-leads count based on zone, state, city and category
   * filter from a given date for a given period for each reason
   *
   * @param  {Object} filter                   filter object
   * @param  {Function} callback                    callback
   * @return {Function} callback                    callback
   * @author Jaiyashree Subramanian
   */
  async getLeadsLostAnalysis(filter, callback) {
    this.filter = filter;
    try {
      this.prepareFilters();
      this.prepareCountCondition();
      this.prepareWhereCondition('lost_on');
      const countQuery = this.prepareCountQuery();
      const lostReasons = await app.LostReason.find({ fields: ['id', 'reason'] });
      const lostAnalysisQuery = this.prepareLostAnalysisQuery(lostReasons);
      const dataCount = await new Promise((resolve, reject) => {
        postgresDs.connector.query(countQuery, this.countParams, (err, count) => {
          if (err) reject(new InstabikeError(err));
          resolve(count.length ? count[0].count : 0);
        });
      });
      const lostLeadList = await new Promise((resolve, reject) => {
        postgresDs.connector.query(lostAnalysisQuery, this.whereParams, (err, result) => {
          if (err) reject(new InstabikeError(err));
          resolve(result);
        });
      });
      return callback(null, { lostLeadList, count: dataCount });
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  prepareLostAnalysisQuery(lostReasons) {
    this.filter.offset = (this.filter.pageNo - 1) * this.filter.limit;
    this.whereParams = this.whereParams.concat([this.filter.limit, this.filter.offset]);
    let reason = '';
    const lostCategory = lostReasons.map((lostReason) => {
      reason = lostReason.reason.toLowerCase().replace(/ /g, '_');
      return `count(1) FILTER (where lost_reason_id = '${lostReason.id}') AS
        ${reason !== '-' ? reason : 'others'}_count`;
    });
    lostCategory.push(this.filter.groupField);
    let query = `SELECT count(1) FILTER (where lost_reason_id is not NULL) AS total_lost_leads,
      ${lostCategory.join(' , ')} from leads l
      ${this.joinQuery} ${this.whereCondition} GROUP BY ${this.filter.groupField}`;
    query = `select name tab_value, temp.*
      from ${this.filter.groupTable} z LEFT JOIN ( ${query} ) temp on z.id = temp.${this.filter.groupField} ${this.countCondition}
      ORDER BY ${this.filter.orderField} ${this.filter.orderBy} LIMIT $${this.whereParams.length - 1}
      OFFSET $${this.whereParams.length}`;
    return query;
  }

  /**
   * To fetch list of leads based on manufacturerId and the filters applied like
   * city, state, zone, dealer category, or the searched field value.
   *
   * @param {object} filter                                        filter data
   * @param {Function} callback                                       callback
   * @author Jaiyashree Subramanian
   */
  async getLeadList(filter, callback) {
    this.filter = filter;
    try {
      this.prepareLeadListCondition();
      const leadsListQuery = this.prepareLeadListQuery();
      const leadsCountQuery = this.prepareLeadsCountQuery();
      const leadList = await new Promise((resolve, reject) => {
        postgresDs.connector.query(leadsListQuery, this.LeadsListParams, (err, result) => {
          if (err) reject(new InstabikeError(err));
          resolve(result);
        });
      });
      /* eslint no-param-reassign: ["error", { "props": false }] */
      await Promise.all(leadList.map(async (leadData) => {
        const leadAdditionalInfo = await this.getleadAdditionalInfo(leadData.id);
        leadData.vehicles = leadAdditionalInfo.vehicles;
        leadData.test_rides = leadAdditionalInfo.test_rides;
      }));
      const count = await new Promise((resolve, reject) => {
        postgresDs.connector.query(leadsCountQuery, this.LeadsCountParams, (err, result) => {
          if (err) reject(new InstabikeError(err));
          resolve(result[0].count);
        });
      });
      return callback(null, { leads: leadList, count });
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  async getleadAdditionalInfo(leadId) {
    this.leadId = leadId;
    try {
      const leadDetails = await app.LeadDetail.find({
        where: { lead_id: leadId, is_deleted: false },
        include: [
          {
            relation: 'vehicle',
            scope: { fields: ['name'] },
          },
        ],
      });
      const result = { vehicles: [], test_rides: [] };
      await Promise.all(leadDetails.map(async (leadDetailData) => {
        result.vehicles.push(leadDetailData.vehicle().name);
        result.test_rides.push(leadDetailData.test_ride_on);
      }));
      return result;
    } catch (err) {
      throw new InstabikeError(err);
    }
  }

  prepareLeadListCondition() {
    let joinCondition = '';
    this.joinType = 'LEFT JOIN';
    this.LeadsCountParams = [this.manufacturerId];
    const whereCondition = ['l.manufacturer_id = $1'];
    if (!lodash.isEmpty(this.filter)) {
      if (!this.filter.isLost && !this.filter.isInvoiced && !this.filter.isBooked) {
        this.LeadsCountParams = this.LeadsCountParams.concat([!!this.filter.isLost,
          !!this.filter.isInvoiced, !!this.filter.isBooked]);
        whereCondition.push('l.is_lost = $2 and l.is_invoiced = $3 and l.is_booked = $4');
      } else {
        if (this.filter.isLost) {
          whereCondition.push('l.is_lost = true');
        }
        if (this.filter.isInvoiced) {
          whereCondition.push('l.is_invoiced = true');
        }
        if (this.filter.isBooked) {
          whereCondition.push('l.is_booked = true and l.is_lost = false and l.is_invoiced = false');
        }
      }
      if (this.filter.category) {
        whereCondition.push(` l.category ILIKE $${this.LeadsCountParams.length + 1} `);
        this.LeadsCountParams = this.LeadsCountParams.concat([this.filter.category]);
      }
      if (this.filter.countryId) {
        const builder =
          StringUtils.generateInClause(this.LeadsCountParams.length + 1, [this.filter.countryId]);
        this.LeadsCountParams = this.LeadsCountParams.concat([this.filter.countryId]);
        whereCondition.push(` l.country_id = ${builder} `);
      }
      if (this.filter.zoneIds && this.filter.zoneIds.length) {
        const builder = StringUtils.generateInClause(
          this.LeadsCountParams.length + 1,
          this.filter.zoneIds,
        );
        this.LeadsCountParams = this.LeadsCountParams.concat(this.filter.zoneIds);
        whereCondition.push(` l.zone_id IN (${builder}) `);
      }
      if (this.filter.stateIds && this.filter.stateIds.length) {
        const builder = StringUtils.generateInClause(
          this.LeadsCountParams.length + 1,
          this.filter.stateIds,
        );
        this.LeadsCountParams = this.LeadsCountParams.concat(this.filter.stateIds);
        whereCondition.push(` l.state_id IN (${builder}) `);
      }
      if (this.filter.cityIds && this.filter.cityIds.length) {
        const builder = StringUtils.generateInClause(
          this.LeadsCountParams.length + 1,
          this.filter.cityIds,
        );
        this.LeadsCountParams = this.LeadsCountParams.concat(this.filter.cityIds);
        whereCondition.push(` l.city_id IN (${builder}) `);
      }
      if (this.filter.dealerCategoryIds && this.filter.dealerCategoryIds.length) {
        const builder = StringUtils.generateInClause(
          this.LeadsCountParams.length + 1,
          this.filter.dealerCategoryIds,
        );
        this.LeadsCountParams = this.LeadsCountParams.concat(this.filter.dealerCategoryIds);
        whereCondition.push(` l.dealer_category_id IN (${builder}) `);
      }
      if (this.filter.searchValue && this.filter.searchValue !== '') {
        this.filter.searchValue = this.filter.searchValue.replace(/[^a-zA-Z0-9]/g, '\\$&');
        whereCondition.push(` ( l.name ILIKE $${this.LeadsCountParams.length + 1}
          or l.mobile_number ILIKE $${this.LeadsCountParams.length + 1}
          or d.name ILIKE $${this.LeadsCountParams.length + 1}
          or d.dealer_code ILIKE $${this.LeadsCountParams.length + 1} ) `);
        this.LeadsCountParams = this.LeadsCountParams.concat([`%${this.filter.searchValue}%`]);
      }
      if (this.filter.fromDate && this.filter.toDate) {
        whereCondition.push(` l.created_at::timestamp::date BETWEEN $${this.LeadsCountParams.length + 1}
          AND $${this.LeadsCountParams.length + 2} `);
        this.LeadsCountParams = this.LeadsCountParams.concat(this.filter.fromDate);
        this.LeadsCountParams = this.LeadsCountParams.concat(this.filter.toDate);
      }
      if (this.filter.vehicleIds && this.filter.vehicleIds.length) {
        const builder = StringUtils.generateInClause(
          this.LeadsCountParams.length + 1,
          this.filter.vehicleIds,
        );
        this.LeadsCountParams = this.LeadsCountParams.concat(this.filter.vehicleIds);
        joinCondition = ` AND lead_details.vehicle_id IN (${builder})`;
        this.joinType = 'INNER JOIN';
      }
      this.joinCondition = joinCondition;
      this.whereClause = whereCondition.join(' AND ');
    }
  }
  prepareLeadListQuery() {
    this.LeadsListParams = [];
    this.LeadsListParams = this.LeadsListParams.concat(this.LeadsCountParams);
    this.filter.offset = (this.filter.pageNo - 1) * this.filter.limit;
    this.LeadsListParams = this.LeadsListParams.concat([this.filter.limit, this.filter.offset]);
    const query = `SELECT l.*, d.name dealer_name, d.dealer_code dealer_code, (SELECT name
      FROM cities WHERE id = l.city_id) city_name
      FROM leads l ${this.joinType} lead_details ON lead_details.lead_id = l.id ${this.joinCondition}
      INNER JOIN dealers d ON d.id = l.dealer_id WHERE ${this.whereClause} GROUP BY l.id, d.name, d.dealer_code
      ORDER BY ${this.filter.orderField} ${this.filter.orderBy} LIMIT $${this.LeadsListParams.length - 1}
      OFFSET $${this.LeadsListParams.length}`;
    return query;
  }

  prepareLeadsCountQuery() {
    const query = `SELECT count(DISTINCT l.id) FROM lead_details
      right JOIN leads l ON lead_details.lead_id = l.id
      INNER JOIN dealers d ON d.id = l.dealer_id WHERE ${this.whereClause} ${this.joinCondition}`;
    return query;
  }

  /**
   * Get Roles under the module manufacturer
   * @param  {Function} callback
   * @return {Array} List of roles
   */
  async getRoles(callback) {
    this.roles = [];
    try {
      this.roles = await app.Roles.find({
        where: { module: constants.USER_TYPE_NAMES.MANUACTURER },
      });
      return callback(null, this.roles);
    } catch (e) {
      return callback(new InstabikeError(e));
    }
  }

  /**
   * Get vehicle properties based dealer manufacturer
   * Its used for Vehicle comparision
   * @param {Function} callback
   * @returns {List} CompareVehicleLookup
   * @author Ponnuvel G
   */
  async getVehicleProperties(callback) {
    if (this.manufacturerId !== this.currentUser.user_type_id) {
      return callback(new InstabikeError(ErrorConstants.ERRORS.USER.TRY_AGAIN));
    }
    const manufacturer = await app.Manufacturer.findById(this.manufacturerId);
    if (!manufacturer) {
      return callback(new InstabikeError(ErrorConstants.ERRORS.MANUFACTURER.NOT_FOUND));
    }
    const properties = await app.CompareVehicleLookup.find({
      where: { manufacturer_id: manufacturer.id },
      order: 'group_order asc',
    });
    return callback(null, properties);
  }
};
