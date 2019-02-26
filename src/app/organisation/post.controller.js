
const logger = require('../../common/utils/logger');

module.exports = (req, res) => {
  logger.debug('In organisation post controller');
  console.log(req.body.editOrgUser);
  if (req.body.editOrg) {
    req.session.editOrgId = req.body.editOrg;
    return req.session.save(() => {res.redirect('/organisation/editorganisation')});
  } else if (req.body.editOrgUser) {
    req.session.editUserId = req.body.editOrgUser;
    return req.session.save(() => {res.redirect('/organisation/users/edit')});
  }
}
