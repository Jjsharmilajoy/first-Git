/**
 * Lead-detail services: this service handles methods such as update lead-detail,
 * create new activity on change of lead-detail, send ems/email notification for lead-
 * activity changes, get test-ride vehicles by status, get test-ride slots, get test-ride
 * counts, update test-ride vehicles status, delete proforma-invoice associated to a lead-
 * detail and mark a lead-detail as deleted.
 */

// import dependencies
const dot = require('dot');
const moment = require('moment');
const lodash = require('lodash');

// import files
const loopback = require('../server.js');
const BaseService = require('../services/base_service');
const InstabikeError = require('../error/instabike_error');
const ErrorConstants = require('../utils/constants/error_constants');
const constants = require('../utils/constants/userConstants');
const StringUtils = require('../utils/string_utils');
const DateUtils = require('../utils/date_utils');

const app = loopback.dataSources.postgres.models;
const postgresDs = loopback.dataSources.postgres;

/**
 * @author Jagajeevan
 */
/* eslint class-methods-use-this: ["error",
  { "exceptMethods": ["prepareTestRideQuery", "prepareSlotByDateQuery", "generateSlotsByDate"] }] */
module.exports = class LeadDetailService extends BaseService {
  constructor(id, dealerId, vehicleId, currentUser) {
    super();
    this.id = id;
    this.dealerId = dealerId;
    this.vehicleId = vehicleId;
    this.currentUser = currentUser;
  }
  /**
   * Update Lead Details and return Lead Detail with Vehicle Details
   * @param  {LeadDetail}   leadDetail
   * @param  {Function} callback
   * @return {LeadDetail} Lead Details with Vehicle Details
   */
  async updateLeadDetail(leadDetail, callback) {
    try {
      const leadDetailObj = leadDetail;
      const existingLeadDetail = await app.LeadDetail.findById(leadDetailObj.id);
      if (leadDetailObj.vehicle_status !== existingLeadDetail.vehicle_status) {
        if (leadDetailObj.vehicle_status === 450) {
          leadDetailObj.booked_on = new Date();
          const leadObj = await app.Lead.findById(existingLeadDetail.lead_id);
          await leadObj.updateAttributes({ is_booked: true, booked_on: new Date() });
        }
        const leadObj = await app.Lead.findById(existingLeadDetail.lead_id);
        await leadObj.updateAttributes({
          is_booked: true,
          booked_on: new Date(),
        });
      }
      await this.updateLeadActivity(leadDetailObj);
      await app.LeadDetail.upsert(leadDetailObj);
      if ((existingLeadDetail.test_ride_status !== leadDetailObj.test_ride_status) ||
        (existingLeadDetail.testride_feedback !== leadDetailObj.testride_feedback)) {
        await app.LeadDetail.updateAll(
          {
            and: [
              { lead_id: leadDetailObj.lead_id },
              { vehicle_id: leadDetailObj.vehicle_id },
            ],
          },
          {
            test_ride_status: leadDetailObj.test_ride_status,
            testride_feedback: leadDetailObj.testride_feedback,
          },
        );
      }
      const leadDetailWithVehicle = await app.LeadDetail.findById(
        leadDetailObj.id,
        {
          include: [
            {
              relation: 'vehicle',
              scope: {
                include: {
                  relation: 'dealer_vehicles',
                  scope: {
                    fields: ['id', 'test_ride_vehicle'],
                    where: { dealer_id: this.dealerId },
                    limit: 1,
                  },
                },
                fields: ['name', 'image_url'],
              },
              where: { is_deleted: false },
            },
            {
              relation: 'financier_lead',
              scope: {
                fields: ['id', 'status'],
                where: { status: { neq: 930 } },
              },
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
   * Update Lead Activity while process test ride
   * @param  {LeadDetail}  leadDetail
   * @author Ponnuvel G
   */
  async updateLeadActivity(leadDetail) {
    this.leadDetail = leadDetail;
    const existingLeadDetail = await app.LeadDetail.findById(leadDetail.id);
    if (leadDetail.test_ride_status !== null) {
      if (existingLeadDetail.test_ride_status !== leadDetail.test_ride_status) {
        const lead = await app.Lead.findById(leadDetail.lead_id);
        let type = null;
        if (leadDetail.test_ride_status === 200) {
          type = constants.ACTIVITY.TEST_RIDE_SCHEDULED;
          this.sendNotification(lead, leadDetail);
        } else if (leadDetail.test_ride_status === 300) {
          type = constants.ACTIVITY.TEST_RIDE_STARTED;
        } else if (leadDetail.test_ride_status === 400) {
          type = constants.ACTIVITY.TEST_RIDE_COMPLETED;
          this.sendNotification(lead, leadDetail);
        } else if (leadDetail.test_ride_status === 500) {
          type = constants.ACTIVITY.TEST_RIDE_CANCELLED;
          this.sendNotification(lead, leadDetail);
        }
        await this.saveActivity(
          lead, null, this.currentUser.id,
          type, leadDetail.test_ride_on.toString(), null, leadDetail.id,
        );
      }
    }
    if (leadDetail.vehicle_status !== null) {
      if (existingLeadDetail.vehicle_status !== leadDetail.vehicle_status) {
        const lead = await app.Lead.findById(leadDetail.lead_id);
        let type = null;
        if (leadDetail.vehicle_status === 450) {
          type = constants.ACTIVITY.VEHICLE_BOOKED;
          this.sendBookedNotification(lead, leadDetail);
        }
        await this.saveActivity(
          lead, null, this.currentUser.id,
          type, leadDetail.booked_on.toString(), null, leadDetail.id,
        );
      }
    }
  }

  /**
   * Send Notification
   * @param  {Lead}  lead
   * @param  {LeadDetail}  leadDetail
   * @return {Object}
   */
  async sendNotification(lead, leadDetail, isReschdule, previousTestRide) {
    const assignedTo = await app.Users.findById(lead.assigned_to);
    const vehicle = await app.Vehicle.findById(leadDetail.vehicle_id);
    const messages = [];
    const notification = {};
    notification.vehicle_name = vehicle.name;
    notification.date = `${moment(leadDetail.test_ride_on).utc().format('DD-MMM-YYYY')}`;
    notification.from = `${moment(leadDetail.test_ride_on).utc().format('h:mm')}` +
      `${moment(leadDetail.test_ride_on).utc().format('a')}`;
    notification.to = `${moment(leadDetail.test_ride_on).add(30, 'minutes').utc().format('h:mm')}` +
      `${moment(leadDetail.test_ride_on).utc().format('a')}`;
    notification.lead_name = lead.name;
    let leadTemplate = null;
    let salesTemplate = null;
    if (leadDetail.test_ride_status === 200) {
      if (isReschdule) {
        notification.previous_date = `${moment(previousTestRide).utc().format('DD-MMM-YYYY')}`;
        notification.previous_from = `${moment(previousTestRide).utc().format('h:mm')}` +
          `${moment(previousTestRide).utc().format('a')}`;
        notification.previous_to = `${moment(previousTestRide).add(30, 'minutes').utc().format('h:mm')}` +
          `${moment(previousTestRide).utc().format('a')}`;
        leadTemplate = dot.template(constants.NOTIFICATION.RETEST_RIDE_LEAD);
        salesTemplate = dot.template(constants.NOTIFICATION.RETEST_RIDE_SALES);
      } else {
        leadTemplate = dot.template(constants.NOTIFICATION.TEST_RIDE_LEAD);
        salesTemplate = dot.template(constants.NOTIFICATION.TEST_RIDE_SALES);
      }
    }
    if (leadDetail.test_ride_status === 500) {
      leadTemplate = dot.template(constants.NOTIFICATION.TEST_RIDE_CANCEL_LEAD);
      salesTemplate = dot.template(constants.NOTIFICATION.TEST_RIDE_CANCEL_SALES);
    }
    if (leadDetail.test_ride_status === 400) {
      leadTemplate = dot.template(constants.NOTIFICATION.TEST_RIDE_COMPLETE_LEAD);
      salesTemplate = dot.template(constants.NOTIFICATION.TEST_RIDE_COMPLETE_SALES);
    }
    const dealerExecutive = await app.Users.findById(lead.assigned_to);
    notification.sales_name = dealerExecutive.first_name;
    notification.official_contact_number = dealerExecutive.official_contact_number;
    const leadMessage = leadTemplate(notification);
    messages.push({ mobile: lead.mobile_number, message: leadMessage });
    const salesMessage = salesTemplate(notification);
    messages.push({ mobile: assignedTo.mobile_no, message: salesMessage });
    this.send(messages);
  }

  /**
   * Save activity when change vehicle status
   * @param  {Lead}  lead
   * @param  {LeadDetail}  leadDetail
   */
  async sendBookedNotification(lead, leadDetail) {
    const vehicle = await app.Vehicle.findById(leadDetail.vehicle_id);
    const dealer = await app.Dealer.findById(lead.dealer_id);
    const messages = [];
    const notification = {};
    notification.vehicle_name = vehicle.name;
    notification.dealer = dealer.name;
    if (leadDetail.vehicle_status === 450) {
      const template = dot.template(constants.NOTIFICATION.BOOKED);
      const message = template(notification);
      messages.push({ mobile: lead.mobile_number, message });
      this.send(messages);
    }
  }

  /**
   * To get the current week test ride slots and its availability
   * @param  {Users}   currentUser
   * @param  {Function} callback         callback
   * @return {TestRideVehicleWeeklySlot} Object
   */
  async getCurrentWeekSlots(currentUser, callback) {
    try {
      if (currentUser.user_type_id !== this.dealerId) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.USER.TRY_AGAIN));
      }
      const dealer = await app.Dealer.findById(this.dealerId);
      const testRideData = await this.prepareTestRideData(dealer);
      return callback(null, { testRideData });
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * Prepare available data for 6 dayes from today
   * @param {Dealer} dealer
   */
  async prepareTestRideData(dealer) {
    const result = [];
    const today = moment().utcOffset(330).format();
    let day = moment().utcOffset(330).format();

    const vehicleParams = [this.dealerId, this.vehicleId];
    const vehicleQuery = `select test_ride_vehicle from dealer_vehicles where dealer_id = $1
      and vehicle_id = $2`;
    const vehicle = await new Promise((resolve, reject) => {
      postgresDs.connector.query(vehicleQuery, vehicleParams, (err, res) => {
        if (err) reject(new InstabikeError(err));
        resolve(res);
      });
    });

    for (let i = 1; i < 8; i += 1) {
      const data = {};
      data.test_ride_vehicle = vehicle[0].test_ride_vehicle;
      const start = moment(day).startOf('day').format();

      let params = [];
      if (day === today) {
        params = [day, this.dealerId, this.vehicleId];
      } else {
        params = [start, this.dealerId, this.vehicleId];
      }
      const query = `SELECT COUNT(*) total_booked FROM
        (SELECT DISTINCT lead_id, vehicle_id from lead_details where
        test_ride_on::timestamp::date = $1 and dealer_id = $2 and vehicle_id = $3
        and test_ride_status >= 200 and test_ride_status <= 300 and is_deleted = false
        and test_ride_on > now() + interval '5 hours' group by lead_id, vehicle_id) tmp`;
      const booked = await new Promise((resolve, reject) => {
        postgresDs.connector.query(query, params, (err, res) => {
          if (err) reject(new InstabikeError(err));
          resolve(res);
        });
      });
      data.total_booked = booked[0].total_booked;

      data.days = moment(day).format();
      data.day_name = moment(day).format('dddd');

      let diff = null;
      if (day === today) {
        const time = moment(day).utcOffset(330).format('HH:mm');
        if (data.day_name === 'Saturday') {
          let startTime = moment.duration(dealer.saturday_start, 'HH:mm');
          let endTime = moment.duration(dealer.saturday_end, 'HH:mm');
          const newtime = moment.duration(time, 'HH:mm');
          if (DateUtils.minutesOfDay(newtime) > DateUtils.minutesOfDay(startTime)) {
            if (DateUtils.minutesOfDay(newtime) > DateUtils.minutesOfDay(endTime)) {
              diff = null;
            } else {
              startTime = moment.duration(time, 'HH:mm');
              endTime = moment.duration(dealer.saturday_end, 'HH:mm');
              diff = endTime.subtract(startTime);
            }
          } else {
            startTime = moment.duration(dealer.saturday_start, 'HH:mm');
            endTime = moment.duration(dealer.saturday_end, 'HH:mm');
            diff = endTime.subtract(startTime);
          }
        } else if (data.day_name === 'Sunday') {
          let startTime = moment.duration(dealer.sunday_start, 'HH:mm');
          let endTime = moment.duration(dealer.sunday_end, 'HH:mm');
          const newtime = moment.duration(time, 'HH:mm');
          if (DateUtils.minutesOfDay(newtime) > DateUtils.minutesOfDay(startTime)) {
            if (DateUtils.minutesOfDay(newtime) > DateUtils.minutesOfDay(endTime)) {
              diff = null;
            } else {
              startTime = moment.duration(time, 'HH:mm');
              endTime = moment.duration(dealer.sunday_end, 'HH:mm');
              diff = endTime.subtract(startTime);
            }
          } else {
            startTime = moment.duration(dealer.sunday_start, 'HH:mm');
            endTime = moment.duration(dealer.sunday_end, 'HH:mm');
            diff = endTime.subtract(startTime);
          }
        } else {
          let startTime = moment.duration(dealer.monday_friday_start, 'HH:mm');
          let endTime = moment.duration(dealer.monday_friday_end, 'HH:mm');
          const newtime = moment.duration(time, 'HH:mm');
          if (DateUtils.minutesOfDay(newtime) > DateUtils.minutesOfDay(startTime)) {
            if (DateUtils.minutesOfDay(newtime) > DateUtils.minutesOfDay(endTime)) {
              diff = null;
            } else {
              startTime = moment.duration(time, 'HH:mm');
              endTime = moment.duration(dealer.monday_friday_end, 'HH:mm');
              diff = endTime.subtract(startTime);
            }
          } else {
            startTime = moment.duration(dealer.monday_friday_start, 'HH:mm');
            endTime = moment.duration(dealer.monday_friday_end, 'HH:mm');
            diff = endTime.subtract(startTime);
          }
        }
      }

      if (day !== today) {
        if (data.day_name === 'Saturday') {
          const startTime = moment.duration(dealer.saturday_start, 'HH:mm');
          const endTime = moment.duration(dealer.saturday_end, 'HH:mm');
          diff = endTime.subtract(startTime);
        } else if (data.day_name === 'Sunday') {
          const startTime = moment.duration(dealer.sunday_start, 'HH:mm');
          const endTime = moment.duration(dealer.sunday_end, 'HH:mm');
          diff = endTime.subtract(startTime);
        } else {
          const startTime = moment.duration(dealer.monday_friday_start, 'HH:mm');
          const endTime = moment.duration(dealer.monday_friday_end, 'HH:mm');
          diff = endTime.subtract(startTime);
        }
      }

      let totalSlots = 0;
      if (diff) {
        totalSlots = diff.hours() * data.test_ride_vehicle * 2;
        if (diff.minutes() > 0 && diff.minutes() <= 30) {
          totalSlots += data.test_ride_vehicle;
        }
        if (diff.minutes() > 30) {
          totalSlots += data.test_ride_vehicle * 2;
        }
      }
      data.total_slots = totalSlots;
      data.is_holiday = false;
      if (dealer.weekly_holiday === data.day_name) {
        data.is_holiday = true;
      }
      result.push(data);
      day = moment(day).add(1, 'days').utcOffset(330).format();
    }
    return result;
  }

  /**
   * To get the current week test ride slots and its availability
   * @param  {dataFilter}   dataFilter
   * @param  {Users}   currentUser
   * @param  {Function} callback         callback
   * @return {TestRideVehicleWeeklySlot} Object
   */
  async slotsByDate(dataFilter, currentUser, callback) {
    try {
      this.dataFilter = dataFilter;
      if (currentUser.user_type_id !== this.dealerId) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.USER.TRY_AGAIN));
      }
      const dealer = await app.Dealer.findById(
        this.dealerId,
        { fields: [`${dataFilter.day_name}_start`, `${dataFilter.day_name}_end`] },
      );
      if (!dealer) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.DEALER.NOT_FOUND));
      }
      const query = this.generateSlotsByDate();
      const start = Object.values(Object.entries(dealer)[1][1])[1];
      const end = Object.values(Object.entries(dealer)[1][1])[0];
      const slotDateParams = [dataFilter.date, end, dataFilter.date, start];
      const dateSeries = await new Promise((resolve, reject) => {
        postgresDs.connector.query(query, slotDateParams, (err, result) => {
          if (err) reject(new InstabikeError(err));
          resolve(result);
        });
      });
      const slotQuery = this.prepareSlotByDateQuery();
      const slotParams = [dataFilter.date, this.dealerId, this.vehicleId];
      const testRideData = await new Promise((resolve, reject) => {
        postgresDs.connector.query(slotQuery, slotParams, (err, result) => {
          if (err) reject(new InstabikeError(err));
          resolve(result);
        });
      });
      const slots = [];
      if (dateSeries.length) {
        await new Promise((resolve, reject) => {
          dateSeries.map((dateSlot, index) => {
            if (!dateSlot) {
              reject(new InstabikeError(ErrorConstants.ERRORS.LEAD.TYPE_NOT_FOUND));
            }
            const slotCount = lodash.find(testRideData, { test_ride_on: dateSlot.slots });
            resolve(slots.push({
              slotFrom: dateSlot.slots.toISOString(),
              slotTo: dateSeries[index + 1].slots.toISOString(),
              booked_count: slotCount ? slotCount.count : 0,
            }));
            return true;
          });
        });
      }
      return callback(null, { vehiclePerSlot: dataFilter.test_ride_vehicle, slots });
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  prepareSlotByDateQuery() {
    const query = `select count(test_ride_on), test_ride_on from (SELECT COUNT(id),
      lead_id, test_ride_on from lead_details WHERE test_ride_on::date = $1
      AND dealer_id = $2 AND vehicle_id = $3
      AND (test_ride_status >= 200 AND test_ride_status <= 399) AND is_deleted = false
      GROUP BY test_ride_on, lead_id) tmp group by test_ride_on`;
    return query;
  }

  /**
   * To find the list of leads with respect to their status
   *
   * @param  {String}   leadStatus
   * @param  {Function} callback
   * @return {Array}    list of leads found
   * @author Jagajeevan
   */
  async getTestRideVehiclesByStatus(status, filter, currentUser, callback) {
    try {
      this.currentUser = currentUser;
      const dealerUserIds = await this.getDealerUserIds();
      if (dealerUserIds.length === 0) {
        return callback();
      }
      await this.getLeadsBasedOnAssociates(dealerUserIds);
      if (this.leadIds === '') {
        return callback();
      }
      const statusCondition = [{ dealer_id: this.dealerId },
        { lead_id: { inq: this.leadIds } }, { is_deleted: false }];
      const from = moment(filter.from).startOf('day');
      const to = moment(filter.to).endOf('day');
      if (status === 'ongoing') {
        statusCondition.push(
          { test_ride_status: { gte: 300 } },
          { test_ride_status: { lte: 399 } },
        );
      } else if (status === 'scheduled') {
        statusCondition.push(
          { test_ride_status: { gte: 200 } },
          { test_ride_status: { lte: 299 } },
        );
      } else if (status === 'completed') {
        statusCondition.push(
          { test_ride_status: { gte: 400 } },
          { test_ride_status: { lte: 499 } },
          { test_ride_on: { between: [from, to] } },
        );
      } else if (status === 'cancelled') {
        statusCondition.push(
          { test_ride_status: { gte: 500 } },
          { test_ride_status: { lte: 599 } },
          { test_ride_on: { between: [from, to] } },
        );
      }
      if (status === 'scheduled') {
        const now = moment().add(300, 'minutes');
        let overDue = [];
        let pending = [];
        if (to < now) {
          statusCondition.push({ test_ride_on: { between: [from, to] } });
          overDue = await app.LeadDetail.find({
            where: { and: statusCondition },
            include: [{
              relation: 'vehicle',
              scope: { fields: ['name', 'image_url'] },
            }, {
              relation: 'lead',
              scope: {
                include: [
                  { relation: 'financier_lead', scope: { fields: ['id'] } },
                  {
                    relation: 'assignee',
                    scope: { fields: ['id', 'first_name', 'last_name'] },
                  }, 'document'],
                fields: ['name', 'mobile_number', 'created_at', 'gender',
                  'user_id', 'assigned_to', 'category'],
              },
            }],
            order: 'test_ride_on ASC',
          });
        } else if (from > now) {
          statusCondition.push({ test_ride_on: { between: [from, to] } });
          pending = await app.LeadDetail.find({
            where: { and: statusCondition },
            include: [{
              relation: 'vehicle',
              scope: { fields: ['name', 'image_url'] },
            }, {
              relation: 'lead',
              scope: {
                include: [
                  { relation: 'financier_lead', scope: { fields: ['id'] } },
                  {
                    relation: 'assignee',
                    scope: { fields: ['id', 'first_name', 'last_name'] },
                  }, 'document'],
                fields: ['name', 'mobile_number', 'created_at', 'gender',
                  'user_id', 'assigned_to', 'category'],
              },
            }],
            order: 'test_ride_on ASC',
          });
        } else {
          statusCondition.push({ test_ride_on: { between: [from, now] } });
          overDue = await app.LeadDetail.find({
            where: { and: statusCondition },
            include: [{
              relation: 'vehicle',
              scope: { fields: ['name', 'image_url'] },
            }, {
              relation: 'lead',
              scope: {
                include: [
                  { relation: 'financier_lead', scope: { fields: ['id'] } },
                  {
                    relation: 'assignee',
                    scope: { fields: ['id', 'first_name', 'last_name'] },
                  }, 'document'],
                fields: ['name', 'mobile_number', 'created_at', 'gender',
                  'user_id', 'assigned_to', 'category'],
              },
            }],
            order: 'test_ride_on ASC',
          });
          const index = statusCondition.indexOf({ test_ride_on: { between: [from, now] } });
          statusCondition.splice(index, 1);
          statusCondition.push({ test_ride_on: { between: [now, to] } });
          pending = await app.LeadDetail.find({
            where: { and: statusCondition },
            include: [{
              relation: 'vehicle',
              scope: { fields: ['name', 'image_url'] },
            }, {
              relation: 'lead',
              scope: {
                include: [
                  { relation: 'financier_lead', scope: { fields: ['id'] } },
                  {
                    relation: 'assignee',
                    scope: { fields: ['id', 'first_name', 'last_name'] },
                  }, 'document'],
                fields: ['name', 'mobile_number', 'created_at', 'gender',
                  'user_id', 'assigned_to', 'category'],
              },
            }],
            order: 'test_ride_on ASC',
          });
        }
        return callback(null, { pending, overDue });
      }
      const testRideObj = await app.LeadDetail.find({
        where: { and: statusCondition },
        include: [{
          relation: 'vehicle',
          scope: { fields: ['name', 'image_url'] },
        }, {
          relation: 'lead',
          scope: {
            include: [
              { relation: 'financier_lead', scope: { fields: ['id'] } },
              {
                relation: 'assignee',
                scope: { fields: ['id', 'first_name', 'last_name'] },
              }, 'document'],
            fields: ['name', 'mobile_number', 'created_at', 'gender',
              'user_id', 'assigned_to', 'category'],
          },
        }],
        order: 'test_ride_on ASC',
      });
      return callback(null, testRideObj);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  async getLeadsBasedOnAssociates(dealerUserIds) {
    const leadIdsArr = [];
    const salesLeadIds = await app.Lead.find({
      where: {
        assigned_to: { inq: dealerUserIds },
      },
      fields: 'id',
    });
    const stripLeadIds = lodash.map(salesLeadIds, 'id');
    this.leadIds = lodash.concat(leadIdsArr, lodash.map(stripLeadIds));
  }

  /**
   * To fetch lead details count based the test ride vehicle status
   *
   * @param  {Object} filter            filter object
   * @param  {Users}
   * @param  {Function} callback        callback
   * @return {Object}
   * @author Jagajeevan
   */
  async getTestRideCount(filter, currentUser, callback) {
    try {
      this.currentUser = currentUser;
      const dealerUserIds = await this.getDealerUserIds();
      if (dealerUserIds.length === 0) {
        return callback();
      }
      await this.getLeadsBasedOnAssociates(dealerUserIds);
      if (this.leadIds === '' || this.leadIds.length === 0) {
        return callback();
      }
      const builder = StringUtils.generateInClause(4, this.leadIds);
      const from = moment(filter.from).startOf('day');
      const to = moment(filter.to).endOf('day');
      let testRideParams = [from, to, this.dealerId];
      const query = `SELECT ongoing, scheduled, completed, cancelled FROM (SELECT
            count(1) FILTER (WHERE test_ride_status >= 300 AND test_ride_status <= 399) AS ongoing,
            count(1) FILTER (WHERE test_ride_status >= 200 AND test_ride_status <= 299 AND
            test_ride_on::timestamp::date BETWEEN $1 AND $2) AS scheduled,
            count(1) FILTER (WHERE test_ride_status >= 400 AND test_ride_status <= 499 AND
            test_ride_on::timestamp::date BETWEEN $1 AND $2) AS completed,
            count(1) FILTER (WHERE test_ride_status >= 500 AND test_ride_status <= 599 AND
            test_ride_on::timestamp::date BETWEEN $1 AND $2) AS cancelled
            FROM lead_details WHERE dealer_id = $3 AND is_deleted = false AND
            lead_id IN (${builder})
          ) t GROUP BY ongoing, scheduled, completed, cancelled`;
      testRideParams = testRideParams.concat(this.leadIds);
      const leadDetailsCount = await new Promise((resolve, reject) => {
        postgresDs.connector.query(query, testRideParams, (err, testRideCount) => {
          if (err) reject(new InstabikeError(err));
          resolve(testRideCount);
        });
      });
      let testRideVehicleParams = [this.dealerId, filter.from, filter.to];
      const paramBuilder = StringUtils.generateInClause(4, this.leadIds);
      const vehicleTypeQuery = `SELECT count(1) FILTER (WHERE v.type = 0) AS bike,
            count(1) FILTER (WHERE v.type = 1) AS scooter
            FROM lead_details ld
            INNER JOIN vehicles v on ld.vehicle_id = v.id
            WHERE test_ride_status >= 200 AND test_ride_status <= 599 AND dealer_id = $1
            AND is_deleted = false AND
            (test_ride_on::timestamp::date BETWEEN $2 AND $3)
            AND lead_id IN (${paramBuilder})`;
      testRideVehicleParams = testRideVehicleParams.concat(this.leadIds);
      const testRideCount = await new Promise((resolve, reject) => {
        postgresDs.connector.query(vehicleTypeQuery, testRideVehicleParams, (err, count) => {
          if (err) reject(new InstabikeError(err));
          resolve(count);
        });
      });
      return callback(null, { testRideCount, leadDetailsCount });
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  generateSlotsByDate() {
    const query = `SELECT generate_series(
          $1::timestamp + $2::time,
          $3::timestamp + $4::time,
          interval  '30 min') as slots`;
    return query;
  }

  /**
   * Update lead detail test vehicle status
   * @param  {string}   leadDetailId
   * @param  {Function} callback
   * @return {obj}
   * @author Jagajeevan
   */
  async updateTestRideVehicleStatus(leadDetailId, leadDetail, callback) {
    this.leadDetailId = leadDetailId;
    try {
      const dealer = await app.Dealer.findById(this.dealerId);
      if (!dealer || !dealer.is_active) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.DEALER.NOT_FOUND));
      }
      const existingLeadDetail = await app.LeadDetail.findById(this.leadDetailId);
      let isReschdule = false;
      let previousTestRide = null;
      if (existingLeadDetail.test_ride_status === 200) {
        isReschdule = true;
        previousTestRide = existingLeadDetail.test_ride_on;
      }
      if (!existingLeadDetail || existingLeadDetail.count === 0) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.LEAD.NOT_FOUND));
      }
      const query = `select count(*) slot_count from (select distinct lead_id from lead_details
        where dealer_id = $1 AND vehicle_id = $2 and test_ride_on = $3
        and test_ride_status between 200 and 399 and is_deleted = false) tmp`;
      const params = [leadDetail.dealer_id, leadDetail.vehicle_id, leadDetail.test_ride_on];
      const slotsCount = await new Promise((resolve, reject) => {
        postgresDs.connector.query(query, params, (err, count) => {
          if (err) reject(new InstabikeError(err));
          resolve(count[0].slot_count);
        });
      });
      const testRideVehicleCount = await app.DealerVehicle.findOne({
        where: {
          dealer_id: leadDetail.dealer_id,
          vehicle_id: leadDetail.vehicle_id,
          is_active: true,
        },
        fields: ['test_ride_vehicle'],
      });
      if (testRideVehicleCount === null) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.TEST_RIDE.VEHICLE_NOT_AVAILABLE));
      }
      if (parseInt(slotsCount, 10) < testRideVehicleCount.test_ride_vehicle) {
        await app.LeadDetail.updateAll(
          {
            and: [
              { lead_id: leadDetail.lead_id },
              { vehicle_id: leadDetail.vehicle_id },
            ],
          },
          {
            test_ride_on: leadDetail.test_ride_on,
            test_ride_status: leadDetail.test_ride_status,
          },
        );
        const lead = await app.Lead.findById(existingLeadDetail.lead_id);
        let type = constants.ACTIVITY.TEST_RIDE_SCHEDULED;
        if (isReschdule) {
          type = constants.ACTIVITY.TEST_RIDE_RESCHEDULED;
        }
        await this.saveActivity(
          lead, null, this.currentUser.id, type,
          leadDetail.test_ride_on.toString(), null, leadDetail.id,
        );
        this.sendNotification(lead, leadDetail, isReschdule, previousTestRide);
        return callback(null, leadDetail);
      }
      return callback(new InstabikeError(ErrorConstants.ERRORS.TEST_RIDE.SLOT_NOT_AVAILABLE));
    } catch (e) {
      return callback(new InstabikeError(e));
    }
  }

  /**
   * get lead details by id
   * @param  {string}   leadDetailId
   * @param  {Function} callback
   * @return {msg}
   * @author Jagajeevan
   */
  async deleteProformoInvoice(leadDetailId, callback) {
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
   * get lead details by id
   * @param  {string}   leadDetailId
   * @param  {Function} callback
   * @return {msg}
   * @author Jagajeevan
   */
  async updateLeadDetailAsDeleted(leadDetailId, callback) {
    try {
      let leadDetail = await app.LeadDetail.findById(leadDetailId, {
        fields: ['dealer_id', 'proforma_invoice_id', 'test_ride_status', 'id', 'lead_id'],
      });
      if (!leadDetail) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.LEAD.NOT_FOUND));
      }
      if (leadDetail.dealer_id === this.currentUser.user_type_id) {
        const flagTestRide = leadDetail.test_ride_status;
        await app.LeadDetail.updateAll({ id: leadDetailId }, {
          is_deleted: true,
          vehicle_status: 900,
          test_ride_status: (
            leadDetail.test_ride_status === 200 ? 500 : leadDetail.test_ride_status
          ),
        });
        const lead = await app.Lead.findById(leadDetail.lead_id);
        leadDetail = await app.LeadDetail.findById(leadDetail.id);
        if (flagTestRide === 200) {
          await this.saveActivity(
            lead, null, this.currentUser.id, constants.ACTIVITY.TEST_RIDE_CANCELLED,
            leadDetail.test_ride_on.toString(), null, leadDetail.id,
          );
          this.sendNotification(lead, leadDetail);
        }
      } else {
        callback(new InstabikeError(ErrorConstants.ERRORS.USER.TRY_AGAIN));
      }
      return callback();
    } catch (e) {
      return callback(new InstabikeError(e));
    }
  }
};
