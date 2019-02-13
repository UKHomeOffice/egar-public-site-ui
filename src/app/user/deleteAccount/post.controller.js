const logger = require('../../../common/utils/logger');
const CookieModel = require('../../../common/models/Cookie.class');
const emailService = require('../../../common/services/sendEmail');
const userApi = require('../../../common/services/userManageApi');
const settings = require('../../../common/config/index');

module.exports = (req, res) => {
  logger.debug('In user / deleteAccount postcontroller');
  const cookie = new CookieModel(req);
  const errObj = { message: 'Failed to delete your account. Contact support or try again' }
  userApi.deleteUser(cookie.getUserEmail())
    .then((apiResponse) => {
      const parsedResponse = JSON.parse(apiResponse);
      if (Object.prototype.hasOwnProperty.call(parsedResponse, 'message')) {
        return res.render('app/user/deleteAccount/index', { cookie, errors: [errObj] });
      }
      emailService.send(
        settings.NOTIFY_ACCOUNT_DELETE_TEMPLATE_ID,
        cookie.getUserEmail(),
        { firstName: cookie.getUserFirstName() }
      )
        .then(() => {
          return res.redirect('/user/logout');
        })
        .catch((err) => {
          logger.error('Failed to send notify email');
          logger.error(err);
          return res.redirect('/user/logout');
        });
    })
    .catch((err) => {
      logger.error('Failed to delete user account');
      logger.error(err);
      return res.render('app/user/deleteAccount/index', { cookie, errors: [errObj] });
    });
};
