const AuditUtil = require('../utils/audit-utils');
const ProformaInvoiceService = require('../services/proforma_invoice_service.js');

module.exports = (ProformaInvoice) => {
  const proformaInvoice = ProformaInvoice;
  /**
   * Updates the log field values
   * @param  {Object}   ctx       database context of the model instance
   * @param  {Function} callback                                callback
   * @author Jaiyashree Subramanian
   */
  proformaInvoice.observe('before save', (ctx, next) => {
    const auditUtil = new AuditUtil();
    auditUtil.persistInstanceUpdatedAt('ProformaInvoice', ctx, next);
  });

  proformaInvoice.remoteMethod('createProformaInvoiceOffer', {
    description: 'To create a new offer for the proforma invoice based on ID',
    accepts: [
      { arg: 'proformaInvoiceId', type: 'string', required: true },
      {
        arg: 'proformaInvoiceOffer', type: 'ProformaInvoiceOffer', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:proformaInvoiceId/proformaInvoiceOffer/create', verb: 'Post' },
    returns: { arg: 'proformaInvoice', type: 'ProformaInvoiceDetail', root: true },
  });

  /**
   * create the proforma invoice offer for vehicle
   * w.r.t proformaInvoiceId
   * @param  {string}   proformaInvoiceId
   * @param  {object}   proformaInvoiceOffer
   * @param  {Function} callback
   * @return {object}  ProformaInvoiceDetail
   * @author shahul hameed b
   */
  proformaInvoice.createProformaInvoiceOffer =
  (proformaInvoiceId, proformaInvoiceOffer, callback) => {
    const proformaInvoiceService = new ProformaInvoiceService(proformaInvoiceId);
    proformaInvoiceService.createProformaInvoiceOffer(proformaInvoiceOffer, callback);
  };

  proformaInvoice.remoteMethod('deleteProformaInvoiceOffer', {
    description: 'To delete a offer for the proforma invoice based on ID',
    accepts: [
      { arg: 'proformaInvoiceId', type: 'string', required: true },
      { arg: 'proformaInvoiceOfferId', type: 'string', required: true },
    ],
    http: { path: '/:proformaInvoiceId/proformaInvoiceOffer/:proformaInvoiceOfferId/delete', verb: 'del' },
    returns: { arg: 'proformaInvoice', type: 'ProformaInvoiceDetail', root: true },
  });

  /**
   * delete the proforminvoice offer  for vehicle
   * w.r.t proformaInvoiceOfferId
   * @param  {string}   proformaInvoiceId
   * @param  {string}   proformaInvoiceOfferId
   * @param  {Function} callback
   * @return {object}  ProformaInvoiceDetail
   * @author shahul hameed b
   */
  proformaInvoice.deleteProformaInvoiceOffer =
  (proformaInvoiceId, proformaInvoiceOfferId, callback) => {
    const proformaInvoiceService = new ProformaInvoiceService(proformaInvoiceId);
    proformaInvoiceService.deleteProformaInvoiceOffer(proformaInvoiceOfferId, callback);
  };

  proformaInvoice.remoteMethod('updateProformaInvoiceAccessories', {
    description: 'To update the list of accessories attached to the proforma-invoice based on ID',
    accepts: [
      { arg: 'id', type: 'string', required: true },
      {
        arg: 'accessories', type: ['DealerAccessory'], http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:id/proformaInvoiceAccessories', verb: 'put' },
    returns: { arg: 'proformaInvoice', type: 'ProformaInvoiceDetail', root: true },
  });

  /**
   * non mandatoryAccessories will be added in
   * the proforminvoice chosed by lead
   * @param  {string}   proformaInvoiceId
   * @param  {object}   proformaInvoiceAccessories
   * @param  {Function} callback
   * @return {object}  ProformaInvoiceDetail
   * @author shahul hameed b
   */
  proformaInvoice.updateProformaInvoiceAccessories = (id, accessories, callback) => {
    const proformaInvoiceService = new ProformaInvoiceService(id);
    proformaInvoiceService.updateProformaInvoiceAccessories(accessories, callback);
  };

  proformaInvoice.remoteMethod('updateProformaInvoice', {
    description: 'To update the proforma-invoice based on ID',
    accepts: [
      { arg: 'proformaInvoiceId', type: 'string', required: true },
      {
        arg: 'variantDetail', type: 'VariantDetail', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:proformaInvoiceId/proformaInvoice', verb: 'put' },
    returns: { arg: 'proformaInvoice', type: 'ProformaInvoiceDetail', root: true },
  });

  /**
   * update the proforminvoice object
   * @param  {string}   proformaInvoiceId
   * @param  {object}   variantDetail
   * @param  {Function} callback
   * @return {object}  ProformaInvoiceDetail
   * @author shahul hameed b
   */
  proformaInvoice.updateProformaInvoice =
  (proformaInvoiceId, variantDetail, callback) => {
    const proformaInvoiceService = new ProformaInvoiceService(proformaInvoiceId);
    proformaInvoiceService.updateProformaInvoice(variantDetail, callback);
  };

  proformaInvoice.remoteMethod('createOtherCharge', {
    description: 'To update the proforma-invoice and add additional charges based on ID',
    accepts: [
      { arg: 'proformaInvoiceId', type: 'string', required: true },
      {
        arg: 'otherCharge', type: 'ProformaInvoiceOtherCharge', http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/:proformaInvoiceId/ProformaInvoiceOtherCharge/create', verb: 'Post' },
    returns: { arg: 'proformaInvoice', type: 'ProformaInvoiceOtherCharge', root: true },
  });

  /**
   * create the proforma invoice other charges
   * @param  {string}   proformaInvoiceId
   * @param  {object}   proformaInvoiceOtherCharge
   * @param  {Function} callback
   * @return {object}  ProformaInvoiceDetail
   * @author Ponnuvel G
   */
  proformaInvoice.createOtherCharge = (proformaInvoiceId, otherCharge, callback) => {
    const proformaInvoiceService = new ProformaInvoiceService(proformaInvoiceId);
    proformaInvoiceService.createOtherCharge(otherCharge, callback);
  };

  proformaInvoice.remoteMethod('deleteOtherCharge', {
    description: 'To update the proforma-invoice and delete additional charges based on ID',
    accepts: [
      { arg: 'proformaInvoiceId', type: 'string', required: true },
      { arg: 'id', type: 'string', required: true },
    ],
    http: { path: '/:proformaInvoiceId/proformaInvoiceOtherCharge/:id/delete', verb: 'del' },
    returns: { arg: 'proformaInvoice', type: 'ProformaInvoiceOtherCharge', root: true },
  });

  /**
   * delete the proforminvoice other charges for vehicle
   * @param  {string}   proformaInvoiceId
   * @param  {string}   otherChargeId
   * @param  {Function} callback
   * @return {object}  ProformaInvoiceDetail
   * @author Ponnuvel G
   */
  proformaInvoice.deleteOtherCharge = (proformaInvoiceId, id, callback) => {
    const proformaInvoiceService = new ProformaInvoiceService(proformaInvoiceId);
    proformaInvoiceService.deleteOtherCharge(id, callback);
  };
};
