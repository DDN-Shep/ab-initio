'use strict';

let express = require('express'),
    favicon = require('serve-favicon'),
    fs = require('fs'),
    path = require('path'),
    spdy = require('spdy');

module.exports = ((app) => {
  let client = path.join(__dirname, '/client'),
      icon = path.join(client, '/favicon.ico'),
      index = path.join(client, '/index.html'),
      port = process.env.PORT || 1337;

  app.use(favicon(icon));
  app.use(express.static(client));

  app.get('*', (req, res) => {
    res.sendFile(index);
  });

  app.set('port', port);

  const options = {
      key: fs.readFileSync(path.join(__dirname, '/server.key')),
      cert:  fs.readFileSync(path.join(__dirname, '/server.crt'))
  }

  let server = spdy.createServer(options, app).listen(port, (error) => {
    if (error) {
      console.error(error)

      return process.exit(1);
    }

    console.log('Server listening on port %s', port);
  });

  return {
    app: app,
    server: server
  };
})(express());