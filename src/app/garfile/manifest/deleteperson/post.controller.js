import loggerFactory from '../../../../common/utils/logger.js';
const logger = loggerFactory(import.meta.url);
import CookieModel from '../../../../common/models/Cookie.class.js';
import garApi from '../../../../common/services/garApi.js';

export default (req, res) => {
  const cookie = new CookieModel(req);
  const userId = cookie.getUserDbId()
  logger.debug(`User: ${userId} In garfile / manifest / deleteperson post controller`);

  const garpeopleIdsToDelete = typeof req.body.garPeopleId === 'string' 
    ? [req.body.garPeopleId]
    : req.body.garPeopleId;

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

  garApi.deleteGarPeople(cookie.getGarId(), garpeopleIdsToDelete)
    .then((apiResponse) => {
      const parsedResponse = JSON.parse(apiResponse);
      if (Object.prototype.hasOwnProperty.call(parsedResponse, 'message')) {
        logger.debug(`User: ${userId} Api returned: ${parsedResponse.message}`);
        req.session.errMsg = parsedResponse;
        return res.redirect('/garfile/manifest');
      }
      req.session.successMsg = 'Person removed from GAR';
      return res.redirect('/garfile/manifest');
    })
    .catch((err) => {
      logger.error(`User: ${userId} Failed to delete gar person`);
      logger.error(err);
      req.session.errMsg = deleteErr;
      return res.redirect('/garfile/manifest');
    });
};
