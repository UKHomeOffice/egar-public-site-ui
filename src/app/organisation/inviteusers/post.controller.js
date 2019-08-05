const logger = require('../../../common/utils/logger')(__filename);
const validator = require('../../../common/utils/validator');
const validations = require('./validations');
const CookieModel = require('../../../common/models/Cookie.class');

module.exports = (req, res) => {
  const { fname, lname, email } = req.body;
  const cookie = new CookieModel(req);

  // Validate chains
  validator.validateChains(validations.validations(req))
    .then(() => {
      cookie.setInviteUserFirstName(fname);
      cookie.setInviteUserLastName(lname);
      cookie.setInviteUserEmail(email);
      res.redirect('/organisation/assignrole');
    })
    .catch((err) => {
      logger.error('Invite Users Organisation postcontroller - There was a problem inviting a user');
      logger.error(JSON.stringify(err));
      res.render('app/organisation/inviteusers/index', {
        cookie, fname, lname, email, errors: err,
      });
    });
};
