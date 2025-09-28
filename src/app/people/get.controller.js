import loggerFactory from '../../common/utils/logger.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const logger = loggerFactory(__filename);
import personApi from '../../common/services/personApi.js';
import CookieModel from '../../common/models/Cookie.class.js';
import { Manifest } from '../../common/models/Manifest.class.js';

export default async (req, res) => {
  logger.debug('In people get controller');
  const cookie = new CookieModel(req);
  const errMSg = { message: 'Failed to get saved people' };
  
  try {
    const response = await personApi.getPeople(cookie.getUserDbId(), 'individual')
    const people = JSON.parse(response);
    const manifest = new Manifest(JSON.stringify({ items: people }));
    
    if (people.message) {
      logger.info('Failed to get saved people');
      logger.info(people.message);
      return res.render('app/people/index', { cookie, errors: [errMSg] });
    }
    if (req.session.errMsg) {
      const { errMsg } = req.session;
      delete req.session.errMsg;
      return res.render('app/people/index', { cookie, people, errors: [errMsg] });
    }

    const isValidPeople = await manifest.validate();

    if (!isValidPeople) {
      logger.error(`User ${cookie.getUserDbId()} users are invalid`);
      logger.info('Manifest validation failed, redirecting with error msg');

      return res.render('app/people/index', { 
        cookie, 
        people, 
        errors: manifest.genErrValidations(), 
        manifestInvalidPeople: manifest.invalidPeople
      });
  
    } 

    if (req.session.successMsg) {

      const { successMsg, successHeader } = req.session;
      delete req.session.successHeader;
      delete req.session.successMsg;

      return res.render('app/people/index', {
        cookie, people, successHeader, successMsg,
      });
    }
    return res.render('app/people/index', { cookie, people });
  } catch (err) {
    logger.info('Failed to get saved people');
    logger.info(err);
    return res.render('app/people/index', { cookie, errors: [errMSg] });
  };
};
