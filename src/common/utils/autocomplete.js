const countries = require('i18n-iso-countries');
const en = require('i18n-iso-countries/langs/en.json');
const logger = require('./logger')(__filename);
const airportList = require('./airport_codes.json');
/**
 * Utility function for generating the list of country codes in a format for this app.
 * This essentially means taking the more normally used alpha-2 (GB) code and country
 * pair and using instead alpha-3 (GBR) as the key.
 */

const COUNTRY_SKIP_LIST = [
  'ABW', 'AIA', 'ALA', 'ANT', 'ASM', 'ATA', 'ATF', 'BES', 'BLM', 'BMU', 'BVT',
  'CCK', 'COK', 'CUW', 'CXR', 'CYM', 'D', 'ESH', 'FLK', 'FRO', 'GGY', 'GIB',
  'GLP', 'GRL', 'GUF', 'GUM', 'HMD', 'IMN', 'JEY', 'MAF', 'MID', 'MNP', 'MSR',
  'MTQ', 'MYT', 'NCL', 'NFK', 'NIU', 'PCN', 'PRI', 'PSE', 'PYF', 'REU', 'SGS', 'SHN',
  'SJM', 'SPM', 'SRB', 'SXM', 'TCA', 'TKL', 'UMI', 'VGB', 'VIR', 'WLF', 'XCT', 'XKK'
]

// ISO/IEC 7501-1 codes, not part of ISO 3166/MA
const customNationalities = [
  { code: 'GBD', label: 'British Overseas Territories Citizen (GBD)' },
  { code: 'GBN', label: 'British National (Overseas) (GBN)' },
  { code: 'GBO', label: 'British Overseas Citizen (GBO)' },
  { code: 'RKS', label: 'Kosovo' },
  { code: 'PSE', label: 'Palestine Authority' },
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

    if (COUNTRY_SKIP_LIST.includes(alpha3)) {
      console.log(`Skipping ${alpha3} as it is in the skip list`);
      return;
    }

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


module.exports = {
  generateNationalityList,
  getCountryFromCode,
  nationalityList,
  airportList,
  airportCodeList
};
