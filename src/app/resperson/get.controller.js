const logger = require('../../common/utils/logger')(__filename);
const CookieModel = require('../../common/models/Cookie.class');
const resPersonApi = require('../../common/services/resPersonApi');

module.exports = async (req, res) => {
  logger.debug('In responsible person get controller');
  const cookie = new CookieModel(req);
  const errMSg = { message: 'Failed to get saved responsible persons' };
  try {
    const response = await resPersonApi.getResPersons(cookie.getUserDbId())
    const resPersons = JSON.parse(response);
    if (req.session.successMsg) {
      const { successMsg, successHeader } = req.session;
      delete req.session.successHeader;
      delete req.session.successMsg;
      return res.render('app/resperson/index', { cookie, resPersons, successMsg, successHeader });
    }
    if (req.session.errMsg) {
      const { errMsg } = req.session;
      delete req.session.errMsg;
      return res.render('app/resperson/index', {
        cookie, resPersons, errors: [errMsg],
      });
    }
    if(resPersons.message) {
      logger.info(`Failed to get saved people: ${resPersons.message}`)
      return res.render('app/resperson/index', {
        cookie, resPersons, errors: [errMSg],
      });
    }
    return res.render('app/resperson/index', { cookie, resPersons });
  } 
  catch (err) {
    logger.info('Failed to get saved responsible people');
    logger.info(err);
    return res.render('app/resperson/index', { cookie, errors: [errMSg] });
  };
};