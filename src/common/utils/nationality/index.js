const nationalityData = require('./countries.json');

const nationalities = {
  // Get all nationalities as array (for dropdowns/autocomplete)
  getAll: () => Object.values(nationalityData).sort((a, b) => a.name.localeCompare(b.name)),

  nationalities: () => Object.values(nationalityData).filter((item) => item?.passport_issuing === true),

  countries: () => Object.values(nationalityData).filter((item) => item?.country === true),

  // Lookup nationality by code - now much simpler!
  getByCode: (code) => {
    return nationalityData[code] || { code, label: code };
  },

  exists: (code) => nationalityData[code] !== undefined,

  // Search nationalities by text (case-insensitive)
  search: (text) => {
    if (!text) return Object.values(nationalityData);
    const searchTerm = text.toLowerCase();
    return Object.values(nationalityData).filter((nationality) => nationality.label.toLowerCase().includes(searchTerm));
  },

  // Get just the list (compatible with current autocomplete.js usage)
  list: Object.values(nationalityData),

  // Direct access to the map for advanced usage
  map: nationalityData,
};

module.exports = nationalities;
