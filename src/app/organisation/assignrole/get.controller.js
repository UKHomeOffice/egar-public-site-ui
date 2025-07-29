
const CookieModel = require('../../../common/models/Cookie.class');
let roles = require('../../../common/seeddata/egar_user_roles.json');

module.exports = (req, res) => {
  const cookie = new CookieModel(req);
 
  if(cookie.getUserRole() !== 'Admin'){
    roles = roles.filter(role => role.id !== '0');
  }

  res.render('app/organisation/assignrole/index', { cookie, roles });
};
