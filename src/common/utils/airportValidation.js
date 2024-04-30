const airportCodes = require('./airport_codes.json');
const logger = require('./logger')(__filename);

const notBritishMsg = 'Either the Arrival or Departure port must be a UK port';

function includesOneBritishAirport(airports) {


  if(!airports.every(airport => Boolean(airport))){
    return true;
  }
  if(!airports.every(airport => airport.match(/^[A-Z]{3,4}$/) )){
    //we can only check with airports codes (IATA, ICAO). If our airports are lat/long then we do not apply this restriction.
    return true;
  }

  const airport0 = findAirportForCode(airports[0]);
  const airport1 = findAirportForCode(airports[1]);

  return airport0.british || airport1.british;
  
  // if (airports.includes(null) || airports.includes(undefined) || airports.includes('YYYY') || airports.includes('ZZZZ')) {
  //   return true;
  // } else {
  //   const britishAirports = airportCodes.filter(item => item.british).map(item => item.id);
  //   const britishAirports2 = airportCodes.filter(item => item.british).map(item => item.id2);
  //   if (britishAirports.includes(airports[0]) || britishAirports.includes(airports[1])) {
  //     return true;
  //   }
  //   if (britishAirports2.includes(airports[0]) || britishAirports2.includes(airports[1])) {
  //     return true;
  //   }
  // }
  // return false;
}

function findAirportForCode(airportCode) {
  if (!isAnAirportCode(airportCode)) {
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

  const arrivalAirfield = findAirportForCode(arrivalCode);
  const departureAirfield = findAirportForCode(departureCode);

  if (departureAirfield && isAirportBritishOrCrownDependency(departureAirfield)) {
    return false;// we know departure and is within UK
  }

  if (arrivalAirfield && !isAirportBritishOrCrownDependency(arrivalAirfield)) {
    return false;// we know arrival airfield and not in UK
  }

  return true;//both unkown; don't know arrival but departure outside UK; don't know departure but arrival in UK
}

function isAirportBritishOrCrownDependency(airport) {
  return airport.british || airport.crownDependency;
}

function isAnAirportCode(airportCode) {
  //if airportCode is: null, undefined, empty string, return false
  if (!airportCode) {
    return false;
  }

  //if airportCode is one of the magic strings, return false
  if (['YYYY', 'ZZZZ'].includes(airportCode)) {
    return false;
  }

  return true;
}

module.exports = {
  includesOneBritishAirport,
  notBritishMsg,
  isBritishAirport,
  isJourneyUKInbound
};