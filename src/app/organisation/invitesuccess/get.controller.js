
import loggerFactory from '../../../common/utils/logger.js';
const logger = loggerFactory(import.meta.url);
import CookieModel from '../../../common/models/Cookie.class.js';

export default (req, res) => {
  logger.debug('In organisation / invitesuccess get controller');

  const cookie = new CookieModel(req);
  res.render('app/organisation/invitesuccess/index', { cookie });
};
