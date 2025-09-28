import CookieModel from '../../../common/models/Cookie.class.js';
import loggerFactory from '../../../common/utils/logger.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const logger = loggerFactory(__filename);
import orgApi from '../../../common/services/organisationApi.js';
import roles from '../../../common/seeddata/egar_user_roles.json' with { type: 'json' };

export default (req, res) => {
  const cookie = new CookieModel(req);
  const userId = req.session.editUserId;
  
  logger.debug('In organisation / editusers get controller');

  if (userId === undefined) {
    res.redirect('/organisation');
    return;
  }
  
  if(cookie.getUserRole() !== 'Admin'){
    roles = roles.filter(role => role.name !== 'Admin');
  }

  orgApi.getUserById(userId)
    .then((apiResponse) => {
      const orgUser = JSON.parse(apiResponse);
      if (orgUser !== undefined) {
        orgUser.role = orgUser.role.name;
      }
      return res.render('app/organisation/editusers/index', { cookie, orgUser, roles });
    })
    .catch((err) => {
      logger.error(err);
      req.session.errMsg = { message: 'Failed to find user details. Try again' };
      return res.redirect('/organisation');
    });
};
