const CookieModel = require('../../../common/models/Cookie.class');
const logger = require('../../../common/utils/logger')(__filename);
const garApi = require('../../../common/services/garApi');

module.exports = (req, res) => {
  const cookie = new CookieModel(req);

  garApi
    .get(res.locals.gar.garId)
    .then((apiResponse) => {
      const parsedResponse = JSON.parse(apiResponse);
      cookie.setGarDepartureVoyage(parsedResponse);

      return res.render('app/garfile/departure/index', { cookie });
    })
    .catch((err) => {
      logger.error('Failed to get GAR details', {
        garId: res.locals.gar.garId,
        errorMessage: err?.message,
        stack: err?.stack,
      });
      res.render('app/garfile/departure/index', {
        cookie,
        errors: [
          {
            message: 'There was a problem getting GAR information',
          },
        ],
      });
    });
};
