const navUtil = require('../../../common/utils/nav');

module.exports = (req, res) => {
  if (req.headers.referer && req.session.u && req.session.u.dbId && req.session.u.vr && req.session.u.rl) {
    res.redirect('/home');
    return;
  }
  navUtil.simpleGetRender(req, res, 'app/user/login/index');
};
