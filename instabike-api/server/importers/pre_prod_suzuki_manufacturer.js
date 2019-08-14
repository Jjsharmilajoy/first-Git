const logger = require('winston');

const BaseImporter = require('../importers/base_importer.js');
const DealerImporter = require('../importers/dealer_importer');
const zonesMappingJson = require('../../server/importers/mappings/zones.json');
const statesMappingJson = require('../../server/importers/mappings/states.json');
const citiesMappingJson = require('../../server/importers/mappings/cities.json');
const vehiclesMappingJson = require('../../server/importers/mappings/vehicles.json');
const variantsMappingJson = require('../../server/importers/mappings/variants.json');
const variantColorsMappingJson = require('../../server/importers/mappings/variant-colors.json');
const accessoriesMappingJson = require('../../server/importers/mappings/accessories.json');
/* const dealerAccessoriesMappingJson
  = require('../../server/importers/mappings/dealer_accessories.json'); */
const dealerCategoriesMappingJson = require('../../server/importers/mappings/dealer-categories.json');
const dealersMappingJson = require('../../server/importers/mappings/dealers.json');
const dealerManagersMappingJson = require('../../server/importers/mappings/dealer-managers.json');
const manufacturerMappingJson = require('../../server/importers/mappings/manufacturers.json');
const manufacturerUsersMappingJson = require('../../server/importers/mappings/manufacturer-users.json');
const manufacturerCityHeadJson = require('../../server/importers/mappings/manufacturer-city-users.json');
const manufacturerStateHeadJson = require('../../server/importers/mappings/manufacturer-state-users.json');
const manufacturerZoneHeadJson = require('../../server/importers/mappings/manufacturer-zone-users.json');
const vehiclePriceMappingJson = require('../../server/importers/mappings/vehicle-price.json');
const galleryMappingJson = require('../../server/importers/mappings/galleries.json');
const vehicleFeaturesMappingJson = require('../../server/importers/mappings/vehicle-features.json');
const vehicleInsuranceMappingJson = require('../../server/importers/mappings/vehicle-insurances.json');
const manufacturerTargetMappingJson = require('../../server/importers/mappings/manufacturer-targets.json');
const financierInterestDetailsMappingJson = require('../../server/importers/mappings/financier-interest-details.json');
const financierCityHeadMappingJson = require('../../server/importers/mappings/financier-city-head.json');
const financierBranchesMappingJson = require('../../server/importers/mappings/financier-branches.json');
const compareVehicleMappingJson = require('../../server/importers/mappings/compare_vehicle_lookup.json');

const filePath = '/server/importers/data/suzuki/financier-interest-details.xlsx';

/**
 * @author Ramanavel Selvaraju
 */
class SuzukiManufaturer {
  static async importData() {
    try {
      await SuzukiManufaturer.importByMappingJson(manufacturerMappingJson);
      await SuzukiManufaturer.importByMappingJson(zonesMappingJson);
      await SuzukiManufaturer.importByMappingJson(statesMappingJson);
      await SuzukiManufaturer.importByMappingJson(citiesMappingJson);
      await SuzukiManufaturer.importByMappingJson(vehiclesMappingJson);
      await SuzukiManufaturer.importByMappingJson(variantsMappingJson);
      await SuzukiManufaturer.importByMappingJson(variantColorsMappingJson);
      await SuzukiManufaturer.importByMappingJson(dealerCategoriesMappingJson);
      await SuzukiManufaturer.importByMappingJson(dealersMappingJson);
      await SuzukiManufaturer.importByMappingJson(accessoriesMappingJson);
      await SuzukiManufaturer.importByMappingJson(galleryMappingJson);
      await SuzukiManufaturer.importUserByMappingJson(dealerManagersMappingJson, 'DEALER_MANAGER');
      await SuzukiManufaturer.importUserByMappingJson(manufacturerUsersMappingJson, 'MANUFACTURER_COUNTRY_HEAD');
      await SuzukiManufaturer.importUserByMappingJson(manufacturerZoneHeadJson, 'MANUFACTURER_ZONE_HEAD');
      await SuzukiManufaturer.importUserByMappingJson(manufacturerStateHeadJson, 'MANUFACTURER_STATE_HEAD');
      await SuzukiManufaturer.importUserByMappingJson(manufacturerCityHeadJson, 'MANUFACTURER_CITY_HEAD');
      await SuzukiManufaturer.importUserByMappingJson(financierCityHeadMappingJson, 'FINANCIER_CITY_HEAD');
      await SuzukiManufaturer.importByMappingJson(vehiclePriceMappingJson);
      await SuzukiManufaturer.importByMappingJson(vehicleFeaturesMappingJson);
      await SuzukiManufaturer.importByMappingJson(vehicleInsuranceMappingJson);
      await SuzukiManufaturer.importByMappingJson(manufacturerTargetMappingJson);
      await SuzukiManufaturer.importByMappingJson(financierInterestDetailsMappingJson);
      await SuzukiManufaturer.importByMappingJson(financierBranchesMappingJson);
      /* await SuzukiManufaturer.importByMappingJson(dealerAccessoriesMappingJson); */
      await SuzukiManufaturer.importByMappingJson(compareVehicleMappingJson);
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

SuzukiManufaturer.importData();
