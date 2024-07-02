const CookieModel = require('../../../common/models/Cookie.class');
const fixedBasedOperatorOptions = require('../../../common/seeddata/fixed_based_operator_options.json');
const logger = require('../../../common/utils/logger')(__filename);

module.exports = (req, res) => {
  logger.debug('In Responsible person get controller');
  const cookie = new CookieModel(req);
  const context = {
    fixedBasedOperatorOptions,
    cookie,
  };
  res.render('app/resperson/add/index', context);
};