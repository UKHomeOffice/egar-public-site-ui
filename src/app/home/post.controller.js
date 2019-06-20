const logger = require('../../common/utils/logger')(__filename);
const ValidationRule = require('../../common/models/ValidationRule.class');
const validator = require('../../common/utils/validator');
const CookieModel = require('../../common/models/Cookie.class');
const userattributes = require('../../common/seeddata/egar_user_account_details.json');
const garoptions = require('../../common/seeddata/egar_create_gar_options.json')


module.exports = (req, res) => {
  logger.debug('In register / reguser post controller');
  const cookie = new CookieModel(req);
  res.render('app/garfile/home/index', {cookie})
};
