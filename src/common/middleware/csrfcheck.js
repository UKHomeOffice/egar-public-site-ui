const noCache = require('../utils/no-cache');
const { canSkipCsrfGeneration } = require('../utils/utils');
const _ = require('lodash');

module.exports = (req, res, next) => {
  noCache(res);

  if (canSkipCsrfGeneration(req)) {
    return next();
  }

  const token = req.csrfToken();

  // Previously, local development required the disabling of CSRF token handling
  // The below adds the csrfToken to the res.render function which should hopefully
  // allow for local development without this hack
  const _render = res.render;
  res.render = function (view, options, fn) {
    _.extend(options, { csrfToken: token });
    _render.call(this, view, options, fn);
  };

  return next();
};
