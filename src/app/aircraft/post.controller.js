
const logger = require('../../common/utils/logger')(__filename);

module.exports = (req, res) => {
  logger.debug('In user aircraft post controller');
  if (req.body.editCraft) {
    req.session.editCraftId = req.body.editCraft;
    return req.session.save(() => {res.redirect('/aircraft/edit')});
  } else if (req.body.deleteCraft) {
    req.session.deleteCraftId = req.body.deleteCraft;
    return req.session.save(() => {res.redirect('/aircraft/delete')});
  }
}
