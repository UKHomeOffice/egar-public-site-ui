document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('login').addEventListener('click', (event) => {
    sendAnalytics(event, 'Register - submit', 'click');
  });
});


