const logger = require('../../../common/utils/logger')(__filename);
const ValidationRule = require('../../../common/models/ValidationRule.class');
const validator = require('../../../common/utils/validator');
const CookieModel = require('../../../common/models/Cookie.class');
const orgApi = require('../../../common/services/organisationApi');


module.exports = (req, res) => {
  const orgname = req.body.Orgname;

  // Start by clearing cookies and initialising
  const cookie = new CookieModel(req);
  cookie.setOrganisationName(req.body.Orgname);


  // Define a validation chain for organisation fields
  const orgnameChain = [
    new ValidationRule(validator.notEmpty, 'Orgname', orgname, 'Enter the name of the organisation'),
  ];

  // Validate chains
  validator.validateChains([orgnameChain]).then(() => {
    // todo call to API pass organisation name, orgname
    // API should return OrgId
    logger.debug('Calling create org api endpoint');
    orgApi.create(orgname, cookie.getUserDbId())
      .then((apiResponse) => {
        const responseObj = JSON.parse(apiResponse);
        if (Object.prototype.hasOwnProperty.call(responseObj, 'message')) {
          const error = [{ message: responseObj.message }];
          res.render('app/organisation/create/index', { cookie, errors: error });
        } else {
          // Successful. Set org name, id & user role in cookie
          cookie.setOrganisationName(responseObj.organisation.name);
          cookie.setOrganisationId(responseObj.organisation.organisationId);
          cookie.setUserRole(responseObj.role.name);
          res.render('app/organisation/createsuccess/index', { cookie });
        }
      })
      .catch((err) => {
        logger.error('Failed to create organisation');
        logger.error(JSON.stringify(err));
        res.render('app/organisation/create/index', { cookie, errors: [err] });
      });
  })
    .catch((err) => {
      logger.info('There was a problem with creating the organisation');
      logger.debug(JSON.stringify(err));
      res.render('app/organisation/create/index', { cookie, errors: err });
    });
};
