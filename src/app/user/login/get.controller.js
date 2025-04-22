const oneLoginUtil = require('../../../common/utils/oneLoginAuth');
const oneLoginApi = require('../../../common/services/oneLoginApi');
const userApi = require('../../../common/services/userManageApi');
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

  const code = req.query.code;

  if(code){
    const cookie = new CookieModel(req);

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
          const {userId, state, oneLoginSid, email, firstName, role} = await userApi.userSearch(
            userInfo.email,
            userInfo.sub,
          );

          if (state !== 'verified' || oneLoginSid === null) {
            res.redirect('/error/404');
            return;
          }

          const {organisation} = await userApi.getDetails(email)

          if (organisation === null) {
            res.redirect('/error/404');
            return;
          }

          cookie.setOrganisationId(organisation.organisationId);
          cookie.setUserEmail(email);
          cookie.setUserFirstName(firstName)
          cookie.setUserDbId(userId);
          cookie.setUserRole(role.name);
          cookie.setUserVerified(true);

          delete req.cookies.nonce;
          delete req.cookies.state

          res.redirect('/home');
          return;
        }
      }

 }

  res.render('app/user/login/index', { oneLoginAuthUrl: oneLoginUtil.getOneLoginAuthUrl(res)});
};
