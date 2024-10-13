const logger = require('../../../common/utils/logger')(__filename);
const CookieModel = require('../../../common/models/Cookie.class');
const garApi = require('../../../common/services/garApi');
const emailService = require('../../../common/services/sendEmail');
const config = require('../../../common/config');

module.exports = (req, res) => {
  logger.debug('In garfile / cancel post controller');
  const cookie = new CookieModel(req);
  const previousGarStatus = cookie.getGarStatus();

  const sendCancellationEmail = () => {
    emailService.send(config.NOTIFY_GAR_CANCEL_TEMPLATE_ID, cookie.getUserEmail(), {
      firstName: cookie.getUserFirstName(),
      cancellationReference: cookie.getCbpId(),
    }).then(() => {
      req.session.successMsg = 'The GAR has been successfully cancelled';
      req.session.successHeader = 'Cancellation Confirmation';
      req.session.save(() => {
        res.redirect('/home');
      });
    }).catch((err) => {
      logger.error(err);
      req.session.successMsg = 'The GAR has been successfully cancelled, but there was a problem with sending the email';
      req.session.successHeader = 'Cancellation Confirmation';
      req.session.save(() => {
        res.redirect('/home');
      });
    });
  };

  garApi.patch(cookie.getGarId(), 'Cancelled', {})
    .then(() => {
      if (!cookie.getCbpId()) {
        req.session.successMsg = 'The GAR has been successfully cancelled';
        req.session.successHeader = 'Cancellation Confirmation';
        req.session.save(() => {
          res.redirect('/home');
        });

        return;
      }

      if (previousGarStatus === 'Submitted') {
        garApi.postGarDepartureExceptions(cookie.getGarId())
        .then(() => {
          sendCancellationEmail();
        })
        .catch((err) => {
          logger.error('Api failed to post GAR exceptions');
          logger.error(err);
          return res.render('app/home', {
            cookie,
            errors: [{
                message: 'Failed to raise departure exception in GAR.',
            }],
          });
        });

        return;
      }

      sendCancellationEmail();
    })
    .catch((err) => {
      logger.error(err);
      res.render('app/garfile/cancel', { cookie, error: [{ message: 'Failed to cancel GAR' }] });
    })  
};
