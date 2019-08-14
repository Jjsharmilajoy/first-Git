"use strict";

const server = require('../server');
const constrains = require('../utils/constants/indexConstraints');
const postgres_ds = server.dataSources.postgres;

/**
 * @author Ramanavel Selvaraju
 */
class IndexConstraintsMigration {
  change() {
    postgres_ds.connector.query(constrains.indexConstrain, (err, data) => {
      if (err)
        throw err;
    });
  }
}

let objIndexConstraints = new IndexConstraintsMigration();
objIndexConstraints.change();
