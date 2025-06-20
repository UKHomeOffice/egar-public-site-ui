const moment = require('moment');

const ValidationRule = require('../../common/models/ValidationRule.class');
const freeCirculationValues = require('../seeddata/egar_craft_eu_free_circulation_options.json');
const visitReasonValues = require('../seeddata/egar_visit_reason_options.json');
const genderValues = require('../seeddata/egar_gender_choice.json');
const { MAX_STRING_LENGTH, MAX_REGISTRATION_LENGTH, MAX_EMAIL_LENGTH, USER_FIRST_NAME_CHARACTER_COUNT, USER_SURNAME_CHARACTER_COUNT, MAX_ALLOWED_CANCELLATION_TIME_TO_CBP } = require('../config/index');
const logger = require('../../common/utils/logger')(__filename);
const { airportCodeList, nationalityList } = require('../../common/utils/autocomplete');
const { documentTypes } = require('./utils');

/**
 * isAbleToCancelGar
 * @param {string|null} lastDepartureDateString
 * @return {Date}
 */
const isAbleToCancelGar = (lastDepartureDateString) => {
  if (lastDepartureDateString === null) return true;
  if (lastDepartureDateString && typeof lastDepartureDateString === "string") {
    const cbpSubmittedDate = new Date(lastDepartureDateString);
    const today = new Date().getTime();
    return (cbpSubmittedDate.getTime() + MAX_ALLOWED_CANCELLATION_TIME_TO_CBP) > today;
  } else {
    throw new Error(
      `lastDepartureDateString: "${lastDepartureDateString}", type: "${typeof lastDepartureDateString}", is not null or a valid string`
    )
  }

}

function isValidDocumentType(documentType) {
  return documentTypes.includes(documentType);
}

function isOtherDocumentWithDocumentDesc(args){
  if (!args) return false;
  const [documentType, documentDesc] = args;

  return isEmpty(documentDesc) || documentType === "Other"
}

/**
 * @param {Date} date
 * @return {Date}
 */
function convertDateToUTC(date) {
  const UTCOffsetMinutes = new Date().getTimezoneOffset();
  const UTCOffsetMilliseconds = UTCOffsetMinutes * 60 * 1000;

  return new Date(date.getTime() + UTCOffsetMilliseconds);
}

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

function nameHasNoNumbers(value) {
  return !/\d/.test(value);
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
 * Predicate to check whether the country code is a valid nationality alpha 3 code.
 *
 * @param {String} countryCode
 * @returns {Bool} True if 3 an nationality code, false otherwise
 */
function isValidNationality(countryCode) {
  return nationalityList.map(country => country.code).includes(countryCode);
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

/**
 * @param {Date} providedDate
 * @return {Boolean}
 */
function dateNotMoreThanTwoDaysInFuture(providedDate) {
  if (!(providedDate instanceof Date)) {
    return false;
  }

  const now = convertDateToUTC(new Date());
  const TWO_DAYS_MILLISECONDS = 2 * 24 * 60 * 60 * 1000;
  const maxDepartureDate = new Date(now.getTime() + TWO_DAYS_MILLISECONDS);

  return Boolean(providedDate) && providedDate.getTime() <= maxDepartureDate.getTime();
}

/**
 * @param {Date} providedDate
 * @return {Boolean}
 */
function isTwoHoursPriorDeparture(providedDate) {
  if (!(providedDate instanceof Date)) {
    return false;
  }

  const today = convertDateToUTC(new Date());
  const TWO_HOURS_MILLISECONDS = 2 * 60 * 60 * 1000;
  const twoHoursPriorDepartureDate = new Date(today.getTime() + TWO_HOURS_MILLISECONDS);

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



function latitude(value) {
  const regex = /^-?([1-8]?[0-9]\.{1}\d{6}$|90\.{1}0{6}$)/;
  return regex.test(value);
}

function longitude(value) {
  const regex = /^-?((([1]?[0-7][0-9]|[1-9]?[0-9])\.{1}\d{6}$)|[1]?[1-8][0]\.{1}0{6}$)/;
  return regex.test(value);
}

/*
This function tries to allow:
Local UK numbers beginning 0 e.g. 01225123456 or 07777777777
International numbers beginning either + or 00
Spaces, hyphens, brackets and anything other than numbers are rejected.
The number is not validated beyond these requirements.
Min and max lengths depend on format:
-UK numbers and international numnbers starting + can range 9-34 chars
-International numbers starting 00 10-15
These lengths are a bit arbitrary.
*/
function validIntlPhone(value) {
  const regex =  /^(\+|00?)[1-9][0-9]{7,32}$/;


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
  realDate,
  realDateInFuture,
  bornAfter1900,
  realDateFromString,
  currentOrPastDate,
  validTime,
  validFlag,
  validPort,
  validISOCountryLength,
  isValidNationality,
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
  preventZ,
  dateNotMoreThanMonthInFuture,
  isAlphanumeric,
  isAlpha,
  isAddressValidCharacters,
  isPostCodeValidCharacters,
  isValidAirportCode,
  dateNotMoreThanTwoDaysInFuture,
  isTwoHoursPriorDeparture,
  convertDateToUTC,
  containTabs,
  isValidDocumentType,
  isOtherDocumentWithDocumentDesc,
  isAbleToCancelGar,
  nameHasNoNumbers
};
