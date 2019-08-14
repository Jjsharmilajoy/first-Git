"use strict";

const server = require('../server');
const postgres_ds = server.dataSources.postgres;
const roleModules = require('../utils/constants/role_module');

/**
 * @author Ramanavel Selvaraju
 */
class RolesModuleMigration {
  change() {
    // This is a sample method you can do it your own
    postgres_ds.connector.query(roleModules.roleModules,
      (err, data) => {
      if (err)
        throw err;
    });
  }
}

let objRolesModule = new RolesModuleMigration();
objRolesModule.change();
