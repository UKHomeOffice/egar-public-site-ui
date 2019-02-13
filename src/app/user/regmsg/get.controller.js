const nanoid = require('nanoid/generate');
const tokenservice = require('../../../common/services/create-token');
const sendTokenService = require('../../../common/services/send-token');
const tokenApi = require('../../../common/services/tokenApi');
const CookieModel = require('../../../common/models/Cookie.class');
const logger = require('../../../common/utils/logger');

module.exports = (req, res) => {
  logger.debug('In user / regmsg get controller');
  const cookie = new CookieModel(req);

  if (req.query.resend && cookie.getUserEmail() !== null) {
    // Generate a new token for the user
    const alphabet = '23456789abcdefghjkmnpqrstuvwxyz-';
    const token = nanoid(alphabet, 13);
    const hashtoken = tokenservice.generateHash(token);

    sendTokenService.send(cookie.getUserFirstName(), cookie.getUserEmail(), token)
      .then(() => {
        logger.info('Storing new token in db');
        tokenApi.setToken(hashtoken, cookie.getUserDbId());
        res.render('app/user/regmsg/index', { cookie });
      });
  } else {
    res.render('app/user/regmsg/index', { cookie });
  }
};
