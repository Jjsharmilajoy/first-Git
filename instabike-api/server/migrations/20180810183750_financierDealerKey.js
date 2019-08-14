"use strict";

const server = require('../server');
const financierModelConstaints = require('../utils/constants/financierModelConstaints');
const postgres_ds = server.dataSources.postgres;

/**
 * @author Jaiyashree Subramanian
 */
class financierForeignKeyMigration {
  change() {
    // To migarte all foreign-key constraints in financier-dependent tables
    postgres_ds.connector.query(financierModelConstaints.financierDealerConstraint,
      (err, data) => {
      if (err)
        throw err;
    });
  }
}

let objfinancierForeignKey = new financierForeignKeyMigration();
objfinancierForeignKey.change();
