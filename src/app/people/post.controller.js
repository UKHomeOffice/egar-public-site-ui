const logger = require('../../common/utils/logger');

module.exports = (req, res) => {
  logger.debug('In people post controller');
  if (req.body.deletePerson) {
    req.session.deletePersonId = req.body.deletePerson;
    req.session.save(() => res.redirect('/people/delete'));
  } else if (req.body.editPerson) {
    req.session.editPersonId = req.body.editPerson;
    req.session.save(() => res.redirect('/people/edit'));
  }
};
