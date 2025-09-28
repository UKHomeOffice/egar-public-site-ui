import utils from '../../../common/utils/utils.js';
import loggerFactory from '../../../common/utils/logger.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const logger = loggerFactory(__filename);
import ValidationRule from '../../../common/models/ValidationRule.class.js';
import validator from '../../../common/utils/validator.js';
import CookieModel from '../../../common/models/Cookie.class.js';
import tokenservice from '../../../common/services/create-token.js';
import emailService from '../../../common/services/sendEmail.js';
import tokenApi from '../../../common/services/tokenApi.js';
import config from '../../../common/config/index.js';
import roles from '../../../common/seeddata/egar_user_roles.json' with { type: "json"};
import oneLoginApi from '../../../common/services/oneLoginApi.js';

export default (req, res) => {
  // Start by clearing cookies and initialising
  const cookie = new CookieModel(req);
  const { role } = req.body;
  cookie.setInviteUserRole(role);
  logger.debug(`Invitee role: ${role}`);

  if(cookie.getUserRole() !== 'Admin'){
    roles = roles.filter(role => role.name !== 'Admin');
  }

  // Generate a token for the user
  const alphabet = '23456789abcdefghjkmnpqrstuvwxyz-';
  const token = utils.nanoid(alphabet, 13);
  const hashToken = tokenservice.generateHash(token);
  const inviterName = cookie.getUserFirstName();
  const firstName = cookie.getInviteUserFirstName();
  const lastName = cookie.getInviteUserLastName();
  const inviterId = cookie.getUserDbId();
  const inviteOrgName = cookie.getOrganisationName();
  const inviteOrgId = cookie.getOrganisationId();
  const inviteeEmail = cookie.getInviteUserEmail()?.toLowerCase();
  const roleId = cookie.getInviteUserRole();

  // Define a validation chain for first name
  const roleChain = [
    new ValidationRule(validator.notEmpty, 'role', req.body.role, 'Select a role'),
  ];

  // Validate chains
  validator.validateChains([roleChain])
    .then(() => {
      tokenApi.setInviteUserToken(hashToken, inviterId, inviteOrgId, roleId, inviteeEmail)
        .then((apiResponse) => {
          const apiResponseObj = JSON.parse(apiResponse);
          if (Object.prototype.hasOwnProperty.call(apiResponseObj, 'message')) {
            // API call unsuccessful
            res.render('app/organisation/assignrole/index', { cookie, roles, errors: [apiResponseObj] });
            return;
          }
          // API call successful
          let notifyTemplate = config.NOTIFY_INVITE_TEMPLATE_ID;

          if(config.ONE_LOGIN_SHOW_ONE_LOGIN || config.ONE_LOGIN_POST_MIGRATION){
            notifyTemplate = config.NOTIFY_ONE_LOGIN_INVITE_TEMPLATE_ID;
          }
          
          emailService.send(notifyTemplate, inviteeEmail, {
            firstname: firstName,
            lastname: lastName,
            user: inviterName,
            org_name: inviteOrgName,
            base_url: oneLoginApi.parseUrlForNonProd(req, config.BASE_URL),
            token,
          }).then(() => {
            res.redirect('/organisation/invite/success');
          }).catch((err) => {
            logger.error('Govnotify failed to send an email');
            logger.error(err);
            res.render('app/organisation/assignrole/index', { cookie, roles, errors: [{ message: 'Could not send an invitation email, try again later.' }] });
          });
        })
        .catch((err) => {
          logger.error('Error setting the invite token');
          logger.error(err);
          res.render('app/organisation/assignrole/index', { cookie, roles, errors: [err] });
        });
    })
    .catch((err) => {
      logger.info('Assign Role post controller - There was a problem with assigning the role');
      res.render('app/organisation/assignrole/index', { cookie, roles, errors: err });
    });
};
