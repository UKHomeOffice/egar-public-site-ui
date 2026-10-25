const logger = require('../../../common/utils/logger')(__filename);
const CookieModel = require('../../../common/models/Cookie.class');
const garApi = require('../../../common/services/data-access/garApi');

module.exports = (req, res) => {
  const cookie = new CookieModel(req);
  logger.debug(`In garfile / amend post controller - User: ${cookie.getUserDbId()} editing GAR: ${cookie.getGarId()}`);

  garApi.patch(res.locals.gar.garId, 'Draft', {}).then(() => {
    req.session.successMsg = 'You may now amend the GAR and resubmit it.';
    req.session.successHeader = 'GAR Amendment';
    req.session.save(() => {
      res.redirect('/garfile/view');
    });
  });
};
