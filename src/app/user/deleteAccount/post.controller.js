const logger = require('../../../common/utils/logger')(__filename);
const CookieModel = require('../../../common/models/Cookie.class');
const { deleteAccount } = require('./utils');

const postController = async (req, res) => {
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
    logger.error('Failed to delete user account', { errorMessage: err?.message, stack: err?.stack });
    return res.render('app/user/deleteAccount/index', { cookie, errors: [errObj] });
  }

  try {
    await deleteAccountOptions.notifyUser();

    if (req.session?.id_token) {
      res.redirect('/user/logout?action=user-deleted');
      return;
    }
  } catch (err) {
    logger.error('Failed to send account deletion email', { errorMessage: err?.message, stack: err?.stack });
  }

  req.session.destroy(() => {
    cookie.reset();
    res.redirect('/user/deleteconfirm');
  });
};

module.exports = postController;
