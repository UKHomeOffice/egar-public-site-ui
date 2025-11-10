const logger = require('../../../common/utils/logger')(__filename);
const CookieModel = require('../../../common/models/Cookie.class');
const { deleteAccount } = require('./utils');
const { ONE_LOGIN_SHOW_ONE_LOGIN } = require('../../../common/config');

module.exports = async (req, res) => {
  logger.info('Rendering page app/user/deleteAccount/index');
  const cookie = new CookieModel(req);
  const userRole = cookie.getUserRole();

  const errObj = { message: 'Internal Server Error. Please contact support or try again' };

  try {
    const deleteAccountOptions = await deleteAccount[userRole](cookie);

    res.locals.text = deleteAccountOptions.text();
    res.render('app/user/deleteAccount/index', { cookie, ONE_LOGIN_SHOW_ONE_LOGIN });
  } catch (err) {
    logger.error('user delete account get controller failed');
    logger.error(err);
    res.render('app/user/deleteAccount/index', { cookie, errors: [errObj] });
  }
};
