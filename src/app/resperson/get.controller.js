import loggerFactory from '../../common/utils/logger.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const logger = loggerFactory(__filename);
import CookieModel from '../../common/models/Cookie.class.js';
import resPersonApi from '../../common/services/resPersonApi.js';

export default async (req, res) => {
  logger.debug('In responsible person get controller');
  const cookie = new CookieModel(req);
  const errMessage = { message: 'Failed to get saved responsible persons' };
  try {
    const response = await resPersonApi.getResPersons(cookie.getUserDbId())
    const resPersons = JSON.parse(response);
    if (req.session.successMsg) {
      const { successMsg, successHeader } = req.session;
      delete req.session.successHeader;
      delete req.session.successMsg;
      return res.render('app/resperson/index', { cookie, resPersons, successMsg, successHeader });
    }
    if (req.session.errMsg) {
      const { errMsg } = req.session;
      delete req.session.errMsg;
      return res.render('app/resperson/index', {
        cookie, resPersons, errors: [errMsg],
      });
    }
    if(resPersons.message) {
      logger.info(`Failed to get saved responsible persons: ${resPersons.message}`)
      return res.render('app/resperson/index', {
        cookie, resPersons:[], errors: [errMessage],
      });
    }
    return res.render('app/resperson/index', { cookie, resPersons });
  } 
  catch (err) {
    logger.info('Failed to get saved responsible persons');
    logger.info(err);
    return res.render('app/resperson/index', { cookie, errors: [errMessage] });
  };
};