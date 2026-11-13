const CookieModel = require('../../../common/models/Cookie.class');
const garoptions = require('../../../common/seeddata/egar_create_gar_options.json');

module.exports = (req, res) => {
  const cookie = new CookieModel(req);
  res.render('app/garfile/home/index', {
    cookie,
    garoptions,
  });
};
