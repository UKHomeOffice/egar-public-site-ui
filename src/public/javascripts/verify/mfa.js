document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('submit').addEventListener('click', (event) => {
    sendAnalytics(event, 'Send MFA code - submit', 'click');
  });
});
