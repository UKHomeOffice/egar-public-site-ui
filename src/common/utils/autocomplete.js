import countries from 'i18n-iso-countries';
import en from 'i18n-iso-countries/langs/en.json' with { type: 'json' };
import loggerFactory from './logger.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const logger = loggerFactory(__filename);
import airportList from './airport_codes.json' with { type: "json"};
/**
 * Utility function for generating the list of country codes in a format for this app.
 * This essentially means taking the more normally used alpha-2 (GB) code and country
 * pair and using instead alpha-3 (GBR) as the key.
 */

// ISO/IEC 7501-1 codes, not part of ISO 3166/MA
const customNationalities = [
  { code: 'GBD', label: 'British Overseas Territories Citizen (GBD)' },
  { code: 'GBN', label: 'British National (Overseas) (GBN)' },
  { code: 'GBO', label: 'British Overseas Citizen (GBO)' },
];

const generateNationalityList = () => {
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

const nationalityList = generateNationalityList();

/**
 * get the country label from a country code
 * @param  {String} countryCode
 */
function getCountryFromCode(countryCode) {
  const countryFromCode = nationalityList.find(country => country.code === countryCode);
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

  return airportCodes;
}

const airportCodeList = listOfAirportCodes(airportList);


export default {
  generateNationalityList,
  getCountryFromCode,
  nationalityList,
  airportList,
  airportCodeList
};
