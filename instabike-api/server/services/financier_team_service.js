/**
 * Financier team services: this service handles methods such as get team members by team-id,
 * get team details, get dealers of a team unassigned to sales, get dealership lead effectiveness,
 * change dealership user, delete dealership member, get dealership wise monthly report.
 */

// import dependencies
const lodash = require('lodash');

// import files
const loopback = require('../server.js');
const BaseService = require('../services/base_service');
const constants = require('../utils/constants/userConstants');
const InstabikeError = require('../error/instabike_error');
const ErrorConstants = require('../utils/constants/error_constants');
const StringUtils = require('../utils/string_utils');

const app = loopback.dataSources.postgres.models;
const postgresDs = loopback.dataSources.postgres;

/* eslint class-methods-use-this: ["error",
 { "exceptMethods": ["dealerBasedLeadSummary"] }] */
module.exports = class FinancierTeammService extends BaseService {
  constructor(id, currentUser) {
    super();
    this.teamId = id;
    this.currentUser = currentUser;
  }
  /**
   * To get list of members of a given team ids
   *
   * @param  {string} teamIds                      financier-team-id
   * @param  {function} callback                           callback
   * @author Jagajeevan
   */
  async getTeamMembersByTeamIds(teamObj, callback) {
    try {
      const user = await app.Users.findOne({
        where: {
          id: this.currentUser.id,
          user_type_name: constants.USER_TYPE_NAMES.FINANCIER,
        },
      });
      if (!user) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.USER.NOT_EXIST));
      }
      const teamMembers = await app.FinancierTeamMember.find({
        where: { financier_team_id: { inq: teamObj.teamIds }, to_date: null },
        include: [{
          relation: 'user',
          scope: { fields: ['first_name', 'last_name'] },
        }],
      });
      const teamOwners = await app.FinancierTeam.find({
        where: { id: { inq: teamObj.teamIds } },
        include: [{
          relation: 'owner',
          scope: { fields: ['first_name', 'last_name'] },
        }],
        fields: ['id', 'owned_by'],
      });
      teamMembers.push(...teamOwners);
      return callback(null, { teamMembers });
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * To get team detail along with active dealers associated to the team
   * and the owner detail
   *
   * @param  {function} callback                           callback
   * @author Jaiyashree Subramanian
   */
  async getTeamDetail(callback) {
    try {
      const financierTeam = await app.FinancierTeam.findOne({
        where: { and: [{ id: this.teamId }, { financier_id: this.currentUser.user_type_id }] },
        include: [
          {
            relation: 'financierDealers',
            scope: {
              where: {
                and: [{ financier_team_id: this.teamId }, { user_id: null }, { to_date: null }],
              },
              include: {
                relation: 'dealer',
                scope: { include: ['manufacturer'] },
              },
            },
          }, 'owner',
        ],
      });
      if (!financierTeam) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.FINANCIER.INVALID_ACCESS));
      }
      return callback(null, { financierTeam });
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * To get dealers associated to a team and unassociated to any sales-user
   *
   * @param  {function} callback                            callback
   * @return  {function} callback                           callback
   * @author Jaiyashree Subramanian
   */
  async getDealersUnassignedToSales(callback) {
    try {
      const associatedFinancierDealers = await app.FinancierDealer.find({
        where: {
          and: [
            { financier_team_id: this.teamId },
            { user_id: { neq: null } },
            { to_date: null },
          ],
        },
      });
      const associatedDealers = lodash.map(associatedFinancierDealers, 'dealer_id');
      const unnassignedFinancierDealers = await app.FinancierDealer.find({
        where: {
          and: [
            { dealer_id: { nin: associatedDealers } },
            { to_date: null },
            { user_id: null },
            { financier_team_id: this.teamId },
          ],
        },
        include: {
          relation: 'dealer',
          scope: { include: ['manufacturer'] },
        },
      });
      return callback(null, unnassignedFinancierDealers);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * To get team-based dealership lead-effectiveness across team members
   *
   * @param  {object} filter                                   date - filter
   * @param  {function} callback                                    callback
   * @author Jaiyashree Subramanian
   */
  async getDealershipLeadEffectiveness(filter, callback) {
    try {
      const team = await app.FinancierTeam.findById(this.teamId);
      if (!team) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.FINANCIER.TEAM_NOT_FOUND));
      }
      let dealerIds = await app.FinancierDealer.find({
        where: {
          and: [
            { financier_team_id: this.teamId },
            { user_id: null },
            { to_date: null },
            { dealer_id: { neq: null } },
          ],
        },
        fields: ['dealer_id'],
      });
      if (!dealerIds.length) return callback(null, []);
      dealerIds = lodash.map(dealerIds, 'dealer_id');
      let params = [team.owned_by, filter.fromDate, filter.toDate, filter.fromDate,
        filter.toDate, this.teamId];
      const dealerString =
        StringUtils.generateInClause(params.length + 1, dealerIds);
      params = params.concat(dealerIds);
      const dealerEffectivenessForTeam = this.dealerEffectivenessForTeam({ dealerString });
      const dealerEffectiveness = await new Promise((resolve, reject) => {
        postgresDs.connector.query(dealerEffectivenessForTeam, params, (err, result) => {
          if (err) reject(new InstabikeError(err));
          resolve(result);
        });
      });
      return callback(null, dealerEffectiveness);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  dealerEffectivenessForTeam(inputs) {
    this.inputs = inputs;
    return `SELECT d.*, temp.*,
      (select user_id from financier_dealers where user_id IS NOT NULL AND dealer_id = d.id
        AND financier_team_id = $6 AND to_date IS NULL) dealer_user_id,
      (SELECT case WHEN to_date IS null THEN 1 ELSE 0 END as is_active
        from financier_dealers where user_id = assigned_to AND dealer_id = d.id
        AND financier_team_id = $6 order by created_at DESC limit 1) is_active,
      (SELECT first_name from users where id = COALESCE (
          assigned_to,
          (SELECT user_id
          from financier_dealers where dealer_id = d.id AND financier_team_id = $6
          and user_id is not null order by created_at DESC limit 1)
        )) first_name,
      (SELECT email from users where id = COALESCE (
          assigned_to,
          (SELECT user_id
          from financier_dealers where dealer_id = d.id AND financier_team_id = $6
          and user_id is not null order by created_at DESC limit 1)
        )) user_email,
      (SELECT mobile_no from users where id = COALESCE (
          assigned_to,
          (SELECT user_id
          from financier_dealers where dealer_id = d.id AND financier_team_id = $6
          and user_id is not null order by created_at DESC limit 1)
        )) user_mobile_no,
      (SELECT last_name from users where id = COALESCE (
          assigned_to,
          (SELECT user_id
          from financier_dealers where dealer_id = d.id AND financier_team_id = $6
          and user_id is not null order by created_at DESC limit 1)
        )) last_name,
      (SELECT case WHEN user_id = $1 THEN 1 ELSE 0 END as is_owner
        from financier_dealers where user_id IS NOT NULL AND dealer_id = d.id
        AND financier_team_id = $6 AND to_date IS NULL ) is_owner
      FROM dealers d LEFT JOIN ( SELECT financier_leads.dealer_id as dealer_id,
      financier_leads.assigned_to as assigned_to,
      COUNT(1) total_leads,
      COUNT(1) FILTER (where status = 500) active_leads,
      COUNT(1) FILTER (where status = 510) pending_leads,
      COUNT(1) FILTER (where status = 520) converted_leads,
      COUNT(1) FILTER (where status = 930) lost_leads
      FROM financier_leads WHERE ( created_at::date BETWEEN $2 AND $3
      OR lost_on::date BETWEEN $4 AND $5 ) AND financier_team_id = $6
      GROUP BY dealer_id, assigned_to) temp on d.id = temp.dealer_id  WHERE d.id
      IN (${inputs.dealerString})`;
  }

  /**
   * To change a assigned-user for a dealership associated to financier-team
   * by expiring the existing association and creating a new own
   *
   * @param  {string} financierTeamId                      financier-team-id
   * @param  {object} dealerId                                     dealer-id
   * @param  {object} newUser                                     new - user
   * @param  {function} callback                                   callback
   * @author Jaiyashree Subramanian
   */
  async changeDealershipUser(dealerId, newUser, callback) {
    try {
      const team = await app.FinancierTeam.findById(this.teamId);
      if (!team) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.FINANCIER.TEAM_NOT_FOUND));
      }
      let financierDealer = await app.FinancierDealer.findOne({
        where: {
          and: [
            { financier_team_id: this.teamId },
            { user_id: { neq: null } },
            { to_date: null },
            { dealer_id: dealerId },
          ],
        },
      });
      if (!financierDealer) {
        financierDealer = await app.FinancierDealer.findOne({
          where: {
            and: [
              { financier_team_id: this.teamId },
              { to_date: null },
              { dealer_id: dealerId },
              { user_id: null },
            ],
          },
        });
      }
      if (!financierDealer) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.FINANCIER.DEALER_NOT_FOUND));
      }
      if (newUser.id !== team.owned_by) {
        const financierteamMember = await app.FinancierTeamMember.findOne({
          where: {
            and: [
              { financier_team_id: this.teamId },
              { user_id: newUser.id },
              { to_date: null },
            ],
          },
        });
        if (!financierteamMember) {
          return callback(new InstabikeError(ErrorConstants.ERRORS.FINANCIER.CAN_NOT_ASSIGN));
        }
      }
      if (financierDealer.user_id) {
        await financierDealer.updateAttributes({ to_date: new Date() });
        await app.FinancierLead.updateAll({
          assigned_to: financierDealer.user_id,
          dealer_id: financierDealer.dealer_id,
          financier_id: financierDealer.financier_id,
          financier_team_id: financierDealer.financier_team_id,
          status: { lt: constants.FINANCIER_LEAD_STATUS.CONVERSION },
        }, {
          assigned_to: newUser.id,
        });
        const FinancierDealerLeads = await app.FinancierLead.find({
          where: {
            and: [
              { assigned_to: newUser.id },
              { dealer_id: financierDealer.dealer_id },
              { financier_id: financierDealer.financier_id },
              { financier_team_id: financierDealer.financier_team_id },
              { status: { lt: constants.FINANCIER_LEAD_STATUS.CONVERSION } },
            ],
          },
        });

        if (FinancierDealerLeads.length > 0) {
          await FinancierDealerLeads.map((leads) => {
            this.saveFinancierActivity(
              leads, null, this.currentUser.id,
              constants.ACTIVITY.LEAD_TRANSFERED,
            );
            return true;
          });
        }
      }
      const newFinancierDealer = await app.FinancierDealer.create({
        financier_id: financierDealer.financier_id,
        financier_team_id: this.teamId,
        user_id: newUser.id,
        from_date: new Date(),
        dealer_id: dealerId,
        city_id: team.city_id,
      });
      return callback(null, newFinancierDealer);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * To get team-member-based dealership lead-effectiveness by dealer-id
   *
   * @param  {string} dealerId                                 dealer-id
   * @param  {object} filter                               date - filter
   * @param  {function} callback                                callback
   * @author Jaiyashree Subramanian
   */
  async getDealershipMemberSummary(dealerId, filter, callback) {
    try {
      const team = await app.FinancierTeam.findOne({
        where: { and: [{ id: this.teamId }, { financier_id: this.currentUser.user_type_id }] },
      });
      if (!team) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.FINANCIER.TEAM_NOT_FOUND));
      }
      const financierDealer = await app.FinancierDealer.findOne({
        where: {
          and: [{ financier_team_id: this.teamId }, { dealer_id: dealerId }],
        },
      });
      if (!financierDealer) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.FINANCIER.DEALER_NOT_FOUND));
      }
      let params = [team.owned_by, filter.fromDate, filter.toDate, filter.fromDate,
        filter.toDate, this.teamId];
      const dealerString =
        StringUtils.generateInClause(params.length + 1, [dealerId]);
      params = params.concat([dealerId]);
      const dealerEffectivenessForTeam = this.dealerEffectivenessForTeam({ dealerString });
      const dealerEffectiveness = await new Promise((resolve, reject) => {
        postgresDs.connector.query(dealerEffectivenessForTeam, params, (err, result) => {
          if (err) reject(new InstabikeError(err));
          resolve(result);
        });
      });
      return callback(null, dealerEffectiveness);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * To get lead performance summary based on dealer-id
   *
   * @param  {string} dealerId                            dealer-id
   * @param  {object} filter                          date - filter
   * @param  {function} callback                           callback
   * @author Sundar P
   */
  async getLeadSummaryBasedOnDealership(dealerId, filter, callback) {
    this.filter = filter;
    try {
      const params = [
        this.teamId,
        dealerId,
        filter.fromDate,
        filter.toDate,
      ];
      const dealerBasedLeadSummary = this.dealerBasedLeadSummary();
      const summary = await new Promise((resolve, reject) => {
        postgresDs.connector.query(dealerBasedLeadSummary, params, (err, result) => {
          if (err) reject(new InstabikeError(err));
          resolve(result.length ? result[0] : {});
        });
      });
      return callback(null, { performance: summary });
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  dealerBasedLeadSummary() {
    return `SELECT COUNT(1) total_leads,
      COUNT(1) FILTER (where status = 500) active_leads,
      COUNT(1) FILTER (where status = 510) pending_leads,
      COUNT(1) FILTER (where status = 520) converted_leads,
      COUNT(1) FILTER (where status = 930) lost_leads
      FROM financier_leads WHERE
      (created_at::date BETWEEN $3 AND $4
      OR lost_on::date BETWEEN $3 AND $4)
      AND financier_team_id = $1 AND dealer_id = $2`;
  }

  /**
   * To delete team-member from team if not assigned to any dealership
   *
   * @param  {string} financierTeamId                financier-team-id
   * @param  {string} userId                            team-member-id
   * @author Jaiyashree Subramanian
   */
  async deleteTeamMember(userId, callback) {
    try {
      if (userId === this.currentUser.id) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.FINANCIER.INVALID_ACCESS));
      }
      const team = await app.FinancierTeam.findOne({
        where: {
          and: [{ id: this.teamId }, { to_date: null },
            { financier_id: this.currentUser.user_type_id }],
        },
      });
      if (!team) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.FINANCIER.TEAM_NOT_FOUND));
      }
      if (this.currentUser.user_type_id !== team.financier_id) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.FINANCIER.INVALID_ACCESS));
      }
      const financierDealers = await app.FinancierDealer.find({
        where: {
          and: [
            { financier_team_id: this.teamId }, { user_id: userId }, { to_date: null }],
        },
      });
      if (financierDealers && financierDealers.length) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.FINANCIER.MEMBER_HAS_DEALERS));
      }
      if (team.owned_by === userId) {
        const teamMembers = await app.FinancierTeamMember.findOne({
          where: {
            and: [{ financier_team_id: team.id }, { to_date: null }],
          },
        });
        if (teamMembers) {
          return callback(new InstabikeError(ErrorConstants.ERRORS.FINANCIER.ASSIGNED_TO_SALES));
        }
      }
      const user = await app.Users.findOne({ where: { id: userId } });
      if (user) {
        await user.updateAttributes({ manager_id: null });
      } else {
        return callback(new InstabikeError(ErrorConstants.ERRORS.USER.NOT_EXIST));
      }
      await app.FinancierTarget.destroyAll({
        financier_team_id: this.teamId,
        user_id: userId,
        to_date: { gte: new Date() },
      });
      await app.FinancierTeamMember.updateAll({
        financier_team_id: this.teamId,
        user_id: userId,
        to_date: null,
      }, {
        to_date: new Date(),
      });
      if (team.owned_by === userId) {
        await app.FinancierTarget.destroyAll({
          financier_team_id: this.teamId,
          to_date: { gte: new Date() },
        });
        await team.updateAttributes({
          owned_by: null,
          to_date: new Date(),
          financier_id: null,
          status: `deleted from financier ${team.financier_id}`,
        });
        await app.FinancierDealer.updateAll({
          financier_team_id: this.teamId,
          to_date: null,
        }, {
          to_date: new Date(),
        });
      }
      return callback(null, 'Deleted Successfully');
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * To get monthly lead-summary of a dealer based on financier and dealer id
   *
   * @param  {string} dealerId                                      dealer-id
   * @param  {object} filter                                    date - filter
   * @param  {function} callback                                     callback
   * @author Jaiyashree Subramanian
   */
  async getDealershipMonthlyReport(dealerId, filter, callback) {
    this.filter = filter;
    try {
      const financierDealer = await app.FinancierDealer.findOne({
        where: {
          and: [
            { dealer_id: dealerId },
            { financier_team_id: this.teamId },
            { user_id: null },
            { to_date: null },
          ],
        },
      });
      if (!financierDealer) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.FINANCIER.DEALER_NOT_FOUND));
      }
      const dealershipMonthlyReport = this.dealershipMonthlyReport();
      const params = [this.filter.fromDate, this.filter.toDate, this.teamId, dealerId];
      const summary = await new Promise((resolve, reject) => {
        postgresDs.connector.query(dealershipMonthlyReport, params, (err, result) => {
          if (err) reject(new InstabikeError(err));
          resolve(result);
        });
      });
      const result = await this.groupResultByMonth(
        summary,
        [this.filter.fromDate, this.filter.toDate],
      );
      return callback(null, result);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  dealershipMonthlyReport(inputs) {
    this.inputs = inputs;
    return `SELECT to_char(COALESCE(lost_on, created_at),'Mon') as month,
      extract(year FROM COALESCE(lost_on, created_at)) as year,
      COUNT(1) total_leads,
      COUNT(1) FILTER (where status = 500) active_leads,
      COUNT(1) FILTER (where status = 510) pending_leads,
      COUNT(1) FILTER (where status = 520) converted_leads,
      COUNT(1) FILTER (where status = 930) lost_leads
      FROM financier_leads WHERE ( created_at::date BETWEEN $1 AND $2
      OR lost_on::date BETWEEN $1 AND $2 ) AND financier_team_id = $3
      AND dealer_id = $4 GROUP BY month, year
    `;
  }

  /**
   * To construct a consecutive month-based array of response
   *
   * @param  {[object]} response                     array of result
   * @param  {[object]} dateParams                     date - filter
   * @param  {[object]} result                      month-based data
   * @author Jaiyashree Subramanian
   */
  async groupResultByMonth(response, dateParams) {
    this.dateParams = dateParams;
    try {
      const dateSeriesQuery = this.generateMonthSeries();
      const dateSeries = await new Promise((resolve, reject) => {
        postgresDs.connector.query(dateSeriesQuery, dateParams, (err, result) => {
          if (err) reject(new InstabikeError(err));
          resolve(result);
        });
      });
      const result = [];
      await Promise.all(dateSeries.map(async (eachDate) => {
        const performanceObj = response.filter(eachPerformance =>
          eachPerformance.month === eachDate.month_series
          && eachPerformance.year === eachDate.year_series);
        if (performanceObj && performanceObj.length) result.push(performanceObj[0]);
        else {
          result.push({ month: eachDate.month_series, year: eachDate.year_series });
        }
      }));
      return result;
    } catch (err) {
      throw (new InstabikeError(err));
    }
  }
};
