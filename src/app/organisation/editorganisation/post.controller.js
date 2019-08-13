const logger = require('../../../common/utils/logger')(__filename);
const ValidationRule = require('../../../common/models/ValidationRule.class');
const validator = require('../../../common/utils/validator');
const CookieModel = require('../../../common/models/Cookie.class');
const organisationApi = require('../../../common/services/organisationApi');

module.exports = (req, res) => {
  const { orgName } = req.body;

  // Start by clearing cookies and initialising
  const cookie = new CookieModel(req);

  // Define a validation chain for user registeration fields
  const orgNameChain = [
    new ValidationRule(validator.notEmpty, 'orgName', orgName, 'Enter the name of the organisation'),
  ];

  // Validate chains
  validator.validateChains([orgNameChain])
    .then(() => {
      // API should return OrgId
      cookie.setOrganisationName(req.body.orgName);
      organisationApi.update(orgName, cookie.getOrganisationId())
        .then((apiResponse) => {
          const responseObj = JSON.parse(apiResponse);
          logger.debug(`Response from API: ${JSON.stringify(responseObj)}`);
          // Check for error
          res.redirect('/organisation');
        })
        .catch((err) => {
          logger.error('There was a problem updating the organisation');
          logger.error(JSON.stringify(err));
          res.render('app/organisation/editorganisation/index', { cookie, orgName, errors: [err] });
        });
    })
    .catch((err) => {
      logger.info('Validation error when editing the organisation');
      res.render('app/organisation/editorganisation/index', { cookie, orgName, errors: err });
    });
};
