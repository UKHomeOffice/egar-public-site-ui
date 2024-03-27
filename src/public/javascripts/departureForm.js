const twoHourWarningText = document.getElementById("twoHourWarningText");
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
const confirmWarnedDepartureDialog = document.getElementById("confirmWarnedDepartureDialog")
const continueWithWarnedDate = document.getElementById('continueWithWarnedDate');
let departureFormSubmitter = undefined;

function isTwoHoursPriorDeparture() {  
  const TWO_HOURS = 60 * 60 * 1000 * 2;
  const today = new Date()
  const twoHoursPriorDepartureDate = new Date(today.getTime() + TWO_HOURS);

  const departureDate = new Date(
    Number(departureYear.value),
    Number(departureMonth.value) - 1,
    Number(departureDay.value),
    Number(departureHour.value),
    Number(departureMinute.value),
  );

  return twoHoursPriorDepartureDate.getTime() < departureDate.getTime();
}


pageForm.addEventListener("submit", (e) => {
  if (!isTwoHoursPriorDeparture() && departureFormSubmitter === undefined) {
    e.preventDefault();
    departureFormSubmitter = e.submitter;
    confirmWarnedDepartureDialog.showModal();
  }
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
  twoHourWarningText.hidden = isTwoHoursPriorDeparture();
});

departureMonth.addEventListener("keyup", (e) => {
  e.target.value = sanitiseValue(e.target.value, 'month');
  autoTab(departureMonth, 'month', departureYear);
  twoHourWarningText.hidden = isTwoHoursPriorDeparture();
});

departureYear.addEventListener("keyup", (e) => {
  e.target.value = sanitiseValue(e.target.value, 'year')
  twoHourWarningText.hidden = isTwoHoursPriorDeparture();
});  

departureHour.addEventListener("keyup", (e) => {
  e.target.value = sanitiseValue(e.target.value, 'hour');
  autoTab(departureHour, 'hour', departureMinute);
  twoHourWarningText.hidden = isTwoHoursPriorDeparture();
});

departureMinute.addEventListener("keyup", (e) => {
 e.target.value = sanitiseValue(e.target.value, 'minute');
 twoHourWarningText.hidden = isTwoHoursPriorDeparture();
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