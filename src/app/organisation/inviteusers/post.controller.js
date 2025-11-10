const logger = require('../../../common/utils/logger')(__filename);
const validator = require('../../../common/utils/validator');
const validations = require('./validations');
const userApi = require('../../../common/services/userManageApi');
const CookieModel = require('../../../common/models/Cookie.class');

module.exports = (req, res) => {
  const { fname, lname, email } = req.body;
  const cookie = new CookieModel(req);

  // Validate chains
  validator
    .validateChains(validations.validations(req))
    .then(() => {
      cookie.setInviteUserFirstName(fname);
      cookie.setInviteUserLastName(lname);
      cookie.setInviteUserEmail(email);
      userApi
        .getDetails(email)
        .then((apiResponse) => {
          if (apiResponse.message === 'User not registered') {
            return res.redirect('/organisation/assignrole');
          }
          if (typeof apiResponse.email !== 'undefined' && apiResponse.email.toLowerCase() === email.toLowerCase()) {
            res.render('app/organisation/inviteusers/userExistError');
            return;
          }
        })
        .catch((err) => {
          logger.error(`Error: proble while getting a user details ${err}`);
          return res.redirect('/organisation/inviteuser');
        });
    })
    .catch((err) => {
      logger.error('Invite Users Organisation postcontroller - There was a problem inviting a user');
      logger.error(JSON.stringify(err));
      res.render('app/organisation/inviteusers/index', {
        cookie,
        fname,
        lname,
        email,
        errors: err,
      });
    });
};
