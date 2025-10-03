const logger = require('../../../../common/utils/logger')(__filename);
const pagination = require('../../../../common/utils/pagination');

module.exports = (req, res) => {
 logger.debug('In amg/checkin post controller');

  if (req.body.nextPage) {
    pagination.setCurrentPage(req, '/garfile/amg/checkin', req.body.nextPage);
    req.session.save(() => res.redirect('/garfile/amg/checkin'));
  } else {
    req.session.errMsg = { message: 'Checkin page failed to perform action.' };
    req.session.save(() => res.redirect('/garfile/amg/checkin'));
  }
};
