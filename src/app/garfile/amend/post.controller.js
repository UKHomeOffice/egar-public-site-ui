const logger = require('../../../common/utils/logger')(__filename);
const CookieModel = require('../../../common/models/Cookie.class');
const garApi = require('../../../common/services/garApi');

module.exports = (req, res) => {
  const cookie = new CookieModel(req);
  logger.debug(
    `In garfile / amend post controller - User: ${cookie.getUserDbId()} editing GAR: ${cookie.getGarId()}`
  );

  garApi.patch(cookie.getGarId(), 'Draft', {}).then(() => {
    req.session.successMsg = 'You may now amend the GAR and resubmit it.';
    req.session.successHeader = 'GAR Amendment';
    req.session.save(() => {
      res.redirect('/garfile/view');
    });
  });
};
