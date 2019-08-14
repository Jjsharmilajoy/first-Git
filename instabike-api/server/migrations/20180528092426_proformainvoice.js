"use strict";

const server = require('../server');
const forgienKeyConstrain = require('../utils/constants/proformaInvoice');
const postgres_ds = server.dataSources.postgres;

/**
 * @author Shahul hameed b
 */
class proformainvoiceMigration {
  change() {
    postgres_ds.connector.query(forgienKeyConstrain.forgienKeyConstrain,
      (err, data) => {
      if (err)
        throw err;
    });
  }
}

let objproformainvoice = new proformainvoiceMigration();
objproformainvoice.change();
