const portPrefix = document.getElementById('port-prefix');
if (portPrefix) {
  const prefix = portPrefix.dataset.prefix;

  const selectElement = document.querySelector(`#${prefix}Port`);
  accessibleAutocomplete.enhanceSelectElement({ selectElement, minLength: 2 });
  document.getElementById(`${prefix}Port`).setAttribute('aria-describedby', `${prefix}Port-hint`);
}
