import CookieModel from '../../../common/models/Cookie.class.js';
import loggerFactory from '../../../common/utils/logger.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const logger = loggerFactory(__filename);
import garApi from '../../../common/services/garApi.js';

export default (req, res) => {
  logger.debug('In garfile/departure get controller');
  const cookie = new CookieModel(req);

  garApi.get(cookie.getGarId()).then((apiResponse) => {
    const parsedResponse = JSON.parse(apiResponse);
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
