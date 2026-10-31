const logger = require('../../../../common/utils/logger')(__filename);
const CookieModel = require('../../../../common/models/Cookie.class');
const { garApi } = require('../../../../common/services/dataAccessApi');

module.exports = (req, res) => {
  const cookie = new CookieModel(req);
  const userId = cookie.getUserDbId();
  logger.debug(`User: ${userId} In garfile / manifest / deleteperson post controller`);

  const garpeopleIdsToDelete = typeof req.body.garPeopleId === 'string' ? [req.body.garPeopleId] : req.body.garPeopleId;

  const deleteErr = { message: 'Failed to delete GAR person. Try again' };

  if (garpeopleIdsToDelete === undefined) {
    logger.error(`User: ${userId} No id provided, redirecting to manifest page`);
    return res.redirect('/garfile/manifest');
  }

  if (!Array.isArray(garpeopleIdsToDelete)) {
    logger.error(`User: ${userId} ${garpeopleIdsToDelete} Id provided is not array, redirecting to manifest page`);
    return res.redirect('/garfile/manifest');
  }

  logger.info(`User: ${userId} Removing ${garpeopleIdsToDelete} from manifest`);

  return garApi
    .deleteGarPeople(res.locals.gar.garId, garpeopleIdsToDelete)
    .then((apiResponse) => {
      if (Object.prototype.hasOwnProperty.call(apiResponse, 'message')) {
        logger.debug('GAR person deletion rejected', { userId, garId: res.locals.gar.garId });
        req.session.errMsg = apiResponse;
        return res.redirect('/garfile/manifest');
      }
      req.session.successMsg = 'Person removed from GAR';
      return res.redirect('/garfile/manifest');
    })
    .catch((err) => {
      logger.error('Failed to delete GAR person', { userId, errorMessage: err?.message, stack: err?.stack });
      req.session.errMsg = err?.type === 'http_error' && typeof err.body?.message === 'string' ? err.body : deleteErr;
      return res.redirect('/garfile/manifest');
    });
};
