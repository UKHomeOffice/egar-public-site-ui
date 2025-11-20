document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('create').addEventListener('click', (event) => {
    sendAnalytics(event, 'Create Organisation - Submit', 'click');
  });
});

