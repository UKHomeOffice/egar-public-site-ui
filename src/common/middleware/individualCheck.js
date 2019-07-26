const CookieModel = require('../models/Cookie.class');
const logger = require('../utils/logger')(__filename);

/**
 * Checks the presence of an organisation id, and redirects to an error page if so.
 * This is for individual-only pages, like the organisation create page.
 */
module.exports = (req, res, next) => {
  const cookie = new CookieModel(req);
  if (cookie.getOrganisationId() !== undefined && cookie.getOrganisationId() !== null) {
    logger.info('Attempted to enter an individual only page with organisation id for user set');
    res.redirect('/error/404');
  } else {
    next();
  }
};
