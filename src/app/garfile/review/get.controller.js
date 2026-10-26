const logger = require('../../../common/utils/logger')(__filename);
const CookieModel = require('../../../common/models/Cookie.class');
const manifestFields = require('../../../common/seeddata/gar_manifest_fields.json');
const { garApi } = require('../../../common/services/dataAccessApi');
const validator = require('../../../common/utils/validator');
const airportValidation = require('../../../common/utils/airportValidation');
const validationList = require('./validations');
const { Manifest } = require('../../../common/models/Manifest.class');
const ValidationRule = require('../../../common/models/ValidationRule.class');

module.exports = (req, res) => {
  const cookie = new CookieModel(req);
  const garId = res?.locals?.gar?.garId;
  const frmUpload = req.query?.from === 'uploadGar';

  Promise.all([garApi.get(garId), garApi.getPeople(garId), garApi.getSupportingDocs(garId)])
    .then((apiResponse) => {
      const garfile = apiResponse[0];
      validator.handleResponseError(garfile);

      const garpeople = apiResponse[1];
      const manifest = new Manifest(apiResponse[1]);

      validator.handleResponseError(garpeople);

      const garsupportingdocs = apiResponse[2];
      validator.handleResponseError(garsupportingdocs);

      const isJourneyUkInbound = airportValidation.isJourneyUKInbound(garfile.departurePort, garfile.arrivalPort);

      const validations = validationList.validations(garfile, garpeople, frmUpload);

      if (!garfile.isMilitaryFlight && !manifest.validateCaptainCrew()) {
        const validateCaptainCrewMsg = __('has_no_crew_or_captains');
        validations.push([new ValidationRule(validator.valuetrue, 'manifest', '', validateCaptainCrewMsg)]);
      }

      const renderObj = {
        cookie,
        manifestFields,
        garfile,
        garpeople,
        garsupportingdocs,
        showChangeLinks: true,
        isJourneyUkInbound,
      };

      validator
        .validateChains(validations)
        .then(() => {
          if (frmUpload) {
            renderObj.successHeader = 'GAR file is uploaded successfully';
            renderObj.successMsg = 'Complete Responsible person details & Customs declarations below';
          }
          res.render('app/garfile/review/index', renderObj);
        })
        .catch((err) => {
          logger.warn('GAR review validation failed', { garId });
          renderObj.errors = err;
          res.render('app/garfile/review/index', renderObj);
        });
    })
    .catch((err) => {
      logger.error('Failed to retrieve GAR for review', { errorMessage: err?.message, stack: err?.stack });
      res.render('app/garfile/review/index', {
        cookie,
        errors: [{ message: 'There was an error retrieving the GAR. Try again later' }],
      });
    });
};
