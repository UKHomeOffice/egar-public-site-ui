const oneLoginUtil = require('../../../common/utils/oneLoginAuth');
const oneLoginApi = require('../../../common/services/oneLoginApi');
const userApi = require('../../../common/services/userManageApi');
const logger = require('../../../common/utils/logger')(__filename);
const CookieModel = require('../../../common/models/Cookie.class');
const {
  ONE_LOGIN_SHOW_ONE_LOGIN,
  NOTIFY_ADMIN_ABOUT_USER_EMAIL_CHANGE_TEMPLATE_ID,
  BASE_URL,
  ONE_LOGIN_POST_MIGRATION,
} = require("../../../common/config");
const sendEmail = require("../../../common/services/sendEmail");
const organisationApi = require('../../../common/services/organisationApi');
const verifyUserService = require('../../../common/services/verificationApi');
const {parseUrlForNonProd} = require("../../../common/services/oneLoginApi");

// Constants
const ROUTES = {
  HOME: '/home',
  ERROR_404: '/error/404',
  REGISTER: '/onelogin/register',
  ERROR_INVITE_EXPIRED: '/error/inviteExpiredError',
};

const USER_STATES = {
  VERIFIED: 'verified'
};

let accountUrl = BASE_URL + '/organisation'

/**
 * Checks if user is authenticated in the session
 * @param {Object} userSessionObject - User session object
 * @returns {boolean} - True if user is authenticated
 */
const isUserAuthenticated = (userSessionObject) => {
  if (!userSessionObject) return false;
  return !!(userSessionObject.dbId && userSessionObject.vr && userSessionObject.rl);
};


const sendAdminUpdateEmail = (userObj) => {
  if (!userObj.organisation) {
    return new Promise((resolve, reject) => resolve(userObj));
  }

  return organisationApi.getListOfOrgUsers(userObj.organisation.organisationId, 'Admin').then(users => {
    const userList = JSON.parse(users)

    userList.items.forEach(user => {
      try {
        sendEmail.send(
          NOTIFY_ADMIN_ABOUT_USER_EMAIL_CHANGE_TEMPLATE_ID,
          user.email,
          {
            firstName: userObj.firstName,
            lastName: userObj.lastName,
            accountUrl,
            adminFirstName: user.firstName,
            adminLastName: user.lastName,
            organisationName: userObj.organisation.organisationName,
          }
        );
      } catch (error) {
        logger.error("Exception when sending email to admin");
        logger.error(error);
      }

    });
  })
}

/**
 * Handles user authentication state and cookie management
 * @param {Object} userInfo - User information from OneLogin
 * @param {Object} cookie - Cookie model instance
 * @returns {Promise<Object>} - User authentication result
 */
const handleUserAuthentication = (userInfo, cookie) => {
  const { email, sub: oneLoginSid } = userInfo;
  return userApi.userSearch(email, oneLoginSid)
    .then(userData => {

      if (!userData?.userId) {
        return { redirect: ROUTES.REGISTER };
      }

      if (userData.state !== USER_STATES.VERIFIED) {
        logger.info('User Id not found or email not verified during onelogin flow.');
        return { redirect: ROUTES.ERROR_404 };
      }

      const oneLoginSidMatches = oneLoginSid === userData.oneLoginSid;
      const emailMatches = email === userData.email;

      switch (true) {
        case oneLoginSidMatches && emailMatches:
          // happy path - SID matches, email matches.
          return userData;

        case oneLoginSidMatches && !emailMatches:
          // sid matches but email does not.
          return new Promise((resolve, reject) =>
            userApi.updateEmailOrOneLoginSid(userData.email, {email}).then(
              () => {
                userData.email = email;
                sendAdminUpdateEmail(userData).then(() => resolve(userData))
              }).catch((err) => reject(err))
          );
        case emailMatches && userData.oneLoginSid === null:
          // user email exists, but onelogin is null or does not match - action, update SID
          return new Promise((resolve, reject) =>
            userApi.updateEmailOrOneLoginSid(userData.email, {oneLoginSid})
              .then(() => {
                userData.oneLoginSid = oneLoginSid;
                return userData;
              })
          );
        case !oneLoginSidMatches && !emailMatches:
          // if neither sid or email matches, register user. Invite token checked in Onelogin flow
          return new Promise((resolve, reject) => resolve({ redirect: ROUTES.REGISTER }));
        default:
          logger.info('User Id not found or email not verified during onelogin flow.');
          return { redirect: ROUTES.ERROR_404 };
      }
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

          return { redirect: ROUTES.HOME };
        });
    });
};

/**
 * Sets all necessary user cookies
 * @param {Object} cookie - Cookie model instance
 * @param {Object} userData - User data
 */
const setUserCookies = (cookie, userData) => {
  const { email, firstName, lastName, userId, role, organisation, state } = userData;
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

  const viewOnLoginPageForTest = req.query.testOneLogin === 'true' ;
  const cookie = new CookieModel(req);

  const { code } = req.query;

  if (!code) {
     if (ONE_LOGIN_POST_MIGRATION === true) {
        return res.redirect(ROUTES.HOME);
    }
    return res.render('app/user/login/index', {
      oneLoginAuthUrl: oneLoginUtil.getOneLoginAuthUrl(req, res),
      ONE_LOGIN_SHOW_ONE_LOGIN,
      viewOnLoginPageForTest
    });
  }

  if (req.query.state !== req.cookies.state) {
    return res.redirect(ROUTES.ERROR_404);
  }

  oneLoginApi.sendOneLoginTokenRequest(req, code, oneLoginUtil)
    .then(({ access_token, id_token }) => {
      if (!id_token) {
        logger.error('Invalid ID Token error.');
        res.render('app/user/login/index', {
          oneLoginAuthUrl: oneLoginUtil.getOneLoginAuthUrl(req, res),
          ONE_LOGIN_SHOW_ONE_LOGIN
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
              ONE_LOGIN_SHOW_ONE_LOGIN
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

          accountUrl = parseUrlForNonProd(req, accountUrl);

          return handleUserAuthentication(userInfo, cookie)
            .then(({ redirect }) => {

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
            .then(async redirect => {
              res.set('Referer', req.headers.host)
              if (redirect === ROUTES.REGISTER) {
                return checkUserInvite(res, userInfo.email);
              }
              return res.redirect(redirect);
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


async function checkUserInvite(res, email) {
  try {
    const apiResponse = await verifyUserService.getUserInviteToken(email);
    if (apiResponse['message'] === 'Token expired' || apiResponse['message'] === 'Token already used') {
      return res.redirect(ROUTES.ERROR_INVITE_EXPIRED);
    }
    else{
      return res.redirect(ROUTES.REGISTER);
    }
  }
  catch (error) {
    logger.error(`Invite link to register failed ${error}`);
    return res.redirect(ROUTES.ERROR_404);
  }
}
