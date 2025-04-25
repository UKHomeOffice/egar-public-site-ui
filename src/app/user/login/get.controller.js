const oneLoginUtil = require('../../../common/utils/oneLoginAuth');
const oneLoginApi = require('../../../common/services/oneLoginApi');
const userApi = require('../../../common/services/userManageApi');
const logger = require('../../../common/utils/logger')(__filename);
const { resolve } = require('path');
const {IS_HTTPS_SERVER} = require("../../../common/config");
const CookieModel = require("../../../common/models/Cookie.class");

/**
 * If incoming object contains a dbId (id), vr (verified) and rl (role),
 * then consider the user logged in.
 *
 * @param {Object} userSessionObject object representing the User in the session.
 */
const checkUserInSession = (userSessionObject) => {
  if (userSessionObject) {
    return userSessionObject.dbId && userSessionObject.vr && userSessionObject.rl;
  }
  return false;
};



module.exports = async (req, res) => {
  if (req.headers.referer && checkUserInSession(req.session.u)) {
    res.redirect('/home');
    return;
  }

  const cookie = new CookieModel(req);
  const code = req.query.code;

  if(code){
    const { access_token, id_token } = await oneLoginApi.sendOneLoginTokenRequest(code);

    if (req.query.state !== req.cookies.state) {
        res.redirect('/error/404');
        return;
    }

    if (id_token) {
      res.cookie('id_token', id_token, {
        httpOnly: true,
        secure: IS_HTTPS_SERVER,
        sameSite: 'none',
      });
    }

    const isValid = await new Promise((resolve) => {
      oneLoginUtil.verifyJwt(id_token, req.cookies.nonce, async (valid) => {
        resolve(valid);
        });
    })

    if(isValid){
        const userInfo = await oneLoginApi.getUserInfoFromOneLogin(access_token);

        if (userInfo && userInfo.email_verified) {
          //search user by one login sid and email
          const {userId, state, oneLoginSid, email, firstName, lastName, role} = await userApi.userSearch(
            userInfo.email,
            userInfo.sub,
          );

          // If no userId, then the user doesn't exist.
          if (!userId || state !== 'verified') {
            logger.info('User Id not found or email not verified during onelogin flow.')
            res.redirect('/error/404');
            return;
          }

          if (userInfo.sub && !oneLoginSid) {
            //   Update DB wih One Login
            await userApi.updateDetails(email, firstName, lastName, userInfo.sub)
          }

          const {organisation} = await userApi.getDetails(email)

          if (organisation === null) {
            logger.info('Organisation not found during onelogin flow')
            res.redirect('/error/404');
            return;
          }

          cookie.setUserEmail(email);
          cookie.setUserFirstName(firstName)
          cookie.setUserLastName(lastName);
          cookie.setUserDbId(userId);
          cookie.setUserRole(role.name);
          cookie.setOrganisationId(organisation.organisationId);
          cookie.setUserVerified(state === 'verified');

          delete req.cookies.nonce;
          delete req.cookies.state
          console.log('Cookied ', cookie)
          res.redirect('/home');
          return;
        }
      }

 }

  res.render('app/user/login/index', { oneLoginAuthUrl: oneLoginUtil.getOneLoginAuthUrl(res)});
};
