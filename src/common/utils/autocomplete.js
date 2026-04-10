const nationalities = require('./nationality');
const nationalityList = nationalities.nationalities();
const countryList = nationalities.countries();
const airportList = require('./airport_codes.json');

function getCountryFromCode(countryCode) {
  const country = nationalities.getByCode(countryCode);
  return country?.label ?? countryCode;
}

/**
 * generate list of airport codes from the airport list
 * @param {Array<Object>}
 * @returns {Array<String>} List of airport codes
 */
function listOfAirportCodes(airportList) {
  const airportCodes = [];

  airportList.forEach((airport) => {
    const iataCode = airport.id;
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
  countryList,
  airportList,
  airportCodeList,
};
