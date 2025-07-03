const logger = require('../../common/utils/logger')(__filename);
const { HOMEPAGE_MESSAGE } = require('../../common/config/index');
const {ONE_LOGIN_POST_MIGRATION, ONE_LOGIN_ACCOUNT_URL} = require("../../common/config");
const oneLoginUtil = require("../../common/utils/oneLoginAuth");

module.exports = (req, res) => {
  logger.debug('In welcome get controller');
  let template = ONE_LOGIN_POST_MIGRATION === true ? 'app/welcome/post_migration_page' : 'app/welcome/index';

  let oneLoginUrl = null;

  if (ONE_LOGIN_POST_MIGRATION === true) {
    console.log("ONE_LOGIN_POST_MIGRATION ", ONE_LOGIN_POST_MIGRATION)
    oneLoginUrl = oneLoginUtil.getOneLoginAuthUrl(req, res)
  }

  console.log("Temoakte ", template, '   ', ONE_LOGIN_POST_MIGRATION, oneLoginUrl)
  res.render(template, {HOMEPAGE_MESSAGE, ONE_LOGIN_POST_MIGRATION, oneLoginUrl: oneLoginUrl });
};
