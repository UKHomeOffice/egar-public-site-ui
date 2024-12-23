/* eslint-disable consistent-return */
const logger = require('../../../common/utils/logger')(__filename);
const CookieModel = require('../../../common/models/Cookie.class');
const { deleteAccount } = require('./utils');

const postController = async (req, res) => {
  logger.debug('In user / deleteAccount postcontroller');

  const cookie = new CookieModel(req);
  const userRole = cookie.getUserRole();

  const errObj = { message: 'Failed to delete your account. Contact support or try again' };
  let deleteAccountOptions;

  try {
    deleteAccountOptions = await deleteAccount[userRole](cookie);

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
    return res.redirect('/user/logout');
  } catch (err) {
    logger.error('Failed to send email that user account is deleted');
    logger.error(err);
    return res.redirect('/user/logout');
  }
};

module.exports = postController;
