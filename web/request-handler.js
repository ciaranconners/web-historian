var path = require('path');
var archive = require('../helpers/archive-helpers');
// require more modules/folders here!



exports.handleRequest = function (req, res) {
  console.log('handling request: ', req.method,req.url);
  var routes = {
    'GET': {
      '/': archive.getRootURL,
      '/styles.css': archive.getStyles,
      '/www.google.com': archive.getGoogle
    },
    'POST': {

    },
    'OPTIONS': {

    }
  };
  if (routes.hasOwnProperty(req.method) && routes[req.method].hasOwnProperty(req.url)) {
    routes[req.method][req.url](req,res);
  } else {
    //catch a 404
    res.writeHead(404);
    res.end('URL request error, not found');
  }

  //res.end(archive.paths.list);
};
