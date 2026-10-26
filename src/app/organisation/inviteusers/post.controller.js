const logger = require('../../../common/utils/logger')(__filename);
const validator = require('../../../common/utils/validator');
const validations = require('./validations');
const { userManageApi: userApi } = require('../../../common/services/dataAccessApi');
const CookieModel = require('../../../common/models/Cookie.class');

module.exports = (req, res) => {
  const { fname, lname, email } = req.body;
  const cookie = new CookieModel(req);

  // Validate chains
  return validator
    .validateChains(validations.validations(req))
    .then(() => {
      cookie.setInviteUserFirstName(fname);
      cookie.setInviteUserLastName(lname);
      cookie.setInviteUserEmail(email);
      return userApi
        .getDetails(email)
        .then((apiResponse) => {
          if (apiResponse.message === 'User not registered') {
            return res.redirect('/organisation/assignrole');
          }
          if (typeof apiResponse.email !== 'undefined' && apiResponse.email.toLowerCase() === email.toLowerCase()) {
            res.render('app/organisation/inviteusers/userExistError', { cookie });
            return;
          }
        })
        .catch((err) => {
          if (err?.type === 'http_error' && err.status === 400 && err.body?.message === 'User not registered') {
            return res.redirect('/organisation/assignrole');
          }
          logger.error('Failed to get user details', { errorMessage: err?.message, stack: err?.stack });
          return res.redirect('/organisation/inviteuser');
        });
    })
    .catch((err) => {
      logger.error('Failed to invite user');
      res.render('app/organisation/inviteusers/index', {
        cookie,
        fname,
        lname,
        email,
        errors: err,
      });
    });
};
