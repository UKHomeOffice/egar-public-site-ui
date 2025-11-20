document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('save-and-exit').addEventListener('click', (event) => {
    sendAnalytics(event, 'Saved Aircraft Edit - Save', 'click');
  });
  document.getElementById('exit-without-saving').addEventListener('click', (event) => {
    sendAnalytics(event, 'Saved Aircraft Edit - Cancel', 'click');
  });
});

