const oneLoginUtil = require('../../../common/utils/oneLoginAuth');
const oneLoginApi = require('../../../common/services/oneLoginApi');
const userApi = require('../../../common/services/userManageApi');
const logger = require('../../../common/utils/logger')(__filename);
const CookieModel = require('../../../common/models/Cookie.class');

// Constants
const ROUTES = {
  HOME: '/home',
  ERROR_404: '/error/404',
  REGISTER: '/onelogin/register'
};

const USER_STATES = {
  VERIFIED: 'verified'
};

/**
 * Checks if user is authenticated in the session
 * @param {Object} userSessionObject - User session object
 * @returns {boolean} - True if user is authenticated
 */
const isUserAuthenticated = (userSessionObject) => {
  if (!userSessionObject) return false;
  return !!(userSessionObject.dbId && userSessionObject.vr && userSessionObject.rl);
};

/**
 * Handles user authentication state and cookie management
 * @param {Object} userInfo - User information from OneLogin
 * @param {Object} cookie - Cookie model instance
 * @returns {Object} - User authentication result
 */
const handleUserAuthentication = async (userInfo, cookie) => {
  const {email, sub: oneLoginSid} = userInfo;
  const userData = await userApi.userSearch(email, oneLoginSid);

  if (!userData.userId) {
    return {redirect: ROUTES.REGISTER};
  }

  if (userData.state !== USER_STATES.VERIFIED) {
    logger.info('User Id not found or email not verified during onelogin flow.');
    return {redirect: ROUTES.ERROR_404};
  }

  if (oneLoginSid && !userData.oneLoginSid) {
    await userApi.updateDetails(email, userData.firstName, userData.lastName, oneLoginSid);
  }

  const {organisation} = await userApi.getDetails(email);
  if (!organisation) {
    logger.info('Organisation not found during onelogin flow');
    return {redirect: ROUTES.ERROR_404};
  }

  setUserCookies(cookie, {
    ...userData, organisation, state: userData.state
  });

  return {redirect: ROUTES.HOME};
};

/**
 * Sets all necessary user cookies
 * @param {Object} cookie - Cookie model instance
 * @param {Object} userData - User data
 */
const setUserCookies = (cookie, userData) => {
  const {email, firstName, lastName, userId, role, organisation, state} = userData;
  cookie.setUserEmail(email);
  cookie.setUserFirstName(firstName);
  cookie.setUserLastName(lastName);
  cookie.setUserDbId(userId);
  cookie.setUserRole(role.name);
  cookie.setOrganisationId(organisation.organisationId);
  cookie.setUserVerified(true);
};

/**
 * Main login controller
 */
module.exports = async (req, res) => {
  if (req.headers.referer && isUserAuthenticated(req.session.u)) {
    return res.redirect(ROUTES.HOME);
  }

  const cookie = new CookieModel(req);

  const {code} = req.query;
  if (!code) {
    return res.render('app/user/login/index', {
      oneLoginAuthUrl: oneLoginUtil.getOneLoginAuthUrl(res)
    });
  }

  if (req.query.state !== req.cookies.state) {
    return res.redirect(ROUTES.ERROR_404);
  }

  try {
    const {access_token, id_token} = await oneLoginApi.sendOneLoginTokenRequest(code);

    if (!id_token) {
      logger.error('Invalid ID Token error.');
      res.render('app/user/login/index', {
        oneLoginAuthUrl: oneLoginUtil.getOneLoginAuthUrl(res),
      });
      return;
    }

    const isValid = await new Promise(resolve => {
      oneLoginUtil.verifyJwt(id_token, req.cookies.nonce, resolve);
    });

    if (!isValid) {
      logger.info('Invalid jwt token received from OneLogin.');
      return res.render('app/user/login/index', {
        oneLoginAuthUrl: oneLoginUtil.getOneLoginAuthUrl(res),
      });
    }

    const userInfo = await oneLoginApi.getUserInfoFromOneLogin(access_token);
    if (!userInfo?.email_verified) {
      return res.redirect(ROUTES.ERROR_404);
    }

    const {redirect} = await handleUserAuthentication(userInfo, cookie);
    delete req.cookies.nonce;
    delete req.cookies.state;
    return res.redirect(redirect);
  } catch (error) {
    logger.error('Login process failed:', error);
    return res.redirect(ROUTES.ERROR_404);
  }
};
