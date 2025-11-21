document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('add-person-manifest').addEventListener('click', (event) => {
    sendAnalytics(event, 'GAR Manifest Edit Person - Save', 'click');
  });
  document.getElementById('exit-person-manifest').addEventListener('click', (event) => {
    sendAnalytics(event, 'GAR Manifest Edit Person - Cancel', 'click');
  });
});


