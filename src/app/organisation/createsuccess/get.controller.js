
'use strict'
const settings = require('../../../common/config/index');
const cookieModel = require('../../../common/models/Cookie.class')


module.exports = (req, res) => {
  var cookie = new cookieModel(req)
  //logger.info('calll to create a new organisation')
    res.render('app/organisation/createsucess/index',{ cookie });
  }
