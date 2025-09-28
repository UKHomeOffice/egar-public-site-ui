import loggerFactory from '../../common/utils/logger.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const logger = loggerFactory(__filename);
import { HOMEPAGE_MESSAGE } from '../../common/config/index.js';
import { ONE_LOGIN_POST_MIGRATION } from '../../common/config/index.js';
import oneLoginUtil from '../../common/utils/oneLoginAuth.js';

export default (req, res) => {
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
