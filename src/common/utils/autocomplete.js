const nationalities = require('./nationality');
const oldNationality = require('./old_nationality_lib');
const logger = require('./logger')(__filename);
const airportList = require('./airport_codes.json');
const {USE_NEW_NATIONALITY_LIST_PROVIDER} = require("../config");

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
      : {label: oldNationality.getCountryFromCode(countryCode)};

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
  getCountryFromCode,
  nationalityList,
  airportList,
  airportCodeList
};
