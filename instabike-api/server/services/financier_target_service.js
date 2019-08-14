/**
 * Financier target Service consists methods such as: get target details,
 * get target completion graph data, and update target, get target summary of a user or
 * city or team, send email on target update, generate date series, check next month
 * target availability
 */

// import dependencies
const lodash = require('lodash');
const moment = require('moment');
const dot = require('dot');

// import files
const loopback = require('../server.js');
const BaseService = require('../services/base_service');
const InstabikeError = require('../error/instabike_error');
const DateUtils = require('../utils/date_utils');
const constants = require('../utils/constants/userConstants');
const ErrorConstants = require('../utils/constants/error_constants');
const ExternalServiceProviders = require('../utils/external_services_providers');
const StringUtils = require('../utils/string_utils');

const postgresDs = loopback.dataSources.postgres;
const app = loopback.dataSources.postgres.models;

/**
 * @author Jaiyashree Subramanian
 */
/* eslint class-methods-use-this: ["error",
 { "exceptMethods": ["updateMonthlyTargets", "sendEmailForTargets"] }] */
module.exports = class FinancierTargetService extends BaseService {
  constructor(financierId, currentUser) {
    super(currentUser);
    this.financierId = financierId;
    this.registerChild(this);
  }

  /**
   * To update incentive_amount for each target creation from
   * previous month target else update it with target value
   *
   * @param  {Object} financierTarget      financier-target instance
   * @param  {Function} callback                            callback
   * @return {Function} callback                            callback
   * @author Jaiyashree Subramanian
   */
  /* eslint no-param-reassign: ["error", { "props": false }] */
  async beforeCreateTarget(financierTarget, callback) {
    this.financierTarget = financierTarget;
    try {
      const previousTarget = await app.FinancierTarget.findOne({
        where: {
          and: [
            { user_id: financierTarget.user_id ? financierTarget.user_id : null },
            { financier_id: financierTarget.financier_id },
            { financier_team_id: financierTarget.financier_team_id },
          ],
        },
        order: 'created_at DESC',
        limit: 1,
      });
      if (!previousTarget || !previousTarget.incentive_eligibility) {
        financierTarget.incentive_eligibility = financierTarget.target_value;
      }
      const params = [financierTarget.from, financierTarget.to, financierTarget.financier_id,
        financierTarget.financier_team_id];
      let userString = '';
      if (financierTarget.user_id) {
        userString = ' and assigned_to = $5 ';
        params.push(financierTarget.user_id);
      }
      const leadsConvertedQuery = this.buildLeadsConvertedQuery({
        userString,
      });
      const leadSummary = await new Promise((resolve, reject) => {
        postgresDs.connector.query(leadsConvertedQuery, params, (err, result) => {
          if (err) reject(new InstabikeError(err));
          resolve(result);
        });
      });
      if (leadSummary && leadSummary.length && leadSummary[0].converted_leads) {
        financierTarget.achieved_value = leadSummary[0].converted_leads;
      }
      if (financierTarget.achieved_value > financierTarget.incentive_eligibility) {
        const activeIncentiveRate = await app.FinancierIncentive.findOne({
          where: {
            and: [
              { financier_id: financierTarget.financier_id },
              { city_id: this.currentUser.city_id },
              { from_date: { lte: new Date() } },
              { to_date: null },
            ],
          },
          fields: 'incentive_amount',
        });
        if (activeIncentiveRate) {
          financierTarget.incentive_earned =
            financierTarget.achieved_value * activeIncentiveRate.incentive_amount;
        }
      }
      financierTarget.targetType = 'TARGET_SET';
      financierTarget.updatedValue = financierTarget.target_value;
      return callback(null, financierTarget);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  buildLeadsConvertedQuery(inputs) {
    this.inputs = inputs;
    return ` SELECT financier_leads.financier_team_id as team_id,
    COUNT(1) FILTER (where status = 520) converted_leads
    FROM financier_leads WHERE ( created_at::date BETWEEN $1 AND $2
    and financier_id = $3 and financier_team_id = $4 ${this.inputs.userString} )
    GROUP BY financier_leads.financier_team_id`;
  }

  /**
   * To update incentive_earned value if a target's incentive-eligibility
   * is updated
   *
   * @param  {Object} financierTarget           financier-target instance
   * @param  {Function} callback                                 callback
   * @return {Function} callback                                 callback
   * @author Jaiyashree Subramanian
   */
  /* eslint no-param-reassign: ["error", { "props": false }] */
  async beforeUpdateTarget(financierTarget, callback) {
    this.financierTarget = financierTarget;
    try {
      const previousTarget = await app.FinancierTarget.findById(financierTarget.id);
      if (previousTarget && previousTarget.target_value &&
          financierTarget.target_value &&
          previousTarget.target_value !== financierTarget.target_value) {
        financierTarget.targetType = 'TARGET_UPDATED';
        financierTarget.updatedValue = financierTarget.target_value;
      }
      if (previousTarget && previousTarget.incentive_eligibility &&
          financierTarget.incentive_eligibility &&
          previousTarget.incentive_eligibility !== financierTarget.incentive_eligibility) {
        financierTarget.targetType = 'INCENTIVE_UPDATED';
        financierTarget.updatedValue = financierTarget.incentive_eligibility;
        if (previousTarget.achieved_value >= financierTarget.incentive_eligibility) {
          const activeIncentiveRate = await app.FinancierIncentive.findOne({
            where: {
              and: [
                { financier_id: previousTarget.financier_id },
                { city_id: this.currentUser.city_id },
                { from_date: { lte: new Date() } },
                { to_date: null },
              ],
            },
            fields: 'incentive_amount',
          });
          if (activeIncentiveRate) {
            financierTarget.incentive_earned =
              previousTarget.achieved_value * activeIncentiveRate.incentive_amount;
          }
        } else if (previousTarget.achieved_value < financierTarget.incentive_eligibility) {
          financierTarget.incentive_earned = 0;
        }
      }
      if (previousTarget && financierTarget.target_value &&
          new Date(previousTarget.from).getTime() > new Date().getTime()) {
        financierTarget.incentive_eligibility = financierTarget.target_value;
      }
      return callback(null, financierTarget);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * To get financier-team-members targets completion for 2 months based on team-id.
   *
   * @param  {Function} callback                    callback
   * @return {Function} callback                    callback
   * @author Jaiyashree Subramanian
   */
  async getMembersTargetCompletion(teamId, callback) {
    try {
      let financierUserIds = await app.FinancierTeamMember.find({
        where: {
          and: [
            { from_date: { lte: new Date() } },
            { financier_team_id: teamId },
            { to_date: null },
            { user_id: { neq: null } },
          ],
        },
        fields: ['user_id'],
      });
      financierUserIds = lodash.map(financierUserIds, 'user_id');
      let financierTeamOwnerIds = await app.FinancierTeam.find({
        where: { and: [{ id: teamId }, { owned_by: { neq: null } }] },
        fields: ['owned_by'],
      });
      financierTeamOwnerIds = lodash.map(financierTeamOwnerIds, 'owned_by');
      financierUserIds = financierUserIds.concat(financierTeamOwnerIds);
      if (financierUserIds.length !== 0) {
        const targetQuery = this.buildMembersTargetCompletionQuery(financierUserIds);
        const targets = await new Promise((resolve, reject) => {
          postgresDs.connector.query(targetQuery.query, targetQuery.params, (err, result) => {
            if (err) reject(new InstabikeError(err));
            resolve(result);
          });
        });
        const nextMonth = DateUtils.getNextMonthDates(new Date());
        const nmTargetQuery = this.buildTeamTargetByDateQuery({
          teamId, fromDate: nextMonth.from_date, toDate: nextMonth.to_date,
        });
        const nextMonthTarget = await new Promise((resolve, reject) => {
          postgresDs.connector.query(nmTargetQuery.query, nmTargetQuery.params, (err, result) => {
            if (err) reject(new InstabikeError(err));
            resolve(result.length ? result[0] : {});
          });
        });
        const currentMonth = DateUtils.getCurrentMonthDates(new Date());
        const cmTargetQuery = this.buildTeamTargetByDateQuery({
          teamId, fromDate: currentMonth.from_date, toDate: currentMonth.to_date,
        });
        const currentMonthTarget = await new Promise((resolve, reject) => {
          postgresDs.connector.query(cmTargetQuery.query, cmTargetQuery.params, (err, result) => {
            if (err) reject(new InstabikeError(err));
            resolve(result.length ? result[0] : {});
          });
        });
        return callback(null, { currentMonthTarget, nextMonthTarget, targets });
      }
      return callback();
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  buildMembersTargetCompletionQuery(financierUserIds) {
    const currentMonth = DateUtils.getCurrentMonthDates(new Date());
    const lastMonth = DateUtils.getLastMonthDates(new Date());
    const nextMonth = DateUtils.getNextMonthDates(new Date());
    let params = [this.financierId, new Date(currentMonth.from_date).toISOString(),
      new Date(currentMonth.to_date).toISOString(), lastMonth.from_date, lastMonth.to_date,
      nextMonth.from_date, nextMonth.to_date];
    const userString =
      StringUtils.generateInClause(params.length + 1, financierUserIds);
    params = params.concat(financierUserIds);
    return { query: this.membersTargetCompletion({ userString }), params };
  }

  membersTargetCompletion(inputs) {
    this.inputs = inputs;
    return `
      SELECT cm_targets.user_id, cm_targets.first_name, cm_targets.last_name,
      cm_targets.current_month_target_id as current_month_target_id,
      cm_targets.current_month_total_target as current_month_total_target,
      cm_targets.current_month_achieved as current_month_achieved,
      cm_targets.incentive_eligibility as current_month_incentive_eligibility,
      lm_targets.last_month_achieved as last_month_achieved, lm_targets.last_month_target as last_month_target,
      nm_targets.next_month_achieved as next_month_achieved, nm_targets.next_month_target as next_month_target,
      nm_targets.next_month_target_id as next_month_target_id,
      nm_targets.incentive_eligibility as next_month_incentive_eligibility from
      (select u.id as user_id, u.first_name as first_name, u.last_name as last_name,
      ft.target_value as current_month_total_target, ft.achieved_value as current_month_achieved,
      ft.incentive_eligibility as incentive_eligibility,
      ft.id as current_month_target_id
      from users as u
      LEFT JOIN financier_targets as ft on ft.user_id=u.id
      and ft.from::date >= $2::date and ft.to::date <= $3::date
      where u.user_type_id= $1 and u.id in (${inputs.userString})
      group by ft.user_id, u.id, ft.target_value, ft.achieved_value, ft.id) as cm_targets
      INNER JOIN (
      select u.id as user_id, sum(ft.achieved_value) as last_month_achieved, sum(ft.target_value) as last_month_target
      from users as u
      LEFT JOIN financier_targets as ft on ft.user_id=u.id
      and ft.from::date >= $4 and ft.to::date <= $5
      where u.user_type_id= $1 and u.id in (${inputs.userString})
      group by ft.user_id, u.id, ft.target_value, ft.achieved_value) as lm_targets on lm_targets.user_id = cm_targets.user_id
      INNER JOIN (
      select u.id as user_id, ft.achieved_value as next_month_achieved, ft.target_value as next_month_target,
      ft.incentive_eligibility as incentive_eligibility,
      ft.id as next_month_target_id
      from users as u
      LEFT JOIN financier_targets as ft on ft.user_id=u.id
      and ft.from::date >= $6 and ft.to::date <= $7
      where u.user_type_id= $1 and u.id in (${inputs.userString})
      group by ft.user_id, u.id, ft.target_value, ft.achieved_value, ft.id) as nm_targets on nm_targets.user_id = cm_targets.user_id
    `;
  }

  buildTeamTargetByDateQuery(inputs) {
    const params = [this.financierId, inputs.teamId, inputs.fromDate, inputs.toDate];
    const query = ` SELECT * FROM financier_targets ft WHERE financier_id = $1 AND
    financier_team_id = $2 AND user_id iS null AND ft.from::date <= $3::date AND
    ft.to::date >= $4::date LIMIT 1`;
    return { query, params };
  }

  /**
   * To get financier-team targets completion for 2 months based on city-id.
   *
   * @param  {Function} callback                    callback
   * @return {Function} callback                    callback
   * @author Jaiyashree Subramanian
   */
  async getTeamsTargetCompletion(cityId, callback) {
    try {
      let financierTeamIds = await app.FinancierTeam.find({
        where: {
          and: [
            { financier_id: this.financierId },
            { city_id: cityId },
          ],
        },
        fields: ['id'],
      });
      financierTeamIds = lodash.map(financierTeamIds, 'id');
      if (financierTeamIds.length !== 0) {
        let params = [];
        const targetQuery = this.buildTeamsTargetCompletionQuery(financierTeamIds);
        const targets = await new Promise((resolve, reject) => {
          postgresDs.connector.query(targetQuery.query, targetQuery.params, (err, dealerTarget) => {
            if (err) reject(new InstabikeError(err));
            resolve(dealerTarget);
          });
        });
        const nextMonth = DateUtils.getNextMonthDates(new Date());
        params = [this.financierId, nextMonth.from_date, nextMonth.to_date];
        const nextMonthTargetQuery = this.overallTarget({
          financierTeamIds,
        });
        params = params.concat(nextMonthTargetQuery.params);
        const nextMonthTarget = await new Promise((resolve, reject) => {
          postgresDs.connector.query(nextMonthTargetQuery.query, params, (err, result) => {
            if (err) reject(new InstabikeError(err));
            resolve(result[0]);
          });
        });
        const currentMonth = DateUtils.getCurrentMonthDates(new Date());
        params = [this.financierId, currentMonth.from_date, currentMonth.to_date];
        const currentMonthQuery = this.overallTarget({
          financierTeamIds,
        });
        params = params.concat(currentMonthQuery.params);
        const currentMonthTarget = await new Promise((resolve, reject) => {
          postgresDs.connector.query(currentMonthQuery.query, params, (err, result) => {
            if (err) reject(new InstabikeError(err));
            resolve(result[0]);
          });
        });
        return callback(null, { currentMonthTarget, nextMonthTarget, targets });
      }
      return callback();
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  overallTarget(inputs) {
    this.inputs = inputs;
    let params = [];
    const teamString =
      StringUtils.generateInClause(4, inputs.financierTeamIds);
    params = params.concat(inputs.financierTeamIds);
    const query = `
      SELECT SUM(achieved_value) achieved_value, SUM(target_value) target_value
      FROM financier_targets ft WHERE financier_id = $1 AND
      ft.from::date >= $2 AND ft.to::date <= $3 AND ft.user_id IS null
      AND ft.financier_team_id in (${teamString})
    `;
    return { query, params };
  }

  buildTeamsTargetCompletionQuery(financierTeamIds) {
    const currentMonth = DateUtils.getCurrentMonthDates(new Date());
    const lastMonth = DateUtils.getLastMonthDates(new Date());
    const nextMonth = DateUtils.getNextMonthDates(new Date());
    let params = [this.financierId, new Date(currentMonth.from_date).toISOString(),
      new Date(currentMonth.to_date).toISOString(), lastMonth.from_date, lastMonth.to_date,
      nextMonth.from_date, nextMonth.to_date];
    const teamString =
      StringUtils.generateInClause(params.length + 1, financierTeamIds);
    params = params.concat(financierTeamIds);
    return { query: this.teamsTargetCompletion({ teamString }), params };
  }

  teamsTargetCompletion(inputs) {
    this.inputs = inputs;
    return `
      SELECT cm_targets.team_id, cm_targets.team_name, cm_targets.current_month_target_id as current_month_target_id,
      cm_targets.current_month_total_target as current_month_total_target,
      cm_targets.current_month_achieved as current_month_achieved,
      cm_targets.incentive_eligibility as current_month_incentive_eligibility,
      lm_targets.last_month_achieved as last_month_achieved, lm_targets.last_month_target as last_month_target,
      nm_targets.next_month_achieved as next_month_achieved, nm_targets.next_month_target as next_month_target,
      nm_targets.next_month_target_id as next_month_target_id,
      nm_targets.incentive_eligibility as next_month_incentive_eligibility from
      (select team.name as team_name, team.id as team_id,
      ft.target_value as current_month_total_target, ft.achieved_value as current_month_achieved,
      ft.id as current_month_target_id, ft.incentive_eligibility as incentive_eligibility
      from financier_teams as team
      LEFT JOIN financier_targets as ft on ft.financier_team_id=team.id and user_id is null
      and ft.from::date >= $2::date and ft.to::date <= $3::date
      where team.financier_id= $1 and team.id in (${inputs.teamString})
      group by ft.financier_team_id, team.id, ft.target_value, ft.achieved_value, ft.id) as cm_targets
      INNER JOIN (
      select team.name as team_name, team.id as team_id,
      ft.target_value as last_month_target, ft.achieved_value as last_month_achieved
      from financier_teams as team
      LEFT JOIN financier_targets as ft on ft.financier_team_id=team.id and user_id is null
      and ft.from::date >= $4 and ft.to::date <= $5
      where team.financier_id= $1 and team.id in (${inputs.teamString})
      group by ft.financier_team_id, team.id, ft.target_value, ft.achieved_value) as lm_targets on lm_targets.team_id = cm_targets.team_id
      INNER JOIN (
      select team.name as team_name, team.id as team_id,
      ft.target_value as next_month_target, ft.achieved_value as next_month_achieved,
      ft.id as next_month_target_id, ft.incentive_eligibility as incentive_eligibility
      from financier_teams as team
      LEFT JOIN financier_targets as ft on ft.financier_team_id=team.id and user_id is null
      and ft.from::date >= $6 and ft.to::date <= $7
      where team.financier_id= $1 and team.id in (${inputs.teamString})
      group by ft.financier_team_id, team.id, ft.target_value, ft.achieved_value, ft.id) as nm_targets on nm_targets.team_id = cm_targets.team_id
    `;
  }
  /**
   * To check if member-target is set for the next month based on team-id
   *
   * @param  {string} teamId                          financier-team-id
   * @param  {function} callback                               callback
   * @author Jaiyashree Subramanian
   */
  async checkNextMonthMemberTarget(teamId, callback) {
    this.teamId = teamId;
    try {
      const nextMonth = DateUtils.getNextMonthDates(new Date());
      const nextMonthTarget = await app.FinancierTarget.find({
        where: {
          and: [
            { financier_id: this.financierId },
            { financier_team_id: this.teamId },
            { user_id: { neq: null } },
            { from: { lte: nextMonth.from_date } },
            { to: { gte: nextMonth.to_date } },
          ],
        },
      });
      return callback(null, !!nextMonthTarget.length);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * To check if team-target is set for the next month based on userId
   *
   * @param  {string} userId           financier-user-id (city-head)
   * @param  {function} callback                            callback
   * @author Jaiyashree Subramanian
   */
  async checkNextMonthTeamTarget(userId, callback) {
    this.userId = userId;
    try {
      const user = await app.Users.findById(userId);
      let teamIds = await app.FinancierTeam.find({
        where: {
          and: [
            { city_id: user.city_id },
            { financier_id: this.financierId },
            { to_date: null },
          ],
        },
        fields: ['id'],
      });
      teamIds = lodash.map(teamIds, 'id');
      const nextMonth = DateUtils.getNextMonthDates(new Date());
      const nextMonthTarget = await app.FinancierTarget.find({
        where: {
          financier_id: this.financierId,
          financier_team_id: { inq: teamIds },
          user_id: null,
          from: { gte: nextMonth.from_date },
          to: { lte: nextMonth.to_date },
        },
      });
      return callback(null, teamIds.length === nextMonthTarget.length);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * updates the target counts for the team and the sales person.
   * @param  {Function} callback
   * @author Jagajeevan
   */
  async updateMonthlyTargets(ctx, leadDetail, callback) {
    if (leadDetail.status === constants.FINANCIER_LEAD_STATUS.CONVERSION) {
      const updateTarget = new Promise(async (resolve, reject) => {
        try {
          const dateFilter = DateUtils.getCurrentMonthDates(new Date());
          const activeIncentiveRate = await app.FinancierIncentive.findOne({
            where: {
              and: [
                { financier_id: leadDetail.financier_id },
                { city_id: this.currentUser.city_id },
                { from_date: { lte: new Date() } },
                { to_date: null },
              ],
            },
          });
          const teamLeadStatusQuery = `SELECT COUNT(1) as converted_leads
            FROM financier_leads WHERE (status = 520 and created_at::date BETWEEN $1 AND $2
            and financier_id = $3 and financier_team_id = $4 )`;
          const teamLeadParams = [dateFilter.from_date, dateFilter.to_date, leadDetail.financier_id,
            leadDetail.financier_team_id];
          const teamLeadsConverted = await new Promise((resolveNew, rejectNew) => {
            postgresDs.connector.query(teamLeadStatusQuery, teamLeadParams, (err, res) => {
              if (err) rejectNew(new InstabikeError(err));
              resolveNew(res && res.length ? res[0].converted_leads : 0);
            });
          });
          const updateTeamTargetQuery = `UPDATE financier_targets ft set
              achieved_value = $5::integer, incentive_earned = $6::integer
            WHERE financier_team_id = $1 AND ft.from::date = $2::date
            AND ft.to::date = $3::date AND financier_id = $4 AND user_id IS NULL`;
          const teamTargetParams = [leadDetail.financier_team_id, dateFilter.from_date,
            dateFilter.to_date, leadDetail.financier_id, teamLeadsConverted,
            teamLeadsConverted * (activeIncentiveRate ? activeIncentiveRate.incentive_amount : 0)];
          await new Promise((resolveNew, rejectNew) => {
            postgresDs.connector.query(updateTeamTargetQuery, teamTargetParams, (err) => {
              if (err) rejectNew(new InstabikeError(err));
              resolveNew();
            });
          });

          const salesLeadStatusQuery = `SELECT COUNT(1) as converted_leads
            FROM financier_leads WHERE (status = 520 and created_at::date BETWEEN $1 AND $2
            and financier_id = $3 and financier_team_id = $4 and assigned_to = $5)`;
          const salesLeadParam = [dateFilter.from_date, dateFilter.to_date, leadDetail.financier_id,
            leadDetail.financier_team_id, leadDetail.assigned_to];
          const salesLeadsConverted = await new Promise((resolveNew, rejectNew) => {
            postgresDs.connector.query(salesLeadStatusQuery, salesLeadParam, (err, res) => {
              if (err) rejectNew(new InstabikeError(err));
              resolveNew(res && res.length ? res[0].converted_leads : 0);
            });
          });

          const updateSalesTargetQuery = `UPDATE financier_targets ft set
              achieved_value = $6, incentive_earned = $7
            WHERE financier_team_id = $1 AND ft.from::date = $2::date
            AND ft.to::date = $3::date AND financier_id = $4 AND user_id = $5`;
          const salesTargetParams = [leadDetail.financier_team_id, dateFilter.from_date,
            dateFilter.to_date, leadDetail.financier_id, leadDetail.assigned_to,
            salesLeadsConverted,
            salesLeadsConverted * (activeIncentiveRate ? activeIncentiveRate.incentive_amount : 0)];
          await new Promise((resolveNew, rejectNew) => {
            postgresDs.connector.query(updateSalesTargetQuery, salesTargetParams, (err) => {
              if (err) rejectNew(new InstabikeError(err));
              resolveNew();
            });
          });
          resolve();
        } catch (e) {
          reject(e);
        }
      });
      return callback(null, updateTarget);
    }
    const context = ctx;
    context.result = await this.getFinancierLeadDetails(leadDetail.id, callback);
    return callback(null, context.result);
  }

  /**
   * get target completion based on the team and the sales.
   * @param  {object} filter
   * @param  {Function} callback
   * @author Jagajeevan
   */
  async getTargetCompletion(filter, callback) {
    try {
      if (this.verifyRole('FINANCIER_CITY_HEAD')) {
        this.teamIds = await app.FinancierTeam.find({
          where: {
            and: [{ city_id: this.currentUser.city_id },
              { financier_id: this.financierId }],
          },
          fields: ['id'],
        });
      } else {
        this.teamIds = await app.FinancierTeam.find({
          where: { owned_by: this.currentUser.id },
          fields: ['id'],
        });
      }
      if (this.teamIds.length === 0) {
        return callback(null, { targets: [] });
      }
      const targetSummary = await this.prepareTeamTargetCompletion(filter);
      const targets = [];
      if (this.dateSeries.length) {
        await new Promise((resolve, reject) => {
          this.dateSeries.map((dateSlot) => {
            if (!dateSlot) {
              reject(new InstabikeError(ErrorConstants.ERRORS.LEAD.TYPE_NOT_FOUND));
            }
            const target = lodash.find(targetSummary, { from: dateSlot.date_series });
            if (!target) {
              resolve(targets.push({
                target: '0',
                achieved: '0',
                month: moment(dateSlot.date_series).format('MMM'),
                year: moment(dateSlot.date_series).format('YY'),
                from: dateSlot.date_series,
              }));
            } else {
              resolve(targets.push(target));
            }
            return true;
          });
        });
      }
      return callback(null, targets);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  async prepareTeamTargetCompletion(filter) {
    try {
      const generateDateSeries = this.generateDateSeries();
      const dateParams = [filter.fromDate, filter.toDate];
      this.dateSeries = await new Promise((resolve, reject) => {
        postgresDs.connector.query(generateDateSeries, dateParams, (err, result) => {
          if (err) reject(new InstabikeError(err));
          resolve(result);
        });
      });
      this.teamIds = lodash.map(this.teamIds, 'id');
      let params = [filter.fromDate, filter.toDate];
      const teamString =
        StringUtils.generateInClause(params.length + 1, this.teamIds);
      params = params.concat(this.teamIds);
      const financierTargetCompletion = this.financierTargetCompletion({ teamString });
      const targetSummary = await new Promise((resolve, reject) => {
        postgresDs.connector.query(financierTargetCompletion, params, (err, result) => {
          if (err) reject(new InstabikeError(err));
          resolve(result);
        });
      });
      return targetSummary;
    } catch (error) {
      return new InstabikeError(error);
    }
  }

  generateDateSeries(inputs) {
    this.inputs = inputs;
    return `SELECT
      generate_series($1, $2, interval '1 month') as date_series `;
  }

  financierTargetCompletion(inputs) {
    this.inputs = inputs;
    return ` SELECT SUM(target_value) target,
      SUM(achieved_value) achieved, to_char(ft.from,'Mon') as month, to_char(ft.from,'YY') as year,
      ft.from from financier_targets ft WHERE ft.from::date BETWEEN $1 AND $2
      AND financier_team_id IN (${inputs.teamString}) AND user_id IS NULL GROUP BY ft.from
    `;
  }

  async getFinancierLeadDetails(leadId, callback) {
    try {
      this.lead = await app.FinancierLead.findOne({
        where: { id: leadId },
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
              include: {
                relation: 'manufacturer',
                scope: {
                  fields:
['id', 'logo_url'],
                },
              },
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
      return this.lead;
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * get target completion based on the team and the sales.
   * @param  {object} filter
   * @param  {Function} callback
   * @author Jagajeevan
   */
  async getTeamSalesPerformance(filter, callback) {
    try {
      if (this.verifyRole('FINANCIER_CITY_HEAD')) {
        this.teamIds = await app.FinancierTeam.find({
          where: {
            and: [{ city_id: this.currentUser.city_id },
              { financier_id: this.financierId }],
          },
          fields: ['id', 'name'],
        });
        this.for = 'cityHead';
      } else {
        this.teamIds = await app.FinancierTeam.find({
          where: {
            owned_by: this.currentUser.id,
          },
          fields: ['id'],
          include: [{
            relation: 'financierTeamMembers',
            scope: {
              fields: ['id', 'user_id'],
              include: {
                relation: 'user',
                scope: {
                  fields: ['id', 'first_name', 'last_name'],
                },
              },
            },
          }],
        });
        this.for = 'teamHead';
      }
      if (this.teamIds.length === 0) {
        return callback(null, { teams: [], targets: [] });
      }
      let targetSummary;
      if (this.for === 'cityHead') {
        targetSummary = await this.prepareTeamSalesPerformanceQuery(filter);
      } else {
        targetSummary = await this.prepareTeamMemberSalesPerformanceQuery(filter);
      }
      const targets = [];
      if (this.dateSeries.length) {
        await new Promise((resolve, reject) => {
          this.dateSeries.map((dateSlot) => {
            if (!dateSlot) {
              reject(new InstabikeError(ErrorConstants.ERRORS.LEAD.TYPE_NOT_FOUND));
            }
            const target = lodash.filter(targetSummary, { from: dateSlot.date_series });
            resolve(targets.push({
              month: moment(dateSlot.date_series).format('MMM'),
              year: moment(dateSlot.date_series).format('YY'),
              targets: target,
            }));
            return true;
          });
        });
      }
      return callback(null, { teams: this.teamIds, targets });
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  async prepareTeamSalesPerformanceQuery(filter) {
    try {
      const generateDateSeries = this.generateDateSeries();
      const dateParams = [filter.fromDate, filter.toDate];
      this.dateSeries = await new Promise((resolve, reject) => {
        postgresDs.connector.query(generateDateSeries, dateParams, (err, result) => {
          if (err) reject(new InstabikeError(err));
          resolve(result);
        });
      });
      const teamIds = lodash.map(this.teamIds, 'id');
      let params = [filter.fromDate, filter.toDate];
      const teamString =
        StringUtils.generateInClause(params.length + 1, teamIds);
      params = params.concat(teamIds);
      const financierTeamSalesPerformance = this.financierTeamSalesPerformance(teamString);
      const targetSummary = await new Promise((resolve, reject) => {
        postgresDs.connector.query(financierTeamSalesPerformance, params, (err, result) => {
          if (err) reject(new InstabikeError(err));
          resolve(result);
        });
      });
      return targetSummary;
    } catch (error) {
      return new InstabikeError(error);
    }
  }

  financierTeamSalesPerformance(inputs) {
    this.inputs = inputs;
    return `SELECT ft.financier_team_id id, SUM(target_value) target,
      SUM(achieved_value) achieved, to_char(ft.from,'Mon') as month, to_char(ft.from,'YY') as year,
      ft.from, fte.name from financier_targets ft
      INNER JOIN financier_teams fte on fte.id = ft.financier_team_id
      WHERE ft.from::date BETWEEN $1 AND $2 AND financier_team_id IN (${inputs})
      AND user_id IS NULL GROUP BY ft.financier_team_id, ft.from, fte.name order by ft.from
    `;
  }

  async prepareTeamMemberSalesPerformanceQuery(filter) {
    try {
      const generateDateSeries = this.generateDateSeries();
      const dateParams = [filter.fromDate, filter.toDate];
      this.dateSeries = await new Promise((resolve, reject) => {
        postgresDs.connector.query(generateDateSeries, dateParams, (err, result) => {
          if (err) reject(new InstabikeError(err));
          resolve(result);
        });
      });
      const teams = JSON.parse(JSON.stringify(this.teamIds[0]));
      this.teamIds = lodash.map(teams.financierTeamMembers, 'user');
      const teamIds = lodash.map(this.teamIds, 'id');
      let params = [filter.fromDate, filter.toDate, teams.id];
      const teamUserString =
        StringUtils.generateInClause(params.length + 1, teamIds);
      params = params.concat(teamIds);
      const financierMembersSalesPerformance = this.financierMembersSalesPerformance({
        teamUserString,
      });
      const targetSummary = await new Promise((resolve, reject) => {
        postgresDs.connector.query(financierMembersSalesPerformance, params, (err, result) => {
          if (err) reject(new InstabikeError(err));
          resolve(result);
        });
      });
      return targetSummary;
    } catch (error) {
      return new InstabikeError(error);
    }
  }

  financierMembersSalesPerformance(inputs) {
    this.inputs = inputs;
    return `SELECT SUM(target_value) target,
      SUM(achieved_value) achieved, to_char(ft.from,'Mon') as month, to_char(ft.from,'YY') as year,
      ft.from, ft.user_id id, u.first_name, u.last_name from financier_targets ft
      INNER JOIN users u on u.id = ft.user_id
      WHERE ft.from::date BETWEEN $1 AND $2 AND financier_team_id = $3
      AND ft.user_id IN (${inputs.teamUserString})
      GROUP BY ft.user_id, ft.from, u.first_name, u.last_name order by ft.from
    `;
  }
  /**
   * To get the current incentive amount set for each loan acheived beyond
   * eligibility
   *
   * @param  {Function} callback                                  callback
   * @return {Function} callback                                  callback
   * @author Jaiyashree Subramanian
   */
  async getActiveIncentive(callback) {
    try {
      const financierIncentive = await app.FinancierIncentive.findOne({
        where: {
          and: [
            { financier_id: this.financierId },
            { city_id: this.currentUser.city_id },
            { from_date: { lte: new Date() } },
            { to_date: null },
          ],
        },
      });
      return callback(null, financierIncentive);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * To update incentive by expiring the existing ones and creating a new
   *
   * @param  {Function} callback                           callback
   * @return {Function} callback                           callback
   * @author Jaiyashree Subramanian
   */
  async updateFinancierIncentive(financierIncentive, callback) {
    try {
      const currentMonth = DateUtils.getCurrentMonthDates(new Date());
      await app.FinancierIncentive.updateAll({
        financier_id: this.financierId,
        city_id: this.currentUser.city_id,
        to_date: null,
      }, { to_date: currentMonth.to_date });
      const newFinancierIncentive = await app.FinancierIncentive.create({
        financier_id: this.financierId,
        city_id: this.currentUser.city_id,
        incentive_amount: financierIncentive.incentive_amount,
        to_date: null,
        from_date: currentMonth.from_date,
      });
      const updateIncentivesEarned = `UPDATE financier_targets ft set incentive_earned
        = (achieved_value) * $1 WHERE financier_team_id IN (
          SELECT financier_team_id FROM financier_teams teams WHERE teams.financier_id = $2
          AND teams.city_id = $3
        ) AND financier_id = $2 AND ft.from::date >= $4
        AND ft.to::date <= $5 AND achieved_value > incentive_eligibility`;
      const updateIncentiveParams = [newFinancierIncentive.incentive_amount, this.financierId,
        this.currentUser.city_id, currentMonth.from_date, currentMonth.to_date];
      await new Promise((resolve, reject) => {
        postgresDs.connector.query(updateIncentivesEarned, updateIncentiveParams, (err, result) => {
          if (err) reject(new InstabikeError(err));
          resolve(result);
        });
      });
      return callback(null, newFinancierIncentive);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * send mails to the team head or sales.
   * @param  {object} ctx
   * @param  {object} targetDetail
   * @param  {Function} callback
   * @author Jagajeevan
   */
  async sendEmailForTargets(ctx, targetDetail, callback) {
    try {
      let user;
      if (targetDetail.user_id === null) {
        const teamOwner = await app.FinancierTeam.findOne({
          where: { id: targetDetail.financier_team_id },
          include: [{
            relation: 'owner',
            scope: { fields: ['email', 'first_name', 'last_name'] },
          }],
          fields: ['id', 'owned_by'],
        });
        user = teamOwner.toJSON();
        user = user.owner;
      } else {
        user = await app.Users.findOne({
          where: { id: targetDetail.user_id },
          fields: ['id', 'email', 'first_name', 'last_name'],
        });
      }
      let emailTemplate;
      if (ctx.args.data.targetType) {
        emailTemplate = dot.template(constants.NOTIFICATION[ctx.args.data.targetType]);
        const replaceObj = {
          name: `${user.first_name}`,
          updatedValue: ctx.args.data.updatedValue,
          month: DateUtils.getMonthName(targetDetail.to),
          year: targetDetail.to.getFullYear(),
          setBy: `${this.currentUser.first_name}`,
          target_value: targetDetail.target_value,
          incentive_eligibility: targetDetail.incentive_eligibility,
        };
        const emailMsg = emailTemplate(replaceObj);
        await ExternalServiceProviders.sendByEmail(
          user.email, emailMsg,
          constants.SUBJECT[ctx.args.data.targetType],
        );
      }
      return callback(null, targetDetail);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }
};
