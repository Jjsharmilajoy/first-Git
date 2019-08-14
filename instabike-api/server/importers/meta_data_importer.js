const logger = require('winston');

const BaseImporter = require('../importers/base_importer.js');
const DealerImporter = require('../importers/dealer_importer');
//const countriesMappingJson = require('../../server/importers/mappings/countries.json');
//const financierMappingJson = require('../../server/importers/mappings/financiers.json');
const lostReasonsMappingJson = require('../../server/importers/mappings/lost-reasons.json');

const filePath = '/server/importers/data/meta_data_new_lost_cat.xlsx';

/**
 * @author Ramanavel Selvaraju
 */
class MetaDataImporter {
  static async importData() {
    try {
      // await MetaDataImporter.importByMappingJson(countriesMappingJson);
      // await MetaDataImporter.importByMappingJson(financierMappingJson);
       await MetaDataImporter.importByMappingJson(lostReasonsMappingJson);
    } catch (e) {
      logger.error(e);
    }
  }

  static importByMappingJson(mappingJson) {
    return new Promise((resolve, reject) => {
      const baseImporter = new BaseImporter(filePath, mappingJson);
      baseImporter.import((err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  static importUserByMappingJson(mappingJson, role) {
    return new Promise((resolve, reject) => {
      const dealerImporter = new DealerImporter(filePath, mappingJson, role);
      dealerImporter.import((err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }
}

MetaDataImporter.importData();
