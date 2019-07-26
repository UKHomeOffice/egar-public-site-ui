const CookieModel = require('../../common/models/Cookie.class');
const logger = require('../utils/logger')(__filename);

/**
 * Checks the presence of an organisation id, and if not, redirect to the error page.
 * Perhaps a more specific access denied page is required, but for now, this should be
 * sufficient.
 */
module.exports = (req, res, next) => {
  const cookie = new CookieModel(req);
  if (cookie.getOrganisationId() === undefined || cookie.getOrganisationId() === null) {
    logger.info('Attempted to enter an organisation page with no organisation id for user set');
    res.redirect('/error/404');
  } else {
    next();
  }
};
