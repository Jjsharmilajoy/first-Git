/**
 * Financier lead service: This service handles methods to fetch financier-leads by status,
 * prepare where condition based on filter applied, fetch leads count based on status,
 * to get financier-lead detail, add a comment to financier-lead and schedule follow-ups.
 */

// import dependencies
const lodash = require('lodash');

// import files
const BaseService = require('../services/base_service');
const loopback = require('../server.js');
const InstabikeError = require('../error/instabike_error');
const ErrorConstants = require('../utils/constants/error_constants');
const constants = require('../utils/constants/userConstants');
const StringUtils = require('../utils/string_utils');

const app = loopback.dataSources.postgres.models;
const postgresDs = loopback.dataSources.postgres;

/**
 * @author Jagajeevan
 */
module.exports = class FinancierLeadService extends BaseService {
  constructor(id, leadId, currentUser) {
    super(currentUser);
    this.id = id;
    this.leadId = leadId;
    this.currentUser = currentUser;
  }
  /**
   * To find the list of leads with respect to their status
   *
   * @param  {String}   leadStatus
   * @param  {Function} callback
   * @return {Array}    list of leads found
   * @author Jagajeevan
   */
  async fetchFinancierLeadsByStatus(leadStatus, filterObject, callback) {
    try {
      this.financierUserIds = await this.getFinancierUserIds();
      if (this.financierUserIds.length === 0) {
        return callback();
      }
      const whereCondition = await this.prepareFinancierLeadsCond(leadStatus, filterObject);
      const leads = await app.FinancierLead.find({
        where: {
          and: whereCondition,
        },
        include: [
          {
            relation: 'lead',
            scope: { fields: ['id', 'name', 'mobile_number', 'gender'] },
          },
          {
            relation: 'dealer',
            scope: {
              include: { relation: 'manufacturer', scope: { fields: ['id', 'logo_url'] } },
              fields: ['id', 'name', 'manufacturer_id'],
            },
          },
          {
            relation: 'assignedTo',
            scope: { fields: ['id', 'first_name', 'last_name'] },
          },
        ],
        order: 'created_at DESC',
      });
      if (leadStatus === 'lost') {
        const groupedLeads = lodash(leads).groupBy(lead => lead.lost_reason);
        return callback(null, groupedLeads);
      }
      return callback(null, leads);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * preparing query to get the leads by its filter
   * @return {string} query
   * @author Jagajeevan
   */
  async prepareFinancierLeadsCond(leadStatus, leadsFilter) {
    try {
      this.condition = [];
      if (this.verifyRole('FINANCIER_CITY_HEAD')) {
        this.condition.push({ city_id: this.currentUser.city_id });
      } else if (this.verifyRole('FINANCIER_TEAM_HEAD')) {
        let teamIds = await app.FinancierTeam.find({
          where: {
            and: [
              { owned_by: this.currentUser.id },
              { city_id: this.currentUser.city_id },
              { financier_id: this.currentUser.user_type_id },
            ],
          },
          fields: 'id',
        });
        teamIds = lodash.map(teamIds, 'id');
        this.condition.push({ financier_team_id: { inq: teamIds } });
      } else if (this.verifyRole('FINANCIER_SALES')) {
        this.condition.push({ assigned_to: this.currentUser.id });
      }
      if (leadsFilter.team && leadsFilter.team.length) {
        this.condition.push({ financier_team_id: { inq: leadsFilter.team } });
      } else {
        let teamIds = await app.FinancierTeam.find({
          where: {
            and: [
              { city_id: this.currentUser.city_id },
              { financier_id: this.currentUser.user_type_id },
            ],
          },
          fields: 'id',
        });
        teamIds = lodash.map(teamIds, 'id');
        this.condition.push({ financier_team_id: { inq: teamIds } });
      }
      if (leadsFilter.members && leadsFilter.members.length) {
        this.condition.push({ assigned_to: { inq: leadsFilter.members } });
      }
      if (leadsFilter.dealer && leadsFilter.dealer.length) {
        this.condition.push({ dealer_id: { inq: leadsFilter.dealer } });
      }
      if (leadsFilter.mobile_number) {
        this.condition.push({ mobile_number: { like: `%${leadsFilter.mobile_number}%` } });
      }
      if (leadsFilter.name) {
        this.condition.push({ name: { like: `%${leadsFilter.name}%` } });
      }
      if (leadsFilter.loan_number) {
        this.condition.push({ loan_id: { like: `%${leadsFilter.loan_number}%` } });
      }
      if (leadStatus === 'active') {
        this.condition.push(
          { status: { gte: 500 } }, { status: { lte: 509 } },
          { created_at: { between: [leadsFilter.fromDate, leadsFilter.toDate] } },
        );
      } else if (leadStatus === 'disbursement_pending') {
        this.condition.push(
          { status: { gte: 510 } }, { status: { lte: 519 } },
          { created_at: { between: [leadsFilter.fromDate, leadsFilter.toDate] } },
        );
      } else if (leadStatus === 'converted') {
        this.condition.push(
          { status: { gte: 520 } }, { status: { lte: 529 } },
          { converted_on: { between: [leadsFilter.fromDate, leadsFilter.toDate] } },
        );
      } else {
        this.condition.push(
          { status: { gte: 930 } }, { status: { lte: 939 } },
          { lost_on: { between: [leadsFilter.fromDate, leadsFilter.toDate] } },
        );
      }
      return this.condition;
    } catch (err) {
      throw new InstabikeError(err);
    }
  }

  /**
   * To fetch leads count based on date and status filter
   *
   * @param  {Object} filter                   filter object
   * @param  {Function} callback                    callback
   * @return {Function} callback                    callback
   * @author Jagajeevan
   */
  async financierLeadCountByStatus(filter, callback) {
    try {
      this.financierUserIds = await this.getFinancierUserIds();
      if (this.financierUserIds.length === 0) {
        return callback();
      }
      const leadstatus = await this.buildLeadsCountByStatusQuery(filter);
      const leadsCount = await new Promise((resolve, reject) => {
        postgresDs.connector.query(leadstatus.query, leadstatus.params, (err, leadCount) => {
          if (err) reject(new InstabikeError(err));
          resolve(leadCount);
        });
      });
      return callback(null, leadsCount);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * preparing query to get the leads count by status
   * @return {string} query
   * @author Jagajeevan
   */
  async buildLeadsCountByStatusQuery(filter) {
    try {
      let params = [filter.fromDate, filter.toDate, this.currentUser.user_type_id];
      let cond = 'WHERE financier_id = $3';
      if (this.verifyRole('FINANCIER_CITY_HEAD')) {
        params.push(this.currentUser.city_id);
        cond = ` ${cond} AND city_id = $${params.length} `;
      } else if (this.verifyRole('FINANCIER_TEAM_HEAD')) {
        let teamIds = await app.FinancierTeam.find({
          where: {
            and: [
              { owned_by: this.currentUser.id },
              { city_id: this.currentUser.city_id },
              { financier_id: this.currentUser.user_type_id },
            ],
          },
          fields: 'id',
        });
        teamIds = lodash.map(teamIds, 'id');
        const teamString =
          StringUtils.generateInClause(params.length + 1, teamIds);
        params = params.concat(teamIds);
        cond = `${cond} AND financier_team_id IN (${teamString}) `;
      } else if (this.verifyRole('FINANCIER_SALES')) {
        params.push(this.currentUser.id);
        cond = ` ${cond} AND assigned_to = $${params.length} `;
      }
      if (filter.mobile_number) {
        params.push(`%${filter.mobile_number}%`);
        cond = ` ${cond} AND mobile_number like $${params.length} `;
      }
      if (filter.name) {
        params.push(`%${filter.name}%`);
        cond = ` ${cond} AND name like $${params.length} `;
      }
      if (filter.loan_number) {
        params.push(`%${filter.loan_number}%`);
        cond = ` ${cond} AND loan_id like $${params.length} `;
      }
      if (filter.team && filter.team.length) {
        const teamString =
          StringUtils.generateInClause(params.length + 1, filter.team);
        params = params.concat(filter.team);
        cond = `${cond} AND financier_team_id IN (${teamString}) `;
      }
      if (filter.members && filter.members.length) {
        const userString =
          StringUtils.generateInClause(params.length + 1, filter.members);
        params = params.concat(filter.members);
        cond = `${cond} AND assigned_to IN (${userString}) `;
      }
      if (filter.dealer && filter.dealer.length) {
        const dealerString =
          StringUtils.generateInClause(params.length + 1, filter.dealer);
        params = params.concat(filter.dealer);
        cond = `${cond} AND dealer_id IN (${dealerString}) `;
      }
      const query = `SELECT active, disbursement_pending, converted, lost,
      sum(active+disbursement_pending+converted+lost) as leads_count FROM (
          SELECT
            count(1) FILTER (WHERE created_at >= $1 AND created_at <= $2
            AND status >= 500 AND status <= 509) AS active,
            count(1) FILTER (WHERE created_at >= $1 AND created_at <= $2
            AND status >= 510 AND status <= 519)  AS disbursement_pending,
            count(1) FILTER (WHERE converted_on >= $1 AND converted_on <= $2
            AND status >= 520 AND status <= 529) AS converted,
            count(1) FILTER (WHERE lost_on >= $1 AND lost_on <= $2
            AND status >= 930 AND status <= 939) AS lost
          FROM financier_leads ${cond}
      ) t group by active, disbursement_pending, converted, lost`;
      return { query, params };
    } catch (error) {
      throw new InstabikeError(error);
    }
  }

  /**
  * Get financier lead by ID with Lead Details, Financial Details etc
  * @param  {function} callback
  * @return {object} lead
  * @author Jagajeevan
  */
  async getFinancierLeadDetails(callback) {
    try {
      const lead = await app.FinancierLead.findOne({
        where: { id: this.id },
        include: [
          {
            relation: 'lead',
            scope: {
              fields: ['id', 'name', 'mobile_number',
                'income_status', 'domicile_status', 'income_range'],
            },
          },
          {
            relation: 'dealer',
            scope: {
              include: { relation: 'manufacturer', scope: { fields: ['id', 'logo_url'] } },
              fields: ['id', 'name', 'manufacturer_id'],
            },
          },
          {
            relation: 'assignedTo',
            scope: { fields: ['id', 'first_name', 'last_name', 'mobile_no'] },
          },
          {
            relation: 'financier',
            scope: { fields: ['id', 'name'] },
          },
          {
            relation: 'document_details',
          },
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
   * To fetch leads based on phone/name/loanId, date filter
   *
   * @param  {Object} leadsFilter              filter object
   * @param  {Function} callback                    callback
   * @return {Function} callback                    callback
   * @author Jagajeevan
   */
  async fetchLeadsByFilter(leadsFilter, paging, callback) {
    try {
      this.financierUserIds = await this.getFinancierUserIds();
      if (this.financierUserIds.length === 0) {
        return callback();
      }
      const whereCondition = [];
      if (this.financierUserIds) {
        whereCondition.push({ assigned_to: { inq: this.financierUserIds } });
      }
      if (leadsFilter.mobile_number) {
        whereCondition.push({ mobile_number: { regexp: `/${leadsFilter.mobile_number}/i` } });
      }
      if (leadsFilter.name) {
        whereCondition.push({ name: { regexp: `/${leadsFilter.name}/i` } });
      }
      if (leadsFilter.loan_number) {
        whereCondition.push({ loan_id: { regexp: `/${leadsFilter.loan_number}/i` } });
      }
      if (leadsFilter.fromDate && leadsFilter.toDate) {
        whereCondition.push({
          or: [
            { created_at: { between: [leadsFilter.fromDate, leadsFilter.toDate] } },
            { converted_on: { between: [leadsFilter.fromDate, leadsFilter.toDate] } },
            { lost_on: { between: [leadsFilter.fromDate, leadsFilter.toDate] } },
          ],
        });
      }
      const leadsCount = await app.FinancierLead.count({ and: whereCondition });
      const leads = await app.FinancierLead.find({
        where: {
          and: whereCondition,
        },
        include: [
          {
            relation: 'lead',
            scope: { fields: ['id', 'name', 'mobile_number', 'gender'] },
          },
          {
            relation: 'dealer',
            scope: {
              include: { relation: 'manufacturer', scope: { fields: ['id', 'logo_url'] } },
              fields: ['id', 'name', 'manufacturer_id'],
            },
          },
          {
            relation: 'assignedTo',
            scope: { fields: ['id', 'first_name', 'last_name'] },
          },
        ],
        order: 'status ASC',
        limit: paging.limit,
        skip: (paging.pageno - 1) * paging.limit,
      });
      return callback(null, { leadsCount, leads });
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * add comment to lead
   * @param  {Object}   leadActivity
   * @return {leadActivity}
   * @author Jagajeevan
   */
  async addCommentToLead(leadActivity, callback) {
    try {
      const lead = await app.FinancierLead.findById(this.id);
      if (!lead) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.LEAD.NOT_FOUND));
      }
      if (!leadActivity.comment) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.LEAD.COMMENT_NOT_FOUND));
      }
      await this.saveFinancierActivity(
        lead, null, this.currentUser.id,
        constants.ACTIVITY.COMMENTS_ADDED, leadActivity.comment,
      );
      return callback(null, leadActivity);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * schedule a follow-up
   * @param  {object} followup
   * @param  {Function} callback
   * @return {FollowUp}
   * @author Jagajeevan
   */
  async scheduleFollowup(followup, callback) {
    try {
      const financierLead = await app.FinancierLead.findById(this.id);
      if (!financierLead) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.LEAD.NOT_FOUND));
      }
      await financierLead.updateAttributes({
        next_follow_up_on: followup.follow_up_at,
        last_follow_up_done_on: financierLead.next_follow_up_on,
      });
      await this.saveFinancierActivity(
        financierLead, null, this.currentUser.id,
        constants.ACTIVITY.FOLLOWUP_SCHEDULED, followup.comment,
      );
      return callback(null, followup);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }
};
