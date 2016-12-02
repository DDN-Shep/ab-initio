'use strict';

let express = require('express'),
    favicon = require('serve-favicon'),
    path = require('path');

module.exports = ((app) => {
  let client = path.join(__dirname, '/client'),
      icon = path.join(client, '/favicon.ico'),
      index = path.join(client, '/index.html');

  app.use(favicon(icon));
  app.use(express.static(client));

  app.get('*', (req, res) => {
    res.sendFile(index);
  });

  app.set('port', process.env.PORT || 1337);

  let server = app.listen(app.get('port'), function() {
    console.log('Server listening on port ' + server.address().port);
  });

  return {
    app: app,
    server: server
  };
})(express());
