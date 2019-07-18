const logger = require('../../common/utils/logger')(__filename);
const pagination = require('../../common/utils/pagination');

module.exports = (req, res) => {
  logger.debug('In people post controller');

  if (req.body.nextPage) {
    pagination.setCurrentPage(req, '/people', req.body.nextPage);
    req.session.save(() => res.redirect('/people'));
    return;
  }

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
