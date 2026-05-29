const config = require('../config/index');

module.exports = (_req, res, next) => {
  if (config.FLAGPOLE_MAINTENANCE === 'true') {
    res.redirect('/error/503');
  } else {
    next();
  }
};
