/* eslint-disable import/no-extraneous-dependencies */
const csv = require('csvtojson/v2');
const fs = require('fs');
const logger = require('./common/utils/logger')(__filename);

const csvFile = './airports.dat';
/**
 * A converter to take in an openflights.org data file (in CSV format) and converting
 * it into a JSON format that can be used by sGAR.
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
    city: 'omit',
    lat: 'omit',
    long: 'omit',
    alt: 'omit',
    utc: 'omit',
    dst: 'omit',
    tz: 'omit',
    type: 'omit',
    source: 'omit',
  },
}).fromFile(csvFile).then((jsonResult) => {
  const processedArray = [];
  jsonResult.forEach((row) => {
    logger.info(`Processing row ${row.id} - ${row.name}`);
    logger.info(`Processing row ${row.id2} - ${row.name}`);
    logger.info(`IATA: ${row.IATA}`);
    logger.info(`ICAO: ${row.ICAO}`);
    // Adding a flag to the row to signify whether the airport is in the UK
    // TODO: Does "Isle of Man" and others like "Jersey" also count as in the UK?
    const british = row.country === 'United Kingdom';
    const label = `${row.name} (${row.country}) `;
    let code = '(';
    let hasIATA = false;
    if (row.ICAO !== '\\N') {
      code += row.ICAO;
    }
    // It is possible that IATA codes do not exist, which appear to be read as
    // a "\N" character so ignore those.
    if (row.IATA !== '\\N') {
      hasIATA = true;
      if (row.ICAO !== '\\N') {
        code += ' / ';
      }
      code += row.IATA;
    }
    code += ')';
    processedArray.push({ british, id: hasIATA ? id2: hasIATA ? row.IATA : row.ICAO, label: label + code });
  });
  logger.info('Resulting output');
  logger.info(JSON.stringify(processedArray));
  fs.writeFileSync('airport_codes.json', JSON.stringify(processedArray, null, 2), 'utf8', (err) => {
    if (err) {
      logger.error('An error occurred while saving to JSON');
    }
  });
});
