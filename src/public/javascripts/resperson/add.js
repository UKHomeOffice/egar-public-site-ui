document.addEventListener("DOMContentLoaded", () => {
  accessibleAutocomplete.enhanceSelectElement(
    {
      selectElement: document.querySelector('#responsibleCountry')
    }
  );
  document.getElementById("add-and-exit").addEventListener("click", (event) => {
    sendAnalytics(event, 'Saved Aircraft Add - Save', 'click');
  })
  document.getElementById("cancel-and-exit").addEventListener("click", (event) => {
    sendAnalytics(event, 'Saved Responsible person Add - Cancel', 'click');
  })
});
