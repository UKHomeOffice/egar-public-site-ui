const settings = require('../../../common/config/index');
const cookieModel = require('../../../common/models/Cookie.class');


module.exports = (req, res) => {
  var cookie = new cookieModel(req);
  res.render('app/user/detailschanged/index',{ cookie });
};
