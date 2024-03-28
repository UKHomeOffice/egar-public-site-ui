const departureDay = document.getElementById("departureDay");
const departureMonth = document.getElementById("departureMonth");
const departureYear = document.getElementById("departureYear");

const departureHourTime = document.getElementById("departureHour");
const departureMinuteTime = document.getElementById("departureMinute");

const departureDegrees = document.getElementById("departureDegrees");
const departureMinutes = document.getElementById("departureMinutes");
const departureSeconds = document.getElementById("departureSeconds");

const departureLongDegrees = document.getElementById("departureLongDegrees");
const departureLongMinutes = document.getElementById("departureLongMinutes");
const departureLongSeconds = document.getElementById("departureLongSeconds");

const pageForm = document.getElementById('page-form');
const confirmWarnedDepartureDialog = document.getElementById("confirmWarnedDepartureDialog")
const continueWithWarnedDate = document.getElementById('continueWithWarnedDate');

const twoHourWarningTexts = Array.from(document.getElementsByClassName("twoHourWarningText"));
const fortyEightHourWarningTexts = Array.from(document.getElementsByClassName("fortyEightHourWarningText"));

let departureFormSubmitter = undefined;

dialogPolyfill.registerDialog(confirmWarnedDepartureDialog);

const departureDate =  () => {
  return new Date(
    Number(departureYear.value),
    Number(departureMonth.value) - 1,
    Number(departureDay.value),
    Number(departureHourTime.value),
    Number(departureMinuteTime.value)
  )
};
  

function showDepartureDateWarningMessages(providedDate) {
  console.log(providedDate);
  twoHourWarningTexts.forEach($element => $element.hidden = isTwoHoursPriorDeparture(providedDate));
  fortyEightHourWarningTexts.forEach($element => $element.hidden = dateNotMoreThanTwoDaysInFuture(providedDate));
}

setTimeout(() => {
    // Instead of dialog confirmination, it will submit the form so post controller validations catches this.
    if ([
      departureYear.value, 
      departureMonth.value,
      departureDay.value,
      departureHourTime.value,
      departureMinuteTime.value
    ].includes('')) {
      return undefined;
    }

  showDepartureDateWarningMessages(departureDate());
}, 500)


pageForm.addEventListener("submit", (e) => {
    // Instead of dialog confirmination, it will submit the form so post controller validations catches this.
  if ([
    departureYear.value, 
    departureMonth.value,
    departureDay.value,
    departureHourTime.value,
    departureMinuteTime.value
  ].includes('')) {
    return undefined;
  }

  if (departureFormSubmitter) {
    return undefined;
  }
  
  if (isTwoHoursPriorDeparture(departureDate()) && dateNotMoreThanTwoDaysInFuture(departureDate())) {
    return undefined;
  }

  e.preventDefault();
  departureFormSubmitter = e.submitter;
  showDepartureDateWarningMessages(departureDate());
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
  showDepartureDateWarningMessages(departureDate());
});

departureMonth.addEventListener("keyup", (e) => {
  e.target.value = sanitiseValue(e.target.value, 'month');
  autoTab(departureMonth, 'month', departureYear);
  showDepartureDateWarningMessages(departureDate());
});

departureYear.addEventListener("keyup", (e) => {
  e.target.value = sanitiseValue(e.target.value, 'year')
  showDepartureDateWarningMessages(departureDate());
});  

departureHourTime.addEventListener("keyup", (e) => {
  e.target.value = sanitiseValue(e.target.value, 'hour');
  autoTab(departureHourTime, 'hour', departureMinuteTime);
  showDepartureDateWarningMessages(departureDate());
});

departureMinuteTime.addEventListener("keyup", (e) => {
  e.target.value = sanitiseValue(e.target.value, 'minute');
  showDepartureDateWarningMessages(departureDate());
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