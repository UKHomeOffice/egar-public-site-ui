const logger = require('../../../common/utils/logger');

module.exports = (req, res) => {
  logger.debug('In user / viewdetails postcontroller');
  if (req.body.deleteCraft) {
    req.session.deleteCraftId = req.body.deleteCraft;
    res.redirect('/user/savedcraft/delete');
  } else if (req.body.editCraft) {
    req.session.editCraftId = req.body.editCraft;
    res.redirect('/user/savedcraft/edit');
  // } else if (req.body.deletePerson) {
  //   req.session.deletePersonId = req.body.deletePerson;
  //   res.redirect('/user/savedpeople/delete');
  } else if (req.body.editPerson) {
    req.session.editPersonId = req.body.editPerson;
    res.redirect('/user/savedpeople/edit');
  }
};
