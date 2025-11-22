document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('login').addEventListener('click', (event) => {
    sendAnalytics(event, 'OneLogin.Register - continue', 'click');
  });
});
