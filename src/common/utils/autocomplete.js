const logger = require('./logger')(__filename);
const countries = require("i18n-iso-countries");

/**
 * Utility function for generating the list of country codes in a format for this app.
 * This essentially means taking the more normally used alpha-2 (GB) code and country
 * pair and using instead alpha-3 (GBR) as the key.
 */
const generateCountryList = () => {
  logger.info('Obtaining all countries and converting to alpha 3 codes')
  const alpha3List = [];
  countries.registerLocale(require("i18n-iso-countries/langs/en.json"));
  Object.keys(countries.getNames('en')).map((key) => {
    const alpha3 = countries.alpha2ToAlpha3(key);
    alpha3List.push({code: alpha3, label: countries.getNames('en')[key] + ' (' + alpha3 + ')'});
  });

  return alpha3List;
};

exports.generateCountryList = generateCountryList;