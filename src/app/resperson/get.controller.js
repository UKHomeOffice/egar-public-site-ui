const logger = require('../../common/utils/logger')(__filename);
const CookieModel = require('../../common/models/Cookie.class');
const resPersonApi = require('../../common/services/resPersonApi');

module.exports = async (req, res) => {
  logger.debug('In responsible person get controller');
  const cookie = new CookieModel(req);
  const errMSg = { message: 'Failed to get saved responsible persons' };
  try {
    const response = await resPersonApi.getResPersons(cookie.getUserDbId(), 'individual')
    const resPersons = JSON.parse(response);
    if (req.session.successMsg) {
      const { successMsg, successHeader } = req.session;
      delete req.session.successHeader;
      delete req.session.successMsg;
      return res.render('app/resperson/index', { cookie, resPersons, successMsg, successHeader });
    }
    return res.render('app/resperson/index', { cookie, resPersons });
  } 
  catch (err) {
    logger.info('Failed to get saved responsible people');
    logger.info(err);
    return res.render('app/resperson/index', { cookie, errors: [errMSg] });
  };
};