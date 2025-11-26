document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('add-and-exit').addEventListener('click', (event) => {
    sendAnalytics(event, 'Saved Aircraft Add - Save', 'click');
  });
  document.getElementById('exit-without-saving').addEventListener('click', (event) => {
    sendAnalytics(event, 'Saved Aircraft Add - Cancel', 'click');
  });
});
