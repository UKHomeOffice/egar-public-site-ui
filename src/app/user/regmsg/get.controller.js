import utils from '../../../common/utils/utils.js';
import tokenService from '../../../common/services/create-token.js';
import sendTokenService from '../../../common/services/send-token.js';
import tokenApi from '../../../common/services/tokenApi.js';
import CookieModel from '../../../common/models/Cookie.class.js';
import loggerFactory from '../../../common/utils/logger.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const logger = loggerFactory(__filename);

export default (req, res) => {
  logger.debug('In user / regmsg get controller');
  const cookie = new CookieModel(req);

  if (req.query.resend && cookie.getUserEmail() !== null) {
    // Generate a new token for the user
    const alphabet = '23456789abcdefghjkmnpqrstuvwxyz-';
    const token = utils.nanoid(alphabet, 13);
    const hashtoken = tokenService.generateHash(token);

    sendTokenService.send(cookie.getUserFirstName(), cookie.getUserEmail(), token)
      .then(() => {
        logger.info('Storing new token in db');
        // Updating token renders previous tokens invalid
        tokenApi.updateToken(hashtoken, cookie.getUserDbId());
        res.render('app/user/regmsg/index', { cookie, resend: true });
      })
      .catch((err) => {
        logger.error('Cannot send token');
        logger.error(err.message);
        // Question, what happens when GOV Notify is down? Is this error message sufficient?
        return res.render('app/user/login/index', {
          cookie,
          unverified: true,
          errors: [{ identifier: 'Username', message: 'There was an error sending the verification email, please try again later.' }],
        });
      });
  } else {
    res.render('app/user/regmsg/index', { cookie });
  }
};
