const prefixArr = ['departure', 'arrival', 'craftBase'];

const portPrefix = prefixArr
  .map((prefix) => document.getElementById(`port-prefix-${prefix}`))
  .filter((pr) => pr)
  .map((pr) => pr.dataset.prefix);

portPrefix.forEach((prefix) => {
  if (prefix) {
    const selectElement = document.querySelector(`#${prefix}Port`);
    accessibleAutocomplete.enhanceSelectElement({ selectElement, minLength: 2 });
    document.getElementById(`${prefix}Port`).setAttribute('aria-describedby', `${prefix}Port-hint`);
  }
});
