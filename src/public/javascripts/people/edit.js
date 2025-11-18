document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('travelDocumentType').addEventListener('change', checkDocumentType);
  document.getElementById('save-and-exit').addEventListener('click', () => {
    sendAnalytics(event, 'Saved People Edit - Save', 'click');
  });
  document.getElementById('exit-without-saving').addEventListener('click', () => {
    sendAnalytics(event, 'Saved People Edit - Cancel', 'click');
  });
});
