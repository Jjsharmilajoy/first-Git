"use strict";

const server = require('../server');
const postgres_ds = server.dataSources.postgres;
const forgienKeyConstrain = require('../utils/constants/foriegnKey');

/**
 * @author Ramanavel Selvaraju
 */
class ForginKeyMappingMigration {
  change() {
    // This is a sample method you can do it your own
    postgres_ds.connector.query(forgienKeyConstrain.forgienKeyConstrain,
      (err) => {
      if (err)
        throw err;
    });
  }
}

let objForginKeyMapping = new ForginKeyMappingMigration();
objForginKeyMapping.change();
