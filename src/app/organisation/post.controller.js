const logger = require('../../common/utils/logger')(__filename);
const pagination = require('../../common/utils/pagination');

module.exports = (req, res) => {
  logger.debug('In organisation post controller');

  if (req.body.nextPage) {
    pagination.setCurrentPage(req, '/organisation', req.body.nextPage);
    req.session.save(() => res.redirect('/organisation'));
  } else if (req.body.editOrgUser) {
    logger.debug(req.body.editOrgUser);
    req.session.editUserId = req.body.editOrgUser;
    req.session.save(() => res.redirect('/organisation/users/edit'));
  } else if (req.body.editOrg) {
    req.session.editOrgId = req.body.editOrg;
    req.session.save(() => res.redirect('/organisation/editorganisation'));
  } else if (req.body.deleteUser) {
    req.session.deleteUserId = req.body.deleteUser;
    req.session.save(() => res.redirect('/organisation/delete'));
  } else {
    req.session.errMsg = {
      message: 'Organisation page failed to perform action.',
    };
    req.session.save(() => res.redirect('/organisation'));
  }
};
