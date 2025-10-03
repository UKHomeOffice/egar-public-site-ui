const submitGarForm = document.getElementById('submitGarForm');
const confirmWarnedDepartureDialog = document.getElementById(
  'confirmWarnedDepartureDialog'
);
const continueWithWarnedDate = document.getElementById(
  'continueWithWarnedDate'
);

const twoHourWarningTexts = Array.from(
  document.getElementsByClassName('twoHourWarningText')
);
const fortyEightHourWarningTexts = Array.from(
  document.getElementsByClassName('fortyEightHourWarningText')
);

const departureDate = document.getElementById('departureDate');
const departureTimeText = document.getElementById('departureTime');

let departureFormSubmitter = undefined;

dialogPolyfill.registerDialog(confirmWarnedDepartureDialog);

const fullDepartureDate = new Date(
  Date.parse(`${departureDate.textContent}T${departureTime.textContent}`)
);

function showDepartureDateWarningMessages(providedDate) {
  twoHourWarningTexts.forEach(
    ($element) => ($element.hidden = isTwoHoursPriorDeparture(providedDate))
  );
  fortyEightHourWarningTexts.forEach(
    ($element) =>
      ($element.hidden = dateNotMoreThanTwoDaysInFuture(providedDate))
  );
}

window.addEventListener('load', () => {
  // So it does not show warning message when is not filled
  if ([departureDate.textContent, departureTime.textContent].includes('')) {
    return undefined;
  }

  showDepartureDateWarningMessages(fullDepartureDate);
});

submitGarForm.addEventListener('submit', (e) => {
  // Instead of dialog confirmination, it will submit the form so post controller validations catches this.
  if ([departureDate.textContent, departureTime.textContent].includes('')) {
    return undefined;
  }

  if (departureFormSubmitter) {
    return undefined;
  }

  if (
    isTwoHoursPriorDeparture(fullDepartureDate) &&
    dateNotMoreThanTwoDaysInFuture(fullDepartureDate)
  ) {
    return undefined;
  }

  e.preventDefault();
  departureFormSubmitter = e.submitter;
  showDepartureDateWarningMessages(fullDepartureDate);
  confirmWarnedDepartureDialog.showModal();
});

confirmWarnedDepartureDialog.addEventListener('close', (e) => {
  departureFormSubmitter = undefined;
});
continueWithWarnedDate.addEventListener('click', (e) => {
  submitGarForm.requestSubmit(departureFormSubmitter);
});
