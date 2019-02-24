const logger = require('../../../common/utils/logger');
const ValidationRule = require('../../../common/models/ValidationRule.class');
const validator = require('../../../common/utils/validator');
const CookieModel = require('../../../common/models/Cookie.class');
const organisationApi = require('../../../common/services/organisationApi');

module.exports = (req, res) => {
  let orgname = req.body.orgname;

  // Get the ip address
  const ip = req.header('x-forwarded-for');

  // Start by clearing cookies and initialising
  const cookie = new CookieModel(req);
  cookie.setOrganisationName(req.body.Orgname);


  // Define a validation chain for user registeration fields
  const orgnameChain = [
    new ValidationRule(validator.notEmpty, 'orgname', orgname, 'Enter the name of the organisation'),
  ];

  // Validate chains
  validator.validateChains([orgnameChain])
    .then((response) => {
      // todo call to API pass organisation name, orgname
      // API should return OrgId
      organisationApi.update(orgname, cookie.getOrganisationId())
        .then((apiResponse) => {
          const responseObj = JSON.parse(apiResponse);
          // Check for error
          // Update cookie
          cookie.setOrganisationName(orgname);
          res.render('app/organisation/index', { cookie });
        })
        .catch((err) => {
          logger.error('There was a problem updating the organisation');
          logger.error(err);
          res.render('app/organisation/editorganisation/index', { cookie, errors: err });
        });
    })
    .catch((err) => {
      logger.info('organisation editorganisation postcontroller - There was a problem with creating the organisation');
      logger.info(err);
      res.render('app/organisation/editorganisation/index', { cookie, errors: err });
    });
};
