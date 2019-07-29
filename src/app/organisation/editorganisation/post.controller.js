const logger = require('../../../common/utils/logger')(__filename);
const ValidationRule = require('../../../common/models/ValidationRule.class');
const validator = require('../../../common/utils/validator');
const CookieModel = require('../../../common/models/Cookie.class');
const organisationApi = require('../../../common/services/organisationApi');

module.exports = (req, res) => {
  const { orgname } = req.body;

  // Start by clearing cookies and initialising
  const cookie = new CookieModel(req);
  cookie.setOrganisationName(req.body.Orgname);

  // Define a validation chain for user registeration fields
  const orgnameChain = [
    new ValidationRule(validator.notEmpty, 'orgname', orgname, 'Enter the name of the organisation'),
  ];

  // Validate chains
  validator.validateChains([orgnameChain])
    .then(() => {
      // API should return OrgId
      organisationApi.update(orgname, cookie.getOrganisationId())
        .then((apiResponse) => {
          const responseObj = JSON.parse(apiResponse);
          logger.debug(`Response from API: ${JSON.stringify(responseObj)}`);
          // Check for error
          // Update cookie
          cookie.setOrganisationName(orgname);
          res.redirect('/organisation');
        })
        .catch((err) => {
          logger.error('There was a problem updating the organisation');
          logger.error(JSON.stringify(err));
          res.render('app/organisation/editorganisation/index', { cookie, errors: [err] });
        });
    })
    .catch((err) => {
      logger.info('There was a problem with editing the organisation');
      logger.debug(JSON.stringify(err));
      res.render('app/organisation/editorganisation/index', { cookie, errors: err });
    });
};
