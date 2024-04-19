const countries = require('i18n-iso-countries');
const moment = require('moment');

const ValidationRule = require('../../common/models/ValidationRule.class');
const freeCirculationValues = require('../seeddata/egar_craft_eu_free_circulation_options.json');
const visitReasonValues = require('../seeddata/egar_visit_reason_options.json');
const genderValues = require('../seeddata/egar_gender_choice.json');
const { MAX_STRING_LENGTH, MAX_REGISTRATION_LENGTH, MAX_EMAIL_LENGTH, USER_FIRST_NAME_CHARACTER_COUNT, USER_SURNAME_CHARACTER_COUNT } = require('../config/index');
const logger = require('../../common/utils/logger')(__filename);
const { airportCodeList } = require('../../common/utils/autocomplete');

/**
 * Check if the string has leading spaces
 * @param {String} value
 * @return {boolean}
 */
function hasLeadingSpace(value) {
  return (/^\s/.test(value));
}

/**
 * Check if the string has only symbols
 * @param {String} value
 * @return {boolean}
 */
function hasOnlySymbols(value) {
  return (/^[^a-zA-Z0-9]+$/.test(value));
}

function containTabs(value) {
  return /\t+/.test(value);
}

/**
 * Check if the string is empty, null or undefined.
 * @param {String} value
 * @return {boolean}
 */
function isEmpty(value) {
  if (value === undefined) {
    return true;
  }
  if (value === null) {
    return true;
  }
  if (value === '') {
    return true;
  }
  return false;
}

/**
 * Check if the string is not empty, does not start with a space and does not contain only symbols.
 * @param {String} value
 * @return {boolean}
 */
function notEmpty(value) {
  // check for null, undefined or empty
  if (isEmpty(value)) {
    return false;
  }

  // check for space at start
  if (hasLeadingSpace(value)) {
    return false;
  }

  // check for only symbols
  if (hasOnlySymbols(value)) {
    return false;
  }

  if(containTabs(value)) {
    return false;
  }
  return true;
}

