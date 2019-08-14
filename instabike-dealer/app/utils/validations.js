import constants from './constants';

export const passwordStrengthValidator = newPassword => {
  const strength = {
    length: false,
    alphaNumeric: false,
    specialChar: false,
    score: 0
  };
  let regex = /[a-zA-Z]/;

  if (regex.test(newPassword) && /[0-9]/.test(newPassword)) {
    strength.alphaNumeric = true;
    strength.score += 1;
  }

  if (newPassword.length >= 8) {
    strength.length = true;
    strength.score += 1;
  }

  regex = /[$@$!%*#?&]/;
  if (regex.test(newPassword)) {
    strength.specialChar = true;
    strength.score += 1;
  }
  /**
      * regex for password
      * password length 8-15 characters
      * 1 special character
      * accepts alpha-numeric
    */
  /*
    if (/^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,15}$/.test(newPassword)) {
      strength.length = true;
      strength.alphaNumeric = true;
      strength.specialChar = true;
    } */

  return strength;
};

export const emailValidator = email => {
  const regex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

  if (email && email.toString().length > 0 && regex.test(email)) {
    return true;
  }
  return false;
};

export const interestValidator = interest => {
  const regex1 = /^([0-9]{1,2}\.[0-9]{1,2})$/i;
  const regex2 = /^([0-9]{1,2})$/i;
  if (interest && interest.toString().length > 0 && (regex1.test(interest) || regex2.test(interest))) {
    return true;
  }
  return false;
};

export const mobileNumberValidator = mobileNumber => {
  if (constants.REMOVE_MOBILE_NUMBER_VALIDATION) {
    return true;
  }
  const regex = /^[6-9]{1}[0-9]{9}$/;
  if (mobileNumber !== undefined && mobileNumber.length === 10 && regex.test(mobileNumber)) {
    return true;
  }
  return false;
};

export const landlineOrmobileNumberValidator = mobileNumber => {
  const regex = /^[0-9]{10}$/;
  if (mobileNumber !== undefined && mobileNumber.length === 10 && regex.test(mobileNumber)) {
    return true;
  }
  return false;
};

export const pincodeValidator = value => {
  const pincode = value && value.toString();
  const regex = /^[0-9]{6}$/;
  if (pincode !== undefined && pincode.length === 6 && regex.test(pincode)) {
    return true;
  }
  return false;
};

export const capitalizeFirstLetter = string => {
  const value = string.replace('_', ' ');
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
};

export const isStringEmpty = value => !(value && value.length !== 0);

export const isNumeric = value => {
  const regex = /^\d+$/;
  return regex.test(value);
};

export const isAlphaOnly = value => {
  const regex = /^[A-Za-z ]+$/;
  return regex.test(value);
};

export const isAlphaNumericOnly = value => {
  const regex = /^[A-Za-z0-9 ]+$/;
  return regex.test(value);
};

export const isEquivalent = (a, b) => {
  // Create arrays of property names
  const aProps = Object.getOwnPropertyNames(a);
  const bProps = Object.getOwnPropertyNames(b);

  // If number of properties is different,
  // objects are not equivalent
  if (aProps.length !== bProps.length) {
    return false;
  }

  for (let i = 0; i < aProps.length; i += 1) {
    const propName = aProps[i];
    if (typeof (a[propName]) === 'object' && typeof (b[propName]) === 'object') {
      if (a[propName] instanceof Array && b[propName] instanceof Array) {
        if (a[propName].length === b[propName].length) return false;
      }
    }
    // If values of same property are not equal,
    // objects are not equivalent
    if (a[propName] !== b[propName]) {
      return false;
    }
  }

  // If we made it this far, objects
  // are considered equivalent
  return true;
};

export const currencyFormatter = value => (
  `${constants.RUPEE} ${value.toString().replace(/(\d)(?=(\d\d)+\d$)/g, '$1,')}`);

export const trimExtraspaces = value => value ? value.trim() : '';

/* export const licenceValidator = value => {
  if (value.length === 15) {
    const currentYear = new Date().getFullYear();

    const isValidState = value.substr(0, 2).match(/[A-Z]{2}/g) !== null &&
      value.substr(0, 2).match(/[A-Z]{2}/g).length > 0;
    const isValidBranch = (value.substr(2, 2)).match(/[0-9]{2}/g) !== null &&
     (value.substr(2, 2)).match(/[0-9]{2}/g).length > 0;
    const year = (value.substr(4, 4)).match(/[0-9]{4}/g) ? value.substr(4, 4) : false;
    const isYearValid = year && !((parseInt(year, 10) > currentYear || parseInt(year, 10) < 1900));
    const isValidDriverProfileId = (value.substr(8, 7)).match(/[0-9]{7}/g) !== null &&
    (value.substr(8, 7)).match(/[0-9]{7}/g).length > 0;
    return isValidState && isValidBranch && isYearValid && isValidDriverProfileId;
  }
  if (value.length === 16) {
    const currentYear = new Date().getFullYear();

    const isValidState = value.substr(0, 3).match(/[A-Z]{2}/g) !== null &&
      value.substr(0, 3).match(/[A-Z]{2}/g).length > 0;
    const isValidBranch = (value.substr(3, 2)).match(/[0-9]{2}/g) !== null &&
     (value.substr(3, 2)).match(/[0-9]{2}/g).length > 0;
    const year = (value.substr(5, 4)).match(/[0-9]{4}/g) ? value.substr(5, 4) : false;
    const isYearValid = year && !((parseInt(year, 10) > currentYear || parseInt(year, 10) < 1900));
    const isValidDriverProfileId = (value.substr(9, 7)).match(/[0-9]{7}/g) !== null &&
    (value.substr(9, 7)).match(/[0-9]{7}/g).length > 0;
    return isValidState && isValidBranch && isYearValid && isValidDriverProfileId;
  }
  return false;
}; */

export const licenceValidator = value => {
  if (value.length === 15) {
    const isValidState = value.substr(0, 2).match(/[a-zA-Z]{2}/g) !== null
      && value.substr(0, 2).match(/[a-zA-Z]{2}/g).length > 0;
    const isValidAlphaNumeric = value.substr(2, 13).match(/[a-zA-Z0-9]{13}/g) !== null
      && value.substr(2, 13).match(/[a-zA-Z0-9]{13}/g).length > 0;
    return isValidState && isValidAlphaNumeric;
  }
  if (value.length === 16) {
    const isValidState = value.substr(0, 2).match(/[a-zA-Z]{2}/g) !== null
      && value.substr(0, 2).match(/[a-zA-Z]{2}/g).length > 0;
    const isValidAlphaNumeric = value.substr(2, 14).match(/[a-zA-Z0-9]{14}/g) !== null
      && value.substr(2, 14).match(/[a-zA-Z0-9]{14}/g).length > 0;
    return isValidState && isValidAlphaNumeric;
  }
  return false;
};
