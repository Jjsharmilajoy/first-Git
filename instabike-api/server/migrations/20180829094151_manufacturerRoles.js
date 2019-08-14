"use strict";

const server = require('../server');
const postgres_ds = server.dataSources.postgres;

const defaultRoles = [
  {
    name: 'MANUFACTURER_COUNTRY_HEAD',
    description: 'Role assigned to a manufacturer'
  },
  {
    name: 'MANUFACTURER_ZONE_HEAD',
    description: 'Role assigned to a manufacturer'
  },
  {
    name: 'MANUFACTURER_STATE_HEAD',
    description: 'Role assigned to a manufacturer'
  },
  {
    name: 'MANUFACTURER_CITY_HEAD',
    description: 'Role assigned to a manufacturer'
  }
];
/**
 * @author Jaiyashree Subramanian
 */
class manufacturerRolesMigration {
  change() {
    // To create set of default roles and persist it into database
    server.models.Roles.create(defaultRoles, (err, roles) => {
      if (err)
        throw err;
    });
  }
}

let objCreateRoles = new manufacturerRolesMigration();
objCreateRoles.change();
