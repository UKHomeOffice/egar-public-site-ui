
module.exports = (req, res) => {
  logger.debug('In organisation post controller')
  if (req.body.editOrg) {
    req.session.editOrgId = req.body.orgId;
    req.session.save(() => {res.redirect('/organisation/editorganisation')};
  } else if (req.body.editOrgUser) {
    req.session.editUserId = req.body.editOrgUser;
    req.session.save(() => {res.redirect('/organisation/users/edit')};
  }
}
