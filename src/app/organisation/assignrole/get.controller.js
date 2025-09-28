
import CookieModel from '../../../common/models/Cookie.class.js';
import roles from '../../../common/seeddata/egar_user_roles.json' with { type: "json"};

export default (req, res) => {
  const cookie = new CookieModel(req);
 
  if(cookie.getUserRole() !== 'Admin'){
    roles = roles.filter(role => role.name !== 'Admin');
  }

  res.render('app/organisation/assignrole/index', { cookie, roles });
};
