//const CookieModel = require('../models/Cookie.class');
const logger = require('../utils/logger')(__filename);
const config = require('../config');

const redirectTo = (res, redirectId, cookie) => {
      //const cookie = new CookieModel(req);
      console.log('In the redorection');
      cookie.setRedirectedId(null);
      if(redirectId === config.SUBMITTED_GARS_TAB_ID){
        return res.redirect('/home#gars-submitted');
      }
      return res.redirect(`/garfile/view?gar_id=${redirectId}`);
      
};


module.exports = {redirectTo};
 

  


