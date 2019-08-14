/**
 * To send a missed-test-ride sms to the leads for test rides booked and not being taken
 * at 09 AM each day
 */

// import files
const loopback = require('../server.js');
const BaseService = require('../services/base_service');
const InstabikeError = require('../error/instabike_error');
const ErrorConstants = require('../utils/constants/error_constants');
const DealerService = require('../services/dealer_service');

const app = loopback.dataSources.postgres.models;

/**
 * @author shahul hameed b
 */
module.exports = class ProformaInvoiceService extends BaseService {
  constructor(proformaInvoiceId, leadId, leadDetailId, proformaInvoice) {
    super();
    this.leadId = leadId;
    this.leadDetailId = leadDetailId;
    this.proformaInvoiceId = proformaInvoiceId;
    this.proformaInvoice = proformaInvoice;
  }

  /**
   * get vehicle pricebreak down for a lead based
   * on dealerId, vehicleId, variantId and leadId
   * @param  {function} callback
   * @return {function} proformainvoice
   * @author shahul hameed b
   */
  async getPriceBreakDown(callback) {
    try {
      const lead = await app.Lead.findById(this.leadId);
      if (!lead) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.LEAD.NOT_FOUND));
      }
      const leadDetailObj = await app.LeadDetail.findById(this.leadDetailId);
      if (!leadDetailObj) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.LEAD.DETAIL_NOT_FOUND));
      }
      const vehiclePrice = await app.VehiclePrice.findOne({
        where: {
          manufacturer_id: leadDetailObj.manufacturer_id,
          dealer_id: leadDetailObj.dealer_id,
          vehicle_id: leadDetailObj.vehicle_id,
          variant_id: leadDetailObj.variant_id,
        },
      });
      if (!vehiclePrice || vehiclePrice == null) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.VEHICLE.PRICE_NOT_FOUND));
      }
      const proformaInvoiceDetail = {};
      proformaInvoiceDetail.proformaInvoice =
      await this.findOrCreateProformaInvoice(leadDetailObj, vehiclePrice, callback);
      const dealerService = new DealerService(leadDetailObj.dealer_id);
      proformaInvoiceDetail.nonMandatoryAccessories =
      await dealerService.getNonMandatoryAccessories(leadDetailObj.vehicle_id);
      proformaInvoiceDetail.mandatoryAccessories =
      await dealerService.getManadatoryAccessories(leadDetailObj.vehicle_id);
      proformaInvoiceDetail.offer = await app.DealerVehicle.findOne({
        where: {
          dealer_id: leadDetailObj.dealer_id,
          vehicle_id: leadDetailObj.vehicle_id,
          is_active: true,
        },
        fields: ['offer'],
      });
      return callback(null, proformaInvoiceDetail);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * Find or create proformaInvoice
   * @param  {object}  leadDetailObj
   * @param  {object}  vehiclePrice
   * @return {object} proformaInvoice
   * @author shahul hameed b
   */
  async findOrCreateProformaInvoice(leadDetailObj, vehiclePrice, callback) {
    try {
      let leadDetail = leadDetailObj;
      let isNewProformaInvoice = true;
      let proformaInvoice = await app.ProformaInvoice.findOne({
        where: {
          dealer_id: leadDetail.dealer_id,
          vehicle_id: leadDetail.vehicle_id,
          lead_id: this.leadId,
          lead_detail_id: leadDetail.id,
          variant_id: leadDetail.variant_id,
        },
      });
      if (!proformaInvoice) {
        proformaInvoice = await this.createProformaInvoice(leadDetail, vehiclePrice, callback);
        leadDetail.proforma_invoice_id = proformaInvoice.id;
        leadDetail = await app.LeadDetail.upsertWithWhere({
          id: this.leadDetailId,
        }, leadDetail);
      } else {
        isNewProformaInvoice = false;
        proformaInvoice.variant_id = leadDetail.variant_id;
        proformaInvoice.variant_colour_id = leadDetail.variant_colour_id;
        proformaInvoice.vehicle_price_id = vehiclePrice.id;
        await app.ProformaInvoice.upsert(proformaInvoice);
      }
      proformaInvoice = await app.ProformaInvoice.findById(
        proformaInvoice.id,
        {
          include: ['proforma_invoice_offer', 'proforma_invoice_other_charges', 'lead', 'lead_detail',
            {
              relation: 'vehicle_price',
              scope: { include: { relation: 'vehicle_insurances' } },
            },
            {
              relation: 'proforma_invoice_accessory',
              scope: { include: { relation: 'dealer_accessory' } },
            }],
        },
      );
      if (leadDetail.total_insurance_amount !== 0 || isNewProformaInvoice) {
        let insuranceAmount = 0;
        if (proformaInvoice.vehicle_price().is_insurance_split) {
          proformaInvoice.vehicle_price().vehicle_insurances().map((eachInsurance) => {
            if (eachInsurance.type === 'zero_depreciation' && leadDetailObj.zero_depreciation) {
              insuranceAmount += parseInt(eachInsurance.amount, 10);
            } else if (eachInsurance.type === 'od_premium'
              && (`${leadDetailObj.od_premium_validity}` === `${eachInsurance.validity}`)) {
              insuranceAmount += parseInt(eachInsurance.amount, 10);
            } else if ((eachInsurance.type === 'compulsory_pa_cover' && leadDetailObj.compulsory_pa_cover)
              || (eachInsurance.type === 'tp_premium' && leadDetailObj.tp_premium)) {
              insuranceAmount += parseInt(eachInsurance.amount, 10);
            }
          });
        } else {
          proformaInvoice.vehicle_price().vehicle_insurances().map((eachInsurance) => {
            if (eachInsurance.type === 'total_amount') {
              insuranceAmount += parseInt(eachInsurance.amount, 10);
            }
          });
        }
        leadDetail.total_insurance_amount = insuranceAmount;
        leadDetail = await app.LeadDetail.upsertWithWhere({
          id: this.leadDetailId,
        }, leadDetail);
        proformaInvoice = JSON.parse(JSON.stringify(proformaInvoice));
        proformaInvoice.lead_detail = leadDetail;
      }
      return proformaInvoice;
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * create a new proformaInvoice
   * @param  {object}  leadDetail
   * @param  {object}  vehiclePrice
   * @return {object}  proformaInvoice
   * @author shahul hameed b
   */
  async createProformaInvoice(leadDetail, vehiclePrice, callback) {
    try {
      const proformaInvoiceObj = {};
      proformaInvoiceObj.manufacturer_id = leadDetail.manufacturer_id;
      proformaInvoiceObj.dealer_id = leadDetail.dealer_id;
      proformaInvoiceObj.vehicle_id = leadDetail.vehicle_id;
      proformaInvoiceObj.lead_id = this.leadId;
      proformaInvoiceObj.vehicle_price_id = vehiclePrice.id;
      proformaInvoiceObj.lead_detail_id = this.leadDetailId;
      proformaInvoiceObj.variant_id = leadDetail.variant_id;
      proformaInvoiceObj.variant_colour_id = leadDetail.variant_colour_id;
      const proformaInvoiceObject = await app.ProformaInvoice.create(proformaInvoiceObj);
      this.proformaInvoiceId = proformaInvoiceObject.id;
      const proformaInvoice = await app.ProformaInvoice.findById(
        this.proformaInvoiceId,
        {
          include: ['proforma_invoice_offer', 'proforma_invoice_other_charges',
            'lead', 'lead_detail',
            {
              relation: 'vehicle_price',
              scope: { include: { relation: 'vehicle_insurances' } },
            },
            {
              relation: 'proforma_invoice_accessory',
              scope: { include: ['dealer_accessory'] },
            }],
        },
      );

      return proformaInvoice;
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * create the proforma invoice offer for vehicle
   * w.r.t proformaInvoiceId
   * @param  {object}   proformaInvoiceOffer
   * @param  {Function} callback
   * @return {object} ProformaInvoiceDetail
   * @author shahul hameed b
   */
  async createProformaInvoiceOffer(proformaInvoiceOffer, callback) {
    try {
      const proformaInvoice = await app.ProformaInvoice.findById(this.proformaInvoiceId);
      if (!proformaInvoice || proformaInvoice == null) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.INVOICE.NOT_FOUND));
      }
      await app.ProformaInvoiceOffer.create(proformaInvoiceOffer);
      const proformaInvoiceObj = await this.findProformaInvoiceById(callback);
      return callback(null, proformaInvoiceObj);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * delete the proforminvoice offer  for vehicle
   * w.r.t proformaInvoiceOfferId
   * @param  {string}   offerId
   * @param  {Function} callback
   * @return {object} ProformaInvoiceDetail
   * @author shahul hameed b
   */
  async deleteProformaInvoiceOffer(offerId, callback) {
    try {
      const proformaInvoice = await app.ProformaInvoice.findById(this.proformaInvoiceId);
      if (!proformaInvoice || proformaInvoice == null) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.INVOICE.NOT_FOUND));
      }
      const proformaInvoiceOfferObj = await app.ProformaInvoiceOffer.findById(offerId);
      if (!proformaInvoiceOfferObj || proformaInvoiceOfferObj == null) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.INVOICE.OFFER_NOT_FOUND));
      }
      await app.ProformaInvoiceOffer.destroyById(offerId);
      const proformaInvoiceObj = await this.findProformaInvoiceById(callback);
      return callback(null, proformaInvoiceObj);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * non mandatoryAccessories will be added in
   * the proforminvoice chosed by lead
   * @param  {object}   dealerAccessories
   * @param  {Function} callback
   * @return {object} ProformaInvoiceDetail
   * @author shahul hameed b
   */
  async updateProformaInvoiceAccessories(dealerAccessories, callback) {
    try {
      await app.ProformaInvoiceAccessory.destroyAll({
        proforma_invoice_id: this.proformaInvoiceId,
      });
      await Promise.all(dealerAccessories.map(async (dealerAccesory) => {
        if (!dealerAccesory.is_mandatory) {
          const invoiceAccessory = {};
          invoiceAccessory.dealer_id = dealerAccesory.dealer_id;
          invoiceAccessory.dealer_accessory_id = dealerAccesory.id;
          invoiceAccessory.proforma_invoice_id = this.proformaInvoiceId;
          const accessory = await app.DealerAccessory.findOne({
            where: {
              accessory_id: dealerAccesory.accessory_id,
            },
          });
          if (accessory) {
            await app.ProformaInvoiceAccessory.create(invoiceAccessory);
          }
        }
      }));
      const proformaInvoice = await this.findProformaInvoiceById(callback);
      return callback(null, proformaInvoice);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * update the proforminvoice object
   * @param  {object}   variantDetail
   * @param  {Function} callback
   * @return {object} ProformaInvoiceDetail
   * @author shahul hameed b
   */
  async updateProformaInvoice(variantDetail, callback) {
    try {
      const proformaInvoice = await app.ProformaInvoice.findById(this.proformaInvoiceId);
      if (!proformaInvoice) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.INVOICE.NOT_FOUND));
      }
      const leadDetail = await app.LeadDetail.findById(proformaInvoice.lead_detail_id);
      proformaInvoice.variant_id = variantDetail.variant_id;
      proformaInvoice.variant_colour_id = variantDetail.variant_colour_id;
      const vehiclePrice = await app.VehiclePrice.findOne({
        where: {
          dealer_id: variantDetail.dealer_id,
          vehicle_id: variantDetail.vehicle_id,
          variant_id: variantDetail.variant_id,
        },
      });
      proformaInvoice.vehicle_price_id = vehiclePrice.id;
      await app.ProformaInvoice.upsert(proformaInvoice);

      const newProformaInvoice = await app.ProformaInvoice.findById(
        proformaInvoice.id,
        {
          include: ['proforma_invoice_offer', 'proforma_invoice_other_charges', 'lead', 'lead_detail',
            {
              relation: 'vehicle_price',
              scope: { include: { relation: 'vehicle_insurances' } },
            },
            {
              relation: 'proforma_invoice_accessory',
              scope: { include: { relation: 'dealer_accessory' } },
            }],
        },
      );
      let insuranceAmount = 0;
      if (leadDetail.total_insurance_amount !== 0) {
        if (newProformaInvoice.vehicle_price().is_insurance_split) {
          newProformaInvoice.vehicle_price().vehicle_insurances().map((eachInsurance) => {
            if (eachInsurance.type === 'zero_depreciation' && leadDetail.zero_depreciation) {
              insuranceAmount += parseInt(eachInsurance.amount, 10);
            } else if (eachInsurance.type === 'od_premium'
              && (`${leadDetail.od_premium_validity}` === `${eachInsurance.validity}`)) {
              insuranceAmount += parseInt(eachInsurance.amount, 10);
            } else if ((eachInsurance.type === 'compulsory_pa_cover' && leadDetail.compulsory_pa_cover)
              || (eachInsurance.type === 'tp_premium' && leadDetail.tp_premium)) {
              insuranceAmount += parseInt(eachInsurance.amount, 10);
            }
          });
        } else {
          newProformaInvoice.vehicle_price().vehicle_insurances().map((eachInsurance) => {
            if (eachInsurance.type === 'total_amount') {
              insuranceAmount += parseInt(eachInsurance.amount, 10);
            }
          });
        }
      }
      leadDetail.total_insurance_amount = insuranceAmount;

      leadDetail.variant_id = variantDetail.variant_id;
      leadDetail.variant_colour_id = variantDetail.variant_colour_id;
      await app.LeadDetail.upsert(leadDetail);
      const proformaInvoiceObj = await this.findProformaInvoiceById(callback);
      return callback(null, proformaInvoiceObj);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * find proformainvoice by id
   * @return {Promise} proformaInvoiceDetail
   * @author shahul hameed b
   */
  async findProformaInvoiceById(callback) {
    try {
      const proformaInvoice = await app.ProformaInvoice.findById(
        this.proformaInvoiceId,
        {
          include: ['proforma_invoice_offer', 'proforma_invoice_other_charges',
            'lead', 'lead_detail',
            {
              relation: 'vehicle_price',
              scope: { include: { relation: 'vehicle_insurances' } },
            },
            {
              relation: 'proforma_invoice_accessory',
              scope: { include: ['dealer_accessory'] },
            }],
        },
      );
      const proformaInvoiceDetail = {};
      proformaInvoiceDetail.proformaInvoice = proformaInvoice;
      const dealerService = new DealerService(proformaInvoice.dealer_id);
      proformaInvoiceDetail.nonMandatoryAccessories =
      await dealerService.getNonMandatoryAccessories(proformaInvoice.vehicle_id);
      proformaInvoiceDetail.mandatoryAccessories =
      await dealerService.getManadatoryAccessories(proformaInvoice.vehicle_id);
      return proformaInvoiceDetail;
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * create the proforma invoice other charges for vehicle
   * @param  {object}   proformaInvoiceOtherCharge
   * @param  {Function} callback
   * @return {object} ProformaInvoiceDetail
   * @author Ponnuvel G
   */
  async createOtherCharge(otherCharge, callback) {
    try {
      const proformaInvoice = await app.ProformaInvoice.findById(this.proformaInvoiceId);
      if (!proformaInvoice || proformaInvoice == null) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.INVOICE.NOT_FOUND));
      }
      await app.ProformaInvoiceOtherCharge.create(otherCharge);
      const proformaInvoiceObj = await this.findProformaInvoiceById(callback);
      return callback(null, proformaInvoiceObj);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }

  /**
   * delete the proforminvoice other charges for vehicle
   * @param  {string}   otherChargeId
   * @param  {Function} callback
   * @return {object} ProformaInvoiceDetail
   * @author Ponnuvel G
   */
  async deleteOtherCharge(otherChargeId, callback) {
    try {
      const proformaInvoice = await app.ProformaInvoice.findById(this.proformaInvoiceId);
      if (!proformaInvoice || proformaInvoice == null) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.INVOICE.NOT_FOUND));
      }
      const otherCharge = await app.ProformaInvoiceOtherCharge.findById(otherChargeId);
      if (!otherCharge || otherCharge == null) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.INVOICE.CHARGE_NOT_FOUND));
      }
      await app.ProformaInvoiceOtherCharge.destroyById(otherChargeId);
      const proformaInvoiceObj = await this.findProformaInvoiceById(callback);
      return callback(null, proformaInvoiceObj);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }
};
