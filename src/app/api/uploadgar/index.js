const indexPath = '/upload';
const paths = {
  index: indexPath,
};

const express = require('express');

const app = express();
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const bodyParser = require('body-parser');
const csrf = require('csurf');
const XLSX = require('xlsx');
const stream = require('stream');
const logger = require('../../../common/utils/logger');
const garApi = require('../../../common/services/garApi');
const createGarApi = require('../../../common/services/createGarApi.js');
const CookieModel = require('../../../common/models/Cookie.class');
const validator = require('../../../common/utils/validator');
const { validations } = require('./validations');

const csrfProtection = csrf({ cookie: true });
const parseForm = bodyParser.urlencoded({ extended: false })
const transformers = require('../../../common/utils/transformers');
const { ExcelParser } = require('../../../common/utils/excelParser');


app.use(bodyParser.json());


router.get('/uploadgar', (req, res) => {
  res.json({ message: 'welcome to our upload module apis' });
});

router.post('/uploadgar', upload.single('file'), (req, res, data) => {
  if (req.file) {
    logger.debug(`In Gar File Upload Service. Uploaded File: ${req.file.filename}`);
    const readStream = new stream.Readable();
    readStream.push(req.file.buffer);
    readStream.push(null);

    const cookie = new CookieModel(req);
    const fileExtension = req.file.originalname.split('.').pop();

    // Redirect if incorrect file type is uploaded
    if (fileExtension !== 'xls' && fileExtension !== 'xlsx' || (typeof fileExtension === 'undefined')) {
      req.session.failureMsg = 'Incorrect file type';
      req.session.failureIdentifier = 'file';
      return res.redirect('garfile/garupload');
    }

    // Read xls/x file into memory
    const workbook = XLSX.read(req.file.buffer, { cellDates: true });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // Check version cell and reject upload if incorrect version found
    const versionCell = worksheet['C1'];
    const versionCellValue = (versionCell ? versionCell.v : undefined);
    if (versionCellValue === undefined
        || versionCellValue.trim() !== 'GENERAL AVIATION REPORT (GAR) -  January 2015')
    {
      req.session.failureMsg = 'Incorrect xls or xlsx file';
      req.session.failureIdentifier = 'file';
      return res.redirect('garfile/garupload');
    }

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

    const voyageParser = new ExcelParser(worksheet, cellMap);

    const manifestMap = {
      documentType: { location: 'A', transform: [transformers.titleCase, transformers.docTypeOrUndefined] },
      documentTypeOther: { location: 'B' },
      issuingState: { location: 'C' },
      documentNumber: { location: 'D', transform: [transformers.numToString] },
      lastName: { location: 'E' },
      firstName: { location: 'F' },
      gender: { location: 'G', transform: [transformers.upperCamelCase, transformers.unknownToUnspecified] },
      dateOfBirth: { location: 'H' },
      placeOfBirth: { location: 'I' },
      nationality: { location: 'J' },
      documentExpiryDate: { location: 'K' },
    };

    const crewMapConfig = {
      startRow: 9,
      terminator: 'TOTAL CREW',
    };

    const passengerMapConfig = {
      startIdentifier: 'PASSENGERS',
      startColumn: 'A',
      skipNum: 2,
      terminator: 'TOTAL PASSENGERS',
    };

    // Excel sheet provides two possible cells per person which may correspond to documentType
    // If the second cell is populated then its value should be considered 'Other' and it should take precedence
    // over the first cell if both are populated.
    // Additionally, set the relevant peopleType field for each section of the manifest
    const crewParser = new ExcelParser(worksheet, manifestMap, crewMapConfig);
    const crew = crewParser.rangeParse();
    crew.map((person) => {
      person.peopleType = 'Crew';
      person.documentType = person.documentTypeOther ? 'Other' : person.documentType;
    });

    const passengerParser = new ExcelParser(worksheet, manifestMap, passengerMapConfig);
    const passengers = passengerParser.rangeParse();
    passengers.map((person) => {
      person.peopleType = 'Passenger';
      person.documentType = person.documentTypeOther ? 'Other' : person.documentType;
    });

    createGarApi.createGar(cookie.getUserDbId())
      .then((apiResponse) => {
        const parsedResponse = JSON.parse(apiResponse);
        if (parsedResponse.message) {
          req.session.failureMsg = 'Failed to create GAR';
          return req.session.save(() => res.redirect('garfile/garupload'));
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
            return req.session.save(() => res.redirect('/garfile/departure'));
          })
          .catch((err) => {
            logger.error('Failed to update API with GAR information');
            logger.error(err);
            req.session.failureMsg = 'Failed to update GAR. Try again';
            req.session.failureIdentifier = 'file';
            return res.redirect('garfile/garupload');
          });
      })
      .catch((validationErrs) => {
        // Validator rejects on validation err
        logger.info('Validation errs detected on file upload');
        req.session.failureMsg = validationErrs;
        return req.session.save(() => res.redirect('/garfile/garupload'));
      });
  } else {
    logger.debug('No file selected for upload');
    req.session.failureMsg = 'Provide a file';
    req.session.failureIdentifier = 'file';
    res.redirect('/garfile/garupload?query=0');
  }
});

module.exports = {
  router,
  paths,
};
