"use strict";

const server = require('../server');
const forgienKeyConstrain = require('../utils/constants/vehicleFeature');
const postgres_ds = server.dataSources.postgres;

/**
 * @author Ramanavel Selvaraju
 */
class vehicleFeature {
  change() {
    // This is a sample method you can do it your own
    postgres_ds.connector.query(forgienKeyConstrain.forgienKeyConstrain,
      (err, data) => {
      if (err)
        throw err;
    });
  }
}

let objvehicleFeature = new vehicleFeature();
objvehicleFeature.change();
