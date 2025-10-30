const csurf = require('csurf');

let secureFlag = false;
if (process.env.COOKIE_SECURE_FLAG === 'true') {
  secureFlag = true;
}
module.exports = (req, res, next) => {
  csurf({
    cookie: {
      httpOnly: true,
      secure: secureFlag,
    },
  });
  next();
};
