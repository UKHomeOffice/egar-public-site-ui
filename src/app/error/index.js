// Npm dependencies
const express = require('express');

// Initialisation
const router = new express.Router();

router.get('/error/404', (req, res) => {
  res.status(404);
  res.render('app/error/404');
});

router.get('/error/503', (req, res) => {
  res.status(503);
  res.render('app/error/503');
});

// Export
module.exports = { router };
