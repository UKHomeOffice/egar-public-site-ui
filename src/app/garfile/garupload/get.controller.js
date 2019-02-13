const logger = require('../../../common/utils/logger');
const CookieModel = require('../../../common/models/Cookie.class')

module.exports = (req, res) => {
  const cookie = new CookieModel(req);
  logger.debug('In garfile / garupload get controller');

  const context = { cookie };

  if (req.session.failureMsg) {
    const errorObj = [{}];
    errorObj[0].message = req.session.failureMsg;
    errorObj[0].identifier = req.session.failureIdentifier;
    context.errors = errorObj;
    delete req.session.failureMsg;
    delete req.session.failureIdentifier;
  }
  return res.render('app/garfile/garupload/index', context);
};
