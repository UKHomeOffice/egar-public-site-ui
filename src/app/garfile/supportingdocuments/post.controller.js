const logger = require('../../../common/utils/logger');
const CookieModel = require('../../../common/models/Cookie.class');
const garApi = require('../../../common/services/garApi');

module.exports = (req, res) => {
  const cookie = new CookieModel(req);
  logger.debug('In garfile / supporting documents post controller');
  res.send(req.body.deleteDocId);
};
