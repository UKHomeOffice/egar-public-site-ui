const countries = require('i18n-iso-countries');
const moment = require('moment');

const ValidationRule = require('../../common/models/ValidationRule.class');
const freeCirculationValues = require('../seeddata/egar_craft_eu_free_circulation_options.json');
const visitReasonValues = require('../seeddata/egar_visit_reason_options.json');
const genderValues = require('../seeddata/egar_gender_choice.json');
const { MAX_STRING_LENGTH, MAX_REGISTRATION_LENGTH, MAX_EMAIL_LENGTH } = require('../config/index');
const logger = require('../../common/utils/logger')(__filename);

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

function isNumeric(input) {
  // Essentially jQuery's implementation...
  return (input - parseFloat(input) + 1) >= 0;
}

// validday
function validDay(d, m, y) {
  if (isNumeric(d)) {
    return m >= 0 && m <= 12 && d > 0 && d <= daysInMonth(m, y);
  }
  return false;
}

function validMonth(m) {
  if (isNumeric(m)) {
    return m >= 0 && m <= 12;
  }
  return false;
}

function validHour(h) {
  return (isNumeric(h) && (h >= 0) && (h <= 23));
}

function validMinute(m) {
  return (isNumeric(m) && (m >= 0) && (m < 60));
}

function validTime(timeObj) {
  return validHour(timeObj.h) && validMinute(timeObj.m);
}

/**
 * Predicate function which checks the length of a country code string.
 *
 * @param {String} countryCode
 * @returns {Bool} True if 3 chars, else false
 */
function validISOCountryLength(countryCode) {
  return notEmpty(countryCode) && countryCode.length === 3;
}

/**
 * Predicate to check whether the country code is a valid ISO1366 alpha 3 code.
 *
 * @param {String} countryCode
 * @returns {Bool} True if 3 an ISO1366 code, false otherwise
 */
function validISO3Country(countryCode) {
  return countries.isValid(countryCode);
}

/**
 * Predicate function which checks a given free circulation value.
 *
 * @param {String} value a free circulation value
 * @returns {Bool} True if contained in freecirulation values else false
 */
function validFreeCirculation(value) {
  const validValues = freeCirculationValues.map(item => item.value);
  return validValues.includes(value);
}

/**
 * Predicate function which checks a given visit reason value
 * @param {String} value A visit reason value
 * @returns {Bool} True if contained in visitreasons else false
 */
function validVisitReason(value) {
  const validValues = visitReasonValues.map(item => item.value);
  return validValues.includes(value);
}

/**
 * Predicate function which checks a given gender value
 * @param {String} value A gender value
 * @returns {Bool} True if contained in gendervalues else false
 */
function validGender(value) {
  const validValues = genderValues.map(item => item.gender);
  return validValues.includes(value);
}

function currentOrFutureDate(dObj) {
  const currDate = new Date();
  if (dObj.y < currDate.getFullYear()) {
    return false;
  }
  if (dObj.y === currDate.getFullYear()) {
    if (dObj.m < currDate.getMonth() + 1) {
      return false;
    }
    if (dObj.m === currDate.getMonth() + 1) {
      return dObj.d >= currDate.getDate();
    }
  }
  return true;
}

function validYear(y) {
  return y.length === 4;
}

const numericDateElements = dObj => isNumeric(dObj.d)
  && isNumeric(dObj.m)
  && isNumeric(dObj.y);

function realDate(dObj) {
  if (dObj === null || dObj === undefined) return false;
  return numericDateElements(dObj)
    && validDay(dObj.d, dObj.m, dObj.y)
    && validMonth(dObj.m)
    && validYear(dObj.y);
}

