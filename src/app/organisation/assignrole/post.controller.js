const nanoid = require('nanoid/generate');
const logger = require('../../../common/utils/logger')(__filename);
const ValidationRule = require('../../../common/models/ValidationRule.class');
const validator = require('../../../common/utils/validator');
const CookieModel = require('../../../common/models/Cookie.class');
const tokenservice = require('../../../common/services/create-token');
const emailService = require('../../../common/services/sendEmail');
const tokenApi = require('../../../common/services/tokenApi');
const config = require('../../../common/config/index');
const roles = require('../../../common/seeddata/egar_user_roles.json');

module.exports = (req, res) => {
  // Start by clearing cookies and initialising
  const cookie = new CookieModel(req);
  const { role } = req.body;
  cookie.setInviteUserRole(role);
  logger.debug(`Invitee role: ${role}`);

  // Generate a token for the user
  const alphabet = '23456789abcdefghjkmnpqrstuvwxyz-';
  const token = nanoid(alphabet, 13);
  const hashToken = tokenservice.generateHash(token);
  const inviterName = cookie.getUserFirstName();
  const firstName = cookie.getInviteUserFirstName();
  const inviterId = cookie.getUserDbId();
  const inviteOrgName = cookie.getOrganisationName();
  const inviteOrgId = cookie.getOrganisationId();
  const inviteeEmail = cookie.getInviteUserEmail();
  const roleId = cookie.getInviteUserRole();

  // Define a validation chain for first name
  const roleChain = [
    new ValidationRule(validator.notEmpty, 'role', req.body.role, 'Select a role'),
  ];

  // Validate chains
  validator.validateChains([roleChain])
    .then(() => {
      tokenApi.setInviteUserToken(hashToken, inviterId, inviteOrgId, roleId)
        .then((apiResponse) => {
          const apiResponseObj = JSON.parse(apiResponse);
          if (Object.prototype.hasOwnProperty.call(apiResponseObj, 'message')) {
            // API call unsuccessful
            res.render('app/organisation/assignrole/index', { cookie, roles, errors: [apiResponseObj] });
            return;
          }
          // API call successful
          emailService.send(config.NOTIFY_INVITE_TEMPLATE_ID, inviteeEmail, {
            firstname: firstName,
            user: inviterName,
            org_name: inviteOrgName,
            base_url: config.BASE_URL,
            token,
          }).then(() => {
            res.redirect('/organisation/invite/success');
          }).catch((err) => {
            logger.error('Govnotify failed to send an email');
            logger.error(JSON.stringify(err));
            res.render('app/organisation/assignrole/index', { cookie, roles, errors: [{ message: 'Could not send an invitation email, try again later.' }] });
          });
        })
        .catch((err) => {
          logger.error('Error setting the invite token');
          logger.error(JSON.stringify(err));
          res.render('app/organisation/assignrole/index', { cookie, roles, errors: [err] });
        });
    })
    .catch((err) => {
      logger.info('Assign Role post controller - There was a problem with assigning the role');
      res.render('app/organisation/assignrole/index', { cookie, roles, errors: err });
    });
};
