const nationalities = require('./nationality');
const oldNationality = require('./old_nationality_lib');
const logger = require('./logger')(__filename);
const { USE_NEW_NATIONALITY_LIST_PROVIDER } = require('../config');
const airportUtility = require('./airports');

/**
 * Utility function for generating the list of country codes in a format for this app.
 * This essentially means taking the more normally used alpha-2 (GB) code and country
 * pair and using instead alpha-3 (GBR) as the key.
 */

class NationalityUtil {
  constructor(useNew = false) {
    this.useNew = useNew;
  }

  getAll() {
    if (this.useNew) {
      return nationalities.getAll();
    }
    return oldNationality.generateNationalityList();
  }

  getCountryFromCode(countryCode) {
    const nationality = this.useNew
      ? nationalities.getByCode(countryCode)
      : { label: oldNationality.getCountryFromCode(countryCode) };

    return nationality?.label ?? countryCode;
  }
}

const nationalityUtil = new NationalityUtil(USE_NEW_NATIONALITY_LIST_PROVIDER);
const nationalityList = nationalityUtil.getAll();

/**
 * get the country label from a country code
 * @param  {String} countryCode
 */
function getCountryFromCode(countryCode) {
  return nationalityUtil.getCountryFromCode(countryCode);
}

const airportList = airportUtility.allAirports();

module.exports = {
  getCountryFromCode,
  nationalityList,
  airportList,
};
