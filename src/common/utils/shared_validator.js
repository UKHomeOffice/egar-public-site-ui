

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

export default {
  isTwoHoursPriorDeparture,
  dateNotMoreThanTwoDaysInFuture,
  autoTab,
  convertDateToUTC,
  sanitiseDateOrTime
}

