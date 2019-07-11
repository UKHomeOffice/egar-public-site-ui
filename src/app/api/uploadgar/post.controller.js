/* eslint-disable no-underscore-dangle */

const i18n = require('i18n');
const XLSX = require('xlsx');
const stream = require('stream');
const logger = require('../../../common/utils/logger')(__filename);
const garApi = require('../../../common/services/garApi');
const createGarApi = require('../../../common/services/createGarApi.js');
const CookieModel = require('../../../common/models/Cookie.class');
const validator = require('../../../common/utils/validator');
const { validations } = require('./validations');
const transformers = require('../../../common/utils/transformers');
const { ExcelParser } = require('../../../common/utils/excelParser');

const checkFileIsExcel = (req, res) => {
  if (req.file) {
    logger.debug(`In Gar File Upload Service. Uploaded File: ${req.file.originalname}`);

    const readStream = new stream.Readable();
    readStream.push(req.file.buffer);
    readStream.push(null);

    const fileExtension = req.file.originalname.split('.').pop();

    // Redirect if incorrect file type is uploaded
    if ((fileExtension !== 'xls' && fileExtension !== 'xlsx') || (typeof fileExtension === 'undefined')) {
      req.session.failureMsg = i18n.__('validation_api_uploadgar_incorrect_type');
      req.session.failureIdentifier = 'file';
      res.redirect('garfile/garupload');
      return false;
    }
  } else {
    logger.debug('No file selected for upload');
    req.session.failureMsg = i18n.__('validation_api_uploadgar_no_file');
    req.session.failureIdentifier = 'file';
    res.redirect('/garfile/garupload?query=0');
    return false;
  }
  return true;
};

const checkFileIsGAR = (req, res, worksheet) => {
  // Check version cell and reject upload if incorrect version found
  const versionCell = worksheet.C1;
  const versionCellValue = (versionCell ? versionCell.v : undefined);
  if (versionCellValue === undefined
      || versionCellValue.trim() !== i18n.__({ phrase: 'upload_gar_file_header', locale: 'en' })) {
    req.session.failureMsg = i18n.__('validation_api_uploadgar_incorrect_gar_file');
    req.session.failureIdentifier = 'file';
    res.redirect('garfile/garupload');
    return false;
  }
  return true;
};

// Define cell configurations for ExcelParser and parse from file read into memory
const cellMap = {
  arrivalPort: { location: 'B3' },
  arrivalDate: { location: 'D3' },
  arrivalTime: { location: 'F3', raw: true },
  departurePort: { location: 'B4' },
  departureDate: { location: 'D4' },
  departureTime: { location: 'F4', raw: true },
  registration: { location: 'B5', raw: true },
  craftType: { location: 'D5', raw: true },
  craftBase: { location: 'H5' },
  freeCirculation: { location: 'L3', transform: [transformers.upperCamelCase] },
  visitReason: { location: 'B6', transform: [transformers.upperCamelCase] },
};

// The cell mappings for manifests, i.e. crew and passengers, this is for the columns
const manifestMap = {
  documentType: { location: 'A', transform: [transformers.titleCase, transformers.docTypeOrUndefined] },
  documentTypeOther: { location: 'B' },
  issuingState: { location: 'C', transform: [transformers.toUpper] },
  documentNumber: { location: 'D', transform: [transformers.numToString] },
  lastName: { location: 'E' },
  firstName: { location: 'F' },
  gender: { location: 'G', transform: [transformers.upperCamelCase, transformers.unknownToUnspecified] },
  dateOfBirth: { location: 'H' },
  placeOfBirth: { location: 'I' },
  nationality: { location: 'J', transform: [transformers.toUpper] },
  documentExpiryDate: { location: 'K' },
};

// Mappings for the rows representing crew
const crewMapConfig = {
  startRow: 9,
  terminator: 'TOTAL CREW',
};

// Mappings for the rows representing passengers
const passengerMapConfig = {
  startIdentifier: 'PASSENGERS',
  startColumn: 'A',
  skipNum: 2,
  terminator: 'TOTAL PASSENGERS',
};

module.exports = (req, res) => {
  logger.debug('Entering upload GAR post controller');
  if (!checkFileIsExcel(req, res)) {
    return;
  }

  const cookie = new CookieModel(req);

  // Read xls/x file into memory
  const workbook = XLSX.read(req.file.buffer, { cellDates: true });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  if (!checkFileIsGAR(req, res, worksheet)) {
    return;
  }
  const voyageParser = new ExcelParser(worksheet, cellMap);

  // Excel sheet provides two possible cells per person which may correspond to documentType
  // If the second cell is populated then its value should be considered 'Other' and it should take
  // precedence over the first cell if both are populated.
  // Additionally, set the relevant peopleType field for each section of the manifest
  const crewParser = new ExcelParser(worksheet, manifestMap, crewMapConfig);
  const crew = crewParser.rangeParse();
  crew.forEach((person) => {
    const crewmember = person;
    crewmember.peopleType = 'Crew';
    crewmember.documentType = crewmember.documentTypeOther ? 'Other' : crewmember.documentType;
  });

  const passengerParser = new ExcelParser(worksheet, manifestMap, passengerMapConfig);
  const passengers = passengerParser.rangeParse();
  passengers.forEach((person) => {
    const passenger = person;
    passenger.peopleType = 'Passenger';
    passenger.documentType = passenger.documentTypeOther ? 'Other' : passenger.documentType;
  });
  validator.validateChains(validations(voyageParser.parse(), crew, passengers))
    .then(() => {
      logger.info('Uploaded excel sheet is valid, creating GAR via API');
      createGarApi.createGar(cookie.getUserDbId())
        .then((apiResponse) => {
          const parsedResponse = JSON.parse(apiResponse);
          if (parsedResponse.message) {
            req.session.failureMsg = 'Failed to create GAR';
            req.session.save(() => res.redirect('garfile/garupload'));
            return;
          }
          logger.info('Created new GAR');
          const { garId } = parsedResponse;
          cookie.setGarId(garId);
          cookie.setGarStatus('Draft');

          const crewUpdate = garApi.patch(garId, 'Draft', { people: crew });
          const passengerUpdate = garApi.patch(garId, 'Draft', { people: passengers });
          const voyageUpdate = garApi.patch(garId, 'Draft', voyageParser.parse());

          Promise.all([crewUpdate, passengerUpdate, voyageUpdate])
            .then(() => {
              logger.info('Updated GAR with excel data');
              req.session.save(() => res.redirect('/garfile/departure'));
            })
            .catch((err) => {
              logger.error('Failed to update API with GAR information');
              logger.error(err);
              req.session.failureMsg = 'Failed to update GAR. Try again';
              req.session.failureIdentifier = 'file';
              res.redirect('garfile/garupload');
            });
        }).catch((err) => {
          logger.error('Failed to create API with GAR information');
          logger.error(err);
          req.session.failureMsg = 'Failed to create GAR. Try again';
          req.session.failureIdentifier = 'file';
          res.redirect('garfile/garupload');
        });
    })
    .catch((validationErrs) => {
      logger.info('Validation errors detected on file upload');
      req.session.failureMsg = validationErrs;
      req.session.save(() => res.redirect('/garfile/garupload'));
    });
};
