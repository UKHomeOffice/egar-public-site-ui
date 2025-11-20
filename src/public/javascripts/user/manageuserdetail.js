
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('submit').addEventListener('click', (event) => {
    sendAnalytics(event, 'Edit Account - Save', 'click');
  });
  document.getElementById('cancel').addEventListener('click', (event) => {
    sendAnalytics(event, 'Edit Account - Cancel', 'click');
  });
});

