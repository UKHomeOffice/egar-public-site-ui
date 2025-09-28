import loggerFactory from '../../../common/utils/logger.js';
const logger = loggerFactory(import.meta.url);
import CookieModel from '../../../common/models/Cookie.class.js';

export default (req, res) => {
  const cookie = new CookieModel(req);
  logger.debug('In garfile / garupload get controller');

  const context = { cookie };

  if (req.session.failureMsg) {
    let errorObj = [{}];
    if (Array.isArray(req.session.failureMsg)) {
      errorObj = req.session.failureMsg;
    } else {
      errorObj[0].message = req.session.failureMsg;
      errorObj[0].identifier = req.session.failureIdentifier;
    }
    context.errors = errorObj;
    delete req.session.failureMsg;
    delete req.session.failureIdentifier;
  }
  return res.render('app/garfile/garupload/index', context);
};
