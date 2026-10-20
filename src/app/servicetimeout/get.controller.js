const CookieModel = require('../../common/models/Cookie.class');
const { IS_HTTPS_SERVER, SAME_SITE_VALUE, SESSION_TIMEOUT_WARNING_DISPLAY_TIME } = require('../../common/config');
const { getOneLoginAuthUrl } = require('../../common/utils/oneLoginAuth');
const logger = require('../../common/utils/logger')(__filename);

module.exports = async (req, res) => {
  const cookie = new CookieModel(req);
  const { action } = req.params;

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
        req.session.touch();
        req.session.lastRefreshedAt = Date.now();
        res.set('Cache-Control', 'no-store');
        return res.json(cookie.getSessionRemainingTimeInSeconds());
      case 'logout':
        res.cookie('serviceTimeout', 'yes', {
          httpOnly: true,
          secure: IS_HTTPS_SERVER,
          sameSite: SAME_SITE_VALUE,
        });
        return res.redirect('/user/logout');
      case 'signout':
        return res.render('app/servicetimeout/signedout', { oneLoginAuthUrl: getOneLoginAuthUrl(req, res) });
      default:
        throw new Error('Unrecognized action');
    }
  } catch (error) {
    logger.error('An error occurred', error);
    res.status(500).render('app/error/500');
  }
};
