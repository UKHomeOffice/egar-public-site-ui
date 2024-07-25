const CookieModel = require('../../../common/models/Cookie.class');
const fixedBasedOperatorOptions = require('../../../common/seeddata/fixed_based_operator_options.json');

module.exports = (req, res) => {
  const cookie = new CookieModel(req);
  const context = {
    fixedBasedOperatorOptions,
    cookie,
  };
  res.render('app/resperson/add/index', context);
};