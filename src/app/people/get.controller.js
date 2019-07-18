/* eslint-disable no-underscore-dangle */
const logger = require('../../common/utils/logger')(__filename);
const personApi = require('../../common/services/personApi');
const CookieModel = require('../../common/models/Cookie.class');
const pagination = require('../../common/utils/pagination');

module.exports = (req, res) => {
  logger.debug('In people get controller');

  const cookie = new CookieModel(req);
  const currentPage = pagination.getCurrentPage(req, '/people');
  const errMSg = { message: 'Failed to get saved people' };

  personApi.getPeople(cookie.getUserDbId(), 'individual', currentPage)
    .then((response) => {
      const parsedResponse = JSON.parse(response);
      const people = parsedResponse.items;
      // console.log(response);
      const { totalPages, totalItems } = parsedResponse._meta;

      let paginationData;
      try {
        paginationData = pagination.build(req, totalPages, totalItems);
      } catch (link) {
        logger.debug('Pagination module threw error, refreshing page');
        res.redirect('/aircraft');
        return;
      }

      if (people.message) {
        logger.info('Failed to get saved people');
        logger.info(people.message);
        res.render('app/people/index', { cookie, errors: [errMSg] });
        return;
      }
      if (req.session.errMsg) {
        const { errMsg } = req.session;
        delete req.session.errMsg;
        res.render('app/people/index', {
          cookie, people, pages: paginationData, errors: [errMsg],
        });
        return;
      }
      if (req.session.successMsg) {
        const { successMsg, successHeader } = req.session;
        delete req.session.successHeader;
        delete req.session.successMsg;
        res.render('app/people/index', {
          cookie, people, pages: paginationData, successHeader, successMsg,
        });
        return;
      }
      res.render('app/people/index', { cookie, people, pages: paginationData });
    })
    .catch((err) => {
      logger.info('Failed to get saved people');
      logger.info(err);
      return res.render('app/people/index', { cookie, errors: [errMSg] });
    });
};
