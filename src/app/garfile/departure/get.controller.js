const CookieModel = require('../../../common/models/Cookie.class');
const logger = require('../../../common/utils/logger')(__filename);
const garApi = require('../../../common/services/garApi');

module.exports = (req, res) => {
  logger.debug('In garfile/departure get controller');
  const cookie = new CookieModel(req);

  garApi.get(cookie.getGarId()).then((apiResponse) => {
    const parsedResponse = JSON.parse(apiResponse);
    if (parsedResponse.departurePort === 'ZZZZ') {
      parsedResponse.departurePort = 'YYYY';
    }
    cookie.setGarDepartureVoyage(parsedResponse);

    return res.render('app/garfile/departure/index', { cookie });
  }).catch((err) => {
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
