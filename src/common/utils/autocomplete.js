const nationalities = require('./nationality');
const logger = require('./logger')(__filename);
const airportList = require('./airport_codes.json');

/**
 * Utility function for generating the list of country codes in a format for this app.
 * This essentially means taking the more normally used alpha-2 (GB) code and country
 * pair and using instead alpha-3 (GBR) as the key.
 */


const nationalityList = nationalities.getAll();


const exists = (code) => nationalities.exists(code);

/**
 * get the country label from a country code
 * @param  {String} countryCode
 */
function getCountryFromCode(countryCode) {
  const nationality = nationalities.getByCode(countryCode);
  return nationality.label || countryCode;
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
