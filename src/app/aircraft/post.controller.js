
import loggerFactory from '../../common/utils/logger.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const logger = loggerFactory(__filename);
import pagination from '../../common/utils/pagination.js';

export default (req, res) => {
  logger.debug('In user aircraft post controller');

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
