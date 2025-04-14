const oneLoginUtil = require('../../../common/utils/oneLoginAuth');
const oneLoginApi = require('../../../common/services/oneLoginApi');
const { resolve } = require('path');

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
    console.log(req.cookies);
    const { access_token, id_token } = await oneLoginApi.sendOneLoginTokenRequest(code);
    
    console.log(id_token);
    oneLoginUtil.verifyJwt(id_token, req.cookies.nonce, async (valid) => {
      if(valid){
        res.cookie('id_token', id_token, {
          httpOnly: true,
          secure: config.IS_PRODUCTION_ENV,
        });
        const userInfo = await oneLoginApi.getUserInfoFromOneLogin(access_token);
        console.log(userInfo);
      //   if (userInfo && userInfo.email_verified) {
      //     //search user by one login sid and email
      //     const userData = await getUserDataByOneLoginData(
      //       userInfo.sub,
      //       userInfo.email,
      //     );
      // }
    }});

      

 }

  res.render('app/user/login/index', { oneLoginAuthUrl: oneLoginUtil.getOneLoginAuthUrl(res)});
};
