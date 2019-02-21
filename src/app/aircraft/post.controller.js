
const logger = require('../../common/utils/logger');

module.exports = (req, res) => {
  logger.debug('In user aircraft post controller');
  if (req.body.editCraft) {
    req.session.editCraftId = req.body.editCraft;
    res.redirect('/aircraft/edit');
  } else if (req.body.deleteCraft) {
    req.session.deleteCraftId = req.body.deleteCraft;
    res.redirect('/aircraft/delete');
  }
}
