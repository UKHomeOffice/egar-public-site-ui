
const logger = require('../../common/utils/logger')(__filename);

module.exports = (req, res) => {
  logger.debug('In user aircraft post controller');
  const pageParam = `?page=${req.body.currentPage}`;

  if (req.body.editCraft) {
    req.session.editCraftId = req.body.editCraft;
    req.session.save(() => res.redirect(`/aircraft/edit${pageParam}`));
    return;
  }
  if (req.body.deleteCraft) {
    req.session.deleteCraftId = req.body.deleteCraft;
    req.session.save(() => res.redirect(`/aircraft/delete${pageParam}`));
  }
};
