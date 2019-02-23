const ValidationRule = require('../../common/models/ValidationRule.class');

function notEmpty(value) {
  if (value === undefined) {
    return false;
  }
  if (value === null) {
    return false;
  }
  if (value === '') {
    return false;
  }
  // check for space at start
  if (/^\s/.test(value)) {
    return false;
  }
  // check for only symbols
  if (/^[^a-zA-Z0-9]+$/.test(value)) {
    return false;
  }
  return true;
}

function valuetrue(value) {
  if (value) {
    return true;
  }
  return false;
}

function daysInMonth(m, y) {
  switch (m - 1) {
    case 1:
      return (y % 4 === 0 && y % 100) || y % 400 === 0 ? 29 : 28;
    case 8:
    case 3:
    case 5:
    case 10:
      return 30;
    default:
      return 31;
  }
}

// check if number
function IsNumeric(input) {
  return (input - 0) == input && input.length > 0;
}

function validPhone(value) {
  if (IsNumeric(value)) {
    return value.length >= 11;
  }
  return false;
}

// validday
function validDay(d, m, y) {
  if (IsNumeric(d)) {
    return m >= 0 && m <= 12 && d > 0 && d <= daysInMonth(m, y);
  }
  return false;
}

function validMonth(m) {
  if (IsNumeric(m)) {
    return m >= 0 && m <= 12;
  }
  return false;
}

function validHour(h) {
  return (IsNumeric(h) && (h >= 0) && (h <= 23));
}

function validMinute(m) {
  return (IsNumeric(m) && (m >= 0) && (m < 60));
}

function validTime(timeObj) {
  return validHour(timeObj.h) && validMinute(timeObj.m);
}

function currentOrFutureDate(dObj) {
  const currDate = new Date();
  if (dObj.y < currDate.getFullYear()) {
    return false;
  }
  if (dObj.y == currDate.getFullYear()) {
    if (dObj.m < currDate.getMonth() + 1) {
      return false;
    }
    if (dObj.m == currDate.getMonth() + 1) {
      return dObj.d >= currDate.getDate();
    }
  }
  return true;
}

function validYear(y) {
  return y.length === 4;
}

function realDate(dObj) {
  if (dObj === null || dObj === undefined) return false;
  return (IsNumeric(dObj.d) &&
      IsNumeric(dObj.m) &&
      IsNumeric(dObj.y) &&
      validDay(dObj.d, dObj.m, dObj.y) &&
      validMonth(dObj.m)) &&
    validYear(dObj.y);
}

function passwordCheck(value) {
  if ((/^(?=.*[a-zA-Z])(?=.*[0-9])/.test(value))) {
    return true;
  }
  if (value.length < 8) {
    return false;
  }
  return true;
}

function validFlag(value) {
  if (value) {
    return true;
  }
  return false;
}

function validPort(value) {
  if (value.length >= 3) {
    return true;
  }
  return false;
}

function passwordValidCharacters(value) {
  // if ((/^(?=.*[a-zA-Z])(?=.*[0-9])/.test(value))) {
  if (/^[a-zA-Z0-9]+$/.test(value)) {
    return true;
  }
  return false;
}

function passwordMinLength(value) {
  if (value.length < 8) {
    return false;
  }
  return true;
}

function confirmPassword(value1, value2) {
  if (value1 === value2) {
    return true;
  }

  return false;
}

function onlySymbols(value) {
  // check for only symbols
  if (/^[^a-zA-Z0-9]+$/.test(value)) {
    return false;
  }
  return true;
}

function email(value) {
  const regex = /^^((([!#$%&'*+\-/=?^_`{|}~\w])|([!#$%&'*+\-/=?^_`{|}~\w][!#$%&'*+\-/=?^_`{|}~\.\w]{0,}[!#$%&'*+\-/=?^_`{|}~\w]))[@]\w+([-.]\w+)*\.\w+([-.]\w+)*)$/;
  return regex.test(value);
}

/**
 * Returns true if valid portcode given.
 * Returns false if ZZZZ entered without coords.
 * @param {Object} portObj contains keys [portCode, lat, long]
 * @returns {Boolean} true if valid port, false if zzzz without coords
 */
function validatePortCoords(portObj) {
  if (portObj.portCode.toUpperCase() === 'ZZZZ') {
    return ((portObj.lat !== '') && (portObj.long !== ''));
  }
  return true;
}

function lattitude(value) {
  const regex = /^-?([1-8]?[0-9]\.{1}\d{4}$|90\.{1}0{4}$)/;
  return regex.test(value);
}

function longitude(value) {
  const regex = /^-?((([1]?[0-7][0-9]|[1-9]?[0-9])\.{1}\d{4}$)|[1]?[1-8][0]\.{1}0{4}$)/;
  return regex.test(value);
}

// very basic expects + followed by min 5 and max 2 numbers
function validIntlPhone(value) {
  const regex = /^[+][0-9]{5,20}$/;
  return regex.test(value);
}

function validateChains(chains) {
  return new Promise((resolve, reject) => {
    const failedRules = [];
    for (let i = 0; i < chains.length; i++) {
      const rules = chains[i];
      for (let x = 0; x < rules.length; x++) {
        const rule = rules[x];
        if (rule.validator(rule.value) === false) {
          failedRules.push(rule);
          break;
        }
      }
    }
    if (failedRules.length === 0) {
      resolve();
    } else {
      reject(failedRules);
    }
  })
}

/**
 * Generates chain of validations
 * @param {function} type Type of validator to use
 * @param {Array} cssIds Array of cssIds
 * @param {Array} values Array of values to validate against
 * @param {Array} msgs Array of error msgs to return
 */
function genValidations(type, cssIds, values, msgs) {
  const validationArr = [];
  for (let i = 0; i < values.length; i++) {
    validationArr.push([new ValidationRule(type, cssIds[i], values[i], msgs[i])]);
  }
  return validationArr;
}


module.exports = {
  notEmpty,
  email,
  passwordCheck,
  passwordValidCharacters,
  passwordMinLength,
  confirmPassword,
  valuetrue,
  IsNumeric,
  validPhone,
  validDay,
  validMonth,
  validYear,
  onlySymbols,
  validateChains,
  genValidations,
  validatePortCoords,
  realDate,
  currentOrFutureDate,
  validTime,
  validFlag,
  validPort,
  lattitude,
  longitude,
  validIntlPhone,
};
