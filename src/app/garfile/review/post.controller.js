const logger = require('../../../common/utils/logger');
const garApi = require('../../../common/services/garApi');
const CookieModel = require('../../../common/models/Cookie.class');
const { Manifest } = require('../../../common/models/Manifest.class');
const emailService = require('../../../common/services/sendEmail');
const config = require('../../../common/config');

module.exports = (req, res) => {
  logger.debug('In garfile / review post controller');
  const cookie = new CookieModel(req);

  const garPeople = garApi.getPeople(cookie.getGarId());
  const garDetails = garApi.get(cookie.getGarId());

  // validatate gar to be submitted
  Promise.all([garDetails, garPeople])
    .then((responseValues) => {
      const parsedGar = JSON.parse(responseValues[0]);
      const parsedPeople = JSON.parse(responseValues[1]);
      const manifest = new Manifest(responseValues[1]);
      let flagGarValidated = false;

      req.session.submiterrormessage = [];

      if (!manifest.validate()) {
        const validationError = {message: 'Resolve manifest errors before submitting.', identifier: 'manifestTable'}
        logger.info('manifest validation failed')
        req.session.submiterrormessage.push(validationError);
      }

      if (!manifest.validateCaptainCrew()) {
        const captainCrewError = {message: 'There must be at least one captain or crew member on the voyage.', identifier: 'manifestTable'}
        logger.info('captain / crew validation failed')
        req.session.submiterrormessage.push(captainCrewError);
      }

      if (!manifest.validate() || !manifest.validateCaptainCrew()) {
        return req.session.save(() => {res.redirect('/garfile/review')});
      }

      if (parsedGar.status.name.toLowerCase() === 'submitted') {
        const submitError = {message: 'This GAR has already been submitted', identifier: ''}
        req.session.submiterrormessage.push(submitError);
        logger.info('gar already submitted')
        return req.session.save(() => {res.redirect('/garfile/review')});
      }

      if (parsedGar.registration !== null
          && parsedGar.arrivalDate !== null
          && parsedPeople.items !== null
          && parsedGar.responsibleGivenName !== null) {
        flagGarValidated = true;
      }

      if (flagGarValidated) {
        garApi
          .patch(cookie.getGarId(), 'Submitted', {})
          .then((apiResponse) => {
            logger.info('Received response from API');
            const parsedResponse = JSON.parse(apiResponse);
            if (!Object.prototype.hasOwnProperty.call(parsedResponse, 'message')) {
              logger.info('Successfully submitted GAR');
              cookie.setGarStatus('Submitted');
              emailService
                .send(config.NOTIFY_GAR_SUBMISSION_TEMPLATE_ID, cookie.getUserEmail(), {
                  firstName: cookie.getUserFirstName(),
                  garId: cookie.getGarId(),
                })
                .then(() => {
                  res.render('app/garfile/submit/success/index', { cookie });
                });
            } else {
              res.render('app/garfile/submit/failure/index', { cookie });
            }
          })
          .catch((err) => {
            logger.error('Failed to submit GAR');
            logger.error(err);
            res.render('app/garfile/submit/failure/index', { cookie, errors: [{ message: 'GAR failed to submit' }] });
          });
      } else {
        logger.error('Failed to submit Incomplete GAR');
        const resolveError = {message: 'Ensure the GAR is complete before submitting', identifier: ''}
        req.session.submiterrormessage.push(resolveError);
        return req.session.save(() => {res.redirect('/garfile/review')});
      }
    });
};
