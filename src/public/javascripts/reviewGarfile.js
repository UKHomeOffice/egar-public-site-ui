const submitGarForm = document.getElementById("submitGarForm");
const confirmWarnedDepartureDialog = document.getElementById("confirmWarnedDepartureDialog")
const continueWithWarnedDate = document.getElementById('continueWithWarnedDate');

const twoHourWarningTexts = Array.from(document.getElementsByClassName("twoHourWarningText"));
const fortyEightHourWarningTexts = Array.from(document.getElementsByClassName("fortyEightHourWarningText"));

const departureDate = document.getElementById("departureDate");
const departureTimeText = document.getElementById("departureTime");

let departureFormSubmitter = undefined;

dialogPolyfill.registerDialog(confirmWarnedDepartureDialog);

const fullDepartureDate = new Date(Date.parse(`${departureDate.textContent}T${departureTime.textContent}`));

function showDepartureDateWarningMessages(providedDate) {
  twoHourWarningTexts.forEach($element => $element.hidden = isTwoHoursPriorDeparture(providedDate));
  fortyEightHourWarningTexts.forEach($element => $element.hidden = dateNotMoreThanTwoDaysInFuture(providedDate));
}

setTimeout(() => {
  if ([departureDate.textContent, departureTime.textContent].includes('')) {
    return false;
  }

  showDepartureDateWarningMessages(fullDepartureDate);
}, 500)


submitGarForm.addEventListener("submit", (e) => {
  if ([departureDate.textContent, departureTime.textContent].includes('')) {
    return true;
  }

  if (departureFormSubmitter) {
    return true;
  }
  
  if (isTwoHoursPriorDeparture(fullDepartureDate) && dateNotMoreThanTwoDaysInFuture(fullDepartureDate)) {
    return true;
  }

  e.preventDefault();
  departureFormSubmitter = e.submitter;
  showDepartureDateWarningMessages(fullDepartureDate);
  confirmWarnedDepartureDialog.showModal();
  
});

confirmWarnedDepartureDialog.addEventListener("close", (e) => {
  departureFormSubmitter = undefined;
});
continueWithWarnedDate.addEventListener("click", (e) => {
  submitGarForm.requestSubmit(departureFormSubmitter);
});