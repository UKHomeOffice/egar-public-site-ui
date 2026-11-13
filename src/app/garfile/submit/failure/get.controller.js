const CookieModel = require('../../../../common/models/Cookie.class');

module.exports = (req, res) => {
  const cookie = new CookieModel(req);
  res.render('app/garfile/review/failure/index', { cookie });
};
