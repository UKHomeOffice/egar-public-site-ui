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


module.exports = (req, res) => {
  logger.debug('In garfile / review post controller');
  const cookie = new CookieModel(req);
  const garId = cookie.getGarId();

  // validatate gar to be submitted
  Promise.all([
    garApi.get(garId),
    garApi.getPeople(garId),
    garApi.getSupportingDocs(garId),
  ]).then((responseValues) => {
    const garfile = JSON.parse(responseValues[0]);
    validator.handleResponseError(garfile);

    const garpeople = JSON.parse(responseValues[1]);
    const manifest = new Manifest(responseValues[1]);
    validator.handleResponseError(garpeople);

    const garsupportingdocs = JSON.parse(responseValues[2]);
    validator.handleResponseError(garsupportingdocs);

    const validations = validationList.validations(garfile, garpeople);

    /*
      Manifest specific validations does not using generic mechanism.
    */
    if (!manifest.validate()) {
      const validateFailMsg = 'Resolve manifest errors before submitting';
      validations.push([
        new ValidationRule(validator.valuetrue, 'resolveError', '', validateFailMsg),
      ]);
    }

    if (!manifest.validateCaptainCrew()) {
      const validateCaptainCrewMsg = 'There must be at least one captain or crew member on the voyage';
      validations.push([
        new ValidationRule(validator.valuetrue, 'captainCrew', '', validateCaptainCrewMsg),
      ]);
    }

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
          if (!Object.prototype.hasOwnProperty.call(parsedResponse, 'message')) {
            logger.info('Successfully submitted GAR');
            cookie.setGarStatus('Submitted');
            emailService.send(config.NOTIFY_GAR_SUBMISSION_TEMPLATE_ID, cookie.getUserEmail(), {
              firstName: cookie.getUserFirstName(),
              garId: cookie.getGarId(),
            }).then(() => {
              res.render('app/garfile/submit/success/index', {
                cookie,
              });
            });
          }
        }).catch((err) => {
          logger.error('Api failed to update GAR');
          logger.error(err);
          res.render('app/garfile/submit/failure/index', {
            cookie,
          });
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
