const logger = require('../../../common/utils/logger')(__filename);
const CookieModel = require('../../../common/models/Cookie.class');
const { garApi } = require('../../../common/services/dataAccessApi');

module.exports = async (req, res) => {
  const cookie = new CookieModel(req);
  logger.debug(`In garfile / amend post controller - User: ${cookie.getUserDbId()} editing GAR: ${cookie.getGarId()}`);

  const garId = res.locals.gar.garId;
  try {
    await garApi.patch(garId, 'Draft', {});
    req.session.successMsg = 'You may now amend the GAR and resubmit it.';
    req.session.successHeader = 'GAR Amendment';
    req.session.save(() => {
      res.redirect('/garfile/view');
    });
  } catch (err) {
    logger.error('Failed to amend GAR', { garId, errorMessage: err?.message, stack: err?.stack });
    res.render('app/garfile/amend/index', {
      cookie,
      errors: [{ identifier: '', message: 'Failed to amend GAR. Try again' }],
    });
  }
};
