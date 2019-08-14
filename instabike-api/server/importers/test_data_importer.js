const logger = require('winston');

const BaseImporter = require('../importers/base_importer.js');
const DealerImporter = require('../importers/dealer_importer');
const dealerTargetMappingJson = require('../../server/importers/mappings/dealer-targets.json');
const teamHeadMappingJson = require('../../server/importers/mappings/dealer-team-head.json');
const financierTeamHeadMappingJson = require('../../server/importers/mappings/financier-team-head.json');
const financierSalesMappingJson = require('../../server/importers/mappings/financier-executive.json');
const financierTeamMappingJson = require('../../server/importers/mappings/financier-team.json');
const financierDealerMappingJson = require('../../server/importers/mappings/financier-dealers.json');
const financierTeamMembersMappingJson = require('../../server/importers/mappings/financier-team-members.json');
const dealerSalesMappingJson = require('../../server/importers/mappings/dealer-sales-users.json');
const leadUserMappingJson = require('../../server/importers/mappings/lead-users.json');
const leadMappingJson = require('../../server/importers/mappings/leads.json');
const leadDetailMappingJson = require('../../server/importers/mappings/lead_details.json');
const proformaInvoiceMappingJson = require('../../server/importers/mappings/proforma_invoices.json');
const financierLeadMappingJson = require('../../server/importers/mappings/financier-leads.json');
const manufacturerFinanciersMappingJson = require('../../server/importers/mappings/manufacturer-financier.json');
const manufacturerFinanciersOrderMappingJson = require('../../server/importers/mappings/manufacturer-financier-order.json');
const dealerFinanciersMappingJson = require('../../server/importers/mappings/dealer-financier.json');
const financierTargetsMappingJson = require('../../server/importers/mappings/financier-targets.json');

const filePath = '/server/importers/data/suzuki_test_data.xlsx';

/**
 * @author Ramanavel Selvaraju
 */
class TestDataImporter {
  static async importData() {
    try {
      await TestDataImporter.importDealerUserByMappingJson(teamHeadMappingJson, 'DEALER_TEAM_HEAD');
      await TestDataImporter.importDealerUserByMappingJson(dealerSalesMappingJson, 'DEALER_SALES');
      await TestDataImporter.importByMappingJson(dealerTargetMappingJson);
      await TestDataImporter.importByMappingJson(manufacturerFinanciersMappingJson);
      await TestDataImporter.importByMappingJson(manufacturerFinanciersOrderMappingJson);
      await TestDataImporter.importByMappingJson(dealerFinanciersMappingJson);
      await TestDataImporter.importDealerUserByMappingJson(financierTeamHeadMappingJson, 'FINANCIER_TEAM_HEAD');
      await TestDataImporter.importByMappingJson(financierTeamMappingJson);
      await TestDataImporter.importDealerUserByMappingJson(financierSalesMappingJson, 'FINANCIER_SALES');
      await TestDataImporter.importByMappingJson(financierTeamMembersMappingJson);
      await TestDataImporter.importByMappingJson(financierDealerMappingJson);
      await TestDataImporter.importByMappingJson(financierTargetsMappingJson);
      await TestDataImporter.importDealerUserByMappingJson(leadUserMappingJson, 'CUSTOMER');
      await TestDataImporter.importByMappingJson(leadMappingJson);
      await TestDataImporter.importByMappingJson(leadDetailMappingJson);
      await TestDataImporter.importByMappingJson(proformaInvoiceMappingJson);
      await TestDataImporter.importByMappingJson(financierLeadMappingJson);
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

  static importDealerUserByMappingJson(mappingJson, role) {
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

TestDataImporter.importData();
