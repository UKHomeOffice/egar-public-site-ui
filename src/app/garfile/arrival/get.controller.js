const CookieModel = require('../../../common/models/Cookie.class');
const logger = require('../../../common/utils/logger')(__filename);
const dataAccessApi = require('../../../common/services/dataAccessApi');

module.exports = async (req, res) => {
  const cookie = new CookieModel(req);

  try {
    const apiResponse = await dataAccessApi.garApi.get(res?.locals?.gar?.garId);
    cookie.setGarArrivalVoyage(apiResponse);
    return res.render('app/garfile/arrival/index', {
      cookie,
    });
  } catch (err) {
    logger.error('Failed to get GAR details', {
      garId: res?.locals?.gar?.garId,
      errorMessage: err?.message,
      stack: err?.stack,
    });
    res.render('app/garfile/arrival/index', {
      cookie,
      errors: [
        {
          message: 'There was a problem getting GAR information',
        },
      ],
    });
  }
};
