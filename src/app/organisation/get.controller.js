const CookieModel = require('../../common/models/Cookie.class');
const dataAccessApi = require('../../common/services/dataAccessApi');
const logger = require('../../common/utils/logger')(__filename);
const { permissionLevels } = require('../../common/utils/permissionLevels');
const NUM_OF_USERS = 5;

module.exports = (req, res) => {
  const cookie = new CookieModel(req);
  const userPermissions = permissionLevels[cookie.getUserRole()];

  const currentPage = Number(req.query.page) || 1;

  return dataAccessApi.organisationApi
    .getUsers(cookie.getOrganisationId(), currentPage, NUM_OF_USERS)
    .then((values) => {
      const orgUsers = values.items.map((orgUser) => {
        const isEditable = userPermissions > permissionLevels[orgUser.role.name];
        return { ...orgUser, isEditable };
      });

      const paginationData = values._meta;
      cookie.setOrganisationUsers(orgUsers);

      if (req.session.errMsg) {
        const { errMsg } = req.session;
        delete req.session.errMsg;
        return res.render('app/organisation/index', {
          cookie,
          orgUsers,
          pages: paginationData,
          currentPage: currentPage,
          errors: [errMsg],
        });
      }
      if (req.session.successMsg) {
        const { successMsg, successHeader } = req.session;
        delete req.session.successHeader;
        delete req.session.successMsg;
        return res.render('app/organisation/index', {
          cookie,
          orgUsers,
          successHeader,
          successMsg,
          pages: paginationData,
          currentPage: currentPage,
        });
      }

      return res.render('app/organisation/index', {
        cookie,
        orgUsers,
        pages: paginationData,
        currentPage: currentPage,
      });
    })
    .catch((err) => {
      logger.error('Failed to fetch organisation users', { errorMessage: err?.message, stack: err?.stack });
      res.render('app/organisation/index', {
        cookie,
        errors: [{ message: 'There was a problem fetching organisation users' }],
      });
    });
};
