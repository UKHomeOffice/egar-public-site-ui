const CookieModel = require('../../../common/models/Cookie.class');
const logger = require('../../../common/utils/logger')(__filename);
const personApi = require('../../../common/services/personApi');
const config = require('../../../common/config');
const {ONE_LOGIN_ACCOUNT_URL} = require("../../../common/config");

const template = config.ONE_LOGIN_SHOW_ONE_LOGIN === true ? 'index' : 'old_index'

module.exports = (req, res) => {
  logger.debug('In user / viewDetails get controller');
  const cookie = new CookieModel(req);
  const userId = cookie.getUserDbId();

  Promise.all([personApi.getPeople(userId, 'individual')])
    .then(([people]) => {
      const savedPeople = JSON.parse(people);

      if (req.session.errMsg) {
        const { errMsg } = req.session;
        delete req.session.errMsg;
        return res.render(`app/user/viewDetails/${template}`, {
          cookie, savedPeople, errors: [errMsg], ONE_LOGIN_ACCOUNT_URL
        });
      }
      if (req.session.successMsg) {
        const { successMsg, successHeader } = req.session;
        delete req.session.successHeader;
        delete req.session.successMsg;
        return res.render(`app/user/viewDetails/${template}`, {
          cookie, savedPeople, successHeader, successMsg, ONE_LOGIN_ACCOUNT_URL
        });
      }
      return res.render(`app/user/viewDetails/${template}`, {cookie, savedPeople });
    })
    .catch((err) => {
      logger.error('There was an error fetching craft / people data for an individual');
      logger.error(err);
      res.render(`app/user/viewDetails/${template}`, { cookie, errors: [{ message: 'There was a problem fetching data' }], ONE_LOGIN_ACCOUNT_URL });
    });
};
