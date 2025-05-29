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
 * @returns {Promise<Object>} - User authentication result
 */
const handleUserAuthentication = (userInfo, cookie) => {
  const {email, sub: oneLoginSid} = userInfo;

  return userApi.userSearch(email, oneLoginSid)
    .then(userData => {
      if (!userData?.userId) {
        return {redirect: ROUTES.REGISTER};
      }

      if (userData.state !== USER_STATES.VERIFIED) {
        logger.info('User Id not found or email not verified during onelogin flow.');
        return {redirect: ROUTES.ERROR_404};
      }

      if (oneLoginSid && !userData?.oneLoginSid) {
        return userApi.updateDetails(email, userData.firstName, userData.lastName, oneLoginSid)
          .then(() => userData);
      }

      return userData;
    })
    .then(userData => {
      if (userData?.redirect) {
        return userData;
      }

      return userApi.getDetails(email)
        .then(details => {
          const { organisation } = details || {};

          setUserCookies(cookie, {
            ...userData, organisation, state: userData.state
          });

          return {redirect: ROUTES.HOME};
        });
    });
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
  cookie.setUserVerified(state === USER_STATES.VERIFIED);

  cookie.setOrganisationId(organisation?.organisationId);
  cookie.setOrganisationName(organisation?.organisationName);
  cookie.setUserOrganisationId(organisation?.organisationId);
};

/**
 * Main login controller
 */
module.exports = (req, res) => {
  if (req.headers.referer && isUserAuthenticated(req.session.u)) {
    return res.redirect(ROUTES.HOME);
  }

  const cookie = new CookieModel(req);

  const {code} = req.query;

  if (!code) {
    return res.render('app/user/login/index', {
      oneLoginAuthUrl: oneLoginUtil.getOneLoginAuthUrl(req, res)
    });
  }

  if (req.query.state !== req.cookies.state) {
    return res.redirect(ROUTES.ERROR_404);
  }

  oneLoginApi.sendOneLoginTokenRequest(code, req, oneLoginUtil)
    .then(({access_token, id_token}) => {
      if (!id_token) {
        logger.error('Invalid ID Token error.');
        res.render('app/user/login/index', {
          oneLoginAuthUrl: oneLoginUtil.getOneLoginAuthUrl(req, res),
        });
        return Promise.reject();
      }

      res.cookie("id_token", id_token);

      return new Promise(resolve => {
        oneLoginUtil.verifyJwt(id_token, req.cookies.nonce, resolve);
      })
      .then(isValid => {
        if (!isValid) {
          logger.info('Invalid jwt token received from OneLogin.');
          res.render('app/user/login/index', {
            oneLoginAuthUrl: oneLoginUtil.getOneLoginAuthUrl(res),
          });
          return Promise.reject();
        }

        return oneLoginApi.getUserInfoFromOneLogin(access_token);
      })
      .then(userInfo => {
        if (!userInfo?.email_verified) {
          res.redirect(ROUTES.ERROR_404);
          return Promise.reject();
        }

        return handleUserAuthentication(userInfo, cookie)
          .then(({redirect}) => {
            if (redirect === ROUTES.HOME) {
              delete req.cookies.nonce;
              delete req.cookies.state;
            } else if (redirect === ROUTES.REGISTER) {
              req.session.access_token = access_token;
            }

            return new Promise((resolve, reject) => {
              req.session.save(err => {
                if (err) {
                  logger.error('Session save error:', err);
                  reject(err);
                } else {
                  logger.info('Session saved successfully');
                  resolve(redirect);
                }
              });
            });
          })
          .then(redirect => {
            res.set('Referer', req.headers.host)
            res.redirect(redirect)
          });
      });
    })
    .catch(error => {
      if (error) {
        logger.error(`Login process failed ${error}`);
      }
      return res.redirect(ROUTES.ERROR_404);
    });
};
