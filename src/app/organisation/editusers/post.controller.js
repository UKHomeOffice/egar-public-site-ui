const logger = require('../../../common/utils/logger')(__filename);
const validator = require('../../../common/utils/validator');
const validations = require('./validations');
const CookieModel = require('../../../common/models/Cookie.class');
const orgApi = require('../../../common/services/organisationApi');
const { getRolesForAssigning } = require('../../../common/utils/utils');
const ValidationRule = require('../../../common/models/ValidationRule.class');
const { ROLE_PERMISSION_ERROR_MSG } = require('../constants');

module.exports = (req, res) => {
  const cookie = new CookieModel(req);

  const orgUser = {
    userId: req.session.editUserId,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    role: req.body.role,
  };

  const roles = getRolesForAssigning(cookie.getUserRole());

  if (
    req.body.role !== '' &&
    cookie.getUserRole() !== undefined &&
    roles.some((r) => r.name === req.body.role) === false
  ) {
    return res.render('app/organisation/editusers/index', {
      cookie,
      orgUser,
      roles,
      errors: [new ValidationRule(null, 'role', req.body.role, ROLE_PERMISSION_ERROR_MSG)],
    });
  }

  validator
    .validateChains(validations.validations(req))
    .then(() => {
      orgApi
        .editUser(cookie.getUserDbId(), cookie.getOrganisationId(), orgUser)
        .then((apiResponse) => {
          const parsedResponse = JSON.parse(apiResponse);
          if (Object.prototype.hasOwnProperty.call(parsedResponse, 'message')) {
            req.session.errMsg = {
              message: 'You do not have the permissions to edit this user or perform this action',
            };
          }
          return req.session.save(() => res.redirect('/organisation'));
        })
        .catch((err) => {
          logger.error('Failed to update org user details', { errorMessage: err?.message, stack: err?.stack });
          req.session.errMsg = { message: 'Failed to update user details. Try again' };
          return req.session.save(() => res.redirect('/organisation'));
        });
    })
    .catch((err) => {
      logger.warn('Org user validation failed', { userId: orgUser.userId });
      res.render('app/organisation/editusers/index', {
        cookie,
        orgUser,
        roles,
        errors: err,
      });
    });
};
