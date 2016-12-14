'use strict';

let express = require('express');

module.exports = ((router) => {
  router.get('/', (req, res, next) => {
  console.log('search');
    res.render('pages/index');
  });

  return router;
})(express.Router());