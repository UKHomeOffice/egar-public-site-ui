
'use strict'
const settings = require('../../../common/config/index');
const cookieModel = require('../../../common/models/Cookie.class')
const roles = require ('../../../common/seeddata/egar_user_roles.json')


module.exports = (req, res) => {
  var cookie = new cookieModel(req)
  //logger.info('calll to create a new organisation')
    res.render('app/organisation/assignrole/index',{ cookie , roles});
  }
