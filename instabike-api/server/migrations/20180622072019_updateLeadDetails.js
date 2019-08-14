"use strict";

const server = require('../server');
const updateForgienKeyConstrain = require('../utils/constants/updateLeadDetails');
const postgres_ds = server.dataSources.postgres;

/**
 * @author Ramanavel Selvaraju
 */
class updateLeadDetailsMigration {
  change() {
    // This is a sample method you can do it your own
    postgres_ds.connector.query(updateForgienKeyConstrain.updateForgienKeyConstrain,
      (err, data) => {
      if (err)
        throw err;
    });
  }
}

let objupdateLeadDetails = new updateLeadDetailsMigration();
objupdateLeadDetails.change();
