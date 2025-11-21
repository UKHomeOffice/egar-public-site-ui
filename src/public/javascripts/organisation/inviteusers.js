document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('continue').addEventListener('click', (event) => {
    sendAnalytics(event, 'Invite User - Continue', 'click');
  });
  document.getElementById('exit').addEventListener('click', (event) => {
    sendAnalytics(event, 'Invite User - Exit', 'click');
  });
});
