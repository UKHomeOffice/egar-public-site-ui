/* eslint-disable no-return-await */
const logger = require('../../../common/utils/logger')(__filename);
const CookieModel = require('../../../common/models/Cookie.class');
const emailService = require('../../../common/services/sendEmail');
const userApi = require('../../../common/services/userManageApi');
const organisationApi = require('../../../common/services/organisationApi');

const settings = require('../../../common/config/index');

const adminDeletionType = (orgUsers) => {
  const LAST_ADMIN_IN_ORGANISATION = 1;
  const FINAL_TWO_USERS_IN_ORGANISATION = 2;

  const totalAdminsInOrg = orgUsers.filter(user => user.role.name === 'Admin').length;

  if (orgUsers.length === LAST_ADMIN_IN_ORGANISATION
    && totalAdminsInOrg === LAST_ADMIN_IN_ORGANISATION
  ) {
    return 'DELETE_ORGANISATION';
  }

  if (
    orgUsers.length === FINAL_TWO_USERS_IN_ORGANISATION
    && totalAdminsInOrg !== FINAL_TWO_USERS_IN_ORGANISATION
  ) {
    return 'DO_NOT_DELETE_ADMIN';
  }

  return 'DELETE_ADMIN';
};

const postController = async (req, res) => {
  logger.debug('In user / deleteAccount postcontroller');

  const cookie = new CookieModel(req);
  const userRole = cookie.getUserRole();
  const errObj = { message: 'Failed to delete your account. Contact support or try again' };

  const defaultDeletion = async () => ({
    deleteAccount: async () => await userApi.deleteUser(cookie.getUserEmail()),
    notifyUser: async () => await emailService.send(
      settings.NOTIFY_ACCOUNT_DELETE_TEMPLATE_ID,
      cookie.getUserEmail(),
      { firstName: cookie.getUserFirstName() },
    ),
  });

  const accountTypes = {
    Individual: defaultDeletion,
    User: defaultDeletion,
    Manager: defaultDeletion,
    Admin: async () => {
      const orgId = cookie.getOrganisationId();
      const orgUsersRes = await organisationApi.getUsers(orgId);
      const orgUsers = JSON.parse(orgUsersRes).items;
      const deletionType = adminDeletionType(orgUsers);

      return {
        deleteAccount: async () => {
          switch (deletionType) {
            case 'DELETE_ORGANISATION':
              return organisationApi.delete(orgId);

            case 'DO_NOT_DELETE_ADMIN':
              return JSON.stringify({
                message: `You cannot leave an organisation with one non admin user.
                To delete your user, please add or promote another admin.
                To delete the organisation, delete the non admin user and then your account.`,
              });

            case 'DELETE_ADMIN':
              return userApi.deleteUser(cookie.getUserEmail());

            default:
              throw new Error('Invalid Deletion type provided');
          }
        },
        notifyUser: async () => {
          switch (deletionType) {
            case 'DELETE_ORGANISATION':
              return await emailService.send(
                settings.NOTIFY_ORGANISATION_DELETE_TEMPLATE_ID,
                cookie.getUserEmail(),
                {
                  firstName: cookie.getUserFirstName(),
                  orgName: cookie.getOrganisationName(),
                },
              );

            case 'DO_NOT_DELETE_ADMIN':
              throw new Error('Email should not be sent if admin is not deleted');

            case 'DELETE_ADMIN':
              return await emailService.send(
                settings.NOTIFY_ACCOUNT_DELETE_TEMPLATE_ID,
                cookie.getUserEmail(),
                { firstName: cookie.getUserFirstName() },
              );

            default:
              throw new Error('Invalid Deletion type provided');
          }
        },
      };
    },
  };


  try {
    const apiResponse = await accountTypes[userRole]().deleteAccount();
    const parsedResponse = JSON.parse(apiResponse);

    if (Object.prototype.hasOwnProperty.call(parsedResponse, 'message')) {
      res.render('app/user/deleteAccount/index', { cookie, errors: [parsedResponse] });
      return;
    }
  } catch (err) {
    logger.error('Failed to delete user account');
    logger.error(err);
    return res.render('app/user/deleteAccount/index', { cookie, errors: [errObj] });
  }

  try {
    await accountTypes[userRole].notifyUser();
    return res.redirect('/user/logout');
  } catch (err) {
    logger.error('Failed to send email that user account is deleted');
    logger.error(err);
    return res.redirect('/user/logout');
  }
};

module.exports = { postController, adminDeletionType };
