document.addEventListener('DOMContentLoaded', () => {
  // Select all forms with the "prevent-double-click" class
  const forms = document.querySelectorAll('form.prevent-double-click');

  forms.forEach((form) => {
    let isFormSubmitted = false; // Track if the form is already submitted

    // Attach an event listener to handle form submission
    form.addEventListener('submit', (e) => {
      // Check if the form has already been submitted
      if (isFormSubmitted) {
        e.preventDefault(); // Prevent the form from submitting again
      } else {
        isFormSubmitted = true; // Mark the form as submitted
      }
    });
  });

  document.querySelectorAll('.govuk-back-link[href="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      window.history.go(-1);
    });
  });
});

window.checkDocumentType = () => {
  if (document.getElementById('travelDocumentType').value == 'Other') {
    document.getElementById('travelDocumentOtherDiv').style.display = 'block';
  } else {
    document.getElementById('travelDocumentOtherDiv').style.display = 'none';
  }
};
window.sendAnalytics = (e, message, event) => {
  console.log('Send Analytics' + message);
  // this function is called but not defined.
  // Adding here so we can reintegrate with GA if necessary.
};

function isNumeric(input) {
  if (typeof input === 'string') {
    return input - parseFloat(input) + 1 >= 0;
  }
  return false;
}

function sanitiseDateOrTime(input, type) {
  const regex = type === 'year' ? '[0-9]{1,4}' : '[0-9]{1,2}';

  return input.match(regex) === null ? '' : input.match(regex)[0];
}

function autoTab(field1, dayMonthOrYear, field2) {
  let len = dayMonthOrYear === 'year' ? 4 : 2;

  let field1Value = sanitiseDateOrTime(field1.value, dayMonthOrYear);

  if (field1Value.length == len) {
    field2.focus();
  }
}

/**
 * Converts a date to UTC using the browser's timezone offset.
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
