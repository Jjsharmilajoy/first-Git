"use strict";
//import statements
const shell  = require('shelljs');
const fs     = require('fs');
const logger = require('winston');

//internal App imports
const server = require('./server');

//global constants
const migration_version_table_create_query = `CREATE TABLE IF NOT EXISTS public.migration_versions
(
  version character varying NOT NULL,
  CONSTRAINT schema_migrations_pkey PRIMARY KEY (version)
)
WITH (
  OIDS=FALSE
);`;

/**
 * This class will take care the extra migartions like adding a index, forign key
 * Migrations will work based on the migrations versio  table.
 * The initiation point will be in the autoUpdate file.
 *
 * @author Ramanavel Selvaraju
 */
class DBMigrate {

  constructor(){
    this.postgres_ds = server.dataSources.postgres;
  }

  /**
   * Responsible for creating the migration_versions table if not exsits
   * and execting the migartions file by file based on the timstamp presents in the migrtaion file.
   * @return {[type]}
   * @author Ramanavel Selvaraju
   */
  run(){
    this.createMigrationVersionTable(() => {
      this.executeMigrations();
    });
  }

  /**
   * Responsible for creating the MigrationVersions Table.
   *
   * @param  {Function} callback
   * @return
   * @author Ramanavel Selvaraju
   */
  createMigrationVersionTable(callback) {
    this.postgres_ds.connector.query(migration_version_table_create_query,
      (err, data) => {
      if(err)
        throw err;
      logger.info('migration_versions table created successfully');
      callback(data);
    });
  }

  /**
   * This method is responsible for actual migrtaion execution from the
   * files which locatioed in the server/migrations folder.
   *
   * @return {Promise}
   * @author Ramanavel Selvaraju
   */
  async executeMigrations(){
    try{
      const files = await this.read_file_names_from_dir('./server/migrations/');
      for (let file of files) {
        const version = file.split('_')[0];
        const versionCountQuery = this.versionCountQuery(version)
        const version_count = await this.executeNativeSQL(versionCountQuery);
        if(version_count[0].count == 0) {
          const name_split = file.split('_');
          logger.info(`Start => ${name_split.slice(1,name_split.length).join("_").split('.')[0]} (version: ${version})`);
          let migration_command = `node server/migrations/${file}`;
          if(shell.exec(migration_command).code !== 0) {
            shell.echo('Error: migration command failed to execute.Try Again');
            shell.exit(1);
          }
          const insertQuery = this.insertIntoVersionsQuery(version);
          await this.executeNativeSQL(insertQuery);
          logger.info(`Done => ${name_split.slice(1,name_split.length).join("_").split('.')[0]}`);
        }
      }
    } catch(err) {
      throw err;
    }
  }

  /**
   * Getting the file names in the given dir name. It uses the fs npm.
   * @param  {String} dir_name directory name to read the file names
   * @return Promise
   * @author Ramanavel Selvaraju
   */
  read_file_names_from_dir(dir_name) {
    return new Promise(function(resolve, reject) {
      fs.readdir(dir_name, (err, files) => {
        if(err) {
          reject(err); return;
        }
        resolve(files);
      });
    });
  }

  /**
   * Helps to execute the native sql in a promissvie manner.
   * This method needs to move to a util class.
   *
   * @param  {String} query
   * @return Promise
   * @author Ramanavel Selvaraju
   */
  executeNativeSQL(query){
    const connector = this.postgres_ds.connector;
    return new Promise(function(resolve, reject) {
      connector.query(query, (err, data)=> {
        if(err) {
          reject(err); return;
        }
        resolve(data);
      });
    });
  }

  insertIntoVersionsQuery(version) {
    return `INSERT INTO public.migration_versions VALUES ('${version}')`;
  }

  versionCountQuery(version){
    return `select count(version) from public.migration_versions where version='${version}'`;
  }
}

let dbMigrate = new DBMigrate();
dbMigrate.run();
