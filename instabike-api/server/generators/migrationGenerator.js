"use strict";

const fs = require('fs');
const path = require('path');
const logger = require('winston');

const migrationTemplate = require('../generators/templates/migrationTemplate');

class MigrationGenerator {

  generate(){
    if(process.argv.length < 3)
      throw new Error("Migration name missing on the npm run argument")
    const name = process.argv[2];
    const version = new Date().toJSON().replace(/-/g, '').replace(/:/g,'').split('.')[0].replace('T','');
    this.generateMigrationFile(name, version);
  }

  generateMigrationFile(name, version) {
    try{
      const binFiePath = path.join('server/migrations',`${version}_${name}.js`);
      const binScript = migrationTemplate({service_name: name, version: version, upcase: name.toUpperCase()});
      fs.writeFileSync(binFiePath, binScript);
      logger.info("Generated the migartion file and added in migrations folder.");
      logger.info("Please add permission by execting the following command if you are running in docker compose");
      logger.info("sudo chmod 777 " + binFiePath);
    } catch(e){
      logger.error(e);
    }
  }

}

let migrationGenerator = new MigrationGenerator();
migrationGenerator.generate(process.argv);
