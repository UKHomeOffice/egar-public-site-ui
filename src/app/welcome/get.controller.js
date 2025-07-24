const logger = require('../../common/utils/logger')(__filename);
const { HOMEPAGE_MESSAGE } = require('../../common/config/index');
const {ONE_LOGIN_POST_MIGRATION, } = require("../../common/config/index");
const oneLoginUtil = require("../../common/utils/oneLoginAuth");

module.exports = (req, res) => {
  logger.debug('In welcome get controller');
  
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
  
  let template = ONE_LOGIN_POST_MIGRATION ? 'app/welcome/post_migration_page' : 'app/welcome/index';

  let oneLoginUrl = null;

  if (ONE_LOGIN_POST_MIGRATION) {
    oneLoginUrl = oneLoginUtil.getOneLoginAuthUrl(req, res)
  }

  res.render(template, {HOMEPAGE_MESSAGE,ONE_LOGIN_POST_MIGRATION, oneLoginUrl });
};
