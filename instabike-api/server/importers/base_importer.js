const XlsxUtils = require('../utils/xlsx_utils');
const loopback = require('../../server/server');
const logger = require('winston');

const app = loopback.dataSources.postgres.models;

module.exports = class BaseImporter {
  constructor(filePath, mappingJson) {
    this.filePath = filePath;
    this.sheetName = mappingJson.sheetName;
    this.mappings = mappingJson.columns;
    this.model = mappingJson.model;
    this.statergy = mappingJson.Statergy;
    this.statergyParam = mappingJson.QueryParams;
    this.relationMapping = mappingJson.relations;
    this.errorRows = [];
  }

  registerChild(child) {
    this.child = child;
  }

  async import(callback) {
    try {
      logger.info(`Import ${this.sheetName}...`);
      this.items = await XlsxUtils.sheetToJSON(this.getAbsolutePath(), this.sheetName);
      if (this.items.length) {
        this.preparedItems = await this.prepareToImport();
        await this.importItems(callback);
      }
      logger.info('Done');
      callback(null, 'Done');
    } catch (err) {
      callback(err);
    }
  }

  prepareToImport() {
    return new Promise(async (resolve, reject) => {
      try {
        const preparedItems = [];
        for (let i = 0; i < this.items.length; i += 1) {
          const keys = Object.keys(this.mappings);
          const preparedItem = await this.processKeys(this.items[i], keys);
          preparedItems.push(preparedItem);
        }
        resolve(preparedItems);
      } catch (e) {
        reject(e);
      }
      this.errorRows = [];
    });
  }

  async processKeys(item, keys) {
    return new Promise((async (resolve, reject) => {
      const preparedItem = {};
      try {
        for (let i = 0; i < keys.length; i += 1) {
          const columnName = this.mappings[keys[i]].property;
          const value = item[keys[i]];
          if (value) {
            preparedItem[columnName] = value;
            const relation = this.relationMapping[columnName];
            if (relation) {
              const relationId = await this.findRelations(relation, preparedItem);
              preparedItem[columnName] = relationId && relationId;
            }
          } else if (this.mappings[keys[i]].defaultValue) {
            preparedItem[columnName] = this.mappings[keys[i]].defaultValue;
          } else {
            /* eslint no-lonely-if: "off" */
            if (this.mappings[keys[i]].type === 'string') {
              preparedItem[columnName] = null;
            } else if (this.mappings[keys[i]].type === 'number') {
              preparedItem[columnName] = 0;
            }
          }
        }
        resolve(preparedItem);
      } catch (e) {
        reject(e);
      }
    }));
  }

  async importItems() {
    /* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
    for (let i = 0; i < this.preparedItems.length; i++) {
      const preparedItem = this.preparedItems[i];
      if (Object.keys(preparedItem).length > 0) {
        if (this.child) {
          await this.child.importRow(preparedItem);
        } else {
          switch (this.statergy) {
            case 'upsertwithwhere':
              await this.upsertWithWhereToModel(preparedItem, this.model);
              break;
            case 'findorcreate':
              await this.findOrCreateToModel(preparedItem, this.model);
              break;
            default:
              await this.importToModel(preparedItem, this.model);
          }
        }
      }
    }
  }

  async findOrCreateToModel(preparedItem, modelName) {
    const newObject = preparedItem;
    return new Promise((resolve) => {
      const queryParam = {};
      this.statergyParam.map((param) => {
        queryParam[param] = preparedItem[param];
        return queryParam;
      });
      app[modelName].findOrCreate({ where: queryParam }, newObject, (err, data) => {
        if (err) {
          const newData = newObject;
          newData.msg = err;
          this.errorRows.push(newObject);
          resolve();
          logger.info(newObject);
          logger.error(err);
          return;
        }
        resolve(data);
      });
    });
  }

  async upsertWithWhereToModel(preparedItem, modelName) {
    const newObject = preparedItem;
    return new Promise((resolve) => {
      const queryParam = {};
      this.statergyParam.map((param) => {
        queryParam[param] = preparedItem[param];
        return queryParam;
      });
      app[modelName].upsertWithWhere(queryParam, newObject, (err, data) => {
        if (err) {
          const newData = newObject;
          newData.msg = err;
          this.errorRows.push(newObject);
          resolve();
          logger.info(newObject);
          logger.error(err);
          return;
        }
        resolve(data);
      });
    });
  }

  async importToModel(preparedItem, modelName) {
    const newObject = preparedItem;
    return new Promise((resolve) => {
      app[modelName].create(newObject, (err, data) => {
        if (err) {
          const newData = newObject;
          newData.msg = err;
          this.errorRows.push(newObject);
          resolve();
          logger.info(newObject);
          logger.error(err);
          return;
        }
        resolve(data);
      });
    });
  }

  getAbsolutePath() {
    return process.cwd() + this.filePath;
  }

  static findOrCreateByName(modelName, name) {
    return new Promise(((resolve, reject) => {
      app[modelName].findOrCreate({ where: { name } }, { name }, (err, data) => {
        if (err) return reject(err);
        return resolve(data);
      });
    }));
  }

  async findRelations(relation, currentObj) {
    let result = null;
    return new Promise((async (resolve, reject) => {
      try {
        if (relation.queryDependencies) {
          result = await this.findRelationId(currentObj, relation);
        }
        resolve(result);
      } catch (e) {
        reject(e);
      }
    }));
  }

  async findRelationId(currentObj, relation) {
    this.x = relation;
    return new Promise(async (resolve, reject) => {
      let relationObj = null;
      try {
        const query = { where: {} };
        relation.queryDependencies.forEach((dependency) => {
          const queryValue = currentObj[dependency.objectProperty];
          if (queryValue) {
            query.where[dependency.queryProperty] = queryValue.trim();
          }
        });
        relationObj = await app[relation.model].findOne(query);
        if (relationObj) {
          resolve(relation.fetchProperty ? relationObj[relation.fetchProperty] : relationObj.id);
        } else {
          logger.info({ model: relation.model, query });
        }
        reject(new Error("Relation Object Doesn't exist in tht Database.."));
      } catch (e) {
        reject(e);
      }
    });
  }
};
