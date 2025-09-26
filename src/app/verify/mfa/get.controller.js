const logger = require('../../../common/utils/logger')(__filename);
const CookieModel = require('../../../common/models/Cookie.class');
const tokenApi = require('../../../common/services/tokenApi');
const token = require('../../../common/services/create-token');
const emailService = require('../../../common/services/sendEmail');
const settings = require('../../../common/config/index');

module.exports = (req, res) => {
  logger.debug('In verify / MFA get controller');
  const cookie = new CookieModel(req);
  const mfaTokenLength = settings.MFA_TOKEN_LENGTH;
  const errMsg = { message: 'There was a problem creating your code. Try again' };
  const context = {
    cookie, mfaTokenLength, successHeader: 'We have resent your code', successMsg: 'Check your email',
  };

  if (req.query.resend !== 'true') {
    res.render('app/verify/mfa/index', { cookie, mfaTokenLength });
    return;
  }
  if (cookie.getUserVerified()) {
    const mfaToken = token.genMfaToken();
    const email = cookie.getUserEmail();
    tokenApi.setMfaToken(email, mfaToken, true)
      .then(() => {
        console.log(mfaToken);
        //emailService.send(settings.NOTIFY_MFA_TEMPLATE_ID, email, { mfaToken });
        res.render('app/verify/mfa/index', context);
      })
      .catch((err) => {
        logger.error(err);
        res.render('app/verify/mfa/index', { cookie, mfaTokenLength, errors: [errMsg] });
      });
  } else {
    res.render('app/verify/mfa/index', context);
  }
};
