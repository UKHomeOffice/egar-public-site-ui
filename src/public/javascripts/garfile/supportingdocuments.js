document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('exit').addEventListener('click', (event) => {
    sendAnalytics(event, 'GAR Supporting Documents - Exit', 'click');
  });
});


