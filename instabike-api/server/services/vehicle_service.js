/**
 * Vehicle service: this service handles methods such as get all similar vehicles by id,
 * get 360-degree images for a vehicle,get available variants, get vehicle price,
 * get vehicle detail,search vehicles based on filter, get vehicle insurance, create
 * insurance and update insurance.
 */

// import dependencies
const lodash = require('lodash');

// import files
const loopback = require('../server.js');
const BaseService = require('../services/base_service');
const InstabikeError = require('../error/instabike_error');
const ErrorConstants = require('../utils/constants/error_constants');
const StringUtils = require('../utils/string_utils');
const constants = require('../utils/constants/userConstants');

const app = loopback.dataSources.postgres.models;
/**
 * @author Ramanavel Selvaraju
 */

/* eslint radix: ["error", "as-needed"] */

module.exports = class VehicleService extends BaseService {
  constructor(vehicleId, vehicle, variantId) {
    super();
    this.vehicleId = vehicleId;
    this.vehicle = vehicle;
    this.variantId = variantId;
  }
  /**
   * Get Similar Vehicles
   * @param  {Users}   currentUser
   * @param  {List}   vehicleIds
   * @param  {Function} callback
   * @return {List}
   */
  async findSimilarVehicles(currentUser, vehicleIds, callback) {
    this.vehicleIds = vehicleIds;
    try {
      const dealer = await app.Dealer.findOne({ where: { id: currentUser.user_type_id } });
      if (!dealer || !dealer.is_active) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.DEALER.NOT_FOUND));
      }
      const similarVehiclesObj = await app.SimilarVehicle.find({
        where: { vehicle_id: { inq: vehicleIds } }, fields: ['similar_vehicle_id'],
      });
      const similarVehiclesIds = lodash.map(similarVehiclesObj, 'similar_vehicle_id');
      const uniqSimilarVehiclesIds = lodash.uniq(similarVehiclesIds);
      const condition = [
        { id: { nin: vehicleIds } },
        {
          or: [{ id: { inq: uniqSimilarVehiclesIds } },
            { manufacturer_id: dealer.manufacturer_id }],
        },
      ];
      if (this.vehicleIds.length > 0) {
        const vehicle = await app.Vehicle.findById(this.vehicleIds[0]);
        if (vehicle) {
          condition.push({ type: vehicle.type });
        }
      }
      const similarVehicles = await app.Vehicle.find({
        where: {
          and: condition,
        },
        fields: ['id', 'name', 'image_url'],
        order: 'type ASC',
      });
      return callback(null, similarVehicles);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * get list of vehicle gallery Object
   * which holds the set of images to
   * produce 360 degree view for a vehicle.
   * @param  {function} callback
   * @return {function} list of vehicle gallery
   */
  async getThreeSixtyDegree(callback) {
    try {
      const vehicle = await app.Vehicle.findById(this.vehicleId);
      if (!vehicle) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.VEHICLE.NOT_FOUND));
      }
      const vehicleGallery = await app.VehicleGallery.find({
        where: { vehicle_id: vehicle.id, is_three_sixty: true },
        order: 'position ASC',
      });
      return callback(null, vehicleGallery);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * get vehicle variant detail with colors and also
   * its price information.
   * @param  {string}   dealerId
   * @param  {function} callback
   * @return {vehiclePrice} list of vehicleprice for vairant with
   * variant and color details.
   * @author shahul hameed b
   */
  async getVariantDetail(dealerId, callback) {
    try {
      const variantWithPrice = await app.VehiclePrice.find({
        where: {
          dealer_id: this.dealerId, vehicle_id: this.vehicleId, variant_id: this.variantId,
        },
        include: {
          relation: 'variant',
          scope: {
            include: {
              relation: 'colors',
            },
          },
        },
      });
      return callback(null, variantWithPrice);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * Get the vehicle price by variant, dealer and vehicle id.
   *
   * @param {string} dealerId                          variant id
   * @param {string} variantId                         variant id
   * @param {Function} callback                        callback
   * @author Ajaykkumar Rajendran
   */
  async getVehiclePrice(dealerId, variantId, callback) {
    try {
      const vehiclePriceObj = await app.VehiclePrice.findOne({
        where: {
          vehicle_id: this.vehicleId,
          variant_id: variantId,
          dealer_id: dealerId,
        },
      });
      return callback(null, vehiclePriceObj);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * To get vehicle detail with its price, variants, colors and features.
   *
   * @param  {function} callback      callback
   * @return {function} callback      callback
   * @author Jaiyashree Subramanian
   */
  async getVehicleDetail(currentUser, callback) {
    try {
      const vehicle = await app.Vehicle.findOne({
        where: { id: this.vehicleId },
        include: ['manufacturer', 'features', {
          relation: 'variants',
          scope: {
            include: ['colors', {
              relation: 'prices',
              scope: {
                where: { dealer_id: currentUser.user_type_id },
                order: 'onroad_price ASC',
              },
            }],
          },
        }, {
          relation: 'similarVehicles', scope: { fields: ['similar_vehicle_id'] },
        }],
      });
      if (!vehicle) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.VEHICLE.NOT_FOUND));
      }
      return callback(null, vehicle);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * To get vehicle detail with its price, variants, colors and features.
   *
   * @param {string} manufacturerId           manufacturer id
   * @param {string} dealerId                 dealer id
   * @param {Object} searchFilter             search Option
   * @param  {Users} currentUser
   * @author Jagajeevan
   */
  async searchVehicle(manufacturerId, dealerId, searchFilter, currentUser, callback) {
    this.searchFilter = searchFilter;
    this.searchCriteria = [{ manufacturer_id: manufacturerId }, { is_active: true }];
    try {
      if (this.searchFilter.budget && this.searchFilter.budget.length) {
        const budgetFilterCond = lodash.split(this.searchFilter.budget, '-');
        const vehicleIds = await app.VehiclePrice.find({
          where: {
            and: [
              { dealer_id: dealerId },
              { ex_showroom_price: { between: [budgetFilterCond[0], budgetFilterCond[1]] } },
            ],
          },
          fields: ['vehicle_id'],
        });
        const vehicleIdArr = vehicleIds.map(vehicleId => vehicleId.vehicle_id);
        this.searchCriteria.push({ id: { inq: vehicleIdArr } });
      }

      if (this.searchFilter.engine && this.searchFilter.engine.length) {
        const engineFilterCond = lodash.split(this.searchFilter.engine, '-');
        this.searchCriteria
          .push({ displacement: { between: [engineFilterCond[0], engineFilterCond[1]] } });
      }

      if (this.searchFilter.type && this.searchFilter.type.length) {
        this.searchCriteria.push({ type: this.searchFilter.type });
      }
      let searchByPrice = false;
      if (this.searchFilter.orderField === 'price' || this.searchFilter.orderField === undefined) {
        this.searchFilter.orderField = 'name';
        this.searchFilter.orderBy = 'ASC';
        searchByPrice = true;
      }
      const vehicles = await app.Vehicle.find({
        where: { and: this.searchCriteria },
        include: {
          relation: 'variants',
          scope: {
            fields: ['id', 'name'],
            include: ['colors',
              {
                relation: 'prices',
                scope: {
                  fields: ['id', 'ex_showroom_price', 'is_prefered'],
                  where: { dealer_id: dealerId },
                  order: 'is_prefered desc',
                },
              }],
          },
        },
        order: `${this.searchFilter.orderField} ${this.searchFilter.orderBy}`,
      });
      //  added by Vignesh to list the vehicle in prefered Order
      if (searchByPrice === false && this.searchFilter.orderField !== 'bhp') {
        if (vehicles.length) {
          const aVehicles = vehicles;
          let newVehicles = [];
          const prefVehicles = [];
          const nonprefVehicles = [];
          Object.keys(aVehicles).forEach((e) => {
            if ((aVehicles[e].variants()[0]) && (aVehicles[e].variants()[0].prices()) &&
                  (aVehicles[e].variants()[0].prices().is_prefered)) {
              prefVehicles.push(aVehicles[e]);
            } else {
              nonprefVehicles.push(aVehicles[e]);
            }
          });
          prefVehicles.sort((a, b) => {
            {
              const nameA = a.name.toLowerCase();
              const nameB = b.name.toLowerCase();
              if (nameA < nameB) {
                return -1;
              }
              if (nameA > nameB) {
                return 1;
              }
              return 0;
            }
          });
          nonprefVehicles.sort((a, b) => {
            {
              const nameA = a.name.toLowerCase();
              const nameB = b.name.toLowerCase();
              if (nameA < nameB) {
                return -1;
              }
              if (nameA > nameB) {
                return 1;
              }
              return 0;
            }
          });
          newVehicles = prefVehicles.concat(nonprefVehicles);
          return callback(null, newVehicles);
        }
        return callback(null, vehicles);
      }
      if (searchByPrice) {
        if (vehicles.length) {
          const vehicleId = lodash.map(vehicles, 'id');
          const start = 1;
          const builder = StringUtils.generateInClause(start + 1, vehicleId);
          const query = `SELECT MIN(ex_showroom_price), vehicle_id FROM vehicle_prices
          WHERE dealer_id = $${start} AND vehicle_id IN (${builder})
          GROUP BY vehicle_id ORDER BY MIN(ex_showroom_price)`;
          let params = [dealerId];
          params = params.concat(vehicleId);
          loopback.dataSources.postgres.connector.query(query, params, (err, resultObjects) => {
            if (err) return callback(new InstabikeError(err));
            const vehiclesObj = [];
            const vehiclesArray = [];
            resultObjects.map((result) => {
              vehicles.map((vehicleObj) => {
                if (vehicleObj.id === result.vehicle_id) {
                  vehiclesArray.push(vehicleObj);
                  vehicles.splice(vehicles.indexOf(vehicleObj), 1);
                }
                return true;
              });
              return true;
            });
            if (resultObjects.length) {
              resultObjects.map((result) => {
                vehiclesArray.map((vehicleObj) => {
                  if (vehicleObj.id === result.vehicle_id) {
                    const singleVehicleObj = vehicleObj.toJSON();
                    const sortedVehicleData = lodash.sortBy(
                      singleVehicleObj.variants,
                      (variant) => {
                        if (variant.prices !== undefined) {
                          return parseInt(variant.prices.ex_showroom_price);
                        }
                        return variant.prices;
                      },
                    );
                    singleVehicleObj.variants = sortedVehicleData;
                    vehiclesObj.push(singleVehicleObj);
                  }
                  return vehicles;
                });
                return resultObjects;
              });
              vehicles.map((vehicle) => {
                vehiclesObj.push(vehicle);
                return true;
              });
              return callback(null, vehiclesObj);
            }
            return callback(null, vehicles);
          });
        } else {
          return callback(null, vehicles);
        }
      } else {
        return callback(null, vehicles);
      }
      return null;
    } catch (error) {
      return callback(error);
    }
  }

  /**
   * Get Insurance Details against vehicle and variant
   * @param  {String}   dealerId
   * @param  {String}   variantId
   * @param  {Function} callback
   * @return {Array} - List of insurances
   * @author Ponnuvel G
   */
  async getVehicleInsurance(dealerId, variantId, callback) {
    try {
      const price = await app.VehiclePrice.findOne({
        where: {
          vehicle_id: this.vehicleId,
          variant_id: variantId,
          dealer_id: dealerId,
        },
      });
      let insurances = await app.VehicleInsurance.find({
        where: { vehicle_price_id: price.id },
      });
      if (insurances.length === 0) {
        insurances = await this.createInsurance(price);
      }
      return callback(null, { insurances, isInsuranceSplit: price.is_insurance_split });
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * Create Insurance details for particular vehicle and variant using vehicle price
   * @param  {VehiclePrice}  price
   * @return {Promise} - List of insurances
   * @author Ponnuvel G
   */
  async createInsurance(price) {
    try {
      this.insurances = [];
      const compulsoryPACover = await app.VehicleInsurance.create({
        type: 'compulsory_pa_cover',
        validity: 5,
        amount: 0,
        vehicle_price_id: price.id,
      });
      this.insurances.push(compulsoryPACover);
      const zeroDepreciation = await app.VehicleInsurance.create({
        type: 'zero_depreciation',
        amount: 0,
        vehicle_price_id: price.id,
      });
      this.insurances.push(zeroDepreciation);
      const odPremiumFiveYear = await app.VehicleInsurance.create({
        type: 'od_premium',
        validity: 5,
        amount: 0,
        vehicle_price_id: price.id,
      });
      this.insurances.push(odPremiumFiveYear);
      const odPremiumOneYear = await app.VehicleInsurance.create({
        type: 'od_premium',
        validity: 1,
        amount: 0,
        vehicle_price_id: price.id,
      });
      this.insurances.push(odPremiumOneYear);
      const tpPremium = await app.VehicleInsurance.create({
        type: 'tp_premium',
        validity: 5,
        amount: 0,
        vehicle_price_id: price.id,
      });
      this.insurances.push(tpPremium);
      const totalAmount = await app.VehicleInsurance.create({
        type: 'total_amount',
        validity: 5,
        amount: 0,
        vehicle_price_id: price.id,
      });
      this.insurances.push(totalAmount);
      return this.insurances;
    } catch (e) {
      throw new InstabikeError(e);
    }
  }

  /**
   * Update list of vehicle insurances
   * @param  {String}   dealerId
   * @param  {String}   variantId
   * @param  {Array}   insurances - VehicleInsurance
   * @param  {Function} callback
   * @return {Promise} - Updated Insurance details
   * @author Ponnuvel G
   */
  /* eslint no-param-reassign: ["error", { "props": false }] */
  async updateVehicleInsurance(dealerId, variantId, isInsuranceSplit, insurances, callback) {
    try {
      const price = await app.VehiclePrice.findOne({
        where: {
          vehicle_id: this.vehicleId,
          variant_id: variantId,
          dealer_id: dealerId,
        },
      });
      if (!price) {
        return callback(new InstabikeError(ErrorConstants.VEHICLE.PRICE_NOT_FOUND));
      }
      if (price.is_insurance_split !== isInsuranceSplit) {
        await price.updateAttributes({ is_insurance_split: isInsuranceSplit });
      }
      for (let i = 0; i < insurances.length; i += 1) {
        insurances[i].vehicle_price_id = price.id;
        await app.VehicleInsurance.upsert(insurances[i]);
      }
      const allInsurances = await app.VehicleInsurance.find({
        where: { vehicle_price_id: price.id },
      });
      return callback(null, { insurances: allInsurances, isInsuranceSplit });
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }
  //    added by Vignesh to update the vehicle as prefered based on dealerId and VehicleId
  async updatePreferedVehicle(vehicleId, dealerId, callback) {
    try {
      const dealer = await app.Dealer.findOne({ where: { dealer_id: this.dealerId } });
      if (!dealer || !dealer.is_active) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.DEALER.NOT_FOUND));
      }
      const params = [dealerId, vehicleId];

      const qry = `update vehicle_prices set is_prefered= case is_prefered 
      when true then false when false then true end where dealer_id=$1
      and vehicle_id=$2`;
      /* eslint-disable no-unused-vars */
      await
      loopback.dataSources.postgres.connector.query(qry, params, (err, res) => {
        if (err) {
          return callback(new InstabikeError(err));
        }
        return true;
      });
      return callback(null, { message: constants.MESSAGE.UPDATE });
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }
};
