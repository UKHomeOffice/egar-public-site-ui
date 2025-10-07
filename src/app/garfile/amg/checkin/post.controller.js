const logger = require('../../../../common/utils/logger')(__filename);
const pagination = require('../../../../common/utils/pagination');

module.exports = (req, res) => {
  logger.debug('In amg/checkin post controller');
  const resubmitted = req.body.resubmitted;
  const pageUrl = `/garfile/amg/checkin?resubmitted=${resubmitted}`;
  if (req.body.nextPage) {
    pagination.setCurrentPage(req, pageUrl, req.body.nextPage);
    req.session.save(() => res.redirect(pageUrl));
  } else {
    req.session.errMsg = { message: 'Checkin page failed to perform action.' };
    req.session.save(() => res.redirect(pageUrl));
  }
};
