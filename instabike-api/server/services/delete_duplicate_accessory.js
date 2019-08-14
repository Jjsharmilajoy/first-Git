/**
 * Delete duplicate accessory : this service is run to delete all redundant accessory
 * added in the database using importer by mistake.
 * This also modifies the corresponding associations such as dealer-accessory,
 * proforma invoice, etc.
 */

const loopback = require('../server.js');
const InstabikeError = require('../error/instabike_error');
const lodash = require('lodash');
const logger = require('winston');

const app = loopback.dataSources.postgres.models;
const postgresDs = loopback.dataSources.postgres;

/**
 * @author Jaiyashree Subramanian
 */
/* eslint class-methods-use-this: ["error",
  { "exceptMethods": ["updateOrDeleteDealerAccessory", "sendEmailForTargets"] }] */
class DeleteAccessories {
  static async removeDuplicateAccessories() {
    try {
      await DeleteAccessories.trimAccessoryData();
      const dulpicateAccessories = await DeleteAccessories.getDuplicateAccessory();
      await DeleteAccessories.findNewAccessories(dulpicateAccessories);
    } catch (e) {
      throw (new InstabikeError(e));
    }
  }

  /**
   * This method updates all accessory names removing the initial and trailing white
   * spaces (if any) is added by running importer.
   * @author Jaiyashree Subramanian
   */
  static trimAccessoryData() {
    try {
      return new Promise((resolve, reject) => {
        const query = `
          UPDATE accessories set item_code = trim(trailing ' ' from item_code),
          name = trim(trailing ' ' from name)
        `;
        const params = [];
        postgresDs.connector.query(query, params, (err, result) => {
          if (err) reject(new InstabikeError(err));
          resolve(result);
        });
      });
    } catch (error) {
      logger.info('error in trimAccessoryData -> ', error);
      throw (new InstabikeError(error));
    }
  }

  /**
   * This method collects the set of accessories that are duplicated.
   *
   * @author Jaiyashree Subramanian
   */
  static getDuplicateAccessory() {
    try {
      return new Promise((resolve, reject) => {
        const query = `
          select id, name from accessories a where name IN (
            select name from (
            SELECT name, item_code, vehicle_id, COUNT( name )  FROM accessories
            WHERE dealer_id is null
            GROUP BY name, item_code, dealer_id, vehicle_id
            HAVING COUNT( name )> 1
            ) t1
          ) and item_code IN (
            select item_code from (
            SELECT name, item_code, vehicle_id, COUNT( name )  FROM accessories
            WHERE dealer_id is null
            GROUP BY name, item_code, dealer_id, vehicle_id
            HAVING COUNT( name )> 1
            ) t2
          ) and vehicle_id IN (
            select vehicle_id from (
            SELECT name, item_code, vehicle_id, COUNT( name )  FROM accessories
            WHERE dealer_id is null
            GROUP BY name, item_code, dealer_id, vehicle_id
            HAVING COUNT( name )> 1
            ) t3
          ) and id = id order by name DESC `;
        const params = [];
        postgresDs.connector.query(query, params, (err, result) => {
          if (err) reject(new InstabikeError(err));
          resolve(result);
        });
      });
    } catch (error) {
      logger.info('error in getDuplicateAccessory -> ', error);
      throw (new InstabikeError(error));
    }
  }

