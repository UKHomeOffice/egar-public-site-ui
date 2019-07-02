const logger = require('./logger')(__filename);
const countries = require("i18n-iso-countries");

/**
 * Utility class for generating the list of country codes in a format for this app.
 * 
 */

/**
 * Some pages just simply create a Cookie instance of the request and render
 * the response for the given page. So this is a convenience method to perform
 * that step.
 * 
 * @param {} req 
 * @param {*} res 
 * @param {*} page 
 */
const generateCountryList = (req, res, page) => {
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