// only allow alpha, hyphen and apostrophe
// must start and end with alpha
// special characters cannot be placed sequentially
function validName(value) {
  const regex = /^[A-z ](?:[A-z ]|[-|\'](?=[A-z ]))*[A-z ]$/
  return regex.test(value);
}

function validFirstNameLength(value) {
  return value.length <= USER_FIRST_NAME_CHARACTER_COUNT;
}

function validSurnameLength(value) {
  return value.length <= USER_SURNAME_CHARACTER_COUNT;
}

function valuetrue(value) {
  if (value) {
    return true;
  }
  return false;
}

function daysInMonth(m, y) {
  const lastDayOfMonth = new Date(y, m, 0);
  return lastDayOfMonth.getDate();
}

function isNumeric(input) {
  if (typeof input === "string") {
    return (input - parseFloat(input) + 1) >= 0;
  }
  return false;
}

/**
 * Check that string does not contains non-printable characters "\"
 * @param {String} value
 */
function isPrintable(value) {
  return !value.includes('\n');
}

function validDay(d, m, y) {
  if (isNumeric(d)) {
    return validMonth(m) && (d >= 1 && d <= daysInMonth(m, y));
  }
  return false;
}

function validMonth(m) {
  if (isNumeric(m)) {
    return m >= 1 && m <= 12;
  }
  return false;
}

function validYear(y) {
  if (isNumeric(y)) {
    return (y.length === 4) && (y >= 1000 && y <= 9999);
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

/**
 * Checks that a valid supplied date is not a past date
 * @param {Object} dObjh Date - can be js Date object or the {d:,m:,y} type object that is used in the UI
 * @returns {Boolean} true if not past date, false if past date
 */
function currentOrPastDate(dObj) {
  const currDate = new Date();
  const currMonth = currDate.getMonth() + 1;

  /*
    Returns true if all dates fields are empty to avoid duplicate error messages being displayed.
    The dateNotMoreThanMonthInFuture function will cover this error.
  */
  if([dObj.d,dObj.m,dObj.y].includes('')) {
    return true;
  }

  /*
    Returns true if supplied dates are invalid to avoid duplicate error messages being displayed.
    The dateNotMoreThanMonthInFuture function will cover this error.
  */
  if(validDay(dObj.d, dObj.m, dObj.y) === false || validMonth(dObj.m) === false || validYear(dObj.y) === false){
    return true;
  }

  if (dObj.y < currDate.getFullYear()) {
    return false;
  }
  if (dObj.y == currDate.getFullYear()) {
    if (dObj.m < currMonth) {
      return false;
    }
    if (dObj.m == currMonth) {
      return dObj.d >= currDate.getDate();
    }
  }

  return true;
}

/**
 * Check that supplied date is within an acceptable range (currently within 1 month from Date.now())
 * @param {Object} dObjh Date - can be js Date object or the {d:,m:,y} type object that is used in the UI
 * * @returns {Bool} Date is within acceptable range
 */
function dateNotMoreThanMonthInFuture(dObj) {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const providedDate = getDateFromDynamicInput(dObj);

  return Boolean(providedDate) && providedDate <= nextMonth;
}

function dateNotMoreThanTwoDaysInFuture(providedDate) {
  const now = new Date();
  const TWO_DAYS_MILLISECONDS = 2 * 24 * 60 * 60 * 1000;
  const maxDepartureDate = new Date(now.getTime() + TWO_DAYS_MILLISECONDS);

  if (!(providedDate instanceof Date)) {
    return false;
  }

  return Boolean(providedDate) && providedDate.getTime() <= maxDepartureDate.getTime();
}

function isTwoHoursPriorDeparture(providedDate) {  
  const TWO_HOURS_MILLISECONDS = 2 * 60 * 60 * 1000;
  const today = new Date()
  const twoHoursPriorDepartureDate = new Date(today.getTime() + TWO_HOURS_MILLISECONDS);

  if (!(providedDate instanceof Date)) {
    return false;
  }

  return Boolean(providedDate) && providedDate.getTime() >= twoHoursPriorDepartureDate.getTime();
}    

/**
 * Normalises and returns various supplied date objects / formats
 * @param {Object} input Date - can be js Date object or the {d:,m:,y} type object that is used in the UI
 * * @returns {Date} js Date or null if cannot parse
 */
function getDateFromDynamicInput(input) {

  if (input === null || input === undefined) return null;//we don't have anything to work with

  let providedDate;

  if (input instanceof Date) {//if it's a Date return as is.
    providedDate = input;
  }
  else if (input instanceof String || typeof input === 'string') {//if it is a string literal or object, parse if possible.
    providedDate = Date.parse(input);

    if (isNaN(providedDate)) {
      providedDate = null;
    }
  }
  else if (input.hasOwnProperty('d')) { // if it is an eGAR UI date object, validate properties and parse
    if (numericDateElements(input)
      && validDay(input.d, input.m, input.y)
      && validMonth(input.m)
      && validYear(input.y)) {
      providedDate = new Date(input.y + '-' + input.m + '-' + input.d);
    }
    else {
      providedDate = null;
    }
  }
  else {//we've got something but we don't  know what it is. this is likely a calling error rather than data error.
    logger.error('Unrecognised date input:' + input);
    providedDate = null;
  }

  return providedDate;
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

function bornAfter1900(dObj) {
  if (dObj === null || dObj === undefined) return false;

  var nextDay = new Date(new Date().getFullYear(), new Date().getMonth(), (new Date().getDate() + 1));
  var providedDate = new Date(dObj.y + '-' + dObj.m + '-' + dObj.d);

  return numericDateElements(dObj)
    && validDay(dObj.d, dObj.m, dObj.y)
    && validMonth(dObj.m)
    && validYear(dObj.y)
    && (dObj.y >= 1900)
    && providedDate < nextDay;
}

function realDateInFuture(dObj) {
  if (dObj === null || dObj === undefined) return false;

  var nextDay = new Date(new Date().getFullYear(), new Date().getMonth(), (new Date().getDate() + 1));
  var providedDate = new Date(dObj.y + '-' + dObj.m + '-' + dObj.d);

  return numericDateElements(dObj)
    && validDay(dObj.d, dObj.m, dObj.y)
    && validMonth(dObj.m)
    && validYear(dObj.y)
    && providedDate >= nextDay;
}

function realDateFromString(str) {
  moment.suppressDeprecationWarnings = true;
  return moment(str).isValid();
}

// This function will validate Passport Expiry date while uploading Gar Template
function passportExpiryDate(value, element) {
  const val = Date.parse(value);
  if (isNaN(val))
    return false;

  const d = new Date(val);
  const f = new Date();

  if (d > f) {
    return true;
  }

  if (f.toDateString() == d.toDateString()) {
    return true;
  }
  return false;
}

// This function will validate a Date of Birth making sure it's not in future while uploading Gar Template
function birthDate(value, element) {
  const val = Date.parse(value);
  if (isNaN(val))
    return false;

  const d = new Date(val);
  const f = new Date();

  f.setMonth(f.getMonth());
  if (d > f) {
    return false;
  }
  return true;
}

// This function will validate departure date while uploading Gar Template
function dateNotInPast(value, element) {
  const val = Date.parse(value);
  if (isNaN(val))
    return false;

  const d = new Date(val);
  const f = new Date();

  if (d > f) {
    return true;
  }

  if (f.toDateString() == d.toDateString()) {
    return true;
  }

  return false;
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
 * Returns false if ZZZZ or YYYY entered without coords.
 * @param {Object} portObj contains keys [portCode, lat, long]
 * @returns {Boolean} true if valid port, false if zzzz without coords
 */
function validatePortCoords(portObj) {
  const portCode = portObj.portCode.toUpperCase();
  if (portCode === 'ZZZZ' || portCode === 'YYYY') {
    return ((portObj.lat !== '') && (portObj.long !== ''));
  }
  return true;
}

function latitude(value) {
  const regex = /^-?([1-8]?[0-9]\.{1}\d{6}$|90\.{1}0{6}$)/;
  return regex.test(value);
}

function longitude(value) {
  const regex = /^-?((([1]?[0-7][0-9]|[1-9]?[0-9])\.{1}\d{6}$)|[1]?[1-8][0]\.{1}0{6}$)/;
  return regex.test(value);
}

// very basic min 5 and max 20 numbers
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
    docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    doc: ['application/msword'],
  };
  const fileExtension = fileName.split('.').slice(-1).pop();
  if (fileTypeObj[fileExtension]) {
    return fileTypeObj[fileExtension].includes(mimeType);
  }
  return false;
}

/**
 * Check if string length is within limit
 * @param {Object} valueObj {value: string, maxLength: number}
 * @return {Bool}
 */
function validTextLength(valueObj) {
  const { value, maxLength } = valueObj;
  return value.length <= maxLength;
}

/**
 * Check if the string length is within the limit. Default limit is 35 characters.
 * @param {String} value
 * @return {Bool}
 */
function isValidStringLength(value) {
  return value.length <= MAX_STRING_LENGTH;
}

/**
 * Check if the string length is within the limit for optional strings.
 * @param {String} value
 * @return {boolean}
 */
function isValidOptionalStringLength(value) {
  return isEmpty(value)
    || (!hasLeadingSpace(value)
      && !hasOnlySymbols(value)
      && value.length <= MAX_STRING_LENGTH);
}

/**
 * Check if aricraft registration length is within the limit
 * @param {String} value
 * @return {Bool}
 */
function isValidRegistrationLength(value) {
  return value.length <= MAX_REGISTRATION_LENGTH;
}

/**
 * Check if string length is within the limit
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
 * @param {Object} voyageDateObject { departureDate: 'yyyy-MM-dd', departureTime: 'HH:mm:ss', arrivalDate: 'yyyy-MM-dd' arrivalTime: 'HH:mm:ss' }
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

function sanitiseDateOrTime(input, type) {
  const regex = (type === 'year') ? '[0-9]{1,4}' : '[0-9]{1,2}';

  return ((input.match(regex) === null) ? '' : input.match(regex)[0]);
}

function autoTab(field1, dayMonthOrYear, field2) {

  let len = (dayMonthOrYear === 'year') ? 4 : 2;

  let field1Value = sanitiseDateOrTime(field1.value, dayMonthOrYear);

  if (field1Value.length == len) {
    field2.focus();
  }
}

function sanitiseCoordinateDegreesOrSeconds(input, type) {
  const regex = (type === 'seconds') ? /^\d{0,3}(\.\d{0,4})?$/ : /^[0-9]{1,3}$|^\[0-9]{1,3}$/;

  return ((input.match(regex) === null) ? '' : input.match(regex)[0]);

}

function sanitiseCoordinateMinutes(input, type) {
  const regex = (type === 'minutes') ? /^\d{0,2}?$/ : /^[0-9]{1,3}$|^\[0-9]{1,3}$/;

  return ((input.match(regex) === null) ? '' : input.match(regex)[0]);

}

function autoTab1(field1, degreesMinutesOrSeconds, field2) {

  let len = (degreesMinutesOrSeconds === 'minutes') ? 2 : 3;

  let field1Value = sanitiseCoordinateMinutes(field1.value, degreesMinutesOrSeconds);

  if (field1Value.length == len) {
    field2.focus();
  }
}

function invalidLatDirection(value) {
  value = value || '';
  value = value.toUpperCase();
  if (['S', 'N'].includes(value)) {
    return true;
  }
  else {
    return false;
  }

}

function invalidLongDirection(value) {
  value = value || '';
  value = value.toUpperCase();
  if (['W', 'E'].includes(value)) {
    return true;
  }
  else {
    return false;
  }

}

function isAlphanumeric(input) {
  const alphanumericRegex = /^[a-zA-Z0-9]+$/;
  return alphanumericRegex.test(input);
}

function isAlpha(input) {
  const alphaRegex = /^[a-z\s\-]+$/i;
  return alphaRegex.test(input);
}

function isAddressValidCharacters(input) {
  const addressRegex = /^[a-z\s\-\d]+$/i;
  return isEmpty(input) || addressRegex.test(input);
}

function isPostCodeValidCharacters(input) {
  const addressRegex = /^[a-z\s\-\d]+$/i;
  return isEmpty(input) || addressRegex.test(input);
}

function preventZ(value) {
  value = value || '';
  if (value.toLowerCase() === "zzzz" || value.toLowerCase() === "yyyy") {
    return false;
  }
  return true;
}

/**
 * Verify that airport code is accurate
 * @param {String} airportCode expected to be an  IATA (length 3) or ICAO (length 4) orcode
 * @returns {Bool}
 */
function isValidAirportCode(airportCode) {
  return airportCodeList.includes(airportCode);
}

module.exports = {
  hasOnlySymbols,
  hasLeadingSpace,
  isEmpty,
  notEmpty,
  validName,
  validFirstNameLength,
  validSurnameLength,
  email,
  confirmPassword,
  valuetrue,
  isNumeric,
  isPrintable,
  validDay,
  validMonth,
  validYear,
  onlySymbols,
  validateChains,
  genValidations,
  validatePortCoords,
  realDate,
  realDateInFuture,
  bornAfter1900,
  realDateFromString,
  currentOrPastDate,
  validTime,
  validFlag,
  validPort,
  validISOCountryLength,
  validISO3Country,
  validFreeCirculation,
  validVisitReason,
  validGender,
  latitude,
  longitude,
  validIntlPhone,
  notSameValues,
  isValidFileMime,
  validTextLength,
  isValidStringLength,
  isValidOptionalStringLength,
  isValidEmailLength,
  isValidRegistrationLength,
  isValidDepAndArrDate,
  handleResponseError,
  sanitiseDateOrTime,
  passportExpiryDate,
  birthDate,
  dateNotInPast,
  autoTab,
  autoTab1,
  sanitiseCoordinateDegreesOrSeconds,
  invalidLatDirection,
  invalidLongDirection,
  sanitiseCoordinateMinutes,
  preventZ,
  dateNotMoreThanMonthInFuture,
  isAlphanumeric,
  isAlpha,
  isAddressValidCharacters,
  isPostCodeValidCharacters,
  isValidAirportCode,
  dateNotMoreThanTwoDaysInFuture,
  isTwoHoursPriorDeparture,
  containTabs
};
