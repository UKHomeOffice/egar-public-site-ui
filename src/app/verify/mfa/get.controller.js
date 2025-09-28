import loggerFactory from '../../../common/utils/logger.js';
const logger = loggerFactory(import.meta.url);
import CookieModel from '../../../common/models/Cookie.class.js';
import tokenApi from '../../../common/services/tokenApi.js';
import token from '../../../common/services/create-token.js';
import emailService from '../../../common/services/sendEmail.js';
import settings from '../../../common/config/index.js';

export default (req, res) => {
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
        emailService.send(settings.NOTIFY_MFA_TEMPLATE_ID, email, { mfaToken });
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
