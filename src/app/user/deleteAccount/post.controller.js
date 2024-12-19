const logger = require('../../../common/utils/logger')(__filename);
const CookieModel = require('../../../common/models/Cookie.class');
const emailService = require('../../../common/services/sendEmail');
const userApi = require('../../../common/services/userManageApi');
const organisationApi = require('../../../common/services/organisationApi');

const settings = require('../../../common/config/index');

const postController = async (req, res) => {
  logger.debug('In user / deleteAccount postcontroller');

  const cookie = new CookieModel(req);
  const errObj = { message: 'Failed to delete your account. Contact support or try again' };

  const deleteAccount = {
    Individual: async () => await userApi.deleteUser(cookie.getUserEmail()),
    User: async () => await userApi.deleteUser(cookie.getUserEmail()),
    Manager: async () => await userApi.deleteUser(cookie.getUserEmail()),
    Admin: async () => {
      const LAST_ADMIN_IN_ORGANISATION = 1;
      const FINAL_TWO_USERS_IN_ORGANISATION = 2;

      const orgId = cookie.getOrganisationId();
      const orgUsersRes = await organisationApi.getUsers(orgId);
      const orgUsers = JSON.parse(orgUsersRes).items;

      const NOT_TWO_ADMINS_IN_ORGANISATION = (
        orgUsers.filter(user => user.role.name === 'Admin').length !== FINAL_TWO_USERS_IN_ORGANISATION
      );

      if (orgUsers.length === LAST_ADMIN_IN_ORGANISATION) {
        return await organisationApi.delete(orgId);
      } if (
        orgUsers.length === FINAL_TWO_USERS_IN_ORGANISATION
        && NOT_TWO_ADMINS_IN_ORGANISATION
      ) {
        return;
      }

      return await userApi.deleteUser(cookie.getUserEmail());
    },
  };


  try {
    const apiResponse = deleteAccount[cookie.getUserRole()]();
    const parsedResponse = JSON.parse(apiResponse);

    if (Object.prototype.hasOwnProperty.call(parsedResponse, 'message')) {
      res.render('app/user/deleteAccount/index', { cookie, errors: [errObj] });
      return;
    }
  } catch (err) {
    logger.error('Failed to delete user account');
    logger.error(err);
    return res.render('app/user/deleteAccount/index', { cookie, errors: [errObj] });
  }

  try {
    await emailService.send(
      settings.NOTIFY_ACCOUNT_DELETE_TEMPLATE_ID,
      cookie.getUserEmail(),
      { firstName: cookie.getUserFirstName() },
    );

    return res.redirect('/user/logout');
  } catch (err) {
    logger.error('Failed to send email that user account is deleted');
    logger.error(err);
    return res.redirect('/user/logout');
  }
};

module.exports = postController;
