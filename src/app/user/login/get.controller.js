const oneLoginUtil = require('../../../common/utils/oneLoginAuth');

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

module.exports = (req, res) => {
  if (req.headers.referer && checkUserInSession(req.session.u)) {
    res.redirect('/home');
    return;
  }
  res.render('app/user/login/index', { oneLoginAuthUrl: oneLoginUtil.getOneLoginAuthUrl(res)});
};
