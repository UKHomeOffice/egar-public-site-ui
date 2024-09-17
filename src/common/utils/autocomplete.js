const countries = require('i18n-iso-countries');
const en = require('i18n-iso-countries/langs/en.json');
const logger = require('./logger')(__filename);
const airportList = require('./airport_codes.json');
/**
 * Utility function for generating the list of country codes in a format for this app.
 * This essentially means taking the more normally used alpha-2 (GB) code and country
 * pair and using instead alpha-3 (GBR) as the key.
 */
const customNationalities = [
  { code: 'GBD', label: 'British Overseas Territories Citizen (GBD)' },
  { code: 'GBN', label: 'British National (Overseas)(GBN)' },
  { code: 'GBO', label: 'British Overseas Citizen (GBO)' },
];

const generateCountryList = () => {
  logger.info('Obtaining all countries and converting to alpha 3 codes');
  const alpha3List = [];
  countries.registerLocale(en);
  alpha3List.push({ code: '', label: '' });

  customNationalities.forEach((nationality) => {
    alpha3List.push(nationality);
  });

  Object.keys(countries.getNames('en')).forEach((key) => {
    const alpha3 = countries.alpha2ToAlpha3(key);
    const countryName = countries.getNames('en')[key];
    alpha3List.push({ code: alpha3, label: `${countryName} (${alpha3})` });
  });

  return alpha3List;
};

const countryList = generateCountryList();

/**
 * get the country label from a country code
 * @param  {String} countryCode
 */
function getCountryFromCode(countryCode) {
  const countryFromCode = countryList.find(country => country.code === countryCode);
  return countryFromCode === undefined ? countryCode : countryFromCode.label;
}

/**
 * generate list of airport codes from the airport list
 * @param {Array<Object>}
 * @returns {Array<String>} List of airport codes
 */
function listOfAirportCodes(airportList) {
  const airportCodes = [];

  airportList.forEach((airport) => {
    const iataCode = airport.id
    const icaoCode = airport.id2;
    airportCodes.push(iataCode);
    airportCodes.push(icaoCode);
  });

  return airportCodes
}

const airportCodeList = listOfAirportCodes(airportList);


module.exports = {
  generateCountryList,
  getCountryFromCode,
  countryList,
  airportList,
  airportCodeList
};
