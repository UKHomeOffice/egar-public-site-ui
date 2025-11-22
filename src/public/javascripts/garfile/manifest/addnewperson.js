document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('add-person-manifest').addEventListener('click', (event) => {
    sendAnalytics(event, 'Save and Exit', 'click');
  });
});
