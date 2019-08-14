const AuditUtil = require('../utils/audit-utils');
const DocumentService = require('../services/document_service');

module.exports = (Document) => {
  const document = Document;
  /**
   * Updates the log field values
   * @param  {Object}   ctx       database context of the model instance
   * @param  {Function} callback                                callback
   * @author Jaiyashree Subramanian
   */
  document.observe('before save', (ctx, next) => {
    const auditUtil = new AuditUtil();
    auditUtil.persistInstanceUpdatedAt('FinancialDocument', ctx, next);
  });

  document.remoteMethod('upload', {
    description: 'Upload Documents',
    accepts: [
      { arg: 'req', type: 'object', http: { source: 'req' } },
      { arg: 'userId', type: 'string', required: true },
    ],
    http: { path: '/Users/:userId/upload', verb: 'POST' },
    returns: { arg: 'document', type: 'Document', root: true },
  });

  document.remoteMethod('OcrUpload', {
    description: 'OCR Extraction ',
    accepts: [
      { arg: 'req', type: 'object', http: { source: 'req' } },
    ],
    http: { path: '/Users/ocrUpload', verb: 'POST' },
    returns: { arg: 'document', type: 'Document', root: true },
  });

  /**
   * Update Dealer and Financial Document to Azure
   * @param  {Object}   req
   * @param  {String}   userId
   * @param  {Function} callback
   * @return {Document} Document
   * @author Ponnuvel G
   */
  document.upload = (req, userId, callback) => {
    const documentService = new DocumentService();
    documentService.upload(req, userId, callback);
  };
  document.remoteMethod('removeDocs', {
    description: 'Delete Documents',
    accepts: [
      { arg: 'id', type: 'string', required: true },
    ],
    http: { path: '/:id', verb: 'DEL' },
    returns: { arg: 'response', type: 'object', root: true },
  });

  document.OcrUpload = (req, callback) => {
    const documentService = new DocumentService();
    documentService.OcrUpload(req, callback);
  };

  /**
   * Delete Document
   * @param  {String}   documentId
   * @param  {Function} callback
   * @return {Document} Document
   * @author Ponnuvel G
   */
  document.removeDocs = (id, callback) => {
    const documentService = new DocumentService(id);
    documentService.remove(callback);
  };

  document.remoteMethod('download', {
    description: 'Download Documents',
    accepts: [
      { arg: 'res', type: 'object', http: { source: 'res' } },
      { arg: 'id', type: 'string', required: true },
      { arg: 'size', type: 'string', required: true },
    ],
    http: { path: '/:id/:size', verb: 'GET' },
    returns: { arg: 'response', type: 'object', root: true },
    accessScopes: ['download'],
  });

  /**
   * Download Document
   * @param  {Object}   ctx
   * @param  {String}   documentId
   * @param  {Function} callback
   * @return {Document} Document
   * @author Ponnuvel G
   */
  document.download = (res, id, size, callback) => {
    const documentService = new DocumentService(id);
    documentService.download(res, size, callback);
  };

  document.remoteMethod('markAsVerified', {
    description: 'Mark List of Documents As Verified',
    accepts: [
      {
        arg: 'documentIds', type: ['string'], http: { source: 'body' }, required: true,
      },
    ],
    http: { path: '/markAsVerified', verb: 'POST' },
    returns: { arg: 'documents', type: '[Document]', root: true },
  });

  /**
   * Mark list of document as OSV verified
   * @param  {List}   documentIds
   * @param  {Function} callback
   * @return {List} List of Document
   * @author Ponnuvel G
   */
  document.markAsVerified = (documentIds, callback) => {
    const documentService = new DocumentService();
    documentService.markAsVerified(documentIds, callback);
  };

  document.remoteMethod('getExchangeVehiclesImages', {
    description: 'get Documents By ExchangeVehicles',
    accepts: [
      { arg: 'leadId', type: 'string', required: true },
    ],
    http: { path: '/getExchangeVehiclesImages/:leadId', verb: 'get' },
    returns: { arg: 'lead', type: 'lead', root: true },
  });

  /**
   * To get documents of exchanged vehicles
   * @param  {leadId}   leadId
   * @param  {Function} callback
   * @return {List} List of Document
   * @author Lingareddy S
   */
  document.getExchangeVehiclesImages = (leadId, callback) => {
    const documentService = new DocumentService();
    documentService.getExchangeVehiclesImages(leadId, callback);
  };
};
