const logger = require('../../common/utils/logger')(__filename);
const CookieModel = require('../../common/models/Cookie.class');


// cookie model, use that in the njks
module.exports = (req, res) => {
  logger.debug('In help get controller');

  const cookie = new CookieModel(req);
  const isLoggedIn = Boolean(cookie.getUserDbId());

  res.render('app/help/index', { cookie, isLoggedIn });

};
