document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('submit').addEventListener('click', (event) => {
    sendAnalytics(event, 'Assign Role - Submit', 'click');
  });
  document.getElementById('exit').addEventListener('click', (event) => {
    sendAnalytics(event, 'Assign Role - Exit', 'click');
  });
});
