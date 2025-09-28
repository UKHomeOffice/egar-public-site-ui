import CookieModel from '../models/Cookie.class.js';
import loggerFactory from '../utils/logger.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const logger = loggerFactory(__filename);

const inaccessiblePageRoute = {
  'organisation' : ['User'],
};

export default (req, res, next) => {
  const cookie = new CookieModel(req);
  const userRole = cookie.getUserRole(); 
  const page = req.originalUrl.split('/')[1];

  if (!!inaccessiblePageRoute[page] && inaccessiblePageRoute[page].includes(userRole)) {
    logger.info(`Can not access the ${page} page`);
    return res.redirect('/home');
  }
  
  next();
  return;

};
