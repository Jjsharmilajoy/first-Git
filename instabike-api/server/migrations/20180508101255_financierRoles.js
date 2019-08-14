"use strict";

const server = require('../server');
const postgres_ds = server.dataSources.postgres;

const defaultRoles = [
  {
    name: 'FINANCIER_CITY_HEAD',
    description: 'Role assigned to a financier-manager'
  },
  {
    name: 'FINANCIER_SALES',
    description: 'Role assigned to a financier-sales'
  },
  {
    name: 'FINANCIER_TEAM_HEAD',
    description: 'Role assigned to a financier-team-head'
  },
];
/**
 * @author Ajaykkumar Rajendran
 */
class CreateRolesMigration {
  change() {
    // To create set of default roles and persist it into database
    server.models.Roles.create(defaultRoles, (err, roles) => {
      if (err)
        throw err;
    });
  }
}

let objCreateRoles = new CreateRolesMigration();
objCreateRoles.change();
