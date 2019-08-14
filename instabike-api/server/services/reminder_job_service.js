/**
 * To send a reminder-test-ride sms to the leads for test rides booked on the next day
 * at 11 PM each night
 */
// import dependencies
const moment = require('moment');
const { CronJob } = require('cron');
const dot = require('dot');
const logger = require('winston');

// import files
const loopback = require('../server.js');
const InstabikeError = require('../error/instabike_error');
const ExternalServiceProviders = require('../utils/external_services_providers');
const constants = require('../utils/constants/userConstants');

const postgresDsConnector = loopback.dataSources.postgres.connector;

/**
 * Reminder Job Service to remind test ride one day before
 * @author Ponnuvel G
 */
class ReminderJobService {
  async start() {
    try {
      this.job = new CronJob('00 00 21 * * *', async () => {
        logger.info(
          'Test ride reminder scheduler starts at ',
          moment().format('DD/MM/YYYY'), this.job.cronTime.source,
        );
        await this.processLeads();
      }, null, true, 'Asia/Kolkata');
      this.job.start();
    } catch (e) {
      throw new InstabikeError(e);
    }
  }

  async processLeads() {
    try {
      const start = moment().startOf('day').add(1770, 'm');
      const query = `select l.id lead_id, l.mobile_number mobile, l.name lead_name, l.assigned_to,
        ld.id lead_details_id, ld.test_ride_on test_ride_on, v.id vehicle_id,
        v.name vehicle_name, d.name dealer_name
        from leads l inner join lead_details ld on l.id = ld.lead_id
        inner join vehicles v on v.id = ld.vehicle_id
        inner join dealers d on l.dealer_id = d.id
        where l.mobile_number is not null and ld.is_deleted = false
        and test_ride_status = 200 and test_ride_on::timestamp::date = $1`;
      const params = [start];
      this.leads = await new Promise((resolve, reject) => {
        postgresDsConnector.query(query, params, (err, res) => {
          if (err) {
            reject(new InstabikeError(err));
          }
          return resolve(res);
        });
      });
      if (this.leads.length) {
        await this.sendReport();
      }
    } catch (e) {
      throw new InstabikeError(e);
    }
  }

  async sendReport() {
    try {
      const messages = [];
      let params = [];
      const query = 'SELECT * FROM users where id = $1';
      for (let i = 0; i < this.leads.length; i += 1) {
        const lead = this.leads[i];
        params = [lead.assigned_to];
        /* eslint no-loop-func: "off" */
        const dealerSales = await new Promise((resolve, reject) => {
          postgresDsConnector.query(query, params, (err, res) => {
            if (err) {
              reject(new InstabikeError(err));
            }
            return resolve(res);
          });
        });
        if (dealerSales.length) {
          const notification = {};
          notification.dealer_sales_name = `${dealerSales[0].first_name}`;
          notification.official_contact_number = dealerSales[0].official_contact_number;
          notification.lead_name = lead.lead_name;
          notification.vehicle_name = lead.vehicle_name;
          notification.dealer = lead.dealer_name;
          notification.date = `${moment(lead.test_ride_on).utc().format('DD-MMM-YYYY')}`;
          notification.from = `${moment(lead.test_ride_on).utc().format('h:mm')}` +
            `${moment(lead.test_ride_on).utc().format('a')}`;
          notification.to = `${moment(lead.test_ride_on).add(30, 'minutes').utc().format('h:mm')}` +
            `${moment(lead.test_ride_on).utc().format('a')}`;
          const leadTemplate = dot.template(constants.NOTIFICATION.TEST_RIDE_REMINDER);
          const leadMessage = leadTemplate(notification);
          messages.push({ mobile: lead.mobile, message: leadMessage });
        }
      }
      if (messages.length > 0) {
        logger.info('Messages=>', messages);
        await ExternalServiceProviders.sendSms(messages);
      }
    } catch (e) {
      throw new InstabikeError(e);
    }
  }
}

const reminderJob = new ReminderJobService();
reminderJob.start();
