/* eslint-disable no-underscore-dangle */
const paginate = require('express-paginate');

const CookieModel = require('../../common/models/Cookie.class');
const logger = require('../../common/utils/logger')(__filename);
const craftApi = require('../../common/services/craftApi');

module.exports = (req, res) => {
  logger.debug('In user aircraft get controller');
  logger.debug('Does session have nextPage set?');
  logger.debug(req.session.nextPage);

  const cookie = new CookieModel(req);
  const crafts = cookie.getUserRole() === 'Individual' ? craftApi.getCrafts(cookie.getUserDbId(), req.query.page) : craftApi.getOrgCrafts(cookie.getOrganisationId());
  crafts.then((values) => {
    const savedCrafts = JSON.parse(values);
    // Pagination, returns _meta and _links:
    logger.debug(JSON.stringify(savedCrafts._meta));
    const startItem = ((req.query.page - 1) * 5) + 1;
    const endItem = Math.min((startItem - 1) + 5, savedCrafts._meta.totalItems);
    const { totalPages, totalItems } = savedCrafts._meta;
    // {"page":1,"perPage":10,"totalPages":2,"totalItems":11}
    // If page is greater than total pages, go to the last available page
    if (totalPages < req.query.page) {
      req.query.page = totalPages;
      res.redirect('/aircraft?page=' + totalPages);
      return;
    }
    const items = paginate.getArrayPages(req)(3, totalPages, req.query.page);
    console.log(JSON.stringify(items));
    console.log(JSON.stringify(paginate.hasNextPages(req)(totalPages)));
    console.log(paginate.hasPreviousPages);
    // console.log(res.locals.paginate.hasPreviousPages);
    console.log('HREFs:');
    console.log(paginate.href(req)(true));
    console.log(paginate.href(req)(false));
    cookie.setSavedCraft(savedCrafts);
    if (req.session.errMsg) {
      const { errMsg } = req.session;
      delete req.session.errMsg;
      res.render('app/aircraft/index', { cookie, savedCrafts, errors: [errMsg] });
      return;
    }
    if (req.session.successMsg) {
      const { successMsg, successHeader } = req.session;
      delete req.session.successHeader;
      delete req.session.successMsg;
      res.render('app/aircraft/index', {
        cookie, savedCrafts, successMsg, successHeader,
      });
      return;
    }
    res.render('app/aircraft/index', {
      cookie,
      savedCrafts,
      pages: {
        startItem,
        previous: paginate.href(req)(true),
        hasNext: paginate.hasNextPages(req)(totalPages),
        next: paginate.href(req)(false),
        endItem,
        currentPage: req.query.page,
        totalItems,
        items,
      },
    });
  }).catch((err) => {
    logger.error('There was an error fetching craft data for an individual');
    logger.error(err);
    res.render('app/aircraft/index', { cookie, errors: [{ message: 'There was a problem fetching data' }] });
  });
};
