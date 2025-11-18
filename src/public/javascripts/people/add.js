document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('travelDocumentType').addEventListener('change', checkDocumentType);
  document.getElementById('add-and-exit').addEventListener('click', (event) => {
    sendAnalytics(event, 'Saved People Add - Save', 'click');
  });
  document.getElementById('exit-without-adding').addEventListener('click', (event) => {
    sendAnalytics(event, 'Saved People Add - Cancel', 'click');
  });
});
