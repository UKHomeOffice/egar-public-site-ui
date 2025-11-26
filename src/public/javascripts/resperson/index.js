document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('addResPersonToGAR').addEventListener('click', (event) => {
    sendAnalytics(event, 'Add resperson to GAR - submit', 'click');
  });
});
