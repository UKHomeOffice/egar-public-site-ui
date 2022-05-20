const airportCodes = require('./airport_codes.json');
const airportCodes2 = require('./airport2_codes.json');
const notBritishMsg = 'Either the Arrival or Departure port must be a UK port';

function isBritishAirport(airports) {
  if (airports.includes(null) || airports.includes(undefined) || airports.includes('YYYY') || airports.includes('ZZZZ'))  {
    return true;
  } else {
    const britishAirports = airportCodes.filter(item => item.british).map(item => item.id);
    const britishAirports2 = airportCodes2.filter(item => item.british).map(item => item.id);
    if (britishAirports.includes(airports[0]) || britishAirports.includes(airports[1]) || britishAirports2.includes(airports[1]) || britishAirports2.includes(airports[0])) {
      return true;
    }    
  }
  return false;
}

module.exports = {
  isBritishAirport,
  notBritishMsg,
};
