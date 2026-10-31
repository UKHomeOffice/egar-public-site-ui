const logger = require('../../../common/utils/logger')(__filename);
const validations = require('../validations');
const validator = require('../../../common/utils/validator');
const CookieModel = require('../../../common/models/Cookie.class');
const { organisationApi } = require('../../../common/services/dataAccessApi');

module.exports = (req, res) => {
  const orgname = req.body.orgName;

  // Start by clearing cookies and initialising
  const cookie = new CookieModel(req);
  cookie.setOrganisationName(orgname);

  // Validate chains
  return validator
    .validateChains(validations.validations(req))
    .then(() => {
      // API should return OrgId
      logger.debug('Calling create org api endpoint');
      return organisationApi
        .create(orgname, cookie.getUserDbId())
        .then((responseObj) => {
          if (Object.prototype.hasOwnProperty.call(responseObj, 'message')) {
            const error = [{ message: responseObj.message }];
            res.render('app/organisation/create/index', { cookie, errors: error });
          } else {
            // Successful. Set org name, id & user role in cookie
            cookie.setOrganisationName(responseObj.organisation.organisationName);
            cookie.setOrganisationId(responseObj.organisation.organisationId);
            cookie.setUserRole(responseObj.role.name);
            res.render('app/organisation/createsuccess/index', { cookie });
          }
        })
        .catch((err) => {
          logger.error('Failed to create organisation', {
            userId: cookie.getUserDbId(),
            errorMessage: err?.message,
            stack: err?.stack,
          });
          const error =
            err?.type === 'http_error' && err.body && typeof err.body.message === 'string'
              ? { message: err.body.message }
              : err;
          res.render('app/organisation/create/index', { cookie, errors: [error] });
        });
    })
    .catch((err) => {
      logger.warn('Organisation validation failed', { userId: cookie.getUserDbId() });
      res.render('app/organisation/create/index', { cookie, errors: err });
    });
};
