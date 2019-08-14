/**
 * To send lead-report and follow-up reports for the day to the corresponding dealer managers
 * through email at 11 PM each night
 */

// import dependencies
const moment = require('moment');
const { CronJob } = require('cron');
const json2csv = require('json2csv').parse;
const base64 = require('base-64');
const dot = require('dot');
const logger = require('winston');

// import files
const loopback = require('../server.js');
const InstabikeError = require('../error/instabike_error');
const ExternalServiceProviders = require('../utils/external_services_providers');
const constants = require('../utils/constants/userConstants');
const reportQueries = require('../utils/constants/reportQueries');

const app = loopback.dataSources.postgres.models;
const postgresDsConnector = loopback.dataSources.postgres.connector;

/**
 * Report Job Service to send leads report end of day to dealer manager
 * @author Ponnuvel G
 */
class ReportJobService {
  async start() {
    try {
      this.job = new CronJob('00 00 23 * * *', async () => {
        logger.info('Lead report scheduler starts at ', moment().format('DD/MM/YYYY'), this.job.cronTime.source);
        await this.processReport();
      }, null, true, 'Asia/Kolkata');
      this.job.start();
    } catch (e) {
      throw new InstabikeError(e);
    }
  }

  async processReport() {
    try {
      const dealers = await app.Dealer.find();
      for (let i = 0; i < dealers.length; i += 1) {
        this.dealerName = dealers[i].name;
        const manager = await app.Users.findOne({
          where: { user_type_id: dealers[i].id, manager_id: null },
        });
        if (manager) {
          this.manager = manager;
          await this.prepareFollowUpReport();
          await this.prepareLeadReport();
          await this.sendReport();
        }
      }
    } catch (e) {
      throw new InstabikeError(e);
    }
  }

  async prepareFollowUpReport() {
    const start = moment().startOf('day');
    const end = moment().endOf('day');
    const followUpsQuery = reportQueries.FOLLOWUP_REPORT_QUERY;
    const params = [this.manager.user_type_id, start, end];
    this.followUps = await new Promise((resolve, reject) => {
      postgresDsConnector.query(followUpsQuery, params, (err, res) => {
        if (err) {
          reject(new InstabikeError(err));
        }
        return resolve(res);
      });
    });
  }

  async prepareLeadReport() {
    const start = moment().startOf('day');
    const end = moment().endOf('day');
    const leadReportQuery = reportQueries.LEAD_REPORT_QUERY;
    const params = [this.manager.user_type_id, start, end];
    this.leads = await new Promise((resolve, reject) => {
      postgresDsConnector.query(leadReportQuery, params, (err, res) => {
        if (err) {
          reject(new InstabikeError(err));
        }
        return resolve(res);
      });
    });
  }

  async sendReport() {
    try {
      const attachments = [];
      let isLeadReport = false;
      let isFollowUpReport = false;
      this.manager.today = moment().utcOffset(330).format('DD-MM-YYYY');
      let template = dot.template(constants.NOTIFICATION.DEALER_REPORT);
      let message = template(this.manager);
      if (this.leads.length > 0) {
        const leadOpts = {
          fields: ['S.No', 'Date of Visit', 'Time of Visit', 'Executive Name', 'Source of Enquiry', 'Pincode',
            'Title', 'Prospect Name', 'Mobile Number', 'Vehicle', 'Variant', 'Color', 'Status',
            'Date of Invoice', 'Lost Reason', 'Test Ride Opted', 'Test Ride Date', 'Test Ride Time',
            'Test Ride Status', 'Exchange Vehicle Opted', 'Vehicle Make', 'Vehicle Model', 'Year of Manufacturer',
            'Vehicle Condition', 'Vehicle Remarks',
            'Exchange Value', 'finance_opted', 'financier_name', 'loan_amount', 'tenure', 'Follow-up Scheduled',
            'Follow_up_date', 'Follow_up_time', 'Comments'],
        };
        const leadCsv = json2csv(this.leads, leadOpts);
        const leadEncoded = base64.encode(leadCsv);
        const leadReportAttachment = {};
        leadReportAttachment.ContentType = constants.CONTENT_TYPE.TEXT_PLAIN;
        leadReportAttachment.Filename = `Leads-Report-on-${this.manager.today}.csv`;
        leadReportAttachment.Base64Content = leadEncoded;
        attachments.push(leadReportAttachment);
        isLeadReport = true;
      }
      if (this.followUps.length > 0) {
        const followUpOpts = {
          fields: ['S.No', 'Date of Followup', 'Completed on Date', 'Followup Completed', 'Date of Creation',
            'Time of Creation', 'Name of DSE', 'Source of Enquiry', 'Pincode', 'Title of theProspect',
            'Name of the Prospect', 'Mobile Number', 'Number of Enquiries', 'Product Enquired', 'Variant',
            'Color', 'Lead Status', 'Remarks', 'Next Follow-up Scheduled', 'Date of Next Follow-up',
            'Time of Next Follow-up', 'No of follow-up done'],
        };
        const followUpCsv = json2csv(this.followUps, followUpOpts);
        const followUpEncoded = base64.encode(followUpCsv);
        const followUpAttachment = {};
        followUpAttachment.ContentType = constants.CONTENT_TYPE.TEXT_PLAIN;
        followUpAttachment.Filename = `Follow-Up-report-on-${this.manager.today}.csv`;
        followUpAttachment.Base64Content = followUpEncoded;
        attachments.push(followUpAttachment);
        isFollowUpReport = true;
      }

      if (!isFollowUpReport && !isLeadReport) {
        logger.info(`${this.manager.email} ==> ${constants.SUBJECT.NO_LEADS_AND_FOLLOWUP}`);
        template = dot.template(constants.NOTIFICATION.NO_LEADS_AND_FOLLOWUP);
        message = template(this.manager);
        await ExternalServiceProviders.sendByEmail(
          this.manager.email, message,
          constants.SUBJECT.NO_LEADS_AND_FOLLOWUP,
        );
      } else if (!isLeadReport) {
        logger.info(`${this.manager.email} ==> ${constants.SUBJECT.NO_LEADS}`);
        template = dot.template(constants.NOTIFICATION.NO_LEADS);
        message = template(this.manager);
        await ExternalServiceProviders.sendReportByEmail(
          this.manager.email, message, attachments,
          constants.SUBJECT.NO_LEADS,
        );
      } else if (!isFollowUpReport) {
        logger.info(`${this.manager.email} ==> ${constants.SUBJECT.NO_FOLLOWUP}`);
        template = dot.template(constants.NOTIFICATION.NO_FOLLOWUP);
        message = template(this.manager);
        await ExternalServiceProviders.sendReportByEmail(
          this.manager.email, message, attachments,
          constants.SUBJECT.NO_FOLLOWUP,
        );
      } else {
        logger.info(`${this.manager.email} ==> ${constants.SUBJECT.DEALER_REPORT}`);
        await ExternalServiceProviders.sendReportByEmail(
          this.manager.email, message, attachments,
          constants.SUBJECT.DEALER_REPORT,
        );
      }
      logger.info(
        'Report sent to => ', this.dealerName, ' => ', this.manager.email,
        ', Number of Leads=>', this.leads.length,
        ', Number of FollowUp=>', this.followUps.length,
        ', Message=>', message, ', Attachments', attachments.length,
      );
    } catch (e) {
      throw new InstabikeError(e);
    }
  }
}

const reportJob = new ReportJobService();
reportJob.start();
