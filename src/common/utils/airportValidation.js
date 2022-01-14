const airportCodes = require('./airport_codes.json');

function isBritishAirport(airports) {
  if (airports.includes(null) || airports.includes(undefined)) {
    return true;
  } else {
    const britishAirports = airportCodes.filter(value => value.british).map(item => item.id);
    if (britishAirports.includes(airports[0]) || britishAirports.includes(airports[1])) {
      return true;
    }
  }
  return false;
}

module.exports = {
  isBritishAirport,
};
