const countries = require('i18n-iso-countries');
const en = require('i18n-iso-countries/langs/en.json');
const logger = require('./logger')(__filename);

/**
 * Utility function for generating the list of country codes in a format for this app.
 * This essentially means taking the more normally used alpha-2 (GB) code and country
 * pair and using instead alpha-3 (GBR) as the key.
 */

// ISO/IEC 7501-1 codes, not part of ISO 3166/MA
const customNationalities = [
  { code: 'GBD', label: 'British Overseas Territories Citizen' },
  { code: 'GBN', label: 'British National (Overseas)' },
  { code: 'GBO', label: 'British Overseas Citizen' },
];

const generateNationalityList = () => {
  logger.info('Obtaining all countries and converting to alpha 3 codes');
  const alpha3List = [];
  countries.registerLocale(en);

  customNationalities.forEach((nationality) => {
    alpha3List.push({
      code: nationality.code,
      label: `${nationality.label} (${nationality.code})`,
    });
  });

  Object.keys(countries.getNames('en')).forEach((key) => {
    const alpha3 = countries.alpha2ToAlpha3(key);
    const countryName = countries.getNames('en')[key];
    alpha3List.push({ code: alpha3, label: `${countryName} (${alpha3})` });
  });

  return alpha3List;
};

const nationalityList = generateNationalityList();

/**
 * get the country label from a country code
 * @param  {String} countryCode
 */
function getCountryFromCode(countryCode) {
  const countryFromCode = nationalityList.find(
    (country) => country.code === countryCode
  );
  return countryFromCode === undefined ? countryCode : countryFromCode.label;
}

module.exports = {
  generateNationalityList,
  getCountryFromCode,
  nationalityList,
};
