const navUtil = require('../../../common/utils/nav');

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
  if (req.headers.referer && req.session.u && checkUserInSession(req.session.u)) {
    res.redirect('/home');
    return;
  }
  navUtil.simpleGetRender(req, res, 'app/user/login/index');
};
