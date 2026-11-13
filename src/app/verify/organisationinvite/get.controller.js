const logger = require('../../../common/utils/logger')(__filename);
const CookieModel = require('../../../common/models/Cookie.class');
const tokenService = require('../../../common/services/create-token');
const oneLoginUtil = require('../../../common/utils/oneLoginAuth');
const verifyUserService = require('../../../common/services/verificationApi');

module.exports = async (req, res) => {
  // Start by clearing cookies and initialising
  const cookie = new CookieModel(req);
  cookie.reset();
  cookie.initialise();

  // Look up and validate token, checking it hasn't expired
  const token = req.query.query;
  const hashedToken = tokenService.generateHash(token);

  const oneLoginAuthUrl = oneLoginUtil.getOneLoginAuthUrl(req, res);

  cookie.setInviteUserToken(hashedToken);
  logger.info('Set hashedToken');

  try {
    const apiResponse = await verifyUserService.getUserInviteTokenByTokenId(hashedToken);

    if (apiResponse['message'] === 'Token expired' || apiResponse['message'] === 'Token already used') {
      return res.redirect('/error/inviteExpiredError');
    }

    return res.render('app/verify/organisationinvite/index', { oneLoginAuthUrl });
  } catch (error) {
    logger.error('Failed to register invite link', { errorMessage: error?.message, stack: error?.stack });
    return res.redirect('/error/404');
  }
};
