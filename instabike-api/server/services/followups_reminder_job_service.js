const { CronJob } = require('cron');
const logger = require('winston');
const moment = require('moment');

const loopback = require('../server.js');
const constants = require('../utils/constants/userConstants');
const InstabikeError = require('../error/instabike_error');
const ExternalServiceProviders = require('../utils/external_services_providers');

const app = loopback.dataSources.postgres.models;

/**
 * @author Pavithra Sivasubramanian
 */
class FollowupsReminderJobService {
  /**
   * Sends reminder once every three hours of the leads scheduled
   * to be followed to the dealer
   * @author Pavithra Sivasubramanian
   */
  async start() {
    try {
      this.job = new CronJob('00 8-18/3 * * *', async () => {
      let userIds = await app.Users.find({
        where: {
          and:
            [{ user_type_name: constants.USER_TYPE_NAMES.DEALER }, { is_active: true }]
        },
        fields: ['id', 'mobile_no']
      });
      const start = moment().add(1, 'h').utc().format();
      const end = moment(start).add(179, 'm').utc().format();
      await this.getDealerLeads(userIds, start, end);
      }, null, true, 'Asia/Kolkata');
      this.job.start();
    } catch (err) {
      throw new InstabikeError(err);
    }
  }

  /**
   * Fetches the leads scheduled to be followed by the dealers
   * @param {Array} userIds
   * @param {Date} start
   * @param {Date} end
   * @author Pavithra Sivasubramanian
   */
  async getDealerLeads(userIds, start, end) {
    try {
      let messages = [];
      await Promise.all(userIds.map(async (userId) => {
        let leads = await this.getLeads(userId.id, start, end);
        let notifications = await this.getNotificationDetails(leads);
        if (notifications.length) {
          let dealerMessage = constants.NOTIFICATION.FOLLOWUPS_REMINDER;
          await Promise.all(notifications.map(notification => {
            let template = `\n ${notification.name} - ${notification.followup_on} - ${notification.mobile_number} - ${notification.vehicle_name}`;
            dealerMessage = dealerMessage.concat(template);
          }));
          messages.push({ mobile: userId.mobile_no, message: dealerMessage });
        }
      }));
      if (messages.length > 0) {
        logger.info('Messages=>', messages);
        await ExternalServiceProviders.sendSms(messages);
      }
    } catch (err) {
      throw new InstabikeError(err);
    }
  }

  /**
   * Get the dealer leads along with its associated vehicle
   * @param {String} userId
   * @param {Date} start
   * @param {Date} end
   * @author Pavithra Sivasubramanian
   */
  async getLeads(userId, start, end) {
    try {
      let leads = await app.Lead.find({
        where: { assigned_to: userId, next_followup_on: { between: [start, end] } },
        fields: ['id', 'name', 'mobile_number', 'next_followup_on'],
        include: {
          relation: 'lead_details',
          scope: {
            where: { is_deleted: false },
            fields: ['vehicle_id'],
            include: { relation: 'vehicle', fields: ['name'] }
          }
        },
        order: 'next_followup_on ASC',
      });
      return leads;
    } catch (err) {
      throw new InstabikeError(err);
    }
  }

  /**
   * Get the lead details to contruct the message
   * @param {Array} leads
   * @author Pavithra Sivasubramanian
   */
  async getNotificationDetails(leads) {
    try {
      let leadInfo = await leads.map(lead => {
        let lead_detail = {};
        let vehicle_name = '';
        let lead_details = lead.toJSON().lead_details;
        if (lead_details.length) {
          for (let i = 0; i < lead_details.length; i++) {
            let leadVehicle = lead_details[i].vehicle ? lead_details[i].vehicle.name : 'No Vehicle';
            if (i != (lead_details.length - 1))
              vehicle_name = vehicle_name.concat(`${leadVehicle}, `);
            else
              vehicle_name = vehicle_name.concat(`${leadVehicle}.`);
          }
        } else {
          vehicle_name = 'No Vehicle'
        }
        lead_detail.name = lead.name;
        lead_detail.mobile_number = lead.mobile_number;
        lead_detail.followup_on = moment(lead.next_followup_on).tz('Asia/Kolkata').format('LT');
        lead_detail.vehicle_name = vehicle_name;
        return lead_detail;
      });
      return leadInfo;
    } catch (err) {
      throw new InstabikeError(err);
    }
  }
}

const followupsReminderJob = new FollowupsReminderJobService();
followupsReminderJob.start();