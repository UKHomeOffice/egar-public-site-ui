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

departureDay.addEventListener("keyup", (e) => {
  e.target.value = sanitiseDateOrTime(e.target.value, 'day');
  autoTab(departureDay, 'day', departureMonth);
});

departureMonth.addEventListener("keyup", (e) => {
  e.target.value = sanitiseDateOrTime(e.target.value, 'month');
  autoTab(departureMonth, 'month', departureYear);
});

departureYear.addEventListener("keyup", (e) => {
  e.target.value = sanitiseDateOrTime(e.target.value, 'year')
});  

departureHourTime.addEventListener("keyup", (e) => {
  e.target.value = sanitiseDateOrTime(e.target.value, 'hour');
  autoTab(departureHourTime, 'hour', departureMinuteTime);
});

departureMinuteTime.addEventListener("keyup", (e) => {
  e.target.value = sanitiseDateOrTime(e.target.value, 'minute');
});

departureDegrees.addEventListener("keyup", (e) => {
  e.target.value = sanitiseCoordinateDegreesOrSeconds(e.target.value, 'degrees');
});

departureMinutes.addEventListener("keyup", (e) => {
  e.target.value = sanitiseCoordinateMinutes(e.target.value, 'minutes');
  autoTab1(departureMinutes, 'minutes', departureSeconds);
});

departureSeconds.addEventListener("keyup", (e) => {
  e.target.value = sanitiseCoordinateDegreesOrSeconds(e.target.value, 'seconds');
});

departureLongDegrees.addEventListener("keyup", (e) => {
  e.target.value = sanitiseCoordinateDegreesOrSeconds(e.target.value, 'degrees');
});

departureLongMinutes.addEventListener("keyup", (e) => {
  e.target.value = sanitiseCoordinateMinutes(e.target.value, 'minutes');
  autoTab1(departureLongMinutes, 'minutes', departureLongSeconds);
});
  
departureLongSeconds.addEventListener("keyup", (e) => {
  e.target.value = sanitiseCoordinateDegreesOrSeconds(e.target.value , 'seconds');
});