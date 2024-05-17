const logger = require('../../../../common/utils/logger')(__filename);
const CookieModel = require('../../../../common/models/Cookie.class');
const garApi = require('../../../../common/services/garApi');

module.exports = (req, res) => {
  const cookie = new CookieModel(req);
  logger.debug('In garfile / manifest / deleteperson get controller');

  const garpeopleIdsToDelete = req.session.deletePersonId;
  delete req.session.deletePersonId;
  const deleteErr = { message: 'Failed to delete GAR person. Try again' };

  if (garpeopleIdsToDelete === undefined) {
    logger.error('No id provided, redirecting to manifest page');
    return res.redirect('/garfile/manifest');
  }

  if (!Array.isArray(garpeopleIdsToDelete)) {
    logger.error(`${garpeopleIdsToDelete} Id provided is not array, redirecting to manifest page`);
    return res.redirect('/garfile/manifest');
  }

  logger.info(`Removing ${garpeopleIdsToDelete} from manifest`);

  garApi.deleteGarPerson(cookie.getGarId(), garpeopleIdsToDelete)
    .then((apiResponse) => {
      const parsedResponse = JSON.parse(apiResponse);
      if (Object.prototype.hasOwnProperty.call(parsedResponse, 'message')) {
        logger.debug(`Api returned: ${parsedResponse.message}`);
        req.session.errMsg = parsedResponse;
        return res.redirect('/garfile/manifest');
      }
      req.session.successMsg = 'Person removed from GAR';
      return res.redirect('/garfile/manifest');
    })
    .catch((err) => {
      logger.error('Failed to delete gar person');
      logger.error(err);
      req.session.errMsg = deleteErr;
      return res.redirect('/garfile/manifest');
    });
};
