const server = require('./server');
const logger = require('winston');

const postgresDs = server.dataSources.postgres;

/**
 * To drop the schema with all the tables in the test database
 *
 * @author Mohammed Mahroof
 */
const dropSchema = () => new Promise((resolve, reject) => {
  postgresDs.connector.query(
    'DROP SCHEMA IF EXISTS public CASCADE',
    (err) => {
      if (err) { reject(err); }
      logger.info('Schema dropped Successfully');
      resolve('Schema dropped Successfully');
    },
  );
});

/**
 * To create the Schema in the test database
 *
 * @author Mohammed Mahroof
 */
const createSchema = () => new Promise((resolve, reject) => {
  postgresDs.connector.query(
    'CREATE SCHEMA IF NOT EXISTS public',
    (err) => {
      if (err) { reject(err); }
      logger.info('Schema created Successfully');
      resolve('Schema created Successfully');
    },
  );
});

/**
 * To create uuid extension and to create the tables
 *
 * @author Mohammed Mahroof
 */
const createExtension = () =>
  new Promise((resolve, reject) => {
    postgresDs.connector.query(
      'CREATE EXTENSION IF NOT EXISTS "uuid-ossp"',
      (err) => {
        if (err) { reject(err); }
        postgresDs.autoupdate((er) => {
          if (er) { reject(er); }
          logger.info('Loopback tables created in ', postgresDs.adapter.name);
          postgresDs.disconnect();
          resolve('done');
        });
        logger.info('Created uuid-ossp extension');
      },
    );
  });

async function updateConnector() {
  if (process.env.NODE_ENV === 'test') {
    await dropSchema();
    await createSchema();
  }
  await createExtension();
}

updateConnector();
