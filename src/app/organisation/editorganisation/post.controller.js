const logger = require('../../../common/utils/logger')(__filename);
const validations = require('../validations');
const validator = require('../../../common/utils/validator');
const CookieModel = require('../../../common/models/Cookie.class');
const organisationApi = require('../../../common/services/organisationApi');

module.exports = (req, res) => {
  const { orgName } = req.body;

  // Start by clearing cookies and initialising
  const cookie = new CookieModel(req);

  // Validate chains
  validator
    .validateChains(validations.validations(req))
    .then(() => {
      // API should return OrgId
      organisationApi
        .update(orgName, cookie.getOrganisationId())
        .then((apiResponse) => {
          const responseObj = JSON.parse(apiResponse);
          logger.debug(`Response from API: ${JSON.stringify(responseObj)}`);
          // Check for error
          cookie.setOrganisationName(req.body.orgName);
          req.session.save(() => {
            res.redirect('/organisation');
          });
        })
        .catch((err) => {
          logger.error('Failed to update organisation', {
            organisationId: cookie.getOrganisationId(),
            errorMessage: err?.message,
            stack: err?.stack,
          });
          res.render('app/organisation/editorganisation/index', { cookie, orgName, errors: [err] });
        });
    })
    .catch((err) => {
      logger.warn('Organisation validation failed', { organisationId: cookie.getOrganisationId() });
      res.render('app/organisation/editorganisation/index', { cookie, orgName, errors: err });
    });
};
