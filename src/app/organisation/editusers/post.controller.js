const logger = require('../../../common/utils/logger');
const validator = require('../../../common/utils/validator');
const validations = require('./validations');
const CookieModel = require('../../../common/models/Cookie.class');
const orgApi = require('../../../common/services/organisationApi');


module.exports = (req, res) => {
  // Get the ip address
  logger.debug('In organisation / editusers post controller');
  const cookie = new CookieModel(req);

  const orgUser = {
    userId: req.session.editUserId,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    role: req.body.role,
  };

  validator.validateChains(validations.validations(req))
    .then(() => {
      orgApi.editUser(cookie.getUserDbId(), cookie.getOrganisationId(), orgUser)
        .then((apiResponse) => {
          const parsedResponse = JSON.parse(apiResponse);
          if (Object.prototype.hasOwnProperty.call(parsedResponse, 'message')) {
            req.session.errMsg = { message: 'You do not have the permissions to edit this user or perform this action' };
          }
          return req.session.save(() => res.redirect('/organisation'));
        })
        .catch((err) => {
          logger.error('Failed to update org user details');
          logger.error(err);
          req.session.errMsg = 'Failed to update user details. Try again';
          return req.session.save(() => res.redirect('/organisation'));
        });
    })
    .catch((err) => {
      logger.info('Failed validations');
      res.render('app/organisation/editusers/index', { cookie, errors: err, orgUser });
    });
};
