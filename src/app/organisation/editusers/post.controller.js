import loggerFactory from '../../../common/utils/logger.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const logger = loggerFactory(__filename);
import validator from '../../../common/utils/validator.js';
import validations from './validations.js';
import CookieModel from '../../../common/models/Cookie.class.js';
import orgApi from '../../../common/services/organisationApi.js';
import roles from '../../../common/seeddata/egar_user_roles.json' with { type: 'json' };

export default (req, res) => {
  logger.debug('In organisation / editusers post controller');
  const cookie = new CookieModel(req);
  

  const orgUser = {
    userId: req.session.editUserId,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    role: req.body.role,
  };

  if(cookie.getUserRole() !== 'Admin'){
     roles = roles.filter(role => role.name !== 'Admin');
  }

  validator.validateChains(validations(req))
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
          req.session.errMsg = { message: 'Failed to update user details. Try again' };
          return req.session.save(() => res.redirect('/organisation'));
        });
    })
    .catch((err) => {
      logger.info('Failed validations editing an organisation user');
      res.render('app/organisation/editusers/index', {
        cookie, orgUser, roles, errors: err,
      });
    });
};
