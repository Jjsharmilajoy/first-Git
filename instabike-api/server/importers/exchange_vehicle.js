const logger = require('winston');

const BaseImporter = require('../importers/base_importer.js');
const exchangeVehiclesMappingJson = require('../../server/importers/mappings/exchange-vehicles.json');

const filePath = '/server/importers/data/hero_motor_corp/exchange_vehicles.xlsx';

/**
 * @author Ponnuvel G
 */
class ExchangeVehicle {
  static async importData() {
    try {
      await ExchangeVehicle.importByMappingJson(exchangeVehiclesMappingJson);
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

ExchangeVehicle.importData();
