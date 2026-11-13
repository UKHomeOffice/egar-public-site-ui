const pagination = require('../../../../common/utils/pagination');

module.exports = (req, res) => {
  const resubmitted = req.body.resubmitted;
  const pageUrl = `/garfile/amg/checkin?resubmitted=${resubmitted}`;
  if (req.body.nextPage) {
    pagination.setCurrentPage(req, '/garfile/amg/checkin', req.body.nextPage);
    req.session.save(() => res.redirect(pageUrl));
  } else {
    req.session.errMsg = { message: 'Checkin page failed to perform action.' };
    req.session.save(() => res.redirect(pageUrl));
  }
};
