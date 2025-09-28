/* eslint-disable no-underscore-dangle */

import CookieModel from '../../common/models/Cookie.class.js';

import loggerFactory from '../../common/utils/logger.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const logger = loggerFactory(__filename);
import craftApi from '../../common/services/craftApi.js';
import pagination from '../../common/utils/pagination.js';

export default (req, res) => {
  logger.debug('In user aircraft get controller');

  const cookie = new CookieModel(req);
  const currentPage = pagination.getCurrentPage(req, '/aircraft');

  const crafts = cookie.getUserRole() === 'Individual' ? craftApi.getCrafts(cookie.getUserDbId(), currentPage) : craftApi.getOrgCrafts(cookie.getOrganisationId(), currentPage);
  crafts.then((values) => {
    const savedCrafts = JSON.parse(values);
    const { totalPages, totalItems } = savedCrafts._meta;

    let paginationData;
    try {
      paginationData = pagination.build(req, totalPages, totalItems);
    } catch (link) {
      logger.debug('Pagination module threw max page, refreshing page');
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
