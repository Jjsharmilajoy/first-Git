/**
 * To send a missed-test-ride sms to the leads for test rides booked and not being taken
 * at 09 AM each day
 */

// import files
const loopback = require('../server.js');
const InstabikeError = require('../error/instabike_error');
const ExternalServiceProviders = require('../utils/external_services_providers');
const constants = require('../utils/constants/userConstants');

// import dependencies
const moment = require('moment');
const { CronJob } = require('cron');
const dot = require('dot');
const logger = require('winston');

const postgresDsConnector = loopback.dataSources.postgres.connector;

/**
 * Missed Job Service to send SMS for missed test ride
 * @author Ponnuvel G
 */
class MissedJobService {
  async start() {
    try {
      this.job = new CronJob('00 00 09 * * *', async () => {
        logger.info(
          'Missed test ride scheduler starts at ',
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
      const start = moment().startOf('day').subtract(1110, 'm');
      const query = `select l.id lead_id, l.mobile_number mobile, l.name lead_name,ld.id
        lead_details_id, ld.test_ride_on test_ride_on, v.id vehicle_id,
        v.name vehicle_name, d.name dealer_name,
        u.first_name sales_executive, u.mobile_no sales_executive_mobile
        from leads l inner join lead_details ld on l.id = ld.lead_id
        inner join vehicles v on v.id = ld.vehicle_id
        inner join dealers d on l.dealer_id = d.id
        inner join users u on u.id = l.assigned_to
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
      for (let i = 0; i < this.leads.length; i += 1) {
        const lead = this.leads[i];
        const notification = {};
        notification.lead_name = lead.lead_name;
        notification.vehicle_name = lead.vehicle_name;
        notification.dealer = lead.dealer_name;
        notification.sales_executive = lead.sales_executive;
        notification.official_contact_number = lead.official_contact_number;
        notification.date = `${moment(lead.test_ride_on).utc().format('DD-MMM-YYYY')}`;
        notification.from = `${moment(lead.test_ride_on).utc().format('h:mm')}` +
          `${moment(lead.test_ride_on).utc().format('a')}`;
        notification.to = `${moment(lead.test_ride_on).add(30, 'minutes').utc().format('h:mm')}` +
          `${moment(lead.test_ride_on).utc().format('a')}`;
        const leadTemplate = dot.template(constants.NOTIFICATION.MISSED_TEST_RIDE);
        const leadMessage = leadTemplate(notification);
        messages.push({ mobile: lead.mobile, message: leadMessage });
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

const missedJob = new MissedJobService();
missedJob.start();
