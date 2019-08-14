/**
 * Lead services: this service handles methods such as get list of leads by filter,
 * create a new lead, update lead, update lead-detail, get complete detail of a lead by Id,
 * get leads count by status, get leads list by status, get in-showroom leads by today, to
 * mark a lead as lost, get lost reasons, get follow-ups for today, get follo-up done for today,
 * schedule follow-up, mark follow-up as complete, add comment to lead, get monthly lead summary,
 * update lead vehicle status as lost on invoice, get target completion, update target achieved,
 * send sms/email notification and update lead.
 */

// import dependencies
const lodash = require('lodash');
const moment = require('moment');
const dot = require('dot');

// import files
const BaseService = require('../services/base_service');
const TargetService = require('../services/target_service');
const loopback = require('../server.js');
const InstabikeError = require('../error/instabike_error');
const ErrorConstants = require('../utils/constants/error_constants');
const constants = require('../utils/constants/userConstants');
const DateUtils = require('../utils/date_utils');
const StringUtils = require('../utils/string_utils');

const app = loopback.dataSources.postgres.models;
const postgresDs = loopback.dataSources.postgres;

/**
 * @author Mohammed Mahroof
 */
module.exports = class LeadService extends BaseService {
  constructor(id, lead, currentUser) {
    super(currentUser);
    this.id = id;
    this.leadId = id;
    this.lead = lead;
    this.currentUser = currentUser;
  }
  /**
   * To find the list of leads with respect to their status
   *
   * @param  {String}   leadStatus
   * @param  {Function} callback
   * @return {Array}    list of leads found
   * @author Mohammed Mahroof, Jagajeevan
   */
  async fetchLeadsByStatus(leadStatus, leadReason, limitCount, skipCount, callback) {
    try {
      const statusCondition = [];
      const dealerUserIds = await this.getDealerUserIds();
      let start = moment.utc().startOf('month');
      const end = moment.utc().endOf('day');
      if (dealerUserIds.length) {
        statusCondition.push({ assigned_to: { inq: dealerUserIds } });
      } else {
        return callback();
      }
      if (leadStatus === 'invoiced') {
        if (!!leadReason && leadReason.toLowerCase() === 'to_be_registered') {
          statusCondition.push({ status: { between: [600, 700] } });
        } else if (!!leadReason && leadReason.toLowerCase() === 'registered') {
          statusCondition.push({ status: { between: [701, 750] } });
        } else if (!!leadReason && leadReason.toLowerCase() === 'delivered') {
          statusCondition.push({ status: { between: [751, 899] } });
        } else {
          statusCondition.push({ status: { between: [600, 899] } });
        }
        statusCondition.push({ is_invoiced: true }, { invoiced_on: { between: [start, end] } });
      } else if (leadStatus === 'booked') {
        statusCondition.push(
          { is_invoiced: false },
          { is_lost: false },
          { is_booked: true },
          { booked_on: { between: [start, end] } },
        );
      } else if (leadStatus === 'lost') {
        statusCondition.push({ is_lost: true }, { lost_on: { between: [start, end] } });
        if (!!leadReason && leadReason.toLowerCase() !== 'all') {
          let lostReasonIds = await new Promise((resolve, reject) => {
            postgresDs.connector.query(
              'SELECT id from lost_reasons where lower(category) = $1',
              [leadReason.toLowerCase()], (err, result) => {
                if (err) reject(new InstabikeError(err));
                resolve(result);
              },
            );
          });
          lostReasonIds = lodash.map(lostReasonIds, 'id');
          statusCondition.push({ lost_reason_id: { inq: lostReasonIds } });
        }
      } else {
        start = moment.utc().subtract(60, 'days');
        statusCondition.push(
          { category: leadStatus.toUpperCase() },
          { is_invoiced: false }, { is_lost: false }, { is_booked: false },
          { created_at: { between: [start, end] } },
        );
      }
      let leads = [];
      leads = await app.Lead.find({
        where: { and: statusCondition },
        include: [
          { relation: 'financier_lead', scope: { fields: 'id' } },
          {
            relation: 'lead_details',
            scope: {
              where: { is_deleted: false },
              include: { relation: 'vehicle', scope: { fields: ['id', 'name'] } },
            },
          },
          { relation: 'assignee', scope: { fields: ['id', 'first_name', 'last_name'] } },
          'lostReason',
        ],
        order: 'created_at DESC',
        limit: limitCount,
        skip: (skipCount * limitCount),
      });
      await leads.map((lead) => {
        const leadObj = lead;
        const testRides = lodash.filter(lead.lead_details(), { test_ride_status: 400 });
        leadObj.testRideStatus = testRides.length;
        return leads;
      });
      return callback(null, leads);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * create a new lead with input user object.
   * create the lead as fresh if the lead createLead
   * by sales person if not then assign as UNASSIGNED.
   * @param  {object}   loggedInPerson
   * @param  {function} callback
   * @return {function}
   * @author shahul hameed b
   */
  async createNewLead(loggedInPerson, callback) {
    try {
      const dealer = await app.Dealer.findById(this.lead.dealer_id);
      if (!dealer || !dealer.is_active) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.DEALER.NOT_FOUND));
      }
      if (this.lead.user_type_name === constants.USER_TYPE_NAMES.CUSTOMER) {
        this.lead.type = constants.LEAD_TYPES.ONLINE;
        this.lead.status = constants.LEAD_STATUS.NEW;
        this.lead.category = constants.LEAD_CATEGORIES.NEW;
      } else {
        this.lead.assigned_to = loggedInPerson.id;
        this.lead.owner_id = loggedInPerson.id;
        this.lead.type = constants.LEAD_TYPES.OFFLINE;
        this.lead.status = constants.LEAD_STATUS.NEW;
        this.lead.category = constants.LEAD_CATEGORIES.NEW;
      }
      let leadObj = await app.Lead.find({ where: { mobile_number: this.lead.mobile_number } });
      if (leadObj && leadObj.length > 0) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.LEAD.EXIST));
      }
      leadObj = await this.createLead(this.lead);
      return callback(null, leadObj);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
  * Update Lead and Lead Details
  * @param  {object}     leadObj
  * @param  {function} callback
  * @return {function} callback
  * @author Ponnuvel G
  */
  async update(leadObj, callback) {
    try {
      let lead = await app.Lead.findById(this.id);
      if (!lead) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.LEAD.NOT_FOUND));
      }
      lead = await app.Lead.upsert(this.lead);
      let leadDetails = [];
      if (leadObj.leadDetails) {
        leadDetails = await this.updateLeadDetails(leadObj.leadDetails);
      }
      return callback(null, { lead, leadDetails });
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  async updateLeadDetails(leadDetails) {
    this.leadDetails = leadDetails;
    const promises = this.leadDetails.map(async (details) => {
      const leadDetail = await app.LeadDetail.upsertWithWhere({
        id: details.id,
        vehicle_id: details.vehicle_id,
        lead_id: details.lead_id,
        dealer_id: details.dealer_id,
      }, details);
      return leadDetail;
    });
    const results = await Promise.all(promises);
    return results;
  }

  /**
  * Get lead by ID with Lead Details, Followup, Lead Financial Details and Lost reason if exists
  * @param  {function} callback
  * @return {Lead} lead
  * @author Ponnuvel G
  */
  async getDetails(callback) {
    try {
      const lead = await app.Lead.findOne({
        where: { id: this.id },
        include: [
          {
            relation: 'lead_details',
            scope: {
              where: { vehicle_status: { lte: 900 }, is_deleted: false },
              include: [
                {
                  relation: 'vehicle',
                  scope: {
                    include: {
                      relation: 'dealer_vehicles',
                      scope: {
                        fields: ['id', 'test_ride_vehicle'],
                        where: { dealer_id: this.currentUser.user_type_id },
                        limit: 1,
                      },
                    },
                    fields: ['name', 'image_url'],
                  },
                },
                {
                  relation: 'financier_lead',
                  scope: {
                    where: { status: { neq: 930 } },
                    fields: ['id', 'status'],
                  },
                },
              ],
            },
          },
          { relation: 'follow_up', scope: { where: { is_completed: false } } }, 'lostReason',
          { relation: 'assignee', scope: { fields: ['first_name', 'last_name'] } },
        ],
      });
      if (!lead) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.LEAD.NOT_FOUND));
      }
      return callback(null, lead);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * To fetch leads count based on zone, state, city, date and status filter
   *
   * @param  {Object} filter                   filter object
   * @param  {Function} callback                    callback
   * @return {Function} callback                    callback
   * @author Jaiyashree Subramanian, Jagajeevan (modified)
   */
  async getLeadsCountByStatus(filter, callback) {
    this.filter = filter;
    try {
      let query;
      if (this.filter.count) {
        this.dealerUserIds = await this.getDealerUserIds();
        if (this.dealerUserIds.length === 0) {
          return callback();
        }
        query = await this.buildLeadsCountByStatusQuery();
      } else {
        query = this.prepareLeadsCountQuery();
      }
      const leadsCount = await new Promise((resolve, reject) => {
        postgresDs.connector.query(query, this.LeadsCountParams, (err, leadCount) => {
          if (err) reject(new InstabikeError(err));
          resolve(leadCount);
        });
      });
      if (this.filter.count) {
        const targetCount = await this.getDealerSalesTarget();
        leadsCount[0].target = targetCount.target;
      }
      return callback(null, leadsCount);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  prepareLeadsCountQuery() {
    let joinQuery = '';
    let query = `SELECT
      count(1) FILTER (where category LIKE 'HOT' AND is_lost = false AND is_booked = false
        AND is_invoiced = false ) AS hot_leads,
      count(1) FILTER (where category LIKE 'WARM' AND is_lost = false AND is_invoiced = false
        AND is_booked = false) AS warm_leads,
      count(1) FILTER (where category LIKE 'NEW' AND is_lost = false AND is_invoiced = false
        AND is_booked = false)  AS fresh_leads,
      count(1) FILTER (where category LIKE 'COLD' AND is_lost = false AND is_invoiced = false
        AND is_booked = false) AS cold_leads,
      count(1) FILTER (where is_lost = true)  AS lost_leads,
      count(1) FILTER (where is_invoiced = false and is_lost = false and is_booked = true) AS booked_leads,
      count(1) FILTER (where is_invoiced = true)  AS invoiced_leads from leads l`;
    if (!lodash.isEmpty(this.filter)) {
      this.LeadsCountParams = [this.filter.manufacturer_id];
      const whereCondition = [' l.manufacturer_id =  $1'];
      if (this.filter.countryId) {
        const builder = StringUtils.generateInClause(
          this.LeadsCountParams.length + 1,
          [this.filter.countryId],
        );
        this.LeadsCountParams = this.LeadsCountParams.concat([this.filter.countryId]);
        whereCondition.push(` l.country_id =${builder} `);
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
      if (this.filter.fromDate && this.filter.toDate) {
        whereCondition.push(` l.created_at::timestamp::date BETWEEN $${this.LeadsCountParams.length + 1}
          AND $${this.LeadsCountParams.length + 2} `);
        this.LeadsCountParams = this.LeadsCountParams.concat(this.filter.fromDate);
        this.LeadsCountParams = this.LeadsCountParams.concat(this.filter.toDate);
      }
      if (this.filter.productIds && this.filter.productIds.length) {
        const builder = StringUtils.generateInClause(
          this.LeadsCountParams.length + 1,
          this.filter.productIds,
        );
        this.LeadsCountParams = this.LeadsCountParams.concat(this.filter.productIds);
        joinQuery = `INNER JOIN lead_details ld ON l.id = ld.lead_id
          AND vehicle_id IN (${builder})`;
      }
      const whereClause = whereCondition.join(' AND ');
      query = `${query} ${joinQuery} WHERE ${whereClause}`;
    }
    return query;
  }

  /**
   * To fetch leads based on zone, state, city, date and status filter
   *
   * @param  {Object} leadsFilter              filter object
   * @param  {Function} callback                    callback
   * @return {Function} callback                    callback
   * @author Jaiyashree Subramanian, Jagajeevan
   */
  async fetchLeadsByFilter(leadsFilter, callback) {
    this.leadsFilter = leadsFilter;
    try {
      this.dealerUserIds = '';
      this.leadIds = '';
      let whereCondition;
      let leadsCount;
      const leadDetailCondition = [{ is_deleted: false }];
      if (this.leadsFilter.dealer) {
        this.dealerUserIds = await this.getDealerUserIds('target');
        if (this.dealerUserIds.length === 0) {
          return callback();
        }

        if (leadsFilter.interestedVehicles && leadsFilter.interestedVehicles.length) {
          leadDetailCondition.push({ vehicle_id: { inq: leadsFilter.interestedVehicles } });
          await this.getVehicleBasedLeads(leadsFilter.interestedVehicles);
          if (this.leadIds === '') {
            return callback();
          }
        }
        whereCondition = this.prepareFilterDealerLeads(this.leadsFilter);
        leadsCount = await app.Lead.count({ and: whereCondition });
      } else {
        whereCondition = this.prepareFilterLeads(this.leadsFilter);
        leadsCount = await app.Lead.count(this.whereCount);
      }
      let leads = await app.Lead.find({
        where: { and: whereCondition },
        include: ['user',
          { relation: 'financier_lead', scope: { fields: ['id'] } },
          {
            relation: 'lead_details',
            scope: {
              where: { and: leadDetailCondition },
              include: [{ relation: 'vehicle', scope: { fields: ['id', 'name'] } },
                {
                  relation: 'financier_lead',
                  scope: { where: { status: { neq: 930 } }, fields: ['id', 'status'] },
                }],
              order: 'invoiced_on DESC',
            },
          },
          {
            relation: 'dealer',
            scope: { fields: ['id', 'name', 'dealer_code'] },
          },
          {
            relation: 'city',
            scope: { fields: ['id', 'name'] },
          },
          {
            relation: 'assignee',
            scope: { fields: ['id', 'first_name', 'last_name'] },
          },
          'lostReason',
        ],
        order: `${leadsFilter.orderField} ${leadsFilter.orderBy}`,
        limit: leadsFilter.limit,
        skip: (leadsFilter.pageNo - 1) * leadsFilter.limit,
      });
      await leads.map((lead) => {
        const leadObj = lead;
        const testRides = lodash.filter(lead.lead_details(), { test_ride_status: 400 });
        leadObj.testRideStatus = testRides.length;
        return leads;
      });
      if (this.leadsFilter.filterBy === 'created') {
        leads = lodash.groupBy(leads, 'category');
      } else if (this.leadsFilter.filterBy === 'invoiced') {
        const leadObj = {};
        if (leads.length) {
          leadObj.invoiced = leads;
        }
        return callback(null, { leadsCount, leads: leadObj });
      } else if (this.leadsFilter.filterBy === 'booked') {
        const leadObj = {};
        if (leads.length) {
          leadObj.booked = leads;
        }
        return callback(null, { leadsCount, leads: leadObj });
      } else if (this.leadsFilter.filterBy === 'lost') {
        const leadObj = {};
        if (leads.length) {
          leadObj.lost = leads;
        }
        return callback(null, { leadsCount, leads: leadObj });
      } else {
        const invoiced = [];
        const booked = [];
        const lost = [];
        const allLeads = [];
        if (leads.length) {
          await new Promise((resolve, reject) => {
            leads.map((lead) => {
              if (lead.is_invoiced === true && lead.invoiced_on) {
                resolve(invoiced.push(lead));
              } else if (lead.is_lost === false && lead.is_invoiced === false &&
                lead.is_booked === true && lead.booked_on) {
                resolve(booked.push(lead));
              } else if (lead.is_lost === true && lead.lost_on) {
                resolve(lost.push(lead));
              } else if (lead.created_at) {
                resolve(allLeads.push(lead));
              } else {
                reject(new InstabikeError(ErrorConstants.ERRORS.LEAD.NOT_FOUND));
              }
              return true;
            });
          });
          leads = lodash.groupBy(allLeads, 'category');
          leads.invoiced = invoiced;
          leads.booked = booked;
          leads.lost = lost;
        }
        return callback(null, {
          leadsCount, leads,
        });
      }
      return callback(null, { leadsCount, leads });
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  prepareFilterLeads(leadsFilter) {
    this.whereCondition = [];
    this.whereCount = {};
    if (leadsFilter.manufacturer_id) {
      this.whereCondition.push({ manufacturer_id: leadsFilter.manufacturer_id });
      this.whereCount.manufacturer_id = leadsFilter.manufacturer_id;
    }
    if (leadsFilter.category) {
      this.whereCondition.push({ category: { regexp: `/${encodeURIComponent(this.leadsFilter.category)}/i` } });
      this.whereCount.category = { regexp: `/${encodeURIComponent(this.leadsFilter.category)}/i` };
    }
    if (leadsFilter.isLost) {
      this.whereCondition.push({ is_lost: true });
      this.whereCount.is_lost = true;
    } else {
      this.whereCondition.push({ is_lost: false });
      this.whereCount.is_lost = false;
    }
    if (leadsFilter.isInvoiced) {
      this.whereCondition.push({ is_invoiced: true });
      this.whereCount.is_invoiced = true;
    } else {
      this.whereCondition.push({ is_invoiced: false });
      this.whereCount.is_invoiced = false;
    }
    if (leadsFilter.isBooked) {
      this.whereCondition.push({ is_booked: true });
      this.whereCount.is_booked = true;
    }
    if (leadsFilter.zoneIds && leadsFilter.zoneIds.length) {
      this.whereCondition.push({ zone_id: { inq: leadsFilter.zoneIds } });
      this.whereCount.zone_id = { inq: leadsFilter.zoneIds };
    }
    if (leadsFilter.cityIds && leadsFilter.cityIds.length) {
      this.whereCondition.push({ city_id: { inq: leadsFilter.cityIds } });
      this.whereCount.city_id = { inq: leadsFilter.cityIds };
    }
    if (leadsFilter.dealerCategoryIds && leadsFilter.dealerCategoryIds.length) {
      this.whereCondition.push({ dealer_category_id: { inq: leadsFilter.dealerCategoryIds } });
      this.whereCount.dealer_category_id = { inq: leadsFilter.dealerCategoryIds };
    }
    if (leadsFilter.fromDate && leadsFilter.toDate) {
      this.whereCondition.push({
        created_at: { between: [leadsFilter.fromDate, leadsFilter.toDate] },
      });
      this.whereCount.created_at = { between: [leadsFilter.fromDate, leadsFilter.toDate] };
    }
    return this.whereCondition;
  }

  /**
   * To fetch leads based dealerid and status
   * @param  {Function} callback
   * @return {LeadsByCategory}
   * @author Vishesh Sagar
   */
  async getInShowroomLeadsByToday(callback) {
    const start = moment.utc().startOf('month');
    const end = moment.utc().endOf('day');
    try {
      const userIds = await this.getDealerUserIds();
      const leads = await app.Lead.find({
        where: {
          and: [
            { assigned_to: { inq: userIds } },
            { created_at: { between: [start, end] } },
            { type: constants.LEAD_TYPES.OFFLINE },
            { is_invoiced: false },
            { is_booked: false },
            { is_lost: false },
          ],
        },
        include: [{ relation: 'lead_details', scope: { where: { is_deleted: false }, include: 'vehicle' } },
          { relation: 'financier_lead', scope: { fields: ['id'] } },
          { relation: 'assignee', scope: { fields: ['id', 'first_name', 'last_name'] } }],
        order: 'created_at DESC',
      });
      await leads.map((lead) => {
        const leadObj = lead;
        const testRides = lodash.filter(lead.lead_details(), { test_ride_status: 400 });
        leadObj.testRideStatus = testRides.length;
        return leads;
      });
      const groupedLeads = lodash.groupBy(leads, 'category');
      const invoicedLeads = await app.Lead.find({
        where: {
          and: [
            { assigned_to: { inq: userIds } },
            { created_at: { between: [start, end] } },
            { type: constants.LEAD_TYPES.OFFLINE },
            { is_invoiced: true },
          ],
        },
        include: [{ relation: 'lead_details', scope: { where: { is_deleted: false }, include: 'vehicle' } },
          { relation: 'financier_lead', scope: { fields: ['id'] } },
          { relation: 'assignee', scope: { fields: ['id', 'first_name', 'last_name'] } }],
        order: 'created_at DESC',
      });
      if (invoicedLeads.length > 0) {
        groupedLeads.INVOICED = invoicedLeads;
      }
      const bookedLeads = await app.Lead.find({
        where: {
          and: [
            { assigned_to: { inq: userIds } },
            { created_at: { between: [start, end] } },
            { type: constants.LEAD_TYPES.OFFLINE },
            { is_invoiced: false },
            { is_booked: true },
          ],
        },
        include: [{ relation: 'lead_details', scope: { where: { is_deleted: false }, include: 'vehicle' } },
          { relation: 'financier_lead', scope: { fields: ['id'] } },
          { relation: 'assignee', scope: { fields: ['id', 'first_name', 'last_name'] } }],
        order: 'created_at DESC',
      });
      if (bookedLeads.length > 0) {
        groupedLeads.BOOKED = bookedLeads;
      }
      const lostLeads = await app.Lead.find({
        where: {
          and: [
            { assigned_to: { inq: userIds } },
            { created_at: { between: [start, end] } },
            { type: constants.LEAD_TYPES.OFFLINE },
            { is_lost: true },
          ],
        },
        include: [{ relation: 'lead_details', scope: { where: { is_deleted: false }, include: 'vehicle' } },
          { relation: 'financier_lead', scope: { fields: ['id'] } },
          { relation: 'assignee', scope: { fields: ['id', 'first_name', 'last_name'] } }],
        order: 'created_at DESC',
      });
      if (lostLeads.length > 0) {
        groupedLeads.LOST = lostLeads;
      }
      return callback(null, groupedLeads);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * Create Lead Details
   * @param  {LeadDetail}   leadDetail
   * @param  {Users}   currentUser
   * @param  {Function} callback
   * @return {LeadDetail}
   * @author Ponnuvel G
   */
  async leadDetail(leadDetail, currentUser, callback) {
    this.leadDetail = leadDetail;
    try {
      const dealer = await app.Dealer.findById(currentUser.user_type_id);
      if (!dealer || !dealer.is_active) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.DEALER.NOT_FOUND));
      }
      const lead = await app.Lead.findById(this.id);
      if (!lead) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.LEAD.NOT_FOUND));
      }
      this.leadDetail.dealer_id = currentUser.user_type_id;
      this.leadDetail.manufacturer_id = dealer.manufacturer_id;
      this.leadDetail.lead_id = this.id;
      const isVehicleExist = await app.LeadDetail.find({
        where: {
          dealer_id: this.leadDetail.dealer_id,
          manufacturer_id: this.leadDetail.manufacturer_id,
          lead_id: this.leadDetail.lead_id,
          vehicle_id: this.leadDetail.vehicle_id,
          is_deleted: false,
          vehicle_status: { neq: 900 },
        },
      });
      if (isVehicleExist && isVehicleExist.length > 0) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.VEHICLE.ALREADY_EXISTS));
      }
      this.leadDetail = await app.LeadDetail.create(this.leadDetail);
      const leadDetailWithVehicle = await app.LeadDetail.findById(
        this.leadDetail.id,
        {
          include: [
            {
              relation: 'vehicle',
              scope: {
                include: {
                  relation: 'dealer_vehicles',
                  scope: {
                    fields: ['id', 'test_ride_vehicle'],
                    where: { dealer_id: dealer.id },
                    limit: 1,
                  },
                },
                fields: ['name', 'image_url'],
              },
              where: { is_deleted: false },
            },
          ],
        },
      );
      return callback(null, leadDetailWithVehicle);
    } catch (e) {
      return callback(new InstabikeError(e));
    }
  }

  /**
   * Update lead and lead vehicle status as lost
   * @param  {Users}   currentUser
   * @param  {Function} callback
   * @return {LeadWithDetail}
   * @author Ponnuvel G
   */
  async markAsLost(currentUser, lostReasonId, lostReasonText, callback) {
    try {
      const dealer = await app.Dealer.findById(currentUser.user_type_id);
      if (!dealer || !dealer.is_active) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.DEALER.NOT_FOUND));
      }
      const existingLead = await app.Lead.findById(this.id);
      if (existingLead.is_invoiced) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.LEAD.ALREADY_INVOICED));
      }
      if (existingLead.is_lost) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.LEAD.ALREADY_LOST));
      }
      const lead = await app.Lead.updateAll({
        id: this.id,
      }, {
        status: constants.LEAD_STATUS.NEW_LOST,
        is_invoiced: false,
        invoiced_on: null,
        is_booked: false,
        booked_on: null,
        is_lost: true,
        lost_reason_text: lostReasonText,
        lost_on: new Date(),
        lost_reason_id: lostReasonId,
        next_followup_on: null,
      });
      if (lead.count === 0) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.LEAD.NOT_FOUND));
      }
      const leadDetails = await app.LeadDetail.find({ where: { lead_id: this.id } });
      const promises = leadDetails.map(async (details) => {
        const leadDetail = details;
        if (leadDetail.test_ride_status === 200 || leadDetail.test_ride_status === 300) {
          leadDetail.test_ride_status = constants.BOOKING_STATUS.CANCELLED;
        }
        leadDetail.vehicle_status = constants.LEAD_STATUS.NEW_LOST;
        await app.LeadDetail.upsert(leadDetail);
      });
      await Promise.all(promises);
      const leadObj = await app.Lead.findById(this.id);
      await this.saveActivity(
        leadObj, null, currentUser.id,
        constants.ACTIVITY.LOST,
      );
      return callback(null, { message: constants.MESSAGE.UPDATE });
    } catch (e) {
      return callback(new InstabikeError(e));
    }
  }

  /**
   * To fetch all reasons that can be used to mark a lead as 'LOST'
   *
   * @param  {function} callback        callback
   * @return {function} callback        callback
   * @author Jaiyashree Subramanian
   */
  getLostReasons(callback) {
    this.query = 'select * from lost_reasons ORDER BY priority ASC';
    postgresDs.connector.query(this.query, null, (err, lostReasons) => {
      if (err) {
        return callback(new InstabikeError(err));
      }
      return callback(null, lostReasons);
    });
  }

  /**
   * Get Leads based on follow up need to be done today
   * @param  {Function} callback
   * @return {LeadsByFollowup}
   * @author Ponnuvel G
   */
  async getFollowupLeadsByToday(callback) {
    const now = moment();
    const end = moment().endOf('day');
    try {
      const userIds = await this.getDealerUserIds();
      const overdue = await app.Lead.find({
        where: {
          and: [
            { assigned_to: { inq: userIds } },
            { next_followup_on: { lt: now } },
          ],
        },
        include: [{ relation: 'lead_details', scope: { where: { is_deleted: false }, include: 'vehicle' } },
          { relation: 'financier_lead', scope: { fields: ['id'] } },
          { relation: 'assignee', scope: { fields: ['first_name', 'last_name'] } }],
        order: 'next_followup_on ASC',
      });
      const pending = await app.Lead.find({
        where: {
          and: [
            { assigned_to: { inq: userIds } },
            { next_followup_on: { between: [now, end] } },
          ],
        },
        include: [{ relation: 'lead_details', scope: { where: { is_deleted: false }, include: 'vehicle' } },
          { relation: 'financier_lead', scope: { fields: ['id'] } },
          { relation: 'assignee', scope: { fields: ['first_name', 'last_name'] } }],
        order: 'next_followup_on ASC',
      });
      await overdue.map((overdueObj) => {
        const overdueLead = overdueObj;
        const testRides = lodash.filter(overdueObj.lead_details(), { test_ride_status: 400 });
        overdueLead.testRideStatus = testRides.length;
        return overdue;
      });
      await pending.map((pendingObj) => {
        const pendingLead = pendingObj;
        const testRides = lodash.filter(pendingObj.lead_details(), { test_ride_status: 400 });
        pendingLead.testRideStatus = testRides.length;
        return pending;
      });
      return callback(null, { overdue, pending });
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * Get leads base on followup done by today
   * @param  {Function} callback
   * @return {LeadsByCategory}
   * @author Ponnuvel G
   */
  async getFollowupDoneLeadsByToday(callback) {
    const start = moment().startOf('day');
    const end = moment().endOf('day');
    try {
      const userIds = await this.getDealerUserIds();
      const leads = await app.Lead.find({
        where: {
          and: [
            { assigned_to: { inq: userIds } },
            { last_followup_on: { between: [start, end] } },
          ],
        },
        include: [{ relation: 'lead_details', scope: { where: { is_deleted: false }, include: 'vehicle' } },
          { relation: 'financier_lead', scope: { fields: ['id'] } },
          { relation: 'assignee', scope: { fields: ['first_name', 'last_name'] } }],
        order: 'last_followup_on ASC',
      });
      const invoiced = [];
      const lost = [];
      const category = [];
      await leads.map((lead) => {
        if (lead.is_invoiced) {
          invoiced.push(lead);
        } else if (lead.is_lost) {
          lost.push(lead);
        } else {
          category.push(lead);
        }
        return leads;
      });
      const groupedLeads = lodash.groupBy(category, 'category');
      groupedLeads.INVOICED = invoiced;
      groupedLeads.LOST = lost;
      return callback(null, groupedLeads);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * preparing query to get the leads count by status
   * @return {string} query
   * @author Jagajeevan
   */
  async buildLeadsCountByStatusQuery(callback) {
    try {
      let startMonth = moment.utc().startOf('month');
      let sixtyDays = moment.utc().subtract(60, 'days');
      let end = moment.utc().endOf('day');
      startMonth = startMonth.toISOString();
      sixtyDays = sixtyDays.toISOString();
      end = end.toISOString();
      this.LeadsCountParams = [sixtyDays, end, sixtyDays, end, sixtyDays, end,
        sixtyDays, end, startMonth, end, startMonth, end];
      const builder = StringUtils.generateInClause(
        this.LeadsCountParams.length + 1,
        this.dealerUserIds,
      );
      this.LeadsCountParams = this.LeadsCountParams.concat(this.dealerUserIds);
      const lostReasons = await app.LostReason.find();
      const reasons = [...new Set(lostReasons.map(item => item.category))];
      let lostReasonQuery = '';
      let i = 0;
      for (i = 0; i < reasons.length; i += 1) {
        let lostReasonIds = (lodash.filter(lostReasons, { category: reasons[i] }));
        lostReasonIds = lodash.map(lostReasonIds, 'id');
        const lostReasonIdString = StringUtils.generateInClause(
          this.LeadsCountParams.length + 1,
          lostReasonIds,
        );
        this.LeadsCountParams = this.LeadsCountParams.concat(lostReasonIds);
        lostReasonQuery = `
          ${lostReasonQuery}, count(1) FILTER (where is_lost = true AND
            lost_on >= $11 AND lost_on <= $12 AND lost_reason_id IN (${lostReasonIdString}))
            AS ${reasons[i].toLowerCase()}`;
      }
      const query = `SELECT new, hot, warm, cold,
      to_be_registered, registered, delivered,
      invoiced, lost, booked,
      others, price, product, service,notintrested,
      sum(new+hot+warm+cold+booked) as leads_count FROM (
          SELECT count(1) FILTER (where category LIKE 'NEW' AND is_invoiced = false AND is_lost = false
            AND is_booked = false AND created_at >= $1 AND created_at <= $2)  AS new,
          count(1) FILTER (where category LIKE 'HOT' AND is_invoiced = false AND is_lost = false
            AND is_booked = false AND created_at >= $3 AND created_at <= $4)  AS hot,
          count(1) FILTER (where category LIKE 'WARM' AND is_invoiced = false AND is_lost = false
            AND is_booked = false AND created_at >= $5 AND created_at <= $6) AS warm,
          count(1) FILTER (where category LIKE 'COLD' AND is_invoiced = false AND is_lost = false
            AND is_booked = false AND created_at >= $7 AND created_at <= $8) AS cold,
          count(1) FILTER (where is_invoiced = false AND is_booked = true AND is_lost = false
            AND booked_on >= $9 AND booked_on <= $10) AS booked,
          count(1) FILTER (where is_invoiced = true AND status between 600 and 900 AND
            invoiced_on >= $9 AND invoiced_on <= $10)  AS invoiced,
          count(1) FILTER (where is_invoiced = true AND status between 600 and 700 AND
            invoiced_on >= $9 AND invoiced_on <= $10)  AS to_be_registered,
          count(1) FILTER (where is_invoiced = true AND status between 701 and 750 AND
            invoiced_on >= $9 AND invoiced_on <= $10)  AS registered,
          count(1) FILTER (where is_invoiced = true AND status between 751 and 899 AND
            invoiced_on >= $9 AND invoiced_on <= $10)  AS delivered,
          count(1) FILTER (where is_lost = true AND
             lost_on >= $11 AND lost_on <= $12)  AS lost ${lostReasonQuery}
          FROM leads WHERE assigned_to IN (${builder})
      ) t group by new, hot, warm, cold, invoiced, lost, booked, others, price,
      product, service, to_be_registered, registered, delivered,notintrested`;
      return query;
    } catch (err) {
      return callback(new InstabikeError(err));
    }
  }

  /**
   * get leads created count by today
   * @param  {Function} callback
   * @return {LeadsCountByToday}
   * @author Ponnuvel G
   */
  async getLeadsCountByToday(callback) {
    const start = moment.utc().startOf('month');
    const end = moment.utc().endOf('day');
    try {
      const userIds = await this.getDealerUserIds();
      const inShowroom = await app.Lead.count({
        assigned_to: { inq: userIds },
        created_at: { between: [start, end] },
        type: constants.LEAD_TYPES.OFFLINE,
      });
      const outOfShowroom = await app.Lead.count({
        assigned_to: { inq: userIds },
        created_at: { between: [start, end] },
        type: constants.LEAD_TYPES.ONLINE,
      });
      return callback(null, { inShowroom, outOfShowroom });
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * schedule a follow-up
   * @param  {object} followup
   * @param  {Function} callback
   * @return {FollowUp}
   * @author Vishesh G
   */
  async scheduleFollowup(followup, callback) {
    try {
      const lead = await app.Lead.findById(this.id);
      if (!lead) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.LEAD.NOT_FOUND));
      }
      const followupObject = followup;
      followupObject.lead_id = this.id;
      followupObject.manufacturer_id = lead.manufacturer_id;
      followupObject.dealer_id = lead.dealer_id;
      const createdFollowup = await app.FollowUp.create(followupObject);
      await lead.updateAttributes({
        next_followup_on: followup.follow_up_at,
        last_followup_on: null,
      });
      await this.saveActivity(
        lead, null, lead.assigned_to,
        constants.ACTIVITY.FOLLOWUP_SCHEDULED, followup.comment,
      );
      return callback(null, createdFollowup);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * Get leads follow need to be done and done by today
   * @param  {Function} callback
   * @return {FollowupCountByToday}
   * @author Ponnuvel G
   */
  async getFollowupCountByToday(callback) {
    const start = moment().startOf('day');
    const end = moment().endOf('day');
    try {
      const userIds = await this.getDealerUserIds();
      const followup = await app.Lead.count({
        assigned_to: { inq: userIds },
        next_followup_on: { lt: end },
      });
      const followupDone = await app.Lead.count({
        assigned_to: { inq: userIds },
        last_followup_on: { between: [start, end] },
      });
      return callback(null, { followup, followupDone });
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * Get lead ids based on vehicle ids
   * @param  {Object}   vehicleIds
   * @return {leadIds}
   * @author Jagajeevan
   */
  async getVehicleBasedLeads(vehicleIds) {
    const leadIdsArr = [];
    const vehicleLeadIds = await app.LeadDetail.find({
      where: {
        dealer_id: this.currentUser.user_type_id,
        vehicle_id: { inq: vehicleIds },
      },
      fields: 'lead_id',
    });
    const stripLeadIds = lodash.map(vehicleLeadIds, 'lead_id');
    this.leadIds = lodash.concat(leadIdsArr, lodash.map(stripLeadIds));
  }

  /**
   * mark Followup Complete
   * @param  {object} followup
   * @param  {string} followupId
   * @param  {Function} callback
   * @return {FollowUp}
   * @author Vishesh G
   */
  async markFollowupComplete(followup, followupId, callback) {
    try {
      const dateNow = new Date();
      await app.FollowUp.updateAll({
        id: followupId,
      }, {
        completed_at: dateNow,
        comment: followup.comment,
        is_completed: true,
      });
      const lead = await app.Lead.findById(this.id);
      await lead.updateAttributes({
        status: constants.LEAD_STATUS.FOLLOWUP_DONE,
        next_followup_on: null,
        last_followup_on: dateNow,
      });
      await this.saveActivity(
        lead, null, lead.assigned_to,
        constants.ACTIVITY.FOLLOWUP_DONE, followup.comment,
      );
      const updatedFollowup = await app.FollowUp.findById(followupId);
      return callback(null, updatedFollowup);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * add comment to lead
   * @param  {Object}   vehicleIds
   * @return {leadIds}
   * @author vishesh
   */
  async addCommentToLead(leadActivity, callback) {
    try {
      const lead = await app.Lead.findById(this.id);
      if (!lead) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.LEAD.NOT_FOUND));
      }
      if (!leadActivity.comment) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.LEAD.COMMENT_NOT_FOUND));
      }
      const count = lead.comments_count + 1;
      await lead.updateAttributes({
        comments_count: count,
      });
      await this.saveActivity(
        lead, null, this.currentUser.id,
        constants.ACTIVITY.COMMENTS_ADDED, leadActivity.comment,
      );
      return callback(null, leadActivity);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * add comment to lead
   * @param  {function}   callback
   * @return {objecr}
   * @author vishesh
   */
  async getMonthlySummary(callback) {
    const monthStart = moment().startOf('month');
    const dayStart = moment().startOf('day');
    const end = moment().endOf('day');
    const response = {};
    try {
      const userIds = await this.getDealerUserIds();
      let leadsParams = [end, dayStart, monthStart];
      const leadBuilder = StringUtils.generateInClause(leadsParams.length + 1, userIds);
      leadsParams = leadsParams.concat(userIds);
      const leadsQuery = `select count(1) filter (where l.next_followup_on::timestamp < $1) as followup,
        count(1) filter (where l.last_followup_on::timestamp between $2 and $1) as followup_done,
        count(1) filter (where l.created_at::timestamp between $3 and $1) as new_leads from leads l
        where l.assigned_to in (${leadBuilder})`;
      const leadsCount = await new Promise((resolve, reject) => {
        loopback.dataSources.postgres.connector.query(leadsQuery, leadsParams, (err, result) => {
          if (err) {
            return reject(new InstabikeError(err));
          }
          return resolve(result);
        });
      });
      if (leadsCount.length > 0) {
        const count = leadsCount[0];
        response.followup = parseInt(count.followup, 10);
        response.followupDone = parseInt(count.followup_done, 10);
        response.newLeads = parseInt(count.new_leads, 10);
      }
      const invoicedStart = moment().startOf('month').add(330, 'm');
      const invoicedEnd = moment().endOf('day').add(330, 'm');
      let params = [invoicedStart, invoicedEnd, this.currentUser.user_type_id];
      const builder = StringUtils.generateInClause(params.length + 1, userIds);
      params = params.concat(userIds);
      const query = `select count(*) filter (where v.type = 0) as bike,
        count(*) filter (where v.type = 1) as scooter from leads l
        inner join lead_details ld on l.id = ld.lead_id and ld.vehicle_status = 600
        inner join vehicles v on ld.vehicle_id = v.id
        where (l.is_invoiced = true)
        and (l.invoiced_on::timestamp::date BETWEEN $1 AND $2)
        and (l.dealer_id = $3)
        and (l.assigned_to in (${builder}))`;
      const salesObj = await new Promise((resolve, reject) => {
        loopback.dataSources.postgres.connector.query(query, params, (err, result) => {
          if (err) {
            return reject(new InstabikeError(err));
          }
          return resolve(result);
        });
      });
      if (salesObj.length > 0) {
        const sales = salesObj[0];
        response.bike = parseInt(sales.bike, 10);
        response.scooter = parseInt(sales.scooter, 10);
        response.invoice = parseInt(sales.bike, 10) + parseInt(sales.scooter, 10);
      }
      return callback(null, response);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * To get the dealer sales target based on the sales team, member
   * @return {Object} dealerTargetCount
   * @author Jagajeevan
   */
  async getDealerSalesTarget() {
    let startMonth = moment.utc().startOf('month');
    let end = moment.utc().endOf('day');
    startMonth = startMonth.toISOString();
    end = end.toISOString();
    let params = [startMonth, end];
    const builder = StringUtils.generateInClause(3, this.dealerUserIds);
    params = params.concat(this.dealerUserIds);
    const query = `SELECT CASE
      WHEN (SUM(target_value) IS NOT NULL) THEN SUM(target_value) ELSE 0 END target
      FROM dealer_targets
      WHERE from_date >= $1 AND to_date <= $2 AND
      dealer_sales_id IN (${builder})`;
    const dealerTargetCount = await new Promise((resolve, reject) => {
      postgresDs.connector.query(query, params, (err, targetCount) => {
        if (err) reject(new InstabikeError(err));
        resolve(targetCount);
      });
    });
    return dealerTargetCount[0];
  }

  /**
   * preparing query to get the leads by its filter
   * @return {string} query
   * @author Jagajeevan
   */
  prepareFilterDealerLeads(leadsFilter) {
    this.whereCondition = [];
    const fromDate = new Date(leadsFilter.fromDate).toDateString('yyyy-MM-dd');
    let toDate = new Date(leadsFilter.toDate);
    toDate.setDate(new Date(leadsFilter.toDate).getDate() + 1);
    toDate = toDate.toDateString('yyyy-MM-dd');
    if (leadsFilter.owner && leadsFilter.owner.length) {
      this.whereCondition.push({ assigned_to: { inq: leadsFilter.owner } });
    } else if (this.dealerUserIds) {
      this.whereCondition.push({ assigned_to: { inq: this.dealerUserIds } });
    }
    if (leadsFilter.mobile_number) {
      this.whereCondition.push({ mobile_number: { like: `%${leadsFilter.mobile_number}%` } });
    }
    if (leadsFilter.name) {
      this.whereCondition.push({ name: { regexp: `/${leadsFilter.name}/i` } });
    }
    if (leadsFilter.filterBy === 'invoiced') {
      this.whereCondition.push(
        { is_invoiced: true },
        { invoiced_on: { between: [fromDate, toDate] } },
      );
    } else if (leadsFilter.filterBy === 'lost') {
      this.whereCondition.push(
        { is_lost: true },
        { lost_on: { between: [fromDate, toDate] } },
      );
      if (leadsFilter.lostReasonsIds && leadsFilter.lostReasonsIds.length) {
        this.whereCondition.push({ lost_reason_id: { inq: leadsFilter.lostReasonsIds } });
      }
    } else if (leadsFilter.filterBy === 'created') {
      this.whereCondition.push(
        { is_invoiced: false }, { is_lost: false },
        { created_at: { between: [fromDate, toDate] } },
      );
    } else if (leadsFilter.filterBy === 'booked') {
      this.whereCondition.push(
        { is_invoiced: false }, { is_booked: true }, { is_lost: false },
        { booked_on: { between: [fromDate, toDate] } },
      );
    } else {
      this.whereCondition.push({
        or: [
          { created_at: { between: [fromDate, toDate] } },
          { invoiced_on: { between: [fromDate, toDate] } },
          { booked_on: { between: [fromDate, toDate] } },
          { lost_on: { between: [fromDate, toDate] } },
        ],
      });
    }
    if (this.leadIds) {
      this.whereCondition.push({ id: { inq: this.leadIds } });
    }
    return this.whereCondition;
  }

  /**
   * Update lead and lead vehicle status as lost
   * @param  {string}   leadId
   * @param  {string}   leadDetailId
   * @param  {Function} callback
   * @return {msg}
   * @author Jagajeevan
   */
  async updateLeadVehicleStatusAsLost(leadDetailId, saveLead, callback) {
    this.leadDetailId = leadDetailId;
    try {
      const dealer = await app.Dealer.findById(this.currentUser.user_type_id);
      if (!dealer || !dealer.is_active) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.DEALER.NOT_FOUND));
      }
      const existingLead = await app.Lead.findById(this.leadId);
      if (!existingLead) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.LEAD.NOT_FOUND));
      }
      if (existingLead.is_invoiced) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.LEAD.ALREADY_INVOICED));
      }
      if (existingLead.is_lost) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.LEAD.ALREADY_LOST));
      }
      const leadDetail = await app.LeadDetail.findById(this.leadDetailId);
      if (!leadDetail || leadDetail.count === 0) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.LEAD.NOT_FOUND));
      }
      const dealerInventory = await app.DealerInventory.findOne({
        where: {
          dealer_id: dealer.id,
          vehicle_id: leadDetail.vehicle_id,
          variant_id: leadDetail.variant_id,
          variant_colours_id: leadDetail.variant_colour_id,
        },
      });
      if (!dealerInventory || dealerInventory.stock_available === 0) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.VEHICLE.NO_STOCK));
      }
      await app.Lead.updateAll(
        { id: this.leadId, dealer_id: dealer.id },
        {
          status: constants.LEAD_STATUS.INVOICED,
          invoiced_on: new Date(),
          is_invoiced: true,
          is_booked: false,
          invoice_id: saveLead.invoice_id,
        },
      );
      await this.createLeadCopyOrUpdate(existingLead, saveLead.markAsNew, leadDetailId);
      const targetService = new TargetService(
        existingLead.manufacturer_id,
        existingLead.dealer_id,
        this.currentUser.id,
        leadDetail.vehicle_id,
        existingLead.assigned_to,
      );
      await targetService.updateTargetAchieved(existingLead.assigned_to);
      dealerInventory.stock_available -= 1;
      await app.DealerInventory.upsert(dealerInventory);
      const invoicedLead = await app.Lead.findOne({
        where: { id: this.leadId },
        include: [
          {
            relation: 'lead_details',
            scope: { where: { is_deleted: false }, include: 'vehicle' },
          },
          { relation: 'follow_up', scope: { where: { is_completed: false } } },
          { relation: 'assignee', scope: { fields: ['first_name', 'last_name'] } },
        ],
      });
      return callback(null, invoicedLead);
    } catch (e) {
      return callback(new InstabikeError(e));
    }
  }

  /**
   * To create a new lead-copy or set other leadDetails of a lead as lost
   * after invoiced
   * @param  {object} existingLead                      old lead object
   * @param  {boolean} saveLead             true if lead must be copied
   * @param  {String} leadDetailId              invoiced lead-detail Id
   * @author Jaiyashree Subramanian
   */
  async createLeadCopyOrUpdate(existingLead, saveLead, leadDetailId) {
    try {
      const totalLeadDetail = await app.LeadDetail.count({ lead_id: this.leadId });
      const invoicedLead = await app.Lead.findById(this.leadId);
      await app.LeadDetail.updateAll(
        { id: this.leadDetailId },
        { vehicle_status: constants.LEAD_STATUS.INVOICED, invoiced_on: moment() },
      );
      if (saveLead && totalLeadDetail > 1) {
        const newLead = JSON.parse(JSON.stringify(existingLead));
        newLead.comments_count = 0;
        newLead.created_at = new Date();
        delete newLead.next_followup_on;
        delete newLead.last_followup_on;
        delete newLead.id;
        const newLeadCopy = await app.Lead.create(newLead);
        await app.LeadDetail.updateAll(
          { lead_id: this.leadId, id: { neq: leadDetailId }, test_ride_status: null },
          {
            lead_id: newLeadCopy.id,
            created_at: new Date(),
          },
        );
        await app.LeadDetail.updateAll(
          { lead_id: this.leadId, id: { neq: leadDetailId }, test_ride_status: { neq: null } },
          {
            lead_id: newLeadCopy.id,
            created_at: new Date(),
            test_ride_status: 500,
          },
        );
        await app.FinancierLead.updateAll(
          { lead_id: this.leadId, lead_detail_id: { neq: leadDetailId }, status: { lte: 930 } },
          {
            lead_id: newLeadCopy.id,
          },
        );
        await this.saveActivity(
          newLeadCopy, null, this.currentUser.id,
          constants.ACTIVITY.LEAD_CREATED,
        );
      } else {
        await app.LeadDetail.updateAll(
          { lead_id: this.leadId, id: { neq: leadDetailId }, test_ride_status: null },
          { vehicle_status: constants.LEAD_STATUS.NEW_LOST },
        );
        await app.LeadDetail.updateAll(
          { lead_id: this.leadId, id: { neq: leadDetailId }, test_ride_status: { neq: null } },
          {
            vehicle_status: constants.LEAD_STATUS.NEW_LOST,
            test_ride_status: 500,
          },
        );
      }
      this.saveActivity(
        invoicedLead, existingLead,
        this.currentUser.id, constants.ACTIVITY.INVOICED,
      );
      this.sendNotification(invoicedLead);
      return;
    } catch (e) {
      throw new InstabikeError(e);
    }
  }

  /**
   * Send Notification
   * @param  {Users}  currentUser
   * @param  {Lead}  lead
   * @return {Object}
   */
  async sendNotification(lead) {
    const leadDetail = await app.LeadDetail.findById(this.leadDetailId);
    const vehicle = await app.Vehicle.findById(leadDetail.vehicle_id);
    const dealer = await app.Dealer.findById(lead.dealer_id);
    const dealerUser = await app.Users.findById(lead.assigned_to);
    const notification = {};
    notification.vehicle_name = vehicle.name;
    notification.invoiced_on = lead.invoiced_on;
    notification.dealer = dealer.name;
    notification.sales_name = dealerUser.first_name;
    notification.official_contact_number = dealerUser.official_contact_number;
    const template = dot.template(constants.NOTIFICATION.INVOICED);
    const message = template(notification);
    const messages = [];
    messages.push({ mobile: lead.mobile_number, message });
    this.send(messages);
  }

  /**
   * get lead details by id
   * @param  {string}   leadDetailId
   * @param  {Users}   currentUser
   * @param  {Function} callback
   * @return {msg}
   * @author Jagajeevan
   */
  async getLeadDetail(leadDetailId, callback) {
    try {
      const leadDetail = await app.LeadDetail.findById(leadDetailId, {
        fields: ['dealer_id', 'proforma_invoice_id'],
      });
      if (!leadDetail) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.LEAD.NOT_FOUND));
      }
      if (leadDetail.dealer_id === this.currentUser.user_type_id) {
        if (leadDetail.proforma_invoice_id) {
          await app.ProformaInvoice.destroyById(leadDetail.proforma_invoice_id);
        }
      } else {
        callback(new InstabikeError(ErrorConstants.ERRORS.USER.TRY_AGAIN));
      }
      return callback();
    } catch (e) {
      return callback(new InstabikeError(e));
    }
  }

  /**
   * Update lead vehicle status as deleted
   * @param  {string}   leadId
   * @param  {string}   leadDetailId
   * @param  {Function} callback
   * @return {msg}
   * @author Jagajeevan
   */
  async updateLeadVehicleAsDeleted(leadId, leadDetailId, callback) {
    try {
      const dealer = await app.Dealer.findById(this.currentUser.user_type_id);
      if (!dealer || !dealer.is_active) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.DEALER.NOT_FOUND));
      }
      const lead = await app.Lead.find({
        where: { id: leadId, dealer_id: dealer.id },
        fields: 'id',
      });
      if (!lead || lead.length === 0) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.LEAD.NOT_FOUND));
      }
      const leadDetail = await app.LeadDetail.find({
        where: {
          id: leadDetailId,
          lead_id: leadId,
        },
        fields: 'id',
      });
      if (!leadDetail || leadDetail.length === 0) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.LEAD.NOT_FOUND));
      }
      await app.LeadDetail.updateAll(
        { lead_id: leadId, id: leadDetailId },
        { is_deleted: true },
      );
      const leadDetails = await app.LeadDetail.find({
        where: { lead_id: leadId, is_deleted: false },
        include: { relation: 'vehicle', scope: { fields: ['id', 'name'] } },
      });
      return callback(null, { leadDetails });
    } catch (e) {
      return callback(new InstabikeError(e));
    }
  }

  /**
  * Get lead by ID with Lead Details, Followup, Lead Financial Details and Lost reason if exists
  * @param  {function} callback
  * @return {Lead} lead
  * @author Jagajeevan
  */
  async getLeadDetails(ctx, callback) {
    try {
      const lead = await app.Lead.findOne({
        where: { id: this.id },
        include: [
          {
            relation: 'lead_details',
            scope: {
              include: { relation: 'vehicle', scope: { fields: ['name', 'image_url'] } },
              where: { is_deleted: false },
            },
          },
          { relation: 'follow_up', scope: { where: { is_completed: false } } }, 'lostReason',
        ],
      });
      if (!lead) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.LEAD.NOT_FOUND));
      }
      const context = ctx;
      context.result = lead;
      return callback(null, context);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * Update the lead assignee and target.
   *
   * @param  {string} leadId
   * @param  {string} dealerSalesId
   * @param  {Function} callback
   * @author Ajaykkumar Rajendran
   */
  async updateTargetAchievedForNewSales(dealerSalesId, callback) {
    try {
      const lead = await app.Lead.findOne({
        where: {
          id: this.leadId,
        },
        include: [
          {
            relation: 'lead_details',
            scope: {
              where: { invoiced_on: { neq: null } },
            },
          },
        ],
      });
      if (lead.is_invoiced) {
        const targetMonth = DateUtils.getCurrentMonthDates(lead.invoiced_on);
        const targetService = new TargetService(
          lead.manufacturer_id,
          lead.dealer_id,
          lead.assigned_to,
          lead.lead_details()[0].vehicle_id,
        );
        await targetService.updateTargetAchievedForNewSales(dealerSalesId, targetMonth);
      }
      const updatedLead = await app.Lead.upsertWithWhere({
        id: this.leadId,
      }, { assigned_to: dealerSalesId });
      return callback(null, updatedLead);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
  * Update Lead
  * @param  {function} callback
  * @return {Lead} lead
  * @author Jagajeevan
  */
  async updateLead(callback) {
    try {
      let lead = await app.Lead.findById(this.id);
      if (!lead) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.LEAD.NOT_FOUND));
      }
      const query = {
        where: {
          and: [
            { id: { neq: this.id } },
            { mobile_number: this.lead.mobile_number },
            {
              or: [
                { dealer_id: lead.dealerId },
                { parent_dealer_id: lead.dealerId },
              ],
            },
            { is_invoiced: false },
            { status: { lt: 600 } },
          ],
        },
      };
      let contacts = [];
      if (process.env.WHITE_LIST_CONTACTS) {
        contacts = process.env.WHITE_LIST_CONTACTS.split(',');
        contacts = await contacts.map(contact => contact.replace(/[\[\]' ]/g, ''));
      }
      if (contacts.includes(this.lead.mobile_number)) {
        query.where.and = query.where.and.concat([
          { name: this.lead.name },
          { gender: this.lead.gender },
        ]);
      }
      lead = await app.Lead.find(query);
      if (lead.length > 0) {
        const executive = await app.Users.findById(lead[0].assigned_to);
        let name = `${executive.first_name}`;
        if (executive.last_name) {
          name += ` ${executive.last_name}`;
        }
        const error = {
          message: `Lead already exist under ${name}`,
          status: 400,
        };
        return callback(new InstabikeError(error));
      }
      lead = await app.Lead.upsert(this.lead);
      return callback(null, { lead });
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }
};
