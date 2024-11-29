const logger = require('../../../common/utils/logger')(__filename);
const CookieModel = require('../../../common/models/Cookie.class');
const garApi = require('../../../common/services/garApi');
const emailService = require('../../../common/services/sendEmail');
const config = require('../../../common/config');

module.exports = async (req, res) => {
  logger.debug('In garfile / cancel post controller');
  const cookie = new CookieModel(req);
  const garId = cookie.getGarId();

  try {
    await garApi.submitGARForException(garId);
    await garApi.patch(cookie.getGarId(), 'Cancelled', {});
   
    if (!cookie.getCbpId()) {
      req.session.successMsg = 'The GAR has been successfully cancelled';
      req.session.successHeader = 'Cancellation Confirmation';
      req.session.save(() => {
        res.redirect('/home');
      });
  
      return;
    }
  } catch (err) {
    logger.error(err);
    res.render('app/garfile/cancel/index', { 
      cookie, 
      errors: [{ identifier: '', message: 'Failed to cancel GAR' }],
    });
    return;
  }

  try {
    await emailService.send(config.NOTIFY_GAR_CANCEL_TEMPLATE_ID, cookie.getUserEmail(), {
      firstName: cookie.getUserFirstName(),
      cancellationReference: cookie.getCbpId(),
    });
  
    req.session.successMsg = 'The GAR has been successfully cancelled';
    req.session.successHeader = 'Cancellation Confirmation';
    req.session.save(() => {
      res.redirect('/home');
    });
  } catch (err) {
    req.session.successMsg = 'The GAR has been successfully cancelled, but there was a problem with sending the email';
    req.session.successHeader = 'Cancellation Confirmation';
    req.session.save(() => {
      res.redirect('/home');
    });
  }
};