  /**
   * This method picks one set of unique accessory as new and the other redundant ones as
   * repeated-accessories
   * @author Jaiyashree Subramanian
   */
  static async findNewAccessories(dulpicateAccessories) {
    try {
      const newAccesoryIds = [];
      let repeatedAccessoryIds = [];
      const accessoryMapping = {};
      let i = 0;
      for (i = 0; i < dulpicateAccessories.length; i += 1) {
        const dulpicateAccessory = dulpicateAccessories[i];
        const filterResult = dulpicateAccessories.filter(eachAccessory =>
          eachAccessory.name === dulpicateAccessory.name &&
          eachAccessory.item_code === dulpicateAccessory.item_code &&
          eachAccessory.vehicle_id === dulpicateAccessory.vehicle_id);
        filterResult.sort((a, b) => (a.id - b.id));
        if (newAccesoryIds.indexOf(filterResult[0].id) < 0) {
          const newAccesoryKey = filterResult[0].id;
          newAccesoryIds.push(newAccesoryKey);
          filterResult.splice(0, 1);
          repeatedAccessoryIds = repeatedAccessoryIds.concat(lodash.map(filterResult, 'id'));
          accessoryMapping[newAccesoryKey] = repeatedAccessoryIds;
        }
      }
      await DeleteAccessories
        .updateOrDeleteDealerAccessory(newAccesoryIds, repeatedAccessoryIds, accessoryMapping);
    } catch (error) {
      logger.info('error in findNewAccessories -> ', error);
      throw (new InstabikeError(error));
    }
  }

  /**
   * This method picks all repeated accessories and updates all its accociated entries
   * in dealer-accessory, proforma-invoice and associates them with the new-accessory-id.
   * Then deletes all the repeated-accessories.
   *
   * @author Jaiyashree Subramanian
   */
  static async updateOrDeleteDealerAccessory(
    newAccesoryIds,
    repeatedAccessoryIds,
    accessoryMapping,
  ) {
    try {
      let i = 0;
      let j = 0;
      const dealers = await app.Dealer.find({ where: {} });
      for (j = 0; j < dealers.length; j += 1) {
        for (i = 0; i < newAccesoryIds.length; i += 1) {
          const newDealerAccessory = await app.DealerAccessory.find({
            where: {
              accessory_id: newAccesoryIds[i],
              dealer_id: dealers[j].id,
            },
          });
          const repeatedDealerAccessory = await app.DealerAccessory.find({
            where: {
              accessory_id: { inq: accessoryMapping[newAccesoryIds[i]] },
              dealer_id: dealers[j].id,
            },
          });
          // logger.info(`*** newDealerAccessory.length = ${newDealerAccessory.length},
            // repeatedDealerAccessory.length = ${repeatedDealerAccessory.length} ***`);
          if (newDealerAccessory.length && repeatedDealerAccessory.length) {
            const repeatedDealerAccessoryIds = lodash.map(repeatedDealerAccessory, 'id');
            await app.ProformaInvoiceAccessory.updateAll({
              dealer_accessory_id: { inq: repeatedDealerAccessoryIds },
            }, {
              dealer_accessory_id: newDealerAccessory[0].id,
            });
            await app.DealerAccessory.destroyAll({
              accessory_id: { inq: accessoryMapping[newAccesoryIds[i]] },
              dealer_id: dealers[j].id,
            });
          } else if (!newDealerAccessory.length && repeatedDealerAccessory.length) {
            const repeatedDealerAccessoryIds = lodash.map(repeatedDealerAccessory, 'id');
            let newDealerAccessoryObj = repeatedDealerAccessory[0];
            newDealerAccessoryObj = JSON.parse(JSON.stringify(newDealerAccessoryObj));
            delete newDealerAccessoryObj.id;
            newDealerAccessoryObj.accessory_id = newAccesoryIds[i];
            newDealerAccessoryObj = await app.DealerAccessory.create(newDealerAccessoryObj);
            await app.ProformaInvoiceAccessory.updateAll({
              dealer_accessory_id: { inq: repeatedDealerAccessoryIds },
            }, {
              dealer_accessory_id: newDealerAccessoryObj.id,
            });
            await app.DealerAccessory.destroyAll({
              accessory_id: { inq: accessoryMapping[newAccesoryIds[i]] },
              dealer_id: dealers[j].id,
            });
          }
        }
      }
      await app.Accessory.destroyAll({ id: { inq: repeatedAccessoryIds } });
      logger.info('Duplicate Accessories Removed');
    } catch (error) {
      logger.info('error in updateOrDeleteDealerAccessory -> ', error);
      throw (new InstabikeError(error));
    }
  }
}

DeleteAccessories.removeDuplicateAccessories();
