
const CookieModel = require('../../../common/models/Cookie.class');
const roles = require('../../../common/seeddata/egar_user_roles.json');

module.exports = (req, res) => {
  const cookie = new CookieModel(req);
  res.render('app/organisation/assignrole/index', { cookie, roles });
};
