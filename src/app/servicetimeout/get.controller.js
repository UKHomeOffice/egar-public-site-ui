const CookieModel = require('../../common/models/Cookie.class');
const { IS_HTTPS_SERVER, SAME_SITE_VALUE, SESSION_TIMEOUT_WARNING_DISPLAY_TIME } = require('../../common/config');
const logger = require('../../common/utils/logger')(__filename);

module.exports = async (req, res) => {
  const cookie = new CookieModel(req);
  const { action } = req.params;
  const hour = 60 * 60 * 1000;

  try {
    switch (action) {
      case 'inactivetime':
        return res.json(SESSION_TIMEOUT_WARNING_DISPLAY_TIME);
      case 'sessiontime':
        if (!cookie.getUserDbId()) {
          return res.json(0); //Set a session length to 0 if user is not loggedIn
        }
        return res.json(cookie.getSessionRemainingTimeInSeconds());
      case 'refreshsession':
        req.session.cookie.maxAge = hour;
        req.session.lastRefreshedAt = Date.now();
        res.set('Cache-Control', 'no-store');
        return res.json(req.session.cookie.expires);
      case 'logout':
        res.cookie('serviceTimeout', 'yes', {
          httpOnly: true,
          secure: IS_HTTPS_SERVER,
          sameSite: SAME_SITE_VALUE,
        });
        return res.redirect('/user/logout');
      default:
        throw new Error('Unrecognized action action');
    }
  } catch (error) {
    logger.error('An error occurred', error);
    res.render('app/error/500');
  }
};
