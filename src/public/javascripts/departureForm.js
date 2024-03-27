const departureDay = document.getElementById("departureDay");
const departureMonth = document.getElementById("departureMonth");
const departureYear = document.getElementById("departureYear");

const departureHour = document.getElementById("departureHour");
const departureMinute = document.getElementById("departureMinute");

const departureDegrees = document.getElementById("departureDegrees");
const departureMinutes = document.getElementById("departureMinutes");
const departureSeconds = document.getElementById("departureSeconds");

const departureLongDegrees = document.getElementById("departureLongDegrees");
const departureLongMinutes = document.getElementById("departureLongMinutes");
const departureLongSeconds = document.getElementById("departureLongSeconds");

const pageForm = document.getElementById('page-form');
const twoHourWarningText = document.getElementById("twoHourWarningText");
const fortyEightHourWarningText = document.getElementById("fortyEightHourWarningText");
const confirmWarnedDepartureDialog = document.getElementById("confirmWarnedDepartureDialog")
const continueWithWarnedDate = document.getElementById('continueWithWarnedDate');
const departureDateWarningMessages = document.getElementsByClassName("departureDateWarningMessages");
let departureFormSubmitter = undefined;

dialogPolyfill.registerDialog(confirmWarnedDepartureDialog);

const departureDate = new Date(
  Number(departureYear.value),
  Number(departureMonth.value) - 1,
  Number(departureDay.value),
  Number(departureHour.value),
  Number(departureMinutes.value)
)

function showDepartureDateWarningMessages(providedDate) {
  twoHourWarningText.hidden = isTwoHoursPriorDeparture(providedDate);
  fortyEightHourWarningText.hidden = dateNotMoreThanTwoDaysInFuture(providedDate);
}

setTimeout(() => {
  if ([departureDate.textContent, departureTime.textContent].includes('')) {
    return false;
  }

  showDepartureDateWarningMessages(departureDate);
}, 500)


pageForm.addEventListener("submit", (e) => {
  if ([
    departureYear.value, 
    departureMonth.value,
    departureDay.value,
    departureHour.value,
    departureMinute.value
  ].includes('')) {
    return true;
  }

  if (departureFormSubmitter) {
    return true;
  }
  
  if (isTwoHoursPriorDeparture(departureDate) && dateNotMoreThanTwoDaysInFuture(departureDate)) {
    return true;
  }

  e.preventDefault();
  departureFormSubmitter = e.submitter;
  confirmWarnedDepartureDialog.showModal();
});

confirmWarnedDepartureDialog.addEventListener("close", (e) => {
  departureFormSubmitter = undefined;
});
continueWithWarnedDate.addEventListener("click", (e) => {
    pageForm.requestSubmit(departureFormSubmitter);
});

departureDay.addEventListener("keyup", (e) => {
  e.target.value = sanitiseValue(e.target.value, 'day');
  autoTab(departureDay, 'day', departureMonth);
  showDepartureDateWarningMessages(departureDate);
});

departureMonth.addEventListener("keyup", (e) => {
  e.target.value = sanitiseValue(e.target.value, 'month');
  autoTab(departureMonth, 'month', departureYear);
  showDepartureDateWarningMessages(departureDate);
});

departureYear.addEventListener("keyup", (e) => {
  e.target.value = sanitiseValue(e.target.value, 'year')
  showDepartureDateWarningMessages(departureDate);
});  

departureHour.addEventListener("keyup", (e) => {
  e.target.value = sanitiseValue(e.target.value, 'hour');
  autoTab(departureHour, 'hour', departureMinute);
  showDepartureDateWarningMessages(departureDate);
});

departureMinute.addEventListener("keyup", (e) => {
  e.target.value = sanitiseValue(e.target.value, 'minute');
  showDepartureDateWarningMessages(departureDate);
});

departureDegrees.addEventListener("keyup", (e) => {
  e.target.value = sanitiseValue1(e.target.value, 'degrees');
});

departureMinutes.addEventListener("keyup", (e) => {
  e.target.value = sanitiseValue2(e.target.value, 'minutes');
  autoTab1(departureMinutes, 'minutes', departureSeconds);
});

departureSeconds.addEventListener("keyup", (e) => {
  e.target.value = sanitiseValue1(e.target.value, 'seconds');
});

departureLongDegrees.addEventListener("keyup", (e) => {
  e.target.value = sanitiseValue1(e.target.value, 'degrees');
});

departureLongMinutes.addEventListener("keyup", (e) => {
  e.target.value = sanitiseValue2(e.target.value, 'minutes');
  autoTab1(departureLongMinutes, 'minutes', departureLongSeconds);
});
  
departureLongSeconds.addEventListener("keyup", (e) => {
  e.target.value = sanitiseValue1(e.target.value , 'seconds');
});