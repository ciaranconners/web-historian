var path = require('path');
var archive = require('../helpers/archive-helpers');
var querystring = require('querystring');
var fs = require('fs');
// require more modules/folders here!



exports.handleRequest = function (req, res) {
  console.log('handling request: ', req.method, req.url);
  var routes = {
    'GET': {
      '/': archive.getRootURL,
      '/styles.css': archive.getStyles
    },
    'POST': {
      '/': archive.postURL
    },
    'OPTIONS': {

    }
  };
  if (req.method === 'GET') {
    if (req.url === '/') {
      archive.getRootURL(req, res);
    } else if (req.url === '/styles.css') {
      archive.getStyles(req, res);
    } else {
      console.log('calling checkURL', req.url.slice(1));
      var slicedUrl = req.url.slice(1);
      archive.isUrlArchived(slicedUrl, function(isArchived) {
        if (isArchived) {
          //if it is, try and load it
          var readPath = archive.paths.archivedSites + '/' + slicedUrl;
          fs.readFile(readPath, 'utf8', (err, data) => {
            if (err) { throw err; }
            res.end(data);
          });
        } else {
          res.writeHead(404);
          res.end('URL request error, not found');
        }
      });
    }

  } else if (req.method === 'POST') {
    archive.postURL(req, res);
  } else if (req.method === 'OPTIONS') {

  } else {
    //catch a 404
    res.writeHead(404);
    res.end('URL request error, not found');
  }

  //res.end(archive.paths.list);
};
