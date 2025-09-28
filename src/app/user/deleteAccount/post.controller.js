/* eslint-disable consistent-return */
import loggerFactory from '../../../common/utils/logger.js';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const logger = loggerFactory(__filename);
import CookieModel from '../../../common/models/Cookie.class.js';
import utils from './utils.js';

const postController = async (req, res) => {
  logger.debug('In user / deleteAccount postcontroller');

  const cookie = new CookieModel(req);
  const userRole = cookie.getUserRole();

  const errObj = { message: 'Failed to delete your account. Contact support or try again' };
  let deleteAccountOptions;

  try {
    deleteAccountOptions = await utils.deleteAccount[userRole](cookie);

    res.locals.text = deleteAccountOptions.text();
    const apiResponse = await deleteAccountOptions.deleteAccount();
    const parsedResponse = JSON.parse(apiResponse);

    if (Object.prototype.hasOwnProperty.call(parsedResponse, 'message')) {
      return res.render('app/user/deleteAccount/index', { cookie, errors: [parsedResponse] });
    }
  } catch (err) {
    logger.error('Failed to delete user account');
    logger.error(err);
    return res.render('app/user/deleteAccount/index', { cookie, errors: [errObj] });
  }

  try {
    await deleteAccountOptions.notifyUser();

    if (Object.hasOwn(req.cookies, 'id_token')) {
      res.redirect('/user/logout?action=user-deleted')
      return;
    }
  } catch (err) {
    logger.error('Failed to send email that user account is deleted');
    logger.error(err);
  }

  req.session.destroy(() => {
    cookie.reset();
    res.redirect('/user/deleteconfirm');
  });
};

export default postController;
