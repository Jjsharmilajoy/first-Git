/**
 * Lead-activity services: this service handles methods such as get lead activity, get
 * assignees of lead, save lead-activity, save financier-lead-activity, send notifiication
 * sms/email on change of a few lead-activity, send notifiication sms/email on change of a
 * few financier-lead-activity, get financier-lead-activities, get financier-lead assignees.
 */

// import dependencies
const dot = require('dot');

// import files
const loopback = require('../server.js');
const BaseService = require('../services/base_service');
const InstabikeError = require('../error/instabike_error');
const constants = require('../utils/constants/userConstants');
const ErrorConstants = require('../utils/constants/error_constants');

const app = loopback.dataSources.postgres.models;

/**
 * @author Ponnuvel G
 */
module.exports = class LeadActivityService extends BaseService {
  constructor(leadId, currentUser) {
    super();
    this.leadId = leadId;
    this.currentUser = currentUser;
  }

  /**
   * Get Lead Activity by Lead ID
   * @param  {Function} callback
   * @return {Promise}
   * @author Ponnuvel G
   */
  async getActivity(callback) {
    try {
      let activities = await app.LeadActivity.find({
        where: { lead_id: this.leadId },
        include: [
          { relation: 'doneBy', scope: { fields: ['id', 'first_name', 'last_name'] } },
          { relation: 'lead', scope: { fields: ['id', 'name'] } },
          { relation: 'financier', scope: { fields: ['id', 'name', 'logo_url'] } },
          {
            relation: 'lead_detail',
            scope: {
              fields: ['id', 'vehicle_id', 'test_ride_on', 'booked_on'],
              include: [
                { relation: 'vehicle', scope: { fields: ['id', 'name', 'image_url'] } }],
            },
          },
        ],
        order: 'created_at DESC',
      });
      activities = await this.getAssignees(activities);
      return callback(null, activities);
    } catch (e) {
      return callback(new InstabikeError(e));
    }
  }

  /**
   * Get Assignees for Lead Activity
   * @param  {LeadActivity}  activities
   * @return {LeadActivity}
   * @author Ponnuvel G
   */
  async getAssignees(activities) {
    this.activities = activities;
    try {
      const moveFrom = 'move_from';
      const moveTo = 'move_to';
      for (let i = 0; i < this.activities.length; i += 1) {
        if (this.activities[i][moveFrom] !== null && this.activities[i][moveFrom] !== 'NEW' &&
          this.activities[i][moveFrom] !== 'HOT' && this.activities[i][moveFrom] !== 'WARM' &&
          this.activities[i][moveFrom] !== 'COLD') {
          const user = await app.Users.findById(activities[i][moveFrom]);
          if (user) {
            if (user.last_name) {
              this.activities[i][moveFrom] = `${user.first_name} ${user.last_name}`;
            } else {
              this.activities[i][moveFrom] = user.first_name;
            }
          }
        }
        if (this.activities[i][moveTo] !== null && this.activities[i][moveTo] !== 'NEW' &&
          this.activities[i][moveTo] !== 'HOT' && this.activities[i][moveTo] !== 'WARM' &&
          this.activities[i][moveTo] !== 'COLD') {
          const user = await app.Users.findById(activities[i][moveTo]);
          if (user) {
            if (user.last_name) {
              this.activities[i][moveTo] = `${user.first_name} ${user.last_name}`;
            } else {
              this.activities[i][moveTo] = user.first_name;
            }
          }
        }
      }
      return this.activities;
    } catch (e) {
      throw new InstabikeError(e);
    }
  }

  /**
   * Save Lead Activity based on the Activity type
   * @param  {Lead}   lead
   * @param  {Users}   currentUser
   * @param  {Function} callback
   * @return {Promise}
   * @author Ponnuvel G
   */
  async saveLeadActivity(lead, currentUser, callback) {
    try {
      if (!lead.is_invoiced) {
        let query = {
          where: {
            and: [
              { id: { neq: lead.id } },
              { mobile_number: lead.mobile_number },
              {
                or: [
                  { dealer_id: lead.dealer_id },
                  { parent_dealer_id: lead.dealer_id },
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
          contacts = await contacts.map(contact => {
            return contact.replace(/[\[\]' ]/g, '');
          });
        }
        if (contacts.includes(lead.mobile_number))
          query.where.and = query.where.and.concat([
            { name: lead.name },
            { gender: lead.gender }
          ]);
        const ifLeadExist = await app.Lead.find(query);
        if (ifLeadExist.length > 0 && lead.mobile_number && lead.mobile_number !== '') {
          const executive = await app.Users.findById(ifLeadExist[0].assigned_to);
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
      }
      const existingLead = await app.Lead.findById(lead.id);
      if (existingLead.category !== lead.category) {
        this.saveActivity(
          lead, existingLead, currentUser.id,
          constants.ACTIVITY.CHANGE_CATEGORY,
        );
      }
      if (existingLead.assigned_to !== lead.assigned_to) {
        this.saveActivity(
          lead, existingLead, currentUser.id,
          constants.ACTIVITY.LEAD_TRANSFERED,
        );
        this.sendNotification(currentUser, lead);
      }
      if (existingLead.status !== lead.status) {
        if (lead.status === constants.LEAD_STATUS.INVOICED) {
          this.saveActivity(lead, existingLead, currentUser.id, constants.ACTIVITY.INVOICED);
        }
        if (lead.status >= constants.LEAD_STATUS.NEW_LOST) {
          this.saveActivity(lead, existingLead, currentUser.id, constants.ACTIVITY.LOST);
        }
      }
      if (lead.mobile_number && existingLead.mobile_number !== lead.mobile_number &&
        lead.mobile_number !== '') {
        const dealer = await app.Dealer.findOne({
          where: { id: lead.dealer_id },
        });
        const assignedToUser = await app.Users.findOne({ where: { id: lead.assigned_to } });
        const messageDetail = {
          name: dealer.name,
          sales_executive: assignedToUser.first_name,
          official_contact_number: assignedToUser.official_contact_number,
        };
        const messages = [];
        const template = dot.template(constants.NOTIFICATION.WELCOME);
        const msg = template(messageDetail);
        const message = { mobile: lead.mobile_number, message: msg };
        messages.push(message);
        this.send(messages);
      }
      return callback();
    } catch (e) {
      return callback(new InstabikeError(e));
    }
  }

  /**
   * Send Notification
   * @param  {Users}  currentUser
   * @param  {Lead}  lead
   * @author Ponnuvel G
   */
  async sendNotification(currentUser, lead) {
    const assignedTo = await app.Users.findById(lead.assigned_to);
    const notification = {};
    notification.assignee = currentUser.first_name;
    notification.lead_name = lead.name;
    notification.lead_status = lead.category;
    notification.dealer_sales = assignedTo.first_name;
    notification.dealer_mobile = assignedTo.mobile_no;
    const salesTemplate = dot.template(constants.NOTIFICATION.TRANSFERRED_SALES);
    const salesMessage = salesTemplate(notification);
    const messages = [];
    messages.push({ mobile: assignedTo.mobile_no, message: salesMessage });
    const leadTemplate = dot.template(constants.NOTIFICATION.TRANSFERRED_LEAD);
    const leadMessage = leadTemplate(notification);
    messages.push({ mobile: lead.mobile_number, message: leadMessage });
    this.send(messages);
  }

  /**
   * Save Lead Activity based on the Activity type
   * @param  {Lead}   lead
   * @param  {Users}   currentUser
   * @param  {Function} callback
   * @return {Promise}
   * @author Jagajeevan
   */
  async saveFinancierLeadActivity(lead, currentUser, callback) {
    try {
      const existingLead = await app.FinancierLead.findById(lead.id);
      if (existingLead.status !== lead.status) {
        lead.loan_amount = existingLead.loan_amount;
        if (existingLead.loan_id) {
          lead.loan_id = existingLead.loan_id;
        }
        if (!lead.mobile_number) {
          /* eslint no-param-reassign: ["error", { "props": false }] */
          lead.mobile_number = existingLead.mobile_number;
        }
        if (lead.status === constants.FINANCIER_LEAD_STATUS.DISBURSEMENT_PENDING) {
          const loanIdCount = await app.FinancierLead.count({
            financier_id: lead.financier_id, loan_id: lead.loan_id,
          });
          if (loanIdCount) {
            return callback(new InstabikeError(ErrorConstants.ERRORS.FINANCIER.LOAN_ID_EXIST));
          }
          await this.saveFinancierActivity(
            lead, existingLead, currentUser.id, constants.ACTIVITY.DISBURSEMENT_PENDING,
            null, constants.ACTIVITY.CHANGE_STATUS,
          );
          await this.sendFinancierNotification(currentUser, lead, existingLead);
        }
        if (lead.status === constants.FINANCIER_LEAD_STATUS.CONVERSION) {
          await this.saveFinancierActivity(
            lead, existingLead, currentUser.id, constants.ACTIVITY.CONVERSION,
            null, constants.ACTIVITY.CHANGE_STATUS,
          );
          const dealerLead = await app.Lead.findById(existingLead.lead_id);
          await this.saveActivity(
            dealerLead, existingLead, currentUser.id,
            constants.ACTIVITY.FINANCE_APPROVED, null,
            existingLead.financier_id, existingLead.lead_detail_id,
          );
          await this.sendFinancierNotification(currentUser, lead, existingLead);
        }
        if (lead.status >= constants.FINANCIER_LEAD_STATUS.LOST) {
          await this.saveFinancierActivity(
            lead, existingLead, currentUser.id, constants.ACTIVITY.LOST,
            null, constants.ACTIVITY.CHANGE_STATUS,
          );
          const dealerLead = await app.Lead.findById(existingLead.lead_id);
          await this.saveActivity(
            dealerLead, existingLead, currentUser.id,
            constants.ACTIVITY.FINANCE_LEAD_LOST,
            lead.lost_reason_comment, existingLead.financier_id, existingLead.lead_detail_id,
          );
          await this.sendFinancierNotification(currentUser, lead, existingLead);
        }
      }
      if (lead.last_follow_up_done_on && lead.next_follow_up_on === null) {
        await this.saveFinancierActivity(
          lead, null, currentUser.id,
          constants.ACTIVITY.FOLLOWUP_DONE, lead.comment,
        );
      }
      return callback();
    } catch (e) {
      return callback(new InstabikeError(e));
    }
  }

  /**
   * Send Financier Notification when change the status of lead
   * @param  {Users}  currentUser
   * @param  {Lead}  lead
   * @author Ponnuvel G
   */
  async sendFinancierNotification(currentUser, lead, existingLead) {
    const notification = {};
    let template = null;
    const fianancier = await app.Financier.findById(existingLead.financier_id);
    const executive = await app.Users.findById(existingLead.assigned_to);
    notification.loan_number = lead.loan_id;
    notification.financier = fianancier.name;
    notification.loan_amount = lead.loan_amount;
    notification.financier_mobile = executive.mobile_no;
    notification.executive = executive.first_name;
    if (lead.status === constants.FINANCIER_LEAD_STATUS.DISBURSEMENT_PENDING) {
      template = dot.template(constants.NOTIFICATION.DISBURSEMENT_PENDING);
    }
    if (lead.status === constants.FINANCIER_LEAD_STATUS.CONVERSION) {
      template = dot.template(constants.NOTIFICATION.LOAN_CONVERTED);
    }
    if (lead.status === constants.FINANCIER_LEAD_STATUS.LOST) {
      if (lead.loan_id) {
        template = dot.template(constants.NOTIFICATION.LOAN_REJECT_WITH_LOANID);
      } else {
        template = dot.template(constants.NOTIFICATION.LOAN_REJECT_WITHOUT_LOANID);
      }
    }
    const msg = template(notification);
    const messages = [];
    messages.push({ mobile: lead.mobile_number, message: msg });
    this.send(messages);
  }

  /**
   * Get Financier Lead Activity by Lead ID
   * @param  {Function} callback
   * @return {Promise}
   * @author Jagajeevan
   */
  async getFinancierLeadActivity(leadId, callback) {
    try {
      const financierLead = await app.FinancierLead.findById(leadId);
      if (!financierLead) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.LEAD.NOT_FOUND));
      }
      if (this.currentUser.user_type_id !== financierLead.financier_id) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.FINANCIER.INVALID_ACCESS));
      }
      if (!this.verifyRole('FINANCIER_CITY_HEAD')) {
        if (this.verifyRole('FINANCIER_TEAM_HEAD')) {
          const team = await app.FinancierTeam.findById(financierLead.financier_team_id);
          if (!team) {
            return callback(new InstabikeError(ErrorConstants.ERRORS.FINANCIER.TEAM_NOT_FOUND));
          }
          if (this.currentUser.id !== team.owned_by) {
            return callback(new InstabikeError(ErrorConstants.ERRORS.FINANCIER.INVALID_ACCESS));
          }
        } else {
          const financierMemberId = await app.FinancierTeamMember.find({
            where: {
              and: [
                { financier_id: financierLead.financier_id },
                { financier_team_id: financierLead.financier_team_id },
                { user_id: this.currentUser.id },
                { to_date: null },
              ],
            },
          });
          if (financierMemberId.length === 0) {
            return callback(new InstabikeError(ErrorConstants.ERRORS.FINANCIER.INVALID_ACCESS));
          }
        }
      }
      let activities = await app.LeadActivity.find({
        where: { financier_lead_id: leadId },
        include: [
          { relation: 'doneBy', scope: { fields: ['id', 'first_name', 'last_name'] } },
          { relation: 'financier_lead', scope: { fields: ['id', 'name'] } },
        ],
        order: 'created_at DESC',
      });
      activities = await this.getFinancierLeadAssignees(activities);
      return callback(null, activities);
    } catch (e) {
      return callback(new InstabikeError(e));
    }
  }

  /**
   * Get Financier Lead Assignees for Lead Activity
   * @param  {LeadActivity}  activities
   * @return {LeadActivity}
   * @author Jagajeevan
   */
  async getFinancierLeadAssignees(activities) {
    this.activities = activities;
    try {
      const moveFrom = 'move_from';
      const moveTo = 'move_to';
      for (let i = 0; i < this.activities.length; i += 1) {
        if (this.activities[i][moveFrom] !== null &&
          this.activities[i][moveFrom] !== constants.ACTIVITY.ACTIVE &&
          this.activities[i][moveFrom] !== constants.ACTIVITY.DISBURSEMENT_PENDING &&
          this.activities[i][moveFrom] !== constants.ACTIVITY.CONVERSION &&
          this.activities[i][moveFrom] !== constants.ACTIVITY.LOST) {
          const user = await app.Users.findById(activities[i][moveFrom]);
          if (user) {
            if (user.last_name) {
              this.activities[i][moveFrom] = `${user.first_name} ${user.last_name}`;
            } else {
              this.activities[i][moveFrom] = user.first_name;
            }
          }
        }
        if (this.activities[i][moveTo] !== null &&
          this.activities[i][moveTo] !== constants.ACTIVITY.ACTIVE &&
          this.activities[i][moveTo] !== constants.ACTIVITY.DISBURSEMENT_PENDING &&
          this.activities[i][moveTo] !== constants.ACTIVITY.CONVERSION &&
          this.activities[i][moveTo] !== constants.ACTIVITY.LOST) {
          const user = await app.Users.findById(activities[i][moveTo]);
          if (user) {
            if (user.last_name) {
              this.activities[i][moveTo] = `${user.first_name} ${user.last_name}`;
            } else {
              this.activities[i][moveTo] = user.first_name;
            }
          }
        }
      }
      return this.activities;
    } catch (e) {
      throw new InstabikeError(e);
    }
  }
};
