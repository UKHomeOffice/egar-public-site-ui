const CookieModel = require('../../../common/models/Cookie.class');
let allRoles = require('../../../common/seeddata/egar_user_roles.json');

module.exports = (req, res) => {
  const cookie = new CookieModel(req);
  const userIsAdmin = cookie.getUserRole() === 'Admin';

  const roles = userIsAdmin
    ? allRoles
    : allRoles.filter((role) => role.name !== 'Admin');

  res.render('app/organisation/assignrole/index', { cookie, roles });
};
