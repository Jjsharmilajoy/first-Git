"use strict";

const server = require('../server');
const postgres_ds = server.dataSources.postgres;

const defaultRoles = [
  {
    name: 'CUSTOMER',
    description: 'Role assigned to a customer-user'
  },
  {
    name: 'MANUFACTURER',
    description: 'Role assigned to a manufacturer'
  },
  {
    name: 'DEALER_SALES',
    description: 'Role assigned to a dealer-sales-person'
  },
  {
    name: 'DEALER_MANAGER',
    description: 'Role assigned to a dealer-manager'
  },
  {
    name: 'DEALER_TEAM_HEAD',
    description: 'Role assigned to a dealer-team-head'
  },
  {
    name: 'SUPER_ADMIN',
    description: 'Role assigned to a super-admin user'
  }
];
/**
 * @author Jaiyashree Subramanian
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
