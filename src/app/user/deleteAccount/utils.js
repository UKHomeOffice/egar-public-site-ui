/* eslint-disable no-underscore-dangle */
/* eslint-disable no-return-await */
const i18n = require('i18n');
const emailService = require('../../../common/services/sendEmail');
const userApi = require('../../../common/services/userManageApi');
const organisationApi = require('../../../common/services/organisationApi');

const settings = require('../../../common/config/index');

const adminDeletionType = (orgUsers) => {
  const LAST_ADMIN_IN_ORGANISATION = 1;

  const totalAdminsInOrg = orgUsers.filter(user => user.role.name === 'Admin').length;

  if (orgUsers.length === LAST_ADMIN_IN_ORGANISATION
      && totalAdminsInOrg === LAST_ADMIN_IN_ORGANISATION
  ) {
    return 'DELETE_ORGANISATION';
  }

  if (
    orgUsers.length > LAST_ADMIN_IN_ORGANISATION
      && totalAdminsInOrg === LAST_ADMIN_IN_ORGANISATION
  ) {
    return 'DO_NOT_DELETE_ADMIN';
  }

  return 'DELETE_ADMIN';
};

const defaultText = () => ({
  deleteButton: i18n.__('heading_delete_account'),
  deleteOrgInfo: '',
});

const defaultDeletion = async cookie => ({
  deleteAccount: async () => await userApi.deleteUser(cookie.getUserEmail()),
  notifyUser: async () => await emailService.send(
    settings.NOTIFY_ACCOUNT_DELETE_TEMPLATE_ID,
    cookie.getUserEmail(),
    { firstName: cookie.getUserFirstName() },
  ),
  text: defaultText,
});

const deleteAccount = {
  Individual: defaultDeletion,
  User: defaultDeletion,
  Manager: defaultDeletion,
  Admin: async (cookie) => {
    const orgId = cookie.getOrganisationId();
    const orgUsersRes = await organisationApi.getListOfOrgUsers(orgId);
    const orgUsers = JSON.parse(orgUsersRes).items;
    const deletionType = adminDeletionType(orgUsers);

    return {
      deleteAccount: async () => {
        switch (deletionType) {
          case 'DELETE_ORGANISATION':
            return organisationApi.delete(orgId);

          case 'DO_NOT_DELETE_ADMIN':
            return JSON.stringify({
              message: i18n.__('delete_admin_account_caption'),
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
      text: () => {
        const deleteOrgText = {
          deleteButton: i18n.__('heading_delete_org_and_account'),
          deleteOrgInfo: i18n.__('delete_admin_account_caption'),
        };

        switch (deletionType) {
          case 'DELETE_ORGANISATION':
            return deleteOrgText;

          case 'DO_NOT_DELETE_ADMIN':
            return deleteOrgText;

          case 'DELETE_ADMIN':
            return defaultText();

          default:
            throw new Error('Invalid Deletion type provided');
        }
      },
    };
  },
};

module.exports = {
  adminDeletionType,
  deleteAccount,
};
