const CookieModel = require('../../../common/models/Cookie.class');


module.exports = (req, res) => {
  const cookie = new CookieModel(req);
  res.render('app/user/manageuserdetail/index', { cookie });
};
