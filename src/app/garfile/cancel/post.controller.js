const logger = require('../../../common/utils/logger')(__filename);
const CookieModel = require('../../../common/models/Cookie.class');
const garApi = require('../../../common/services/garApi');
const emailService = require('../../../common/services/sendEmail');
const config = require('../../../common/config');

module.exports = (req, res) => {
  logger.debug('In garfile / cancel get controller');
  const cookie = new CookieModel(req);
  garApi
    .patch(cookie.getGarId(), 'Cancelled', {})
    .then(() => {
      emailService.send(config.NOTIFY_GAR_CANCEL_TEMPLATE_ID, cookie.getUserEmail(), {
        firstName: cookie.getUserFirstName(),
        garId: cookie.getGarId(),
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
};
