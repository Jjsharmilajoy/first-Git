import { AsyncStorage } from 'react-native';

module.exports = {

  storeJsonValues: async function storeJsonValues(key, jsonObject) {
    try {
      this.storeStringValues(key, JSON.stringify(jsonObject));
    } catch (error) {
      console.log(`Error storing JsonValues ---', ${error}!`);
    }
  },

  storeStringValues: async function storeStringValues(key, value) {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.log(`Error storing StringValues ---, ${error}!`);
    }
  },

  mergeItem: async function mergeItem(key, value) {
    try {
      await AsyncStorage.mergeItem(key, JSON.stringify(value));
    } catch (error) {
      console.log(`Error retrieving data ---',${error}!`);
    }
  },

  getAllKeys: async function getAllKeys(callback) {
    try {
      await AsyncStorage.getAllKeys((error, result) => {
        if (result !== null) {
          console.log(`All Keys ---',${result}!`);
        }
        if (callback) {
          callback(error, result);
        }
      });
    } catch (error) {
      console.log(`Error getting Keys ---, ${error}!`);
    }
  },

  getItem: async function getItem(key) {
    try {
      const result = await AsyncStorage.getItem(key);
      return JSON.parse(result);
    } catch (error) {
      console.log(`Error retrieving data ---',${error}!`);
    }
  },

  getStringItem: async function getItem(key) {
    try {
      const result = await AsyncStorage.getItem(key);
      return result;
    } catch (error) {
      console.log(`Error retrieving data ---',${error}!`);
    }
  },

  getJsonObject: async function getJsonObject(key, callback) {
    try {
      await AsyncStorage.getItem(key, (error, result) => {
        if (result !== null) {
          result = JSON.parse(result);
        }
        if (callback) {
          callback(result);
        }
      });
    } catch (error) {
      console.log(`Error retrieving data ---,${error}!`);
    }
  },

  clearValues: async function clearValues() {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.log(`Error while clear the values ---'${error}!`);
    }
  },

  removeItem: async function removeItem(key, callback) {
    try {
      await AsyncStorage.removeItem(key, (error, result) => {
        if (result !== null) {
          console.log(`removed key & value ---${key}!,'&',${result}!`);
          result = JSON.parse(result);
        }
        if (callback) {
          callback(result);
        }
      });
    } catch (error) {
      console.log(`Error while clear the values ---${error}!`);
    }
  }
};
