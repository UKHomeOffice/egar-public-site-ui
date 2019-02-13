const express = require('express');
const app = express;
const csurf = require('csurf');
module.exports = (req, res, next) => {
     let csrf = csurf({cookie: {
        httpOnly: true,
        secure: true
      }});
    next();
}