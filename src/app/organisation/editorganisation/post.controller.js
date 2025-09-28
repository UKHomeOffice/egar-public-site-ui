import loggerFactory from '../../../common/utils/logger.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const logger = loggerFactory(__filename);
import ValidationRule from '../../../common/models/ValidationRule.class.js';
import validator from '../../../common/utils/validator.js';
import CookieModel from '../../../common/models/Cookie.class.js';
import organisationApi from '../../../common/services/organisationApi.js';

export default (req, res) => {
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
      organisationApi.update(orgName, cookie.getOrganisationId())
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
          logger.error('There was a problem updating the organisation');
          logger.error(err);
          res.render('app/organisation/editorganisation/index', { cookie, orgName, errors: [err] });
        });
    })
    .catch((err) => {
      logger.info('Validation error when editing the organisation');
      res.render('app/organisation/editorganisation/index', { cookie, orgName, errors: err });
    });
};
