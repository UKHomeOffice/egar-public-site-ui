const departureDay = document.getElementById('departureDay');
const departureMonth = document.getElementById('departureMonth');
const departureYear = document.getElementById('departureYear');

const departureHourTime = document.getElementById('departureHour');
const departureMinuteTime = document.getElementById('departureMinute');

const pageForm = document.getElementById('page-form');
const confirmWarnedDepartureDialog = document.getElementById('confirmWarnedDepartureDialog');
const continueWithWarnedDate = document.getElementById('continueWithWarnedDate');

const twoHourWarningTexts = Array.from(document.getElementsByClassName('twoHourWarningText'));
const fortyEightHourWarningTexts = Array.from(
  document.getElementsByClassName('fortyEightHourWarningText')
);
const daylightSavingWarningTexts = Array.from(
  document.getElementsByClassName('daylightSavingWarning')
);

let departureFormSubmitter = undefined;

dialogPolyfill.registerDialog(confirmWarnedDepartureDialog);

const departureDate = () => {
  return new Date(
    Number(departureYear.value),
    Number(departureMonth.value) - 1,
    Number(departureDay.value),
    Number(departureHourTime.value),
    Number(departureMinuteTime.value)
  );
};

function showDepartureDateWarningMessages(providedDate) {
  twoHourWarningTexts.forEach(
    ($element) => ($element.hidden = isTwoHoursPriorDeparture(providedDate))
  );
  fortyEightHourWarningTexts.forEach(
    ($element) => ($element.hidden = dateNotMoreThanTwoDaysInFuture(providedDate))
  );
}

window.addEventListener('load', () => {
  // So it does not show warning message when form is blank
  if (
    [
      departureYear.value,
      departureMonth.value,
      departureDay.value,
      departureHourTime.value,
      departureMinuteTime.value,
    ].includes('')
  ) {
    return;
  }

  showDepartureDateWarningMessages(departureDate());
});

pageForm.addEventListener('submit', (e) => {
  // Instead of dialog confirmination, it will submit the form so post controller validations catches this.
  if (
    [
      departureYear.value,
      departureMonth.value,
      departureDay.value,
      departureHourTime.value,
      departureMinuteTime.value,
    ].includes('')
  ) {
    return;
  }

  if (departureFormSubmitter) {
    return;
  }

  if (
    isTwoHoursPriorDeparture(departureDate()) &&
    dateNotMoreThanTwoDaysInFuture(departureDate())
  ) {
    return;
  }

  e.preventDefault();
  departureFormSubmitter = e.submitter;
  showDepartureDateWarningMessages(departureDate());
  confirmWarnedDepartureDialog.showModal();
});

confirmWarnedDepartureDialog.addEventListener('close', (e) => {
  departureFormSubmitter = undefined;
});
continueWithWarnedDate.addEventListener('click', (e) => {
  pageForm.requestSubmit(departureFormSubmitter);
});

departureDay.addEventListener('keyup', (e) => {
  e.target.value = sanitiseDateOrTime(e.target.value, 'day');
  autoTab(departureDay, 'day', departureMonth);
  showDepartureDateWarningMessages(departureDate());
});

departureMonth.addEventListener('keyup', (e) => {
  e.target.value = sanitiseDateOrTime(e.target.value, 'month');
  autoTab(departureMonth, 'month', departureYear);
  showDepartureDateWarningMessages(departureDate());
});

departureYear.addEventListener('keyup', (e) => {
  e.target.value = sanitiseDateOrTime(e.target.value, 'year');
  showDepartureDateWarningMessages(departureDate());
});

departureHourTime.addEventListener('keyup', (e) => {
  e.target.value = sanitiseDateOrTime(e.target.value, 'hour');
  autoTab(departureHourTime, 'hour', departureMinuteTime);
  showDepartureDateWarningMessages(departureDate());
});

departureMinuteTime.addEventListener('keyup', (e) => {
  e.target.value = sanitiseDateOrTime(e.target.value, 'minute');
  showDepartureDateWarningMessages(departureDate());
});
