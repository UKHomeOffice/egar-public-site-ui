
import validator from "/utils/shared_validator.js";

const arrivalDay = document.getElementById("arrivalDay");
const arrivalMonth = document.getElementById("arrivalMonth");
const arrivalYear = document.getElementById("arrivalYear");
const arrivalHourTime = document.getElementById("arrivalHour");
const arrivalMinuteTime = document.getElementById("arrivalMinute");

arrivalDay.addEventListener("keyup", (e) => {
  e.target.value = validator.sanitiseDateOrTime(e.target.value, 'day');
  validator.autoTab(arrivalDay, 'day', arrivalMonth);
});

arrivalMonth.addEventListener("keyup", (e) => {
  e.target.value = validator.sanitiseDateOrTime(e.target.value, 'month');
  validator.autoTab(arrivalMonth, 'month', arrivalYear);
});

arrivalYear.addEventListener("keyup", (e) => {
  e.target.value = validator.sanitiseDateOrTime(e.target.value, 'year')
});

arrivalHourTime.addEventListener("keyup", (e) => {
  e.target.value = validator.sanitiseDateOrTime(e.target.value, 'hour');
  validator.autoTab(arrivalHourTime, 'hour', arrivalMinuteTime);
});

arrivalMinuteTime.addEventListener("keyup", (e) => {
  e.target.value = validator.sanitiseDateOrTime(e.target.value, 'minute');
});
