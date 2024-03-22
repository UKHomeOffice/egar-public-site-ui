const logger = require('../../../common/utils/logger')(__filename);
const CookieModel = require('../../../common/models/Cookie.class');
const garApi = require('../../../common/services/garApi');
const emailService = require('../../../common/services/sendEmail');
const config = require('../../../common/config');

module.exports = (req, res) => {
  logger.debug('In garfile / amend post controller');
  const cookie = new CookieModel(req);

  garApi.patch(cookie.getGarId(), 'Draft', {})
    .then(() => {

      req.session.successMsg = 'You may now amend the GAR and resubmit it.';
      req.session.successHeader = 'GAR Amendment';
      req.session.save(() => {
        res.redirect('/garfile/view');
      });
    })
};