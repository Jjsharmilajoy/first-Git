const logger = require('winston');
const moment = require('moment');
const XLSX = require('xlsx');

const loopback = require('../server.js');
const constants = require('../utils/constants/userConstants');
const InstabikeError = require('../error/instabike_error');
const ErrorConstants = require('../utils/constants/error_constants');
const BaseService = require('../services/base_service.js');

const filePath = './server/lead_to_financier_lead/data/JSFW_Financier_18_July_2019.xlsx';
const sheetName = 'Sheet1';
const app = loopback.dataSources.postgres.models;
/**
 * @author Pavithra Sivasubramanian
 */
class FinancierLeads extends BaseService {
  /**
   * To create financier leads with the data obtained from the xlsx file name
   * @author Pavithra Sivasubramanian
   */
  async createFinancierLeads() {
    try {
      let workbook = XLSX.readFile(filePath);
      if (!workbook.SheetNames.includes(sheetName)) {
        throw new InstabikeError(ErrorConstants.ERRORS.IMPORT_XLSX.SHEET_NOT_FOUND);
      }
      let data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      for (let i = 0; i < data.length; i++) {
        let keys = ['lead_mobile_number', 'dealer_name', 'dse_mobile_number', 'vehicle_name', 
          'financier_name', 'financier_mobile_number', 'loan_amount', 'tenure', 'emi'];
        keys.map(key => { 
          if (!data[i].hasOwnProperty(key)) {
            ErrorConstants.ERRORS.IMPORT_XLSX.EMPTY_INPUT.message = 
              `${ErrorConstants.ERRORS.IMPORT_XLSX.EMPTY_INPUT.message} for ${key}`;
            throw new InstabikeError(ErrorConstants.ERRORS.IMPORT_XLSX.EMPTY_INPUT);
          }	
        })
        await this.createLead(data[i]);
      }
      logger.info(`Importing financier-leads done`);
    } catch (err) {
      throw new InstabikeError(err);
    }
  }

  /**
   * To create new financier lead
   *
   * @param  {object} data
   * @author Pavithra Sivasubramanian
   */
  async createLead(data) {
    try {
      let leadInfo = await this.getLeadInfo(data);
      let financierDetails = await this.getFinancierDetails(data, leadInfo.vehicle, leadInfo.dealer, leadInfo.lead);
      const isLeadExist = await app.FinancierLead.findOne({
        where: {
          financier_id: financierDetails.financier.id,
          mobile_number: data.lead_mobile_number,
          lead_id: leadInfo.lead.id,
          lead_detail_id: leadInfo.lead.toJSON().lead_details[0] ?
            leadInfo.lead.toJSON().lead_details[0].id : null
        },
      });
      if (!isLeadExist) {
        let newLead = await this.constructFinancierLead(financierDetails.financier, leadInfo.vehicle,
          leadInfo.lead, financierDetails.assignedTo, financierDetails.financier_sales, data.loan_amount);
        await this.getFinancierLeadActivity(newLead, leadInfo.lead, financierDetails.financier);
      }			
    } catch (e) {
      throw new InstabikeError(e);
    }
  }

  /**
   * To get the dealer, vehicle and lead details
   *
   * @param  {object} data
   * @author Pavithra Sivasubramanian
   */
  async getLeadInfo(data) {
    try {
      let dealer = await app.Dealer.findOne({	where: { name: data.dealer_name } });
      if (!dealer) {
        ErrorConstants.ERRORS.DEALER.NOT_FOUND.message = 
          `${ErrorConstants.ERRORS.DEALER.NOT_FOUND.message} for ${data.dealer_name}`;
        throw new InstabikeError(ErrorConstants.ERRORS.DEALER.NOT_FOUND);
      }
      let vehicle = await this.getVehicle(data.vehicle_name, dealer.id);
      if (!vehicle) {
        ErrorConstants.ERRORS.VEHICLE.NOT_FOUND.message = 
          `${ErrorConstants.ERRORS.VEHICLE.NOT_FOUND.message} for ${data.vehicle_name}`;
        throw new InstabikeError(ErrorConstants.ERRORS.VEHICLE.NOT_FOUND);
      }
      let lead = await this.getDealerLead(data.lead_mobile_number, vehicle.id);
      if (!lead) {
        ErrorConstants.ERRORS.LEAD.NOT_FOUND.message = 
          `${ErrorConstants.ERRORS.LEAD.NOT_FOUND.message} for ${data.lead_mobile_number}`;
        throw new InstabikeError(ErrorConstants.ERRORS.LEAD.NOT_FOUND);
      }
      return { dealer: dealer, vehicle: vehicle, lead: lead };
    } catch (e) {
      throw new InstabikeError(e);
    }
  }

