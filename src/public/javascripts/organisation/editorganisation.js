document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('save-and-exit').addEventListener('click', (event) => {
    sendAnalytics(event, 'Edit Organisation - Save and exit', 'click');
  });
  document.getElementById('exit-without-saving').addEventListener('click', (event) => {
    sendAnalytics(event, 'Edit Organisation - Exit without saving', 'click');
  });
});

