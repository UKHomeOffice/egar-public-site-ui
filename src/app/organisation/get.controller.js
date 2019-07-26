
const CookieModel = require('../../common/models/Cookie.class');
const orgApi = require('../../common/services/organisationApi');
const logger = require('../../common/utils/logger')(__filename);

module.exports = (req, res) => {
  const cookie = new CookieModel(req);

  // Individuals cannot go to the /organisation page, so, redirect to error.
  // If this is the only generally restricted area, then this single if statement
  // probably suffices rather than some middleware
  if (cookie.getOrganisationId() === undefined) {
    logger.info('Entered organisation URL without organisation id set');
    res.redirect('/error/404');
    return;
  }

  orgApi.getUsers(cookie.getOrganisationId())
    .then((values) => {
      const orgUsers = JSON.parse(values);
      cookie.setOrganisationUsers(orgUsers);
      if (req.session.errMsg) {
        const { errMsg } = req.session;
        delete req.session.errMsg;
        return res.render('app/organisation/index', { cookie, orgUsers, errors: [errMsg] });
      }
      if (req.session.successMsg) {
        const { successMsg, successHeader } = req.session;
        delete req.session.successHeader;
        delete req.session.successMsg;
        return res.render('app/organisation/index', {
          cookie, orgUsers, successHeader, successMsg,
        });
      }
      return res.render('app/organisation/index', { cookie, orgUsers });
    })
    .catch((err) => {
      logger.error('There was an error fetching users for the organisation');
      logger.error(err);
      res.render('app/organisation/index', { cookie, errors: [{ message: 'There was a problem fetching organisation users' }] });
    });
};
