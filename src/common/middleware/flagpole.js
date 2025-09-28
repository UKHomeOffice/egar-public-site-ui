import config from '../config/index.js';

export default (req, res, next) => {
  if (config.FLAGPOLE_MAINTENANCE === 'true') {
    res.redirect('/error/503');
  } else {
    next();
  }
};
