const logger = require('../../../common/utils/logger')(__filename);
const CookieModel = require('../../../common/models/Cookie.class');
const manifestFields = require('../../../common/seeddata/gar_manifest_fields.json');
const garApi = require('../../../common/services/garApi');
// const ValidationRule = require('../../../common/models/ValidationRule.class');
const validator = require('../../../common/utils/validator');
const validationList = require('./validations');

// const voyageDateMsg = 'Arrival date must not be earlier than departure date';
// const validateFailMsg = 'Resolve manifest errors before submitting.';
// const validateCaptainCrewMsg = 'There must be at least one captain or crew member on the voyage.';
// const registrationMsg = 'Registration must provided';
// const responsibleGivenNameMsg = 'Responsible person must provided';

function handleResponseError(parsedApiResponse) {
  if ({}.hasOwnProperty.call(parsedApiResponse, 'message')) {
    logger.debug(`Api returned Error: ${parsedApiResponse}`);
  }
}

module.exports = (req, res) => {
  const cookie = new CookieModel(req);
  logger.debug('In garfile / review get controller');

  const garId = cookie.getGarId();

  Promise.all([
    garApi.get(garId),
    garApi.getPeople(garId),
    garApi.getSupportingDocs(garId)])
    .then((apiResponse) => {
      const garfile = JSON.parse(apiResponse[0]);
      handleResponseError(garfile);

      const garpeople = JSON.parse(apiResponse[1]);
      handleResponseError(garpeople);

      const garsupportingdocs = JSON.parse(apiResponse[2]);
      handleResponseError(garsupportingdocs);

      // Validations
      // const voyageDateObj = {
      //   departureDate: garfile.departureDate,
      //   arrivalDate: garfile.arrivalDate,
      // };

      const validations = validationList.validations(garfile, garpeople);
      // const validations = [[
      //   new ValidationRule(validator.isValidDepAndArrDate, 'voyageDates', voyageDateObj, voyageDateMsg),
      // ],
      // [
      //   new ValidationRule(validator.notEmpty, 'resgistration', garfile.registration, registrationMsg),
      // ],
      // [
      //   new ValidationRule(validator.notEmpty, 'garPeople', garpeople.items, validateCaptainCrewMsg),
      // ],
      // [
      //   new ValidationRule(validator.notEmpty, 'responsibleGivenName', garfile.responsibleGivenName, responsibleGivenNameMsg),
      // ]];

      const renderObj = {
        cookie,
        showChangeLinks: true,
        manifestFields,
        garfile,
        garpeople,
        garsupportingdocs,
      };

      validator.validateChains(validations)
        .then(() => {
          if (req.session.submiterrormessage && req.session.submiterrormessage.length > 0) {
            const msg = req.session.submiterrormessage;
            delete req.session.submiterrormessage;
            renderObj.errors = msg;
            res.render('app/garfile/review/index', renderObj);
          } else {
            res.render('app/garfile/review/index', renderObj);
          }
        }).catch((err) => {
          logger.info('Validation failed');
          logger.info(err);
          renderObj.errors = err;
          res.render('app/garfile/review/index', renderObj);
        });
    });
};
