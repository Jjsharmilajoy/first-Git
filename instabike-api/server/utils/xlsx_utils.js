const xlsx = require('xlsx');
const path = require('path');
const InstaBikeError = require('../error/instabike_error');
const ErrorConstants = require('./constants/error_constants');

module.exports = class XlsxUtils {
  /**
   * Validates the file extension and the sheet name in the loopkup provided.
   * returns coneverted json object from given xlsx file path.
   *
   * @param {String} filePath xlsx file path name
   * @param {String} sheetName Sheet name to extarct the values as json
   * @author Siva Sankari P
   */
  static sheetToJSON(filePath, sheetName) {
    return new Promise((resolve, reject) => {
      try {
        if (path.extname(filePath) !== '.xlsx') {
          throw new InstaBikeError(ErrorConstants.ERRORS.IMPORT_XLSX.INVALID_TYPE);
        }
        const workBook = xlsx.readFile(filePath);
        if (!workBook.SheetNames.includes(sheetName)) {
          throw new InstaBikeError(ErrorConstants.ERRORS.IMPORT_XLSX.SHEET_NOT_FOUND);
        }
        const json = xlsx.utils.sheet_to_json(workBook.Sheets[sheetName]);
        resolve(json);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * To get the column Names from the given sheet
   *
   * @param filePath
   * @param sheetName
   * @returns {Promise<any>}
   * @author Siva Sankari P
   */
  static getSheetHeaders(filePath, sheetName) {
    return new Promise((resolve, reject) => {
      try {
        if (path.extname(filePath) !== '.xlsx') {
          throw new InstaBikeError(ErrorConstants.ERRORS.IMPORT_XLSX.INVALID_TYPE);
        }
        const workBook = xlsx.readFile(filePath);
        if (!workBook.SheetNames.includes(sheetName)) {
          throw new InstaBikeError(ErrorConstants.ERRORS.IMPORT_XLSX.SHEET_NOT_FOUND);
        }
        const json = xlsx.utils.sheet_to_json(workBook.Sheets[sheetName], { header: 1 })[0];
        resolve(json);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Export JSON to XLSX
   * @param filePath
   * @param sheetName
   * @param data
   * @author Siva Sankari P
   */
  static appendExportToXLSX(filePath, sheetName, data) {
    return new Promise((resolve, reject) => {
      try {
        const errorWorkBook = xlsx.readFile(filePath);
        if (path.extname(filePath) !== '.xlsx') {
          throw new InstaBikeError(ErrorConstants.ERRORS.IMPORT_XLSX.INVALID_TYPE);
        }
        const worksheet = xlsx.utils.json_to_sheet(data);
        if (errorWorkBook.SheetNames.includes(sheetName)) {
          throw new InstaBikeError(ErrorConstants.ERRORS.IMPORT_XLSX.SHEET_EXIST);
        }
        errorWorkBook.SheetNames.push(sheetName);
        errorWorkBook.Sheets[sheetName] = worksheet;
        xlsx.writeFile(errorWorkBook, filePath, { type: 'string' });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
};
