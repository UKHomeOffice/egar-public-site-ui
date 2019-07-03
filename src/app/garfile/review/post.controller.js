const logger = require('../../../common/utils/logger')(__filename);
const garApi = require('../../../common/services/garApi');
const CookieModel = require('../../../common/models/Cookie.class');
const manifestFields = require('../../../common/seeddata/gar_manifest_fields.json');
const { Manifest } = require('../../../common/models/Manifest.class');
const emailService = require('../../../common/services/sendEmail');
const config = require('../../../common/config');
const ValidationRule = require('../../../common/models/ValidationRule.class');
const validator = require('../../../common/utils/validator');
const validationList = require('./validations');

function handleResponseError(parsedApiResponse) {
  if ({}.hasOwnProperty.call(parsedApiResponse, 'message')) {
    logger.debug(`Api return Error: ${parsedApiResponse}`);
  }
}

module.exports = (req, res) => {
  logger.debug('In garfile / review post controller');
  const cookie = new CookieModel(req);
  const garId = cookie.getGarId();

  const garDetails = garApi.get(garId);
  const garPeople = garApi.getPeople(garId);
  const garSupportingDocs = garApi.getSupportingDocs(garId);

  // validatate gar to be submitted
  Promise.all([garDetails, garPeople, garSupportingDocs])
    .then((responseValues) => {
      const garfile = JSON.parse(responseValues[0]);
      handleResponseError(garfile);

      const garpeople = JSON.parse(responseValues[1]);
      const manifest = new Manifest(responseValues[1]);
      handleResponseError(garpeople);

      const garsupportingdocs = JSON.parse(responseValues[2]);
      handleResponseError(garsupportingdocs);

      // let flagGarValidated = false;

      req.session.submiterrormessage = [];

      const validations = validationList.validations(garfile, garpeople);

      const validateFailMsg = 'Resolve manifest errors before submitting.';
      const validateCaptainCrewMsg = 'There must be at least one captain or crew member on the voyage.';

      /*
        The following validators are manifest specific therefore not using generic validations mechanism.
      */
      if (!manifest.validate()) {
        // const validationError = { message: validateFailMsg, identifier: 'manifestTable' };
        // logger.info('manifest validation failed');
        // req.session.submiterrormessage.push(validationError);
        validations.push([
          new ValidationRule(validator.valuetrue, '', false, validateFailMsg),
        ]);
      }

      if (!manifest.validateCaptainCrew()) {
        // const captainCrewError = { message: validateCaptainCrewMsg, identifier: 'manifestTable' };
        // logger.info('captain / crew validation failed');
        // req.session.submiterrormessage.push(captainCrewError);
        validations.push([
          new ValidationRule(validator.valuetrue, 'captainCrew', false, validateCaptainCrewMsg),
        ]);
      }

      // if (!manifest.validate() || !manifest.validateCaptainCrew()) {
      //   return req.session.save(() => {
      //     res.redirect('/garfile/review');
      //   });
      // }

      if (garfile.status.name.toLowerCase() === 'submitted') {
        const submitError = {
          message: 'This GAR has already been submitted',
          identifier: '',
        };
        req.session.submiterrormessage.push(submitError);
        logger.info('gar already submitted');
        return req.session.save(() => {
          res.redirect('/garfile/review');
        });
      }

      const performAPICall = () => {
        garApi.patch(garId, 'Submitted', {})
          .then((apiResponse) => {
            logger.info('Received response from API');
            const parsedResponse = JSON.parse(apiResponse);
            if (Object.prototype.hasOwnProperty.call(parsedResponse, 'message')) {
              logger.info('Successfully submitted GAR');
              cookie.setGarStatus('Submitted');
              emailService.send(config.NOTIFY_GAR_SUBMISSION_TEMPLATE_ID, cookie.getUserEmail(), {
                firstName: cookie.getUserFirstName(),
                garId: cookie.getGarId(),
              }).then(() => {
                res.render('app/garfile/submit/success/index', { cookie });
              });
            }
          }).catch((err) => {
            logger.error('Api failed to update GAR');
            logger.error(err);
            res.render('app/garfile/submit/failure/index', { cookie });
          });
      };

      const renderObj = {
        cookie,
        showChangeLinks: true,
        manifestFields,
        garfile,
        garpeople,
        garsupportingdocs,
      };

      validator.validateChains(validations).then(() => {
        performAPICall();
      }).catch((err) => {
        logger.info('Failed to submit incomplete GAR - validation failed');
        logger.info(err);
        renderObj.errors = err;
        res.render('app/garfile/review/index', renderObj);
      });
    });
};
