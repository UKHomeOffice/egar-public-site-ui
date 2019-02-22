const CookieModel = require('../../../common/models/Cookie.class');
const logger = require('../../../common/utils/logger');
const personApi = require('../../../common/services/personApi');


module.exports = (req, res) => {
  const cookie = new CookieModel(req);
  logger.debug('In people / delete get controller');

  const errMsg = { message: 'Failed to delete person. Try again' };
  const personId = req.session.deletePersonId;

  if (personId === undefined) {
    return res.redirect('/people');
  }

  personApi.deletePerson(cookie.getUserDbId(), personId)
    .then((apiResponse) => {
      const parsedResponse = JSON.parse(apiResponse);
      if (Object.prototype.hasOwnProperty.call(parsedResponse, 'message')) {
        req.session.errMsg = errMsg;
        return req.session.save(() => res.redirect('/people'));
      }
      req.session.successHeader = 'Success';
      req.session.successMsg = 'Person deleted';
      return req.session.save(() => res.redirect('/people'));
    })
    .catch((err) => {
      logger.error(err);
      req.session.errMsg = errMsg;
      return req.session.save(() => res.redirect('/people'));
    });
};
