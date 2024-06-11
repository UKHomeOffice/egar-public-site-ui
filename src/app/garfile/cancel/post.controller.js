const logger = require('../../../common/utils/logger')(__filename);
const CookieModel = require('../../../common/models/Cookie.class');
const garApi = require('../../../common/services/garApi');
const emailService = require('../../../common/services/sendEmail');
const config = require('../../../common/config');

module.exports = (req, res) => {
  logger.debug('In garfile / cancel post controller');
  const cookie = new CookieModel(req);
  const isCancelled = true

  garApi.getPeople(cookie.getGarId())
    .then((res) => {
      const garpeople = JSON.parse(res).items;
      const passengersToRaiseException = garpeople
        .filter(garperson => garperson.amgCheckinResponseCode !== null)
        .map(garperson => garperson.garPeopleId);

      return passengersToRaiseException;
    })
    .then((passengersToRaiseException) => {
      if (passengersToRaiseException.length === 0) {
        return null
      } else {
        garApi.postGarPassengerConfirmations(
          cookie.getGarId(), 
          passengersToRaiseException,
          isCancelled
        );
      }
    })
    .then(() => {
      garApi.patch(cookie.getGarId(), 'Cancelled', {})
        .then(() => {
          emailService.send(config.NOTIFY_GAR_CANCEL_TEMPLATE_ID, cookie.getUserEmail(), {
            firstName: cookie.getUserFirstName(),
            garId: cookie.getCbpId(),
          }).then(() => {
            req.session.successMsg = 'The GAR has been successfully cancelled';
            req.session.successHeader = 'Cancellation Confirmation';
            req.session.save(() => {
              res.redirect('/home');
            });
          }).catch(() => {
            req.session.successMsg = 'The GAR has been successfully cancelled, but there was a problem with sending the email';
            req.session.successHeader = 'Cancellation Confirmation';
            req.session.save(() => {
              res.redirect('/home');
            });
          });
        })
      .catch((err) => {
        logger.error(err);
        res.render('app/garfile/cancel', { cookie, error: [{ message: 'Failed to cancel GAR' }] });
      });
    })
    .catch((err) => {
      logger.error('Api failed to post GAR exceptions');
      logger.error(err);
      res.render('app/home', {
          cookie,
          errors: [{
              message: 'Failed to post GAR confirmation|exceptions',
          }],
      });
    });
};
