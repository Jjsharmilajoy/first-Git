const logger = require('winston');

const BaseImporter = require('../importers/base_importer.js');
const DealerImporter = require('../importers/dealer_importer');

const leadMappingJson = require('../../server/importers/mappings/leads.json');
const leadDetailMappingJson = require('../../server/importers/mappings/lead_details.json');
const citiesMappingJson = require('../../server/importers/mappings/cities.json');
const manufacturerTargetMappingJson = require('../../server/importers/mappings/manufacturer-targets.json');
const dealersMappingJson = require('../../server/importers/mappings/dealers.json');
const dealerManagersMappingJson = require('../../server/importers/mappings/dealer-managers.json');

const leadNew = '/server/importers/data/leads_2018.xlsx';
const leadDetailNew = '/server/importers/data/lead_details_2018.xlsx';
const leadOld = '/server/importers/data/leads_2017.xlsx';
const leadDetailOld = '/server/importers/data/lead_details_2017.xlsx';
const demoData = '/server/importers/data/demo_data.xlsx';
const activeLeadNew = '/server/importers/data/leads_active_2018.xlsx';

class DemoTestDataImporter {
  static async importData() {
    try {
      await DemoTestDataImporter.importByMappingJson(demoData, citiesMappingJson);
      await DemoTestDataImporter.importByMappingJson(leadOld, leadMappingJson);
      await DemoTestDataImporter.importByMappingJson(leadDetailOld, leadDetailMappingJson);
      await DemoTestDataImporter.importByMappingJson(leadNew, leadMappingJson);
      await DemoTestDataImporter.importByMappingJson(leadDetailNew, leadDetailMappingJson);
      await DemoTestDataImporter.importByMappingJson(activeLeadNew, leadMappingJson);
      await DemoTestDataImporter.importByMappingJson(demoData, dealersMappingJson);
      await DemoTestDataImporter.importUserByMappingJson(demoData, dealerManagersMappingJson, 'DEALER_MANAGER');
      await DemoTestDataImporter.importByMappingJson(demoData, manufacturerTargetMappingJson);
    } catch (e) {
      logger.error(e);
    }
  }

  static importByMappingJson(filePath, mappingJson) {
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

  static importUserByMappingJson(filePath, mappingJson, role) {
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

DemoTestDataImporter.importData();
