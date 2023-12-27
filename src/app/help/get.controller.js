const logger = require('../../common/utils/logger')(__filename);
const CookieModel = require('../../common/models/Cookie.class');


// cookie model, use that in the njks
module.exports = (req, res) => {
  const cookie = new CookieModel(req);
  logger.debug('In help get controller');

  res.render('app/help/index', { cookie });

};
