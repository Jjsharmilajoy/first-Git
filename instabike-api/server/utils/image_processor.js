/* eslint-disable valid-typeof */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-nested-ternary */
const azure = require('azure-storage');
const toStream = require('buffer-to-stream');
const request = require('request');
const InstabikeError = require('../error/instabike_error');
const https = require('https');
const path = require('path');
const sharp = require('sharp');
const axios = require('axios');


module.exports = class ImageProcessor {
  /**
   * Update
   * @param  {Object} file
   * @param  {string} dir
   * @return {Object} Azure Blob Result
   */
  static async upload(file, dir, isImage) {
    try {
      const stream = toStream(file.buffer);
      let image = null;
      if (isImage) {
        const resizer = sharp().resize(200);
        image = stream.pipe(resizer);
      }
      let fileName = `${process.env.AZURE_DOCS_CONTAINER}/${dir}/original/${file.originalname}`;
      const response = [];
      const original = await ImageProcessor.send(stream, fileName, file.size);
      response.push(original);
      if (isImage) {
        fileName = `${process.env.AZURE_DOCS_CONTAINER}/${dir}/small/${file.originalname}`;
        const small = await ImageProcessor.send(image, fileName, file.size);
        response.push(small);
      }
      return response;
    } catch (error) {
      return new InstabikeError(error);
    }
  }
  /**
   * OCR CODE EXTRACTION
   *    */
  static async OcrUpload(file, isImage) {
    try {
      const stream = toStream(file.buffer);
      let image = null;
      if (isImage) {
        const resizer = sharp().resize(200);
        image = stream.pipe(resizer);
      }
      let fileName = `${process.env.AZURE_DOCS_CONTAINER}/${file.originalname}/original/${file.originalname}`;
      const response = [];

      const original = await ImageProcessor.send(stream, fileName, file.size);

      response.push(original);


      if (isImage) {
        fileName = `${process.env.AZURE_DOCS_CONTAINER}/${file.originalname}/small/${file.originalname}`;
        const small = await ImageProcessor.send(image, fileName, file.size);
        response.push(small);
      }

      return response;
    } catch (error) {
      return new InstabikeError(error);
    }
  }

  static async ocrCall(req, image) {
    let promise;
    const resObj = {
      name: '',
      gender: '',
      pinCode: '',
      licenseNo: '',
      isDocDeleted: '',
      ocrFailed: false,
    };
    // eslint-disable-next-line prefer-const
    promise = new Promise(((resolve, reject) => {
      const options = {
        url: `${process.env.OCR_HOST}/${req}`,
        method: 'POST',
        headers: {
          appId: `${process.env.OCR_APP_ID}`,
          appKey: `${process.env.OCR_APP_KEY}`,
        },
      };
      const r = request(options, (err, resp, body) => {
        if (err) {
          // eslint-disable-next-line prefer-promise-reject-errors
          reject({ err });
        } else {
          resolve(body);
        }
      });

      const form = r.form();
      const extension = image.split('.').pop();
      const type = extension === 'pdf' ? 'pdf' : 'image';
      form.append(type, request(image));
      form.append('outputImageUrl', 'no');
    }));
    const result = await promise;

    if (result) {
      let resultdata;
      // eslint-disable-next-line prefer-const
      resultdata = JSON.parse(result);

      if (resultdata.status === 'success') {
        if (resultdata && resultdata.result[0] &&
          resultdata.result[0].details && resultdata.result[0].details.name) {
          resObj.name = resultdata.result[0].details.name;
        } else if (resultdata && resultdata.result[1] &&
          resultdata.result[1].details && resultdata.result[1].details.name) {
          resObj.name = resultdata.result[1].details.name;
        }
        if (resultdata.result[0].type !== 'pan') {
          if (resultdata && resultdata.result[0] && resultdata.result[0].details
            && resultdata.result[0].details.address_split) {
            resObj.pinCode = resultdata.result[0].details.address_split.pin;
          } else if (resultdata && resultdata.result[1] && resultdata.result[1].details
            && resultdata.result[1].details.address_split) {
            resObj.pinCode = resultdata.result[1].details.address_split.pin;
          }

          if (resultdata && resultdata.result[0] &&
            resultdata.result[0].details && resultdata.result[0].details.gender) {
            resObj.gender = resultdata.result[0].details.gender;
          } else if (resultdata && resultdata.result[1] &&
            resultdata.result[1].details && resultdata.result[1].details.gender) {
            resObj.gender = resultdata.result[1].details.gender;
          }
        }
      } else {
        resObj.ocrFailed = true;
      }

      return resObj;
    }
    return resObj;
  }
  static async drivingLicenseOCR(image) {
    const resObj = {
      name: '',
      gender: '',
      pinCode: '',
      licenseNo: '',
      isDocDeleted: false,
      ocrFailed: false,
    };
    await axios.post(
      `${process.env.AUTONOM_HOST}`,
      {
        url: image,
      },
      {
        headers: {
          'x-api-key':
            `${process.env.AUTONOM_APP_KEY}`,
          version:
            `${process.env.AUTONOM_APP_VERSION}`,
        },
      },
    )
      .then((response) => {
        if (response.data) {
          let license;
          if (typeof response.data !== 'object') {
            license = JSON.parse(response.data.data.info);
          } else {
            license = response.data.data.info;
            resObj.name = license.name ? license.name.toString().replace(',', ' ') : '';
            license.address !== null ?
              (typeof (license.address[license.address.length - 1]) === Number) ?
                (resObj.pinCode = license.address[license.address.length - 1]) : '' : '';
            resObj.licenseNo = response.data.data.info.dl_id;
            resObj.name === '' ? resObj.ocrFailed = true : resObj.ocrFailed;
          }
        } else {
          // OCR RESPOSE FAILURE CASE
          resObj.ocrFailed = true;
        }
      });

    return resObj;
  }
  /**
   * Send file to Azure
   * @param {Stream} stream - file stream
   * @param {String} fileName - name of the file
   * @param {Integer} size - size of the file
   */
  static send(stream, fileName, size) {
    return new Promise((resolve, reject) => {
      const blobService = azure.createBlobService(
        process.env.AZURE_STORAGE_ACCOUNT,
        process.env.AZURE_STORAGE_ACCESS_KEY,
      );
      blobService.createBlockBlobFromStream(
        process.env.AZURE_CONTAINER, fileName,
        stream, size, {}, (error, result) => {
          if (error) { return reject(new InstabikeError(error)); }
          return resolve(result);
        },
      );
    });
  }

  /**
   * Remove
   * @param  {String} url
   * @return {Promise} Removed file details
   * @author Ponnuvel G
   */
  static remove(url) {
    return new Promise((resolve, reject) => {
      const blobService = azure.createBlobService(
        process.env.AZURE_STORAGE_ACCOUNT,
        process.env.AZURE_STORAGE_ACCESS_KEY,
      );
      blobService.deleteBlobIfExists(process.env.AZURE_CONTAINER, url, (error, result) => {
        if (error) return reject(new InstabikeError(error));
        return resolve(result);
      });
    });
  }


  /**
   * Download
   * @param  {Object} response
   * @param  {string} url
   * @return {Object} Read Stream
   */
  static download(response, url) {
    return new Promise(((resolve, reject) => {
      const blobService = azure.createBlobService(
        process.env.AZURE_STORAGE_ACCOUNT,
        process.env.AZURE_STORAGE_ACCESS_KEY,
      );
      blobService.createReadStream(process.env.AZURE_CONTAINER, url).pipe(response);
      response.on('error', error => reject(new InstabikeError(error)));
      response.on('end', () => resolve(response));
    }));
  }

  /**
   * Download Pdf and convert as base64 string
   * @param  {Vehicle}  vehicle
   * @return {Objcet}
   */
  static downloadPdf(vehicle) {
    return new Promise((resolve, reject) => {
      https.get(vehicle.brochure_url, (stream) => {
        const data = [];
        stream.on('data', (chunk) => {
          data.push(chunk);
        });
        stream.on('end', async () => {
          const buffer = Buffer.concat(data);
          const attachment = {};
          attachment['Content-Type'] = 'application/pdf';
          attachment.Filename = path.basename(vehicle.brochure_url);
          attachment.Content = buffer.toString('base64');
          return resolve(attachment);
        });
        stream.on('error', error => reject(error));
      });
    });
  }
};
