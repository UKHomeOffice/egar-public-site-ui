// Npm dependencies
const express = require('express');

// Initialisation
const router = new express.Router();

router.get('/error/404', (_req, res) => {
  res.status(404);
  res.render('app/error/404');
});

router.get('/error/503', (_req, res) => {
  res.status(503);
  res.render('app/error/503');
});

router.get('/error/inviteExpiredError', (_req, res) => {
  res.status(410);
  res.render('app/error/inviteExpiredError');
});

router.get('/error/oneLoginServiceError', (_req, res) => {
  res.status(410);
  res.render('app/error/oneLoginServiceError');
});

router.get('/error/loginError', (_req, res) => {
  // res.status(410)
  res.render('app/error/loginError');
});

// Export
module.exports = { router };