function realDateFromString(str) {
  moment.suppressDeprecationWarnings = true;
  return moment(str).isValid();
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
  const regex = /^^((([!#$%&'*+\-/=?^_`{|}~\w])|([!#$%&'*+\-/=?^_`{|}~\w][!#$%&'*+\-/=?^_`{|}~.\w]{0,}[!#$%&'*+\-/=?^_`{|}~\w]))[@]\w+([-.]\w+)*\.\w+([-.]\w+)*)$/;
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
  const regex = /^[0-9]{5,20}$/;
  return regex.test(value);
}

function validateChains(chains) {
  return new Promise((resolve, reject) => {
    const failedRules = [];
    for (let i = 0; i < chains.length; i += 1) {
      const rules = chains[i];
      for (let x = 0; x < rules.length; x += 1) {
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
  });
}

/**
 * false if all values in array are equal, else true
 * @param {Array} values
 * @returns {Bool}
 */
function notSameValues(values) {
  if (values.includes(null) || values.includes(undefined)) {
    return true;
  }
  return !values.every(v => v.trim().toLowerCase() === values[0].trim().toLowerCase());
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
  for (let i = 0; i < values.length; i += 1) {
    validationArr.push([new ValidationRule(type, cssIds[i], values[i], msgs[i])]);
  }
  return validationArr;
}

/**
 * Given a filename and mimetype, return true if the extension in the fileName matches
 * the mimeType and the mimetype is one of the allowed types otherwise return false.
 *
 * @param {String} fileName
 * @param {String} mimeType
 * @returns {Bool}
 */
function isValidFileMime(fileName, mimeType) {
  const fileTypeObj = {
    jpg: ['image/jpeg', 'image/x-citrix-jpeg'],
    jpeg: ['image/jpeg', 'image/x-citrix-jpeg'],
    png: ['image/png', 'image/x-citrix-png', 'image/x-png'],
    pdf: ['application/pdf'],
    gif: ['image/gif'],
  };
  const fileExtension = fileName.split('.').slice(-1).pop();
  if (fileTypeObj[fileExtension]) {
    return fileTypeObj[fileExtension].includes(mimeType);
  }
  return false;
}

/**
 * Check if the string length is within the limit. Default limit is 35 characters.
 * @param {String} value
 * @return {Bool}
 */
function isValidStringLength(value) {
  return value.length <= MAX_STRING_LENGTH;
}

function isValidRegistrationLength(value) {
  return value.length <= MAX_REGISTRATION_LENGTH;
}

/**
 * Check if string lenght is within the limit
 * @param  {String} value
 * @return {Bool}
 */
function isValidEmailLength(value) {
  return value.length <= MAX_EMAIL_LENGTH;
}

/**
 * Parse datetime string to moment object
 * @param {String} dateTimeStr 'yyyy-MM-dd HH:mm:ss'
 * @param {String} dateTimeFormat defines the moment format default: 'YYYY-MM-DD HH:mm:ss'
 * @return {Bool}
 */
function isValidDateTime(dateTimeStr, dateTimeFormat = 'YYYY-MM-DD HH:mm:ss') {
  return moment.utc(dateTimeStr, dateTimeFormat).isValid();
}

/**
 * Verify that Arrival Date is after Departure Date
 * @param {Object} voyageDateObject { depatureDate: 'yyyy-MM-dd', departureTiem: 'HH:mm:ss', arrivalDate: 'yyyy-MM-dd' arrivalTime: 'HH:mm:ss' }
 * @returns {Bool}
 */
function isValidDepAndArrDate(voyageDateTimeObject) {
  const dateTimeFormat = 'YYYY-MM-DD HH:mm:ss';
  const { departureDate, departureTime, arrivalDate, arrivalTime } = voyageDateTimeObject;
  const depDateTimeStr = `${departureDate} ${departureTime}`;
  const arrDateTimeStr = `${arrivalDate} ${arrivalTime}`;

  if (isValidDateTime(depDateTimeStr) && isValidDateTime(arrDateTimeStr)) {
    const depDateTime = moment.utc(`${departureDate} ${departureTime}`, dateTimeFormat, true);
    const arrDateTime = moment.utc(`${arrivalDate} ${arrivalTime}`, dateTimeFormat, true);
    return arrDateTime.isAfter(depDateTime);
  }
  return false;
}

function handleResponseError(parsedApiResponse) {
  if ({}.hasOwnProperty.call(parsedApiResponse, 'message')) {
    logger.debug(`Api return Error: ${parsedApiResponse}`);
  }
}

module.exports = {
  notEmpty,
  email,
  confirmPassword,
  valuetrue,
  isNumeric,
  validDay,
  validMonth,
  validYear,
  onlySymbols,
  validateChains,
  genValidations,
  validatePortCoords,
  realDate,
  realDateFromString,
  currentOrFutureDate,
  validTime,
  validFlag,
  validPort,
  validISOCountryLength,
  validISO3Country,
  validFreeCirculation,
  validVisitReason,
  validGender,
  lattitude,
  longitude,
  validIntlPhone,
  notSameValues,
  isValidFileMime,
  isValidStringLength,
  isValidEmailLength,
  isValidRegistrationLength,
  isValidDepAndArrDate,
  handleResponseError,
};
