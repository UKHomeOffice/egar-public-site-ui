import loggerFactory from '../../../common/utils/logger.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const logger = loggerFactory(__filename);
import CookieModel from '../../../common/models/Cookie.class.js';
import manifestFields from '../../../common/seeddata/gar_manifest_fields.json' with { type: "json"};
import garApi from '../../../common/services/garApi.js';
import validator from '../../../common/utils/validator.js';
import airportValidation from '../../../common/utils/airportValidation.js';
import validationList from './validations.js';
import { Manifest } from '../../../common/models/Manifest.class.js';
import ValidationRule from '../../../common/models/ValidationRule.class.js';

export default (req, res) => {
  logger.debug('In garfile / review get controller');
  const cookie = new CookieModel(req);
  const garId = cookie.getGarId();
  const frmUpload = req.query?.from === 'uploadGar';
  Promise.all([
    garApi.get(garId),
    garApi.getPeople(garId),
    garApi.getSupportingDocs(garId),
  ]).then((apiResponse) => {
    const garfile = JSON.parse(apiResponse[0]);
    validator.handleResponseError(garfile);

    const garpeople = JSON.parse(apiResponse[1]);
    const manifest = new Manifest(apiResponse[1]);
    
    validator.handleResponseError(garpeople);

    const garsupportingdocs = JSON.parse(apiResponse[2]);
    validator.handleResponseError(garsupportingdocs);

    const isJourneyUkInbound = airportValidation.isJourneyUKInbound(garfile.departurePort, garfile.arrivalPort);

    const validations = validationList.validations(garfile, garpeople, frmUpload);

    if (!garfile.isMilitaryFlight && !manifest.validateCaptainCrew()) {
      const validateCaptainCrewMsg = __('has_no_crew_or_captains');
      validations.push([
        new ValidationRule(validator.valuetrue, 'manifest', '', validateCaptainCrewMsg),
      ]);
    }

    const renderObj = {
      cookie,
      manifestFields,
      garfile,
      garpeople,
      garsupportingdocs,
      showChangeLinks: true,
      isJourneyUkInbound
    };

    validator.validateChains(validations)
      .then(() => {
        if(frmUpload){
        renderObj.successHeader = 'GAR file is uploaded successfully';
        renderObj.successMsg = 'Complete Responsible person details & Customs declarations below';
        }
        res.render('app/garfile/review/index', renderObj);
      }).catch((err) => {
        logger.info('GAR review validation failed');
        logger.debug(err);
        renderObj.errors = err;
        res.render('app/garfile/review/index', renderObj);
      });
  }).catch((err) => {
    logger.error('Error retrieving GAR for review');
    logger.error(err);
    res.render('app/garfile/review/index', { cookie, errors: [{ message: 'There was an error retrieving the GAR. Try again later' }] });
  });
};
