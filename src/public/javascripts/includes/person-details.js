document.addEventListener('DOMContentLoaded', () => {
  accessibleAutocomplete.enhanceSelectElement({
    selectElement: document.querySelector('#nationality'),
  });
  accessibleAutocomplete.enhanceSelectElement({
    selectElement: document.querySelector('#issuingState'),
  });
  document.getElementById('travelDocumentType').addEventListener('onchange', () => {
    checkDocumentType();
  });
});
