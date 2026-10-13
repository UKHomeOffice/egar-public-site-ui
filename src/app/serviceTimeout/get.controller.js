const CookieModel = require('../../common/models/Cookie.class');
const { IS_HTTPS_SERVER, SAME_SITE_VALUE, SESSION_TIMEOUT_WARNING_DISPLAY_TIME } = require('../../common/config');
const logger = require('../../common/utils/logger')(__filename);

module.exports = async (req, res) => {
  const cookie = new CookieModel(req);
  const { action } = req.params;

  try {
    if (action === 'inactivetime') {
      res.json(SESSION_TIMEOUT_WARNING_DISPLAY_TIME);
      return;
    }

    if (action === 'sessiontime') {
      if (!cookie.getUserDbId()) {
        res.json(0); //Set a session length to 0 if user is not loggedIn
        return;
      }
      res.json(cookie.getSessionRemainingTimeInSeconds());
      return;
    }

    if (action === 'refreshsession') {
      req.session.touch();
      cookie.setAttributes('newSessionStartAt', new Date().toISOString());
      res.json(req.getAttributes('cookie').expires);
      return;
    }

    if (action === 'logout') {
      res.cookie('serviceTimeout', 'yes', {
        httpOnly: true,
        secure: IS_HTTPS_SERVER,
        sameSite: SAME_SITE_VALUE,
      });
      return res.redirect('/logout');
    }
  } catch (error) {
    logger.error('An error occurred', error);
    // add 500 template
  }
};
