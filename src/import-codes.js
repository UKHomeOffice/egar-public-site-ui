const csv = require('csvtojson/v2');
const csvFile='./airports.dat';
const fs = require('fs');

/**
 * A converter to take in an openflights.org data file (in CSV format) and converting it into a JSON format that can be
 * used by sGAR.
 *
 * This will not be expected to be used during the app use and is expected to be run as:
 * 
 * node import-codes
 * 
 * Which will take a file called "airports.dat" which can be obtained via:
 * https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat
 * 
 * So Kudos to openflights: https://openflights.org/data.html
 */
csv({
  headers: ['id', 'name', 'city', 'country', 'IATA', 'ICAO', 'lat', 'long', 'alt', 'utc', 'dst', 'tz', 'type', 'source'],
  colParser: {
    'city': 'omit',
    'lat': 'omit',
    'long': 'omit',
    'alt': 'omit',
    'utc': 'omit',
    'dst': 'omit',
    'tz': 'omit',
    'type': 'omit',
    'source': 'omit',
  },
}).fromFile(csvFile).then((jsonResult) => {
  let processedArray = [];
  jsonResult.forEach((row) => {
    console.log('Processing row ' + row.id + ' - ' + row.name);
    console.log('IATA: ' + row.IATA);
    console.log('ICAO: ' + row.ICAO);
    // Adding a flag to the row to signify whether the airport is in the UK
    // TODO: Does "Isle of Man" and others like "Jersey" also count as in the UK?
    const british = row.country === 'United Kingdom';
    const label = row.name + ' (' + row.country + ') ';
    // It is possible that IATA codes do not exist, which appear to be read as a "\N" character so ignore those.
    if (row.IATA !== '\\N') {
      processedArray.push({id: row.IATA, british: british, label: label + '(' + row.IATA + ')'})
    }
    if (row.ICAO !== '\\N') {
      processedArray.push({id: row.ICAO, british: british, label: label + '(' + row.ICAO + ')'})
    }
  });
  console.log('Resulting output');
  console.log(processedArray);
  fs.writeFileSync('airport_codes.json', JSON.stringify(processedArray, null, 2), 'utf8', (err) => {
    if (err) {
      console.log('An error occurred while saving to JSON');
      return console.log(err);
    }
  })
})