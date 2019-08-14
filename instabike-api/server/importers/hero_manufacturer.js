const logger = require('winston');

const BaseImporter = require('../importers/base_importer.js');
const DealerImporter = require('../importers/dealer_importer');
const vehiclesMappingJson = require('../../server/importers/mappings/vehicles.json');
const variantsMappingJson = require('../../server/importers/mappings/variants.json');
const manufacturerMappingJson = require('../../server/importers/mappings/manufacturers.json');
const variantColorsMappingJson = require('../../server/importers/mappings/variant-colors.json');

const filePath = '/server/importers/data/apr4/hero-apr4.xlsx';

/**
 * @author Ponnuvel G
 */
class HeroManufaturer {
  static async importData() {
    try {
      await HeroManufaturer.importByMappingJson(manufacturerMappingJson);
      await HeroManufaturer.importByMappingJson(vehiclesMappingJson);
      await HeroManufaturer.importByMappingJson(variantsMappingJson);
      await HeroManufaturer.importByMappingJson(variantColorsMappingJson);
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

  static importDealerByMappingJson(mappingJson) {
    return new Promise((resolve, reject) => {
      const dealerImporter = new DealerImporter(filePath, mappingJson, 'DEALER_MANAGER');
      dealerImporter.import((err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  static importManufacturerUserByMappingJson(mappingJson) {
    return new Promise((resolve, reject) => {
      const dealerImporter = new DealerImporter(filePath, mappingJson, 'MANUFACTURER');
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

HeroManufaturer.importData();
