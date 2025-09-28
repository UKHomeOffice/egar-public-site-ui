import csurf from 'csurf';

let secureFlag = false;
if (process.env.COOKIE_SECURE_FLAG === 'true') {
  secureFlag = true;
}

export default (req, res, next) => {
  csurf(
    {
      cookie: {
        httpOnly: true,
        secure: secureFlag,
      },
    },
  );
  next();
};
