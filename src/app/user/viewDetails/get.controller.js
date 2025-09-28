import CookieModel from '../../../common/models/Cookie.class.js';
import loggerFactory from '../../../common/utils/logger.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const logger = loggerFactory(__filename);
import personApi from '../../../common/services/personApi.js';
import { ONE_LOGIN_ACCOUNT_URL, ONE_LOGIN_SHOW_ONE_LOGIN } from '../../../common/config/index.js';

const template = ONE_LOGIN_SHOW_ONE_LOGIN === true ? 'index' : 'old_index'

export default (req, res) => {
  logger.debug('In user / viewDetails get controller');
  const cookie = new CookieModel(req);
  const userId = cookie.getUserDbId();

  Promise.all([personApi.getPeople(userId, 'individual')])
    .then(([people]) => {
      const savedPeople = JSON.parse(people);

      if (req.session.errMsg) {
        const { errMsg } = req.session;
        delete req.session.errMsg;
        return res.render(`app/user/viewDetails/${template}`, {
          cookie, savedPeople, errors: [errMsg], ONE_LOGIN_ACCOUNT_URL,
        });
      }
      if (req.session.successMsg) {
        const { successMsg, successHeader } = req.session;
        delete req.session.successHeader;
        delete req.session.successMsg;
        return res.render(`app/user/viewDetails/${template}`, {
          cookie, savedPeople, successHeader, successMsg, ONE_LOGIN_ACCOUNT_URL,
        });
      }
      return res.render(`app/user/viewDetails/${template}`, {cookie, savedPeople, ONE_LOGIN_ACCOUNT_URL });
    })
    .catch((err) => {
      logger.error('There was an error fetching craft / people data for an individual');
      logger.error(err);
      res.render(`app/user/viewDetails/${template}`, {
        cookie,
        errors: [{ message: 'There was a problem fetching data' }],
        ONE_LOGIN_ACCOUNT_URL
      });
    });
};
