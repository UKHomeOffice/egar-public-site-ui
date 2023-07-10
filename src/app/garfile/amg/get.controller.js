const logger = require('../../../common/utils/logger')(__filename);
const CookieModel = require('../../../common/models/Cookie.class');
const manifestFields = require('../../../common/seeddata/gar_manifest_fields.json');
const garApi = require('../../../common/services/garApi');
const validator = require('../../../common/utils/validator');
const validationList = require('./validations');

module.exports = (req, res) => {
  logger.debug('In garfile / amg get controller');
    res.render('app/garfile/amg/index');
};
