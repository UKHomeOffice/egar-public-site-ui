const CookieModel = require('../../../common/models/Cookie.class');
const { getRolesForAssigning } = require('../../../common/utils/utils');

module.exports = (req, res) => {
  const cookie = new CookieModel(req);
  const roles = getRolesForAssigning(cookie.getUserRole());

  res.render('app/organisation/assignrole/index', { cookie, roles });
};
