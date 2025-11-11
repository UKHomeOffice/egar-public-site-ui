const bodyParser = require('body-parser');

module.exports = (_req, _res, next) => {
  bodyParser.urlencoded({ extended: false });
  next();
};
