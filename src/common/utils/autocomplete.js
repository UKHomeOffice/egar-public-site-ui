const countries = require('i18n-iso-countries');
const en = require('i18n-iso-countries/langs/en.json');
const logger = require('./logger')(__filename);
const airportList = require('./airport_codes_v2.json');
/**
 * Utility function for generating the list of country codes in a format for this app.
 * This essentially means taking the more normally used alpha-2 (GB) code and country
 * pair and using instead alpha-3 (GBR) as the key.
 */
const generateCountryList = () => {
  logger.info('Obtaining all countries and converting to alpha 3 codes');
  const alpha3List = [];
  countries.registerLocale(en);
  Object.keys(countries.getNames('en')).forEach((key) => {
    const alpha3 = countries.alpha2ToAlpha3(key);
    const countryName = countries.getNames('en')[key];
    alpha3List.push({ code: alpha3, label: `${countryName} (${alpha3})` });
  });

  return alpha3List;
};

exports.generateCountryList = generateCountryList;
exports.airportList = airportList;
