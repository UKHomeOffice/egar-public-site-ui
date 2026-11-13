const { HOMEPAGE_MESSAGE } = require('../../common/config/index');

module.exports = (req, res) => {
  if (req.cookies.errorPage === 'login-error') {
    res.clearCookie('errorPage');
    return res.redirect('/error/loginError');
  } else if (req.cookies.errorPage === 'service-error') {
    res.clearCookie('errorPage');
    return res.redirect('/error/oneLoginServiceError');
  } else if (req.cookies.errorPage === 'invite-expired') {
    res.clearCookie('errorPage');
    return res.redirect('/error/inviteExpiredError');
  }

  res.render('app/welcome/index', { HOMEPAGE_MESSAGE });
};