  /**
   * To get the financier details
   *
   * @param  {object} data
   * @param  {object} vehicle
   * @param  {object} dealer
   * @param  {object} lead
   * @author Pavithra Sivasubramanian
   */
  async getFinancierDetails(data, vehicle, dealer, lead) {
    try {
      let financier = await this.getFinancier(data.financier_name, vehicle.id, dealer.id, 
        data.tenure, data.emi, lead);
      let financier_sales = await this.getFinancierSales(data.financier_mobile_number);
      if (!financier || !financier_sales) {
        ErrorConstants.ERRORS.FINANCIER.NOT_FOUND.message = 
          `${ErrorConstants.ERRORS.FINANCIER.NOT_FOUND.message} 
          for ${data.financier_name} or ${data.financier_mobile_number}`
        throw new InstabikeError(ErrorConstants.ERRORS.FINANCIER.NOT_FOUND);
      }
      const assignedTo = await app.FinancierDealer.findOne({
        where: {
          and: [{ user_id: financier_sales.id }, { dealer_id: lead.dealer_id }],
        },
      });
      if (!assignedTo) {
        ErrorConstants.ERRORS.FINANCIER.CAN_NOT_ASSIGN.message = 
          `${ErrorConstants.ERRORS.FINANCIER.CAN_NOT_ASSIGN.message} for ${financier_sales.id}`
        throw new InstabikeError(ErrorConstants.ERRORS.FINANCIER.CAN_NOT_ASSIGN);
      }
      return { financier: financier, financier_sales: financier_sales, assignedTo: assignedTo };
    } catch (e) {
      throw new InstabikeError(e);
    }
  }

  /**
   * To track the activities of the financier lead
   *
   * @param  {object} newLead
   * @param  {object} lead
   * @param  {object} financier
   * @author Pavithra Sivasubramanian
   */
  async getFinancierLeadActivity(newLead, lead, financier) {
    try {
      let lead_detail_id = lead.toJSON().lead_details[0] ? lead.toJSON().lead_details[0].id : null;
      await this.saveActivity(lead, newLead, lead.assigned_to, constants.ACTIVITY.FINANCE_SELECTED, 
        null, financier.id, lead_detail_id);
      await this.saveFinancierActivity(newLead, null, lead.assigned_to,
        constants.ACTIVITY.LEAD_CREATED);
      await this.saveFinancierActivity(newLead, null, lead.assigned_to, 
        constants.ACTIVITY.LEAD_ASSIGNED);
      lead.status = constants.FINANCIER_LEAD_STATUS.ACTIVE;
      await this.saveFinancierActivity(newLead, lead, newLead.assigned_to,
        constants.ACTIVITY.CONVERSION, null, constants.ACTIVITY.CHANGE_STATUS);
      await this.saveActivity(lead, newLead, lead.assigned_to, constants.ACTIVITY.FINANCE_APPROVED, 
        null,	financier.id, lead_detail_id);			
    } catch (e) {
      throw new InstabikeError(e);
    }
  }

  /**
   * To get the vehicle details
   *
   * @param  {string} vehicle_name
   * @param  {string} dealer_id
   * @author Pavithra Sivasubramanian
   */
  async getVehicle(vehicle_name, dealer_id) {
    try {
      return await app.Vehicle.findOne({
        where: { name: vehicle_name },
        include: {
          relation: 'prices',
          scope: { where: { dealer_id: dealer_id }, fields: ['onroad_price'] },
        }
      });
    } catch (e) {
      throw new InstabikeError(e);
    }
  }

  /**
   * To get the lead details 
   *
   * @param  {string} lead_mobile_number
   * @param  {string} vehicle_id
   * @author Pavithra Sivasubramanian
   */
  async getDealerLead(lead_mobile_number, vehicle_id) {
    try {
      return await app.Lead.findOne({
        where: { mobile_number: lead_mobile_number },
        include: [{
          relation: 'lead_details',
          scope: { where: { vehicle_id: vehicle_id }, fields: ['id', 'variant_id'] },
        }, {
          relation: 'lostReason',
          scope: { fields: ['category', 'reason'] }
        }]
      });
    } catch (e) {
      throw new InstabikeError(e);
    }
  }

