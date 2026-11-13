const logger = require('../../common/utils/logger')(__filename);
const CookieModel = require('../../common/models/Cookie.class');
const resPersonApi = require('../../common/services/resPersonApi');

module.exports = async (req, res) => {
  const cookie = new CookieModel(req);
  const errMessage = { message: 'Failed to get saved responsible persons' };
  try {
    const response = await resPersonApi.getResPersons(cookie.getUserDbId());
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
        cookie,
        resPersons,
        errors: [errMsg],
      });
    }
    if (resPersons.message) {
      logger.warn('Failed to get saved responsible persons', { errorMessage: resPersons.message });
      return res.render('app/resperson/index', {
        cookie,
        resPersons: [],
        errors: [errMessage],
      });
    }
    return res.render('app/resperson/index', { cookie, resPersons });
  } catch {
    logger.warn('Failed to get saved responsible persons');
    return res.render('app/resperson/index', { cookie, errors: [errMessage] });
  }
};
