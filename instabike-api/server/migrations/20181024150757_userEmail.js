"use strict";

const server = require('../server');
const postgres_ds = server.dataSources.postgres;

/**
 * @author Ramanavel Selvaraju
 */
class userEmailMigration {
  change() {
    // This is a sample method you can do it your own
    postgres_ds.connector.query('DROP INDEX IF EXISTS users_email_idx',
      (err, data) => {
      if (err)
        throw err;
    });
  }
}

let objuserEmail = new userEmailMigration();
objuserEmail.change();
