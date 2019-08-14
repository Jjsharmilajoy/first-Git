const logger = require('winston');

const BaseImporter = require('../importers/base_importer.js');
const variantsMappingJson = require('../../server/importers/mappings/variants.json');

const filePath = '/server/importers/data/apr9/suzuki_variant_specs.xlsx';

/**
 * @author Ramanavel Selvaraju
 */
class SuzukiManufaturer {
  static async importData() {
    try {
      await SuzukiManufaturer.importByMappingJson(variantsMappingJson);
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
}

SuzukiManufaturer.importData();
