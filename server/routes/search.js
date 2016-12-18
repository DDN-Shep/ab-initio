'use strict';

let express = require('express');

module.exports = ((router) => {
  router.get('/', (req, res, next) => {
    res.render('pages/search');
  });

  return router;
})(express.Router());