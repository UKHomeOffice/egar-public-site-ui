const logger = require('../../../../common/utils/logger');
const CookieModel = require('../../../../common/models/Cookie.class');
const manifestFields = require('../../../../common/seeddata/gar_manifest_fields.json');
const garApi = require('../../../../common/services/garApi');

module.exports = (req, res) => {
  const cookie = new CookieModel(req);
  logger.debug('In garfile / submit/success get controller');
  res.render('app/garfile/submit/sucess/index', {cookie});
}
