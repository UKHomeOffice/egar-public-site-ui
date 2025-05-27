const CookieModel = require('../../../common/models/Cookie.class');
const logger = require('../../../common/utils/logger')(__filename);
const personApi = require('../../../common/services/personApi');
const config = require('../../../common/config');

module.exports = (req, res) => {
  logger.debug('In user / viewDetails get controller');
  const cookie = new CookieModel(req);
  const userId = cookie.getUserDbId();
  const oneloginUrl = config.ONE_LOGIN_ACCOUNT_URL;

  Promise.all([personApi.getPeople(userId, 'individual')])
    .then(([people]) => {
      const savedPeople = JSON.parse(people);

      if (req.session.errMsg) {
        const { errMsg } = req.session;
        delete req.session.errMsg;
        return res.render('app/user/viewDetails/index', {
          cookie, savedPeople, errors: [errMsg], oneloginUrl
        });
      }
      if (req.session.successMsg) {
        const { successMsg, successHeader } = req.session;
        delete req.session.successHeader;
        delete req.session.successMsg;
        return res.render('app/user/viewDetails/index', {
          cookie, savedPeople, successHeader, successMsg, oneloginUrl
        });
      }
      return res.render('app/user/viewDetails/index', {cookie, savedPeople, oneloginUrl });
    })
    .catch((err) => {
      logger.error('There was an error fetching craft / people data for an individual');
      logger.error(err);
      res.render('app/user/viewDetails/index', { cookie, errors: [{ message: 'There was a problem fetching data' }], oneloginUrl });
    });
};
