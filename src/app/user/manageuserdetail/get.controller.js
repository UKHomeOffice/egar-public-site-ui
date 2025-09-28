import CookieModel from '../../../common/models/Cookie.class.js';
import config from '../../../common/config/index.js';

export default (req, res) => {
  const cookie = new CookieModel(req);

  const template = config.ONE_LOGIN_SHOW_ONE_LOGIN === true ? 'index' : 'old_index';

  res.render(`app/user/manageuserdetail/${template}`, { cookie });
};
