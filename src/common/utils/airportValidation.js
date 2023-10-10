const airportCodes = require('./airport_codes.json');

const notBritishMsg = 'Either the Arrival or Departure port must be a UK port';

function includesOneBritishAirport(airports) {
  if (airports.includes(null) || airports.includes(undefined) || airports.includes('YYYY') || airports.includes('ZZZZ')) {
    return true;
  } else {
    const britishAirports = airportCodes.filter(item => item.british).map(item => item.id);
    const britishAirports2 = airportCodes.filter(item => item.british).map(item => item.id2);
    if (britishAirports.includes(airports[0]) || britishAirports.includes(airports[1])) {
      return true;
    }
    if (britishAirports2.includes(airports[0]) || britishAirports2.includes(airports[1])) {
      return true;
    }
  }
  return false;
}

function findAirportForCode(airportCode) {
  if (!airportCode) {
    return null;
  }

  const matches = airportCodes.filter(item => [item.id, item.id2].includes(airportCode));

  if (matches.length > 1) {
    throw new Error(`airport code ${airportCode} matched more than one airport`);
  }

  if (matches.length == 1) {
    return matches[0];
  }

  return null;
}

//TODO: include this function into includesOneBritishAirport instead of more confusing logic implemented there
function isBritishAirport(airportCode) {
  const airport = findAirportForCode(airportCode);

  if (airport == null) {
    throw new Error(`no airport matched code ${airportCode}`);
  }

  return airport.british;
}

function isJourneyUKInbound(departureCode, arrivalCode) {

  if (!departureCode || !arrivalCode) {
    return true;
  }

  const departureAirfield = findAirportForCode(departureCode);
  const arrivalAirfield = findAirportForCode(arrivalCode);

  return !departureAirfield.british && arrivalAirfield.british;
  //TODO implement Crown Dependency logic

}

module.exports = {
  includesOneBritishAirport,
  notBritishMsg,
  isBritishAirport,
  isJourneyUKInbound
};
