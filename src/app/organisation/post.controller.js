const logger = require('../../common/utils/logger')(__filename);

module.exports = (req, res) => {
  logger.debug('In organisation post controller');
  logger.debug(req.body.editOrgUser);
  if (req.body.editOrg) {
    req.session.editOrgId = req.body.editOrg;
    req.session.save(() => { res.redirect('/organisation/editorganisation'); });
  } else if (req.body.editOrgUser) {
    req.session.editUserId = req.body.editOrgUser;
    req.session.save(() => { res.redirect('/organisation/users/edit'); });
  }
};
