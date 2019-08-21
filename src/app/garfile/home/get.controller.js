const logger = require('../../../common/utils/logger')(__filename);
const CookieModel = require('../../../common/models/Cookie.class');
const garoptions = require('../../../common/seeddata/egar_create_gar_options.json');

module.exports = (req, res) => {
  logger.debug('In garfile / home get controller');
  const cookie = new CookieModel(req);
  res.render('app/garfile/home/index', {
    cookie,
    garoptions,
  });
};
