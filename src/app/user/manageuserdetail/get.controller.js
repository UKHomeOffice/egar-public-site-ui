const CookieModel = require('../../../common/models/Cookie.class');
const config = require('../../../common/config/index');

module.exports = (req, res) => {
  const cookie = new CookieModel(req);

  const template = config.ONE_LOGIN_SHOW_ONE_LOGIN === true ? 'index' : 'old_index';

  res.render(`app/user/manageuserdetail/${template}`, { cookie });
};
