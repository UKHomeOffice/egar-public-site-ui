import loggerFactory from '../../../common/utils/logger.js';
const logger = loggerFactory(import.meta.url);
import ValidationRule from '../../../common/models/ValidationRule.class.js';
import validator from '../../../common/utils/validator.js';
import CookieModel from '../../../common/models/Cookie.class.js';
import orgApi from '../../../common/services/organisationApi.js';

export default (req, res) => {
  const orgname = req.body.orgName;

  // Start by clearing cookies and initialising
  const cookie = new CookieModel(req);
  cookie.setOrganisationName(orgname);

  // Define a validation chain for organisation fields
  const orgnameChain = [
    new ValidationRule(validator.notEmpty, 'orgName', orgname, 'Enter the name of the organisation'),
  ];

  // Validate chains
  validator.validateChains([orgnameChain]).then(() => {
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
          cookie.setOrganisationName(responseObj.organisation.organisationName);
          cookie.setOrganisationId(responseObj.organisation.organisationId);
          cookie.setUserRole(responseObj.role.name);
          res.render('app/organisation/createsuccess/index', { cookie });
        }
      })
      .catch((err) => {
        logger.error('Failed to create organisation');
        logger.error(err);
        res.render('app/organisation/create/index', { cookie, errors: [err] });
      });
  })
    .catch((err) => {
      logger.info('There was a validation problem with creating the organisation');
      res.render('app/organisation/create/index', { cookie, errors: err });
    });
};
