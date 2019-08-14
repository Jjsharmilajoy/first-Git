/**
 * MIS report Job: To generate a MIS-lead-report and to generate and save it as a
 * YYYY-MM-DD.csv at 10 PM each night
 */

// import files
const loopback = require('../server.js');
const InstabikeError = require('../error/instabike_error');
const constants = require('../utils/constants/userConstants');

// import dependencies
const moment = require('moment');
const { CronJob } = require('cron');
const logger = require('winston');
const fs = require('fs');

const postgresDsConnector = loopback.dataSources.postgres.connector;

/**
 * MIS-report generator to get lead and dealer based report in csv format
 * @author Jaiyashree Subramanian
 */
class MISJobService {
  /**
   * To start the cron job to run at 10 PM each night
   * @author Jaiyashree Subramanian
   */
  async start() {
    try {
      this.job = new CronJob('00 00 22 * * *', async () => {
        logger.info(
          'MIS-report generator running at ',
          moment().format('DD/MM/YYYY'), this.job.cronTime.source,
        );
        await this.generateReportData();
      }, null, true, 'Asia/Kolkata');
      this.job.start();
    } catch (e) {
      logger.info(e);
      throw new InstabikeError(e);
    }
  }

  /**
   * To generate MIS-query and get the data output to save as a .csv
   * @author Jaiyashree Subramanian
   */
  async generateReportData() {
    try {
      const date = new Date();
      const currentMonth =
        date.getMonth() < 9 ? `0${(date.getMonth() + 1)}` : `${(date.getMonth() + 1)}`;
      const currentDate = date.getDate() < 10 ? `0${date.getDate()}` : `${date.getDate()}`;
      const start = `${date.getFullYear()}-01-01 00:00:00+00`;
      // const start = `${date.getFullYear()}-${currentMonth}-01 00:00:00+00`;
      this.fileDate = `${date.getFullYear()}-${currentMonth}-${currentDate}`;
      const query = `select
      to_char(lead.created_at + interval '5 hours 30 min', 'DD-MM-YYYY') as date,
      to_char(lead.created_at + interval '5 hours 30 min', 'HH:MI:SSAM') as created_time,
      ( select name from zones where id = lead.zone_id ) as zone,
      ( select name from states where id = lead.state_id ) as state,
      ( select name from cities where id = lead.city_id ) as city,
      ( select name from dealer_categories dc where dc.id = lead.dealer_category_id ) as dealer_category,
      ( select name from dealers d where d.id = lead.dealer_id ) as name_of_the_dealer,
      lead.source_of_enquiry as source_of_enquiry,
      ( select first_name from users u where u.id = lead.assigned_to ) as name_of_the_dse,
      lead.pincode as pincode,
      ( CASE WHEN (lead.gender = 'male') THEN 'Mr.' ELSE 'Ms.' END ) as title_of_the_prospect,
      lead.name as name_of_the_prospect, lead.mobile_number as phone_number,
      ( select count(1) from lead_details where lead_id = lead.id and is_deleted = false ) as number_of_enquiries,
      ( select name from vehicles where id = ld.vehicle_id ) as product_enquired,
       (select color from variant_colours where id=ld.variant_colour_id ) as Product_Color,
      ( CASE WHEN (lead.category = 'NEW' and lead.is_lost = false and lead.is_invoiced = false
          and lead.is_booked = false ) THEN 'yes' ELSE 'no' END ) as new,
      ( CASE WHEN (lead.category = 'HOT' and lead.is_lost = false and lead.is_invoiced = false
          and lead.is_booked = false ) THEN 'yes' ELSE 'no' END ) as hot,
      ( CASE WHEN (lead.category = 'WARM' and lead.is_lost = false and lead.is_invoiced = false
          and lead.is_booked = false ) THEN 'yes' ELSE 'no' END ) as warm,
      ( CASE WHEN (lead.category = 'COLD' and lead.is_lost = false and lead.is_invoiced = false
          and lead.is_booked = false ) THEN 'yes' ELSE 'no' END ) as cold,
      ( CASE WHEN (ld.booked_on IS NOT NULL) THEN 'yes'
          ELSE 'no' END ) as is_booked,
      ( CASE WHEN (ld.invoiced_on IS NOT NULL) THEN 'yes'
          ELSE 'no' END ) as is_invoiced,
      ( CASE WHEN (lead.is_lost = true) THEN 'yes' ELSE 'no' END ) as lost,
      ( CASE WHEN (lead.lost_reason_text is NULL OR lead.lost_reason_text = '')
        THEN ( select reason from lost_reasons where id = lead.lost_reason_id )
        ELSE lead.lost_reason_text END ) as lost_reason,
(CASE WHEN(lead.lost_reason_id is not NULL )Then
(select category from lost_reasons where id = lead.lost_reason_id )
Else '' END) as Lost_Category,
      lead.category as last_status,
      to_char(ld.booked_on + interval '5 hours 30 min', 'DD-MM-YYYY') as booked_date,
      to_char(ld.invoiced_on + interval '5 hours 30 min', 'DD-MM-YYYY') as invoiced_date,
      to_char(cast(lead.lost_on as timestamp with time zone) + interval '5 hours 30 min', 'DD-MM-YYYY') as Lost_Date,
      ( CASE WHEN (ld.test_ride_status is not null) THEN 'yes' ELSE 'no' END ) as test_ride_availed,
      (case ld.test_ride_status when 200 then 'Booked'
        when 300 then 'Ongoing' when 400 then 'Completed'
        when 500 then 'Cancelled' end) "Test Ride Status",
      ( CASE WHEN ( (select count(1) from exchange_vehicles where lead_id = lead.id ) = 0)
          THEN 'no' ELSE 'yes' END ) as exchange_vehicle_opted,
      ( select manufacturer from exchange_vehicles where lead_id = lead.id order by created_at DESC limit 1)
          as vehicle_make,
      ( select vehicle from exchange_vehicles where lead_id = lead.id order by created_at DESC limit 1)
          as vehicle_model,
      ( select variant_year from exchange_vehicles where lead_id = lead.id order by created_at DESC limit 1)
          as year_of_manufacturer,
      ( select condition from exchange_vehicles where lead_id = lead.id order by created_at DESC limit 1)
          as vehicle_condition,
      ( select remarks from exchange_vehicles where lead_id = lead.id order by created_at DESC limit 1)
          as vehicle_remarks,
      ( select quoted_value from exchange_vehicles where lead_id = lead.id order by created_at DESC limit 1)
          as exchange_value,
      ( CASE WHEN ( lead.income_status = 1 AND fl.id is not null) THEN 'self-employed'
          WHEN ( lead.income_status = 0 AND fl.id is not null) THEN 'salaried'
          ELSE '' END ) as income_status,
      ( CASE WHEN (fl.id is not null) THEN 'yes' ELSE 'no' END ) as finance_opted,
      ( select name from financiers f where f.id = fl.financier_id ) as financier_name,
      fl.loan_amount as loan_amount,
      fl.tenure as tenure,
      ( CASE WHEN (fl.status = 500) THEN 'active'
        WHEN (fl.status = 510) THEN 'disbursement-pending'
        WHEN (fl.status = 520) THEN 'converted'
        WHEN (fl.status = 930) THEN 'lost' END ) as finance_status,
      ( CASE WHEN ( (select count(1) from follow_ups where lead_id = lead.id ) = 0) THEN 'no' ELSE 'yes' END )
          as follow_up_scheduled,
      to_char(lead.next_followup_on + interval '5 hours 30 min', 'DD-MM-YYYY') as next_follow_up_date,
      to_char(lead.next_followup_on + interval '5 hours 30 min', 'HH:MI:SSAM') as next_follow_up_time,
      ( select to_char(completed_at + interval '5 hours 30 min', 'DD-MM-YYYY')
          from follow_ups where lead_id = lead.id and is_completed = true
          order by created_at DESC limit 1 ) as last_follow_up_date,
      ( select to_char(completed_at + interval '5 hours 30 min', 'HH:MI:SSAM')
          from follow_ups where lead_id = lead.id and is_completed = true
          order by created_at DESC limit 1 ) as last_follow_up_time,
      ( select comment from follow_ups where lead_id = lead.id and is_completed = true
          order by created_at DESC limit 1 ) as follow_up_comment,
      ( select count(1) from follow_ups where lead_id = lead.id and is_completed = true ) as number_of_follow_up_done,
  (SELECT  string_agg(comment, '; ')
FROM  lead_activities  where lead_id=lead.id and type='Comments Added') AS General_Comments
    from leads lead
    left join lead_details ld ON ld.lead_id = lead.id and ld.is_deleted = false
    left join financier_leads fl ON fl.lead_detail_id = ld.id and
      fl.created_at=(select max(created_at) from financier_leads fl_temp
      where fl_temp.lead_detail_id = ld.id)
      where
        ( lead.created_at between $1 and (select now()) ) or
        ( lead.invoiced_on between $1 and (select now()) ) or
        ( lead.lost_on between $1 and (select now()) )
      order by lead.created_at ASC, lead.name ASC`;
      const params = [start];
      this.result = await new Promise((resolve, reject) => {
        postgresDsConnector.query(query, params, (err, res) => {
          if (err) {
            logger.info('Error in preparing report data');
            reject(new InstabikeError(err));
          }
          return resolve(res);
        });
      });
      let csv = [];
      if (this.result.length) {
        const items = this.result;
        // specify how you want to handle null values here
        const replacer = (key, value) => (value === null ? '' : value);
        const header = Object.keys(items[0]);
        await Promise.all(items.map((row) => {
          const eachRow = header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(',');
          csv.push(eachRow);
        }));
        csv.unshift(header.join(','));
        csv = csv.join('\r\n');
      } else {
        csv = constants.MIS_REPORT.DEFAULT_TITLE;
      }
      await this.saveReportAsCSV(csv);
    } catch (e) {
      logger.info(e);
      throw new InstabikeError(e);
    }
  }

  /**
   * To generate and save file as a YYYY-MM-DD.csv
   * @param  {[Object]} csvData           list of rows in the csv
   * @author Jaiyashree Subramanian
   */
  async saveReportAsCSV(csvData) {
    try {
      fs.writeFile(
        `${__dirname}/../../MIS-reports/${this.fileDate}_MIS-report.csv`,
        csvData, (err) => {
          if (err) {
            logger.info(`Error in generating ${this.fileDate}_MIS-report.csv`);
          }
          logger.info(`${this.fileDate}_MIS-report.csv Generated Successfully`);
        },
      );
    } catch (e) {
      logger.info(e);
      throw new InstabikeError(e);
    }
  }
}

const MISJob = new MISJobService();
MISJob.start();
