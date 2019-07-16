const paginate = require('express-paginate');
const url = require('url');

const logger = require('../../common/utils/logger')(__filename);

module.exports = (req, totalPages, totalItems) => {
  logger.debug('Entering the pagination module');

  if (req.query.page === null || req.query.page === undefined) {
    logger.debug('No page parameter set, defaulting to 1');
    const params = '?page=1';
    const firstPageUrl = url.parse(req.originalUrl).pathname + params;
    logger.debug(firstPageUrl);
    throw firstPageUrl;
  }

  if (totalPages === 0) {
    // In a future user story, the entire table will be hidden if there are no
    // results, so this could readily return nothing.
    logger.debug('No results detected');

    return {
      startItem: 0,
      previous: '',
      hasNext: false,
      next: '',
      endItem: 0,
      currentPage: 1,
      totalItems,
      items: [],
    };
  }

  // If the page defined by the query is greater than the total available
  // pages, then gracefully go to the last page, this is expected to be handled
  // by the owning page, by having the required link thrown here
  if (totalPages < req.query.page) {
    req.query.page = totalPages;
    const params = `?page=${totalPages}`;
    const lastPageUrl = url.parse(req.originalUrl).pathname + params;
    logger.debug(lastPageUrl);
    throw lastPageUrl;
  }

  const startItem = ((req.query.page - 1) * 5) + 1;
  const endItem = Math.min((startItem - 1) + 5, totalItems);
  const items = paginate.getArrayPages(req)(3, totalPages, req.query.page);

  // {"page":1,"perPage":10,"totalPages":2,"totalItems":11}
  // If page is greater than total pages, go to the last available page

  logger.debug(JSON.stringify(items));
  logger.debug(JSON.stringify(paginate.hasNextPages(req)(totalPages)));

  logger.debug('HREFs:');
  logger.debug(paginate.href(req)(true));
  logger.debug(paginate.href(req)(false));

  return {
    startItem,
    previous: paginate.href(req)(true),
    hasNext: paginate.hasNextPages(req)(totalPages),
    next: paginate.href(req)(false),
    endItem,
    currentPage: req.query.page,
    totalItems,
    items,
  };
};
