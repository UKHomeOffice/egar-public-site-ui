const logger = require('./logger')(__filename);
const CookieModel = require('../models/Cookie.class');

/**
 * Some pages just simply create a Cookie instance of the request and render
 * the response for the given page. So this is a convenience method to perform
 * that step.
 *
 * @param {} req incoming request
 * @param {*} res outgoing response
 * @param {*} page page to render
 */
const simpleGetRender = (req, res, page) => {
  logger.info(`Rendering page ${page}`);
  const cookie = new CookieModel(req);
  res.render(page, { cookie });
};

exports.simpleGetRender = simpleGetRender;
