const oneLoginUtil = require('../../../common/utils/oneLoginAuth');
const oneLoginApi = require('../../../common/services/oneLoginApi');
const userApi = require('../../../common/services/userManageApi');
const logger = require('../../../common/utils/logger')(__filename);
const CookieModel = require('../../../common/models/Cookie.class');
const { ONE_LOGIN_SHOW_ONE_LOGIN, NOTIFY_ADMIN_ABOUT_USER_EMAIL_CHANGE_TEMPLATE_ID, BASE_URL, ONE_LOGIN_POST_MIGRATION} = require("../../../common/config");
const sendEmail = require("../../../common/services/sendEmail");
const organisationApi = require('../../../common/services/organisationApi');
const verifyUserService = require('../../../common/services/verificationApi');
const {parseUrlForNonProd} = require("../../../common/services/oneLoginApi");
const { getOneLoginLogoutUrl } = require("../../../common/utils/oneLoginAuth");

// Constants
const ROUTES = {
  HOME: '/home',
  ERROR_404: '/error/404',
  REGISTER: '/onelogin/register',
  ERROR_INVITE_EXPIRED: '/error/inviteExpiredError',
  ERROR_IN_LOGIN: '/error/loginError',
  ERROR_ONELOGIN_SERVICE: '/error/oneLoginServiceError',
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
const handleUserAuthentication = (req, res, userInfo, cookie) => {
  const { email, sub: oneLoginSid } = userInfo;
  return userApi.userSearch(email, oneLoginSid)
    .then(async userData => {

      if (!userData?.userId) {
        return { redirect: ROUTES.REGISTER };
      }

      if (userData.state !== USER_STATES.VERIFIED) {
        logger.info('User Id not found or email not verified during onelogin flow.');
        return redirectErrorPage(req, res, 'login-error');
        
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
          return new Promise((resolve, reject) => {
            userApi.updateEmailOrOneLoginSid(userData.email, {oneLoginSid})
              .then(() => {
                userData.oneLoginSid = oneLoginSid;
                return userData;
              })
          });
        case !oneLoginSidMatches && emailMatches && userData.oneLoginSid !== null:
          // condition: User had SID in our DB that doesn't match the one from ONELOGIN. Email matches however.
          return redirectErrorPage(req, res, 'login-error');

        default:
          logger.info('User Id not found or email not verified during onelogin flow.');
          //return { redirect: '/user/logout?action=service-error' };
          return redirectErrorPage(req, res, 'service-error');
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
module.exports = async (req, res) => {
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

  if (req.query?.state !== req.cookies.state) {
    return redirectErrorPage(req, res, 'service-error');
  }


  oneLoginApi.sendOneLoginTokenRequest(req, code, oneLoginUtil)
    .then(({ access_token, id_token }) => {

      res.cookie("id_token", id_token);
      if (!id_token) {
        // If for some reason, One Login service does not return a valid id_token, something is wrong with service.
        logger.error('Invalid ID Token error.');
        return redirectErrorPage(req, res, 'service-error');
      }

      return new Promise((resolve) => {
        oneLoginUtil.verifyJwt(id_token, req.cookies.nonce, resolve);
      })
        .then(isValid => {
          if (!isValid) {
            logger.info('Invalid jwt token received from OneLogin.');
            return redirectErrorPage(req, res, 'service-error');
          }
          return oneLoginApi.getUserInfoFromOneLogin(access_token);
        })
        .then(userInfo => {
          if (!userInfo?.email_verified) {
            return redirectErrorPage(req, res, 'login-error');
            
          }

          accountUrl = parseUrlForNonProd(req, accountUrl);

          return handleUserAuthentication(req, res, userInfo, cookie)
            .then(({ redirect }) => {
              if (redirect === ROUTES.HOME) {
                delete req.cookies.nonce;
                delete req.cookies.state;
              } else if (redirect === ROUTES.REGISTER) {
                req.session.access_token = access_token;
              }
              return redirect;
            })
            .then(redirect => {
              res.set('Referer', req.headers.host)
              if (redirect === ROUTES.REGISTER) {
                return checkUserInvite(req, res, userInfo.email);
              }
              req.session.save()
              return res.redirect(redirect);
            });
        });
    })
    .catch(error => {
      if (error) {
        logger.error(`Login process failed ${error}`);
      }
    });
};


async function checkUserInvite(req, res, email) {
  try {
    const apiResponse = await verifyUserService.getUserInviteToken(email);
    if (apiResponse['message'] === 'Token expired' || apiResponse['message'] === 'Token already used') {
      return redirectErrorPage(req, res, 'invite-expired');
    }

    return res.redirect(ROUTES.REGISTER);
  }
  catch (error) {
    logger.error(`Invite link to register failed ${error}`);
    return redirectErrorPage(req, res, 'login-error');
  }
}

function redirectErrorPage(req, res, errorPage) {
res.cookie("errorPage", errorPage);

const logoutUrl = getOneLoginLogoutUrl(req, req.cookies.id_token, req.cookies.state);
return res.redirect(logoutUrl);
}

