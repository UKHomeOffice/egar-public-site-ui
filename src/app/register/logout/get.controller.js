const logger = require('../../../common/utils/logger')(__filename);
const CookieModel = require('../../../common/models/Cookie.class');

module.exports = (req, res) => {
  const cookie = new CookieModel(req);
  req.session.destroy((err) => {
    if (err) {
      logger.error(err);
    } else {
      cookie.reset();
      res.redirect('/login');
    }
  });
};
