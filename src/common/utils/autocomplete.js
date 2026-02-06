const nationalities = require('./nationality');
const nationalityList = nationalities.nationalities();
const countryList = nationalities.countries();
const airportUtility = require('./airports');

function getCountryFromCode(countryCode) {
  const country = nationalities.getByCode(countryCode);
  return country?.label ?? countryCode;
}

const airportList = airportUtility.allAirports();

module.exports = {
  getCountryFromCode,
  nationalityList,
  countryList,
  airportList,
};
