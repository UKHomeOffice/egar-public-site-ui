import loggerFactory from '../../common/utils/logger.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const logger = loggerFactory(__filename);

export default (req, res) => {
  logger.debug('In people post controller');
  if (req.body.deletePerson) {
    req.session.deletePersonId = req.body.deletePerson;
    req.session.save(() => res.redirect('/people/delete'));
  } else if (req.body.editPerson) {
    req.session.editPersonId = req.body.editPerson;
    req.session.save(() => res.redirect('/people/edit'));
  } else {
    // Unexpected action, just redirect back to calling screen
    res.redirect('/people');
  }
};
