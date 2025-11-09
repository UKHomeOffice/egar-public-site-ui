const logger = require('../../../common/utils/logger')(__filename);
const {
  API_BASE,
  ONE_LOGIN_SHOW_ONE_LOGIN,
  ONE_LOGIN_POST_MIGRATION,
} = require('../../../common/config');
const CookieModel = require('../../../common/models/Cookie.class');
const tokenService = require('../../../common/services/create-token');
const oneLoginUtil = require('../../../common/utils/oneLoginAuth');
const { URL } = require('url');
const verifyUserService = require('../../../common/services/verificationApi');

module.exports = async (req, res) => {
  logger.debug('In verify / invite get controller');

  // Start by clearing cookies and initialising
  const cookie = new CookieModel(req);
  cookie.reset();
  cookie.initialise();

  // Look up and validate token, checking it hasn't expired
  const token = req.query.query;
  const hashedToken = tokenService.generateHash(token);
  const pathName = new URL(req.originalUrl, API_BASE).pathname;

  let oneLoginAuthUrl = '';
  if (ONE_LOGIN_SHOW_ONE_LOGIN === true || ONE_LOGIN_POST_MIGRATION === true) {
    oneLoginAuthUrl = oneLoginUtil.getOneLoginAuthUrl(req, res);
  }
  cookie.setInviteUserToken(hashedToken);
  logger.info('Set hashedToken');

  try {
    const apiResponse = await verifyUserService.getUserInviteTokenByTokenId(hashedToken);

    if (
      apiResponse['message'] === 'Token expired' ||
      apiResponse['message'] === 'Token already used'
    ) {
      return res.redirect('/error/inviteExpiredError');
    }

    return res.render('app/verify/organisationinvite/index', { pathName, oneLoginAuthUrl });
  } catch (error) {
    logger.error(`Invite link to register failed ${error}`);
    return res.redirect('/error/404');
  }
};
