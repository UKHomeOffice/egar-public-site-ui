import validator from "/utils/shared_validator.js";

const dobPrefix = "dob";
const expiryPrefix = "expiry";


function dateHandler(prefix) {
  const dateDay = document.getElementById(prefix + "Day");
  const dateMonth = document.getElementById(prefix + "Month");
  const dateYear = document.getElementById(prefix + "Year");

  dateDay.addEventListener("keyup", (e) => {
    e.target.value = validator.sanitiseDateOrTime(e.target.value, 'day');
    validator.autoTab(dateDay, 'day', dateMonth);
  });

  dateMonth.addEventListener("keyup", (e) => {
    e.target.value = validator.sanitiseDateOrTime(e.target.value, 'month');
    validator.autoTab(dateMonth, 'month', dateYear);
  });

  dateYear.addEventListener("keyup", (e) => {
    e.target.value = validator.sanitiseDateOrTime(e.target.value, 'year')
  });
}

dateHandler(dobPrefix);
dateHandler(expiryPrefix);
