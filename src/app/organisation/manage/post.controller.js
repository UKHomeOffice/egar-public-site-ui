const logger = require('../../../common/utils/logger');

module.exports = (req, res) => {
  logger.debug('In organisation manage postcontroller');
  if (req.body.deleteCraft) {
    req.session.deleteCraftId = req.body.deleteCraft;
    res.redirect('/organisation/savedcraft/delete');
  } else if (req.body.editCraft) {
    req.session.editCraftId = req.body.editCraft;
    res.redirect('/organisation/savedcraft/edit');
  // } else if (req.body.deletePerson) {
  //   req.session.deletePersonId = req.body.deletePerson;
  //   res.redirect('/organisation/savedpeople/delete');
  } else if (req.body.editPerson) {
    req.session.editPersonId = req.body.editPerson;
    res.redirect('/organisation/savedpeople/edit');
  } else if (req.body.editUser) {
    req.session.editUserId = req.body.editUser;
    res.redirect('/organisation/users/edit');
  }
};
