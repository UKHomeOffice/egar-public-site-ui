const pagination = require('../../common/utils/pagination');

module.exports = (req, res) => {
  if (req.body.nextPage) {
    pagination.setCurrentPage(req, '/aircraft', req.body.nextPage);
    req.session.save(() => res.redirect('/aircraft'));
    return;
  }

  if (req.body.editCraft) {
    req.session.editCraftId = req.body.editCraft;
    req.session.save(() => res.redirect('/aircraft/edit'));
    return;
  }
  if (req.body.deleteCraft) {
    req.session.deleteCraftId = req.body.deleteCraft;
    req.session.save(() => res.redirect('/aircraft/delete'));
  }
};
