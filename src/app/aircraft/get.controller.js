/* eslint-disable no-underscore-dangle */

const CookieModel = require('../../common/models/Cookie.class');
const logger = require('../../common/utils/logger')(__filename);
const craftApi = require('../../common/services/craftApi');
const pagination = require('../../common/utils/pagination');

module.exports = (req, res) => {
  logger.debug('In user aircraft get controller');

  const cookie = new CookieModel(req);
  const currentPage = pagination.getCurrentPage(req, '/aircraft');

  const crafts = cookie.getUserRole() === 'Individual' ? craftApi.getCrafts(cookie.getUserDbId(), currentPage) : craftApi.getOrgCrafts(cookie.getOrganisationId());
  crafts.then((values) => {
    const savedCrafts = JSON.parse(values);
    const { totalPages, totalItems } = savedCrafts._meta;

    let paginationData;
    try {
      paginationData = pagination.build(req, totalPages, totalItems);
    } catch (link) {
      logger.debug('Pagination module threw error, refreshing page');
      res.redirect('/aircraft');
      return;
    }

    cookie.setSavedCraft(savedCrafts);
    if (req.session.errMsg) {
      const { errMsg } = req.session;
      delete req.session.errMsg;
      res.render('app/aircraft/index', {
        cookie, savedCrafts, pages: paginationData, errors: [errMsg],
      });
      return;
    }
    if (req.session.successMsg) {
      const { successMsg, successHeader } = req.session;
      delete req.session.successHeader;
      delete req.session.successMsg;
      res.render('app/aircraft/index', {
        cookie, savedCrafts, successMsg, successHeader, pages: paginationData,
      });
      return;
    }
    res.render('app/aircraft/index', {
      cookie,
      savedCrafts,
      pages: paginationData,
    });
  }).catch((err) => {
    logger.error('There was an error fetching craft data for an individual');
    logger.error(err);
    res.render('app/aircraft/index', { cookie, errors: [{ message: 'There was a problem fetching data' }] });
  });
};
