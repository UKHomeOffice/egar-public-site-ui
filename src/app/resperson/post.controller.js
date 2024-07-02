const logger = require('../../common/utils/logger')(__filename);

module.exports = (req, res) => {
  logger.debug('In responsible person post controller >>');
  if (req.body.deleteResponsiblePerson) {
    logger.debug(`In responsible person delete controller ${req.body.deleteResponsiblePerson}`);
    req.session.deleteResponsiblePersonId = req.body.deleteResponsiblePerson;
    req.session.save(() => res.redirect('/resPerson/delete'));
  } else if (req.body.editResponsiblePerson) {
    logger.debug(`In responsible person edit controller ${req.body.deleteResponsiblePerson}`);
    req.session.editResponsiblePersonId = req.body.editResponsiblePerson;
    req.session.save(() => res.redirect('/resPerson/edit'));
  } else {
    res.redirect('/resperson');
  }
};