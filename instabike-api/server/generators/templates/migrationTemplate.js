function template(strings, ...keys) {
  return (function(...values) {
    var dict = values[values.length - 1] || {};
    var result = [strings[0]];
    keys.forEach(function(key, i) {
      var value = Number.isInteger(key) ? values[key] : dict[key];
      result.push(value, strings[i + 1]);
    });
    return result.join('');
  });
}

let serviceMigration=template`"use strict";

const server = require('../server');
const postgres_ds = server.dataSources.postgres;

/**
 * @author Ramanavel Selvaraju
 */
class ${'service_name'}Migration {
  change() {
    // This is a sample method you can do it your own
    postgres_ds.connector.query('Your native query goes here...',
      (err, data) => {
      if (err)
        throw err;
      console.log('Your success messge if needed..');
    });
  }
}

let obj${'service_name'} = new ${'service_name'}Migration();
obj${'service_name'}.change();
`

module.exports = serviceMigration;