  /**
   * To get the financier details 
   *
   * @param  {string} financier_name
   * @param  {string} vehicle_id
   * @param  {string} dealer_id
   * @author Pavithra Sivasubramanian
   */
  async getFinancier(financier_name, vehicle_id, dealer_id, tenure, emi, lead) {
    try {
      let variant_id = lead.toJSON().lead_details ? lead.toJSON().lead_details[0].variant_id : null;
      return await app.Financier.findOne({
        where: { name: financier_name },
        include: {
          relation: 'financierInterestDetail',
          scope: {
            where: {
              and: [
                { vehicle_id: vehicle_id }, 
                { dealer_id: dealer_id }, 
                { tenure: tenure },
                { emi: emi },
                { variant_id: variant_id }                
              ] 
            },
            fields: ['tenure', 'rate_of_interest', 'down_payment', 'emi', 'status', 'advance_emi', 'variant_id'],
          }
        }
      });
    } catch (e) {
      throw new InstabikeError(e);
    }
  }

  /**
   * To get the financier sales person details 
   *
   * @param  {string} financier_mobile_number
   * @author Pavithra Sivasubramanian
   */
  async getFinancierSales(financier_mobile_number) {
    try {
      return await app.Users.findOne({
        where: {
          and: [
            { mobile_no: financier_mobile_number },
            { user_type_name: constants.USER_TYPE_NAMES.FINANCIER }
          ]
        }
      });
    } catch (e) {
      throw new InstabikeError(e);
    }
  }

  /**
   * To construct the financier lead object and persist it to the database
   *
   * @param  {object} financier
   * @param  {object} vehicle
   * @param  {object} lead
   * @param  {object} assignedTo
   * @param  {object} financier_sales
   * @author Pavithra Sivasubramanian
   */
  async constructFinancierLead(financier, vehicle, lead, assignedTo, financier_sales, loan_amount) {
    try {
      let newLead = {};
      financier = financier.toJSON();
      newLead.financier_id = financier.id;
      if (financier.financierInterestDetail.length) {
        newLead.tenure = financier.financierInterestDetail[0].tenure;
        newLead.interest_percentage = financier.financierInterestDetail[0].rate_of_interest;
        newLead.down_payment = financier.financierInterestDetail[0].down_payment;
        newLead.emi = financier.financierInterestDetail[0].emi;
        newLead.advance_emi = financier.financierInterestDetail[0].advance_emi;
      }
      if (vehicle.toJSON().prices.length)
        newLead.loan_amount = loan_amount;
      lead = lead.toJSON();
      newLead.next_follow_up_on = lead.next_followup_on;
      newLead.last_follow_up_done_on = lead.last_followup_on;
      newLead.created_at = lead.created_at;
      newLead.updated_at = lead.updated_at;
      newLead.lost_on = lead.lost_on;
      newLead.name = lead.name;
      newLead.mobile_number = lead.mobile_number;
      newLead.lead_id = lead.id;
      newLead.user_id = lead.user_id;
      newLead.dealer_id = lead.dealer_id;
      newLead.assigned_by = lead.assigned_to;
      newLead.lost_reason = lead.lostReason ? lead.lostReason.category : null;
      newLead.lost_reason_comment = lead.lostReason ? lead.lostReason.reason : null;
      newLead.lead_detail_id = lead.lead_details[0] ? lead.lead_details[0].id : null;
      newLead.converted_on = `${moment(lead.created_at).add(15, 'seconds').utc().format()}`;
      newLead.financier_team_id = assignedTo.financier_team_id;
      newLead.country_id = assignedTo.country_id;
      newLead.zone_id = assignedTo.zone_id;
      newLead.state_id = assignedTo.state_id;
      newLead.city_id = assignedTo.city_id;
      newLead.assigned_to = financier_sales.id;
      newLead.status = constants.FINANCIER_LEAD_STATUS.CONVERSION;
      newLead = await app.FinancierLead.findOrCreate({
        where: {
          and: [
            { mobile_number: newLead.mobile_number },
            { lead_id: newLead.lead_id },
            { lead_detail_id: newLead.lead_detail_id },
            { financier_id: newLead.financier_id }
          ]
        }
      }, newLead);
      return newLead[0];
    } catch (e) {
      throw new InstabikeError(e);
    }
  }
}

const financierLeads = new FinancierLeads();
financierLeads.createFinancierLeads();