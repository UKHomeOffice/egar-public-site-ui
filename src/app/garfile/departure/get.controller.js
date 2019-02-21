const CookieModel = require('../../../common/models/Cookie.class');
const logger = require('../../../common/utils/logger');
const garApi = require('../../../common/services/garApi');

module.exports = (req, res) => {
  logger.debug('In garfile/departureHour get controller');
  const cookie = new CookieModel(req);
  garApi.get(cookie.getGarId())
    .then((apiResponse) => {
      const parsedResponse = JSON.parse(apiResponse);
      cookie.setGarDepartureVoyage(parsedResponse);

      return res.render('app/garfile/departure/index', {
        cookie,
      });
    })
    .catch((err) => {
      logger.error('Failed to get GAR details');
      logger.error(err);
      res.render('app/garfile/departure/index', {
        cookie,
        errors: [{
          message: 'There was a problem getting GAR information',
        }],
      });
    });
};
