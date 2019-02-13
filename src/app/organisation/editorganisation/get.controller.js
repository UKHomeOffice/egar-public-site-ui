
'use strict'
const settings = require('../../../common/config/index');
const cookieModel = require('../../../common/models/Cookie.class')
const seeddata = require('../../../common/seeddata/egar_organisation_users.json')


module.exports = (req, res) => {
  const cookie = new cookieModel(req)
  //logger.info('calll to manage an organisation')
    res.render('app/organisation/editorganisation/index',{ cookie });
  }
