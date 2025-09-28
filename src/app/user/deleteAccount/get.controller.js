import loggerFactory from '../../../common/utils/logger.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const logger = loggerFactory(__filename);
import CookieModel from '../../../common/models/Cookie.class.js';
import utils from './utils.js';
import { ONE_LOGIN_SHOW_ONE_LOGIN } from '../../../common/config/index.js';

export default async (req, res) => {
  logger.info('Rendering page app/user/deleteAccount/index');
  const cookie = new CookieModel(req);
  const userRole = cookie.getUserRole();

  const errObj = { message: 'Internal Server Error. Please contact support or try again' };

  try {
    const deleteAccountOptions = await utils.deleteAccount[userRole](cookie);

    res.locals.text = deleteAccountOptions.text();
    res.render('app/user/deleteAccount/index', { cookie, ONE_LOGIN_SHOW_ONE_LOGIN });
  } catch (err) {
    logger.error('user delete account get controller failed');
    logger.error(err);
    res.render('app/user/deleteAccount/index', { cookie, errors: [errObj] });
  }
};
