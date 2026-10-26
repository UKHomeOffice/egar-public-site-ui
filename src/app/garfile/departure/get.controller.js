const CookieModel = require('../../../common/models/Cookie.class');
const logger = require('../../../common/utils/logger')(__filename);
const dataAccessApi = require('../../../common/services/dataAccessApi');

module.exports = (req, res) => {
  const cookie = new CookieModel(req);

  return dataAccessApi.garApi
    .get(res.locals.gar.garId)
    .then((apiResponse) => {
      cookie.setGarDepartureVoyage(apiResponse);

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
