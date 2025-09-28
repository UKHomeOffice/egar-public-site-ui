import CookieModel from '../../../common/models/Cookie.class.js';
import fixedBasedOperatorOptions from '../../../common/seeddata/fixed_based_operator_options.json' with { type: "json"};

export default (req, res) => {
  const cookie = new CookieModel(req);
  const context = {
    fixedBasedOperatorOptions,
    cookie,
  };
  res.render('app/resperson/add/index', context);
};