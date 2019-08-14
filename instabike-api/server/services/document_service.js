/* eslint-disable no-restricted-syntax */
/* eslint-disable class-methods-use-this */
/**
 * Document service handles methods such as upload, download, remove a document and
 * to mark a document as verified
 */

// import dependencies
const path = require('path');
const lodash = require('lodash');

// import files
const BaseService = require('../services/base_service');
const loopback = require('../server.js');
const InstabikeError = require('../error/instabike_error');
const ErrorConstants = require('../utils/constants/error_constants');
const ImageProcessor = require('../utils/image_processor');

const app = loopback.dataSources.postgres.models;
const postgresDs = loopback.dataSources.postgres;


/**
 * @author Ponnuvel G
 */
module.exports = class DocumentService extends BaseService {
  constructor(id, currentUser) {
    super(currentUser);
    this.id = id;
    this.currentUser = currentUser;
  }
  /**
   * Upload Dealer and Financier Documents to Azure
   * @param  {Object}   req
   * @param  {String}   userId
   * @param  {Function} callback
   * @return {Document} Document
   * @author Ponnuvel G
   */
  async upload(req, userId, callback) {
    this.userId = userId;
    try {
      const fileTypes = ['png', 'jpg', 'jpeg'];
      if (req.files.length === 0) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.DOCUMENT.NOT_FOUND));
      }
      const isImage = lodash.includes(
        fileTypes,
        path.extname(req.files[0].originalname).slice(1).toLowerCase(),
      );
      await ImageProcessor.upload(req.files[0], userId, isImage);
      let document = {};
      document.customer_user_id = this.userId;
      document.url = `${process.env.AZURE_DOCS_CONTAINER}/${userId}`;
      document.file_name = req.files[0].originalname;
      const lead = JSON.parse(req.body.lead);
      document.item_type_id = lead.lead_id;
      document.item_type_name = lead.type;
      document.name = lead.name;
      document = await app.Document.create(document);
      return callback(null, document);
    } catch (e) {
      return callback(new InstabikeError(e));
    }
  }
  /**
   * OCR CODE EXTRACTION
   * @author Lingareddy
   *    */
  async OcrUpload(req, callback) {
    try {
      const fileTypes = ['png', 'jpg', 'jpeg'];
      const folders = ['original', 'small'];
      let DeleteDocs = '';
      if (req.files.length === 0) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.DOCUMENT.NOT_FOUND));
      }
      const isImage = lodash.includes(
        fileTypes,
        path.extname(req.files[0].originalname).slice(1).toLowerCase(),
      );
      const res = await ImageProcessor.OcrUpload(req.files[0], isImage);
      const documentPath = res[0].name;
      let ocrRes = '';
      const fileName = `https://${process.env.AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/${process.env.AZURE_CONTAINER}/${documentPath}`;
      let reqOBJ;
      if (req.body.type === 'Aadhar Card' || req.body.type === 'Pan Card') {
        if (req.body.type === 'Aadhar Card') {
          reqOBJ = 'readAadhar';
        }
        if (req.body.type === 'Pan Card') {
          reqOBJ = 'readPAN';
        }
        ocrRes = await ImageProcessor.ocrCall(reqOBJ, fileName);
      }
      if (req.body.type === 'Driving License') {
        ocrRes = await ImageProcessor.drivingLicenseOCR(fileName);
      }
      for (const docPath of folders) {
        DeleteDocs = await DocumentService.removeOcrDocs(`${process.env.AZURE_DOCS_CONTAINER}/${req.files[0].originalname}/${docPath}/${req.files[0].originalname}`, callback);
      }
      ocrRes.isDocDeleted = DeleteDocs;
      return callback(null, ocrRes);
    } catch (e) {
      return callback(new InstabikeError(e));
    }
  }

  /**
   * Delete Document from Azure
   * @param  {String}   documentId
   * @param  {Function} callback
   * @return {Document} Document
   * @author Ponnuvel G
   */
  async remove(callback) {
    try {
      const document = await app.Document.findById(this.id);
      if (!document) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.DOCUMENT.NOT_FOUND));
      }
      await ImageProcessor.remove(document.url);
      await app.Document.destroyById(this.id);
      await app.Document.updateAll({
        customer_user_id: document.customer_user_id,
        item_type_id: document.item_type_id,
        item_type_name: document.item_type_name,
        name: document.name,
      }, {
        is_osv_verified: false,
      });
      return callback(null, document);
    } catch (e) {
      return callback(new InstabikeError(e));
    }
  }
  static async removeOcrDocs(fileName, callback) {
    try {
      return await ImageProcessor.remove(fileName);
    } catch (e) {
      return callback(new InstabikeError(e));
    }
  }


  /**
   * Download Document from Azure
   * @param  {Object}   ctx
   * @param  {String}   documentId
   * @param  {Function} callback
   * @return {Stream}
   * @author Ponnuvel G
   */
  async download(res, size, callback) {
    try {
      const document = await app.Document.findById(this.id);
      if (!document) {
        return callback(new InstabikeError(ErrorConstants.ERRORS.DOCUMENT.NOT_FOUND));
      }
      const response = await ImageProcessor.download(res, `${document.url}/${size}/${document.file_name}`);
      return callback(null, response);
    } catch (e) {
      return callback(new InstabikeError(e));
    }
  }

  /**
   * Mark list of document as OSV verified
   * @param  {List}   documentIds
   * @param  {Function} callback
   * @return {List} List of Document
   * @author Ponnuvel G
   */
  async markAsVerified(documentIds, callback) {
    this.documents = [];
    try {
      for (let i = 0; i < documentIds.length; i += 1) {
        const document = await app.Document.findById(documentIds[i]);
        await document.updateAttributes({
          is_osv_verified: true,
        });
        this.documents.push(document);
      }
      return callback(null, this.documents);
    } catch (e) {
      return callback(new InstabikeError(e));
    }
  }

  /**
   * Return Documents of exchanged vehicles
   * @param  {String}   leadId
   * @return {Document} Document
   * @author Lingareddy S
   */

  async getExchangeVehiclesImages(leadId, callback) {
    try {
      const data1 = await app.Document.find({
        where: {
          item_type_id: leadId, name: 'exchange-vehicle',
        },
        fields: ['id', 'name', 'url', 'file_name', 'item_type_id', 'item_type_name', 'is_osv_verified',
          'created_at', 'updated_at', 'customer_user_id'],
      });
      return callback(null, data1);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }
};
