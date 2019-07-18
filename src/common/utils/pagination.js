const url = require('url');
const _ = require('lodash');

const logger = require('./logger')(__filename);

/**
 * For a given page (like '/aircraft' or '/people') return the current page as
 * set in the session (provided by req). If the currentPage map is not present,
 * create it, and likewise, if the given page is not set, then default to 1.
 */
const getCurrentPage = (req, pageUrl) => {
  if (req.session.currentPage === undefined) {
    logger.debug('Getting currentPage returned no session variable, creating');
    req.session.currentPage = {};
  }
  if (req.session.currentPage[pageUrl] === undefined) {
    logger.debug(`Getting currentPage for ${pageUrl} returned undefined, adding default`);
    req.session.currentPage[pageUrl] = 1;
    req.session.save();
  }
  return req.session.currentPage[pageUrl];
};

/**
 * For a given page (like '/aircraft' or '/people') then set the current page
 * to be the provided pageNumber, stored in the session (provided by req). If
 * the currentPage map is not present, then it is created.
 *
 * @param {Object} req Request object containing the session
 * @param {String} pageUrl The page of interest, equivalent to the url
 * @param {Number} pageNumber The page number to set
 */
const setCurrentPage = (req, pageUrl, pageNumber) => {
  if (req.session.currentPage === undefined) {
    logger.debug('Setting currentPage returned no session variable, creating');
    req.session.currentPage = {};
  }
  req.session.currentPage[pageUrl] = _.toNumber(pageNumber);
  req.session.save();
};

/**
 * Returns a boolean to denote whether there are any more pages from the
 * current page, used for rendering elements in the templates. Returns true
 * if current page is less than the page count.
 *
 * @param {Number} currentPage Current page app is on
 * @param {Number} pageCount Page count for the given screen
 */
const hasNextPages = (currentPage, pageCount) => {
  if (typeof pageCount !== 'number' || pageCount < 0) throw new Error('pagination error: pageCount is not a number >= 0');
  return currentPage < pageCount;
};

/**
 * Given a limit variable, creates an array of numbers that represent the
 * nearby links that could be used. This returns an array of numbers, and takes
 * inspiration from the express-paginate library, which also returned urls for
 * those pages, which is not necessary here.
 *
 * @param {Number} limit Count of pages to expect
 * @param {Number} pageCount Total pages for the screen
 * @param {Number} currentPage Current page for the screen
 */
const getPages = (limit, pageCount, currentPage) => {
  if (limit > 0) {
    const pages = [];
    const end = Math.min(Math.max(currentPage + Math.floor(limit / 2), limit), pageCount);
    const start = Math.max(1, (currentPage < (limit - 1)) ? 1 : (end - limit) + 1);

    for (let i = start; i <= end; i += 1) {
      pages.push({
        number: i,
      });
    }
    return pages;
  }
  return null;
};

/**
 * With the supplied total number of pages, total number of items and the
 * session via the req scope, return an object containing metadata to be used
 * by the pagination templates, containing information such as previous or next
 * page numbers, what numbers should be displayed,
 * @param {Object} req 
 * @param {Number} totalPages 
 * @param {Number} totalItems 
 */
const build = (req, totalPages, totalItems) => {
  logger.debug('Entering the pagination module');

  const pathName = url.parse(req.originalUrl).pathname;
  const currentPage = getCurrentPage(req, pathName);

  if (totalPages === 0) {
    // In a future user story, the entire table will be hidden if there are no
    // results, so this could readily return nothing.
    logger.debug('No results detected');

    return {
      startItem: 0,
      previous: '0',
      hasNext: false,
      next: '0',
      endItem: 0,
      currentPage,
      totalItems,
      items: [],
    };
  }

  // If the page defined by the query is greater than the total available
  // pages, then gracefully go to the last page, this is expected to be handled
  // by the calling page, a redirect back to the page with the newly stored
  // page should suffice
  if (totalPages < currentPage) {
    setCurrentPage(req, pathName, totalPages);
    logger.debug(`Page has been set to ${totalPages}`);
    throw totalPages;
  }

  const startItem = ((currentPage - 1) * 5) + 1;
  const endItem = Math.min((startItem - 1) + 5, totalItems);
  const items = getPages(3, totalPages, currentPage);

  logger.debug(JSON.stringify(items));
  logger.debug(JSON.stringify(hasNextPages(currentPage, totalPages)));

  logger.debug('HREFs:');
  logger.debug(currentPage - 1);
  logger.debug(currentPage + 1);

  return {
    startItem,
    previous: currentPage - 1,
    hasNext: hasNextPages(currentPage, totalPages),
    next: currentPage + 1,
    endItem,
    currentPage,
    totalItems,
    items,
  };
};

exports.getCurrentPage = getCurrentPage;
exports.setCurrentPage = setCurrentPage;
exports.build = build;
