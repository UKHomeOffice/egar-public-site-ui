const logger = require('../../common/utils/logger');
const personApi = require('../../common/services/personApi');
const CookieModel = require('../../common/models/Cookie.class');

module.exports = (req, res) => {
  logger.debug('In people get controller');
  const cookie = new CookieModel(req);
  const errMSg = { message: 'Failed to get saved people' };

  personApi.getPeople(cookie.getUserDbId(), 'individual')
    .then((response) => {
      const people = JSON.parse(response);
      if (people.message) {
        logger.info('Failed to get saved people');
        logger.info(people.message);
        return res.render('app/people/index', { cookie, errors: [errMSg] });
      }
      if (req.session.errMsg) {
        const { errMsg } = req.session;
        delete req.session.errMsg;
        return res.render('app/people/index', { cookie, people, errors: [errMsg] });
      }
      if (req.session.successMsg) {
        const { successMsg, successHeader } = req.session;
        delete req.session.successHeader;
        delete req.session.successMsg;
        return res.render('app/organisation/manage/index', { cookie, people, successHeader, successMsg });
      }
      return res.render('app/people/index', { cookie, people });
    })
    .catch((err) => {
      logger.info('Failed to get saved people');
      logger.info(err);
      return res.render('app/people/index', { cookie, errors: [errMSg] });
    });
};
