document.addEventListener('DOMContentLoaded', () => {
  const pagePrefix = document.getElementById('page-prefix');
  if (pagePrefix) {
    const prefix = pagePrefix.dataset.prefix;

    const day = document.getElementById(`${prefix}Day`);
    if (day) {
      day.addEventListener('keyup', function () {
        sanitiseDateOrTime(this.value, 'day');
      });
    }
    const month = document.getElementById(`${prefix}Month`);
    if (month) {
      month.addEventListener('keyup', function () {
        sanitiseDateOrTime(this.value, 'month');
      });
    }
    const year = document.getElementById(`${prefix}Year`);
    if (year) {
      year.addEventListener('keyup', function () {
        sanitiseDateOrTime(this.value, 'year');
      });
    }
    const hour = document.getElementById(`${prefix}Hour`);
    if (hour) {
      hour.addEventListener('keyup', function () {
        sanitiseDateOrTime(this.value, 'hour');
      });
    }
    const minute = document.getElementById(`${prefix}Minute`);
    if (minute) {
      minute.addEventListener('keyup', function () {
        sanitiseDateOrTime(this.value, 'minute');
      });
    }
  }
});
