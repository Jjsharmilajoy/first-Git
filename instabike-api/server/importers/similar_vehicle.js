const logger = require('winston');

const BaseImporter = require('../importers/base_importer.js');
const similarVehiclesMappingJson = require('../../server/importers/mappings/similar-vehicles.json');

const filePath = '/server/importers/data/hero_motor_corp/similar_vehicles.xlsx';

/**
 * @author Ponnuvel G
 */
class SimilarVehicle {
  static async importData() {
    try {
      await SimilarVehicle.importByMappingJson(similarVehiclesMappingJson);
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

SimilarVehicle.importData();
