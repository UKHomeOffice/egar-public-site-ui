const CookieModel = require('../../common/models/Cookie.class');
const { GAR_TEMPLATE_FILE } = require('../../common/config');

module.exports = (req, res) => {
  const cookie = new CookieModel(req);
  res.render('app/garfile/home/index', { cookie, GAR_TEMPLATE_FILE });
};
