'use strict';

let express = require('express'),
    favicon = require('serve-favicon'),
    fs = require('fs'),
    path = require('path'),
    spdy = require('spdy'),
    env = process.env.NODE_ENV || 'development',
    port = process.env.PORT || 1337;

module.exports = ((app) => {
  app.use(favicon('./client/favicon.ico'));
  app.use(express.static('./client'));

  app.set('port', port);
  app.set('views', './server/views');
  app.set('view engine', 'pug');

  const routes = {
    '/': './server/routes/search.js'
  };

  Object.keys(routes).forEach((i) => app.use(i, require(routes[i])));

  app.use((req, res, next) => {
    var error = new Error('Not Found');
    error.status = 404;
    next(error);
  });

  app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
      status: error.status,
      message: error.message
    });
  });

  const options = {
    key: fs.readFileSync(path.join('./server/certificates', env, 'server.key')),
    cert:  fs.readFileSync(path.join('./server/certificates', env, 'server.crt'))
  };

  let server = spdy.createServer(options, app).listen(port, (error) => {
    if (error) {
      console.error(error);

      return process.exit(1);
    }

    console.log('Server listening on port %s', port);
  });

  return {
    app: app,
    server: server
  };
})(express());