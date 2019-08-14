"use strict";

const server = require('../server');
const postgres_ds = server.dataSources.postgres;
const forgienKeyConstrain = require('../utils/constants/foriegnKey');

/**
 * @author Jaiyashree Subramanian
 */
class ForginKeyMappingMigration {
  change() {
    // To update new models and add foreign-key constraint
    postgres_ds.connector.query(forgienKeyConstrain.newConstraints,
      (err) => {
      if (err)
        throw err;
    });
  }
}

let objForginKeyMapping = new ForginKeyMappingMigration();
objForginKeyMapping.change();
