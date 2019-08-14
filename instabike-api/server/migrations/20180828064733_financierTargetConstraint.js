"use strict";

const server = require('../server');
const financierModelConstaints = require('../utils/constants/financierModelConstaints');
const postgres_ds = server.dataSources.postgres;

/**
 * @author Jaiyashree Subramanian
 */
class financierTargetConstraint {
  change() {
    // To migarte all unique-key constraints in financier-target table
    postgres_ds.connector.query(financierModelConstaints.financierTargetConstraint,
      (err, data) => {
      if (err)
        throw err;
    });
  }
}

let objfinancierForeignKey = new financierTargetConstraint();
objfinancierForeignKey.change();
