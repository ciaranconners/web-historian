var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var HTMLFetch = require('../workers/htmlfetcher');
var querystring = require('querystring');
var http = require('http');


/*
 * You will need to reuse the same paths many times over in the course of this sprint.
 * Consider using the `paths` object below to store frequently used file paths. This way,
 * if you move any files, you'll only need to change your code in one place! Feel free to
 * customize it in any way you wish.
 */

exports.paths = {
  siteAssets: path.join(__dirname, '../web/public'),
  archivedSites: path.join(__dirname, '../archives/sites'),
  list: path.join(__dirname, '../archives/sites.txt')
};

var readFile = function (filePath, callback) {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) { throw err; }
    callback(data);
  });
};

exports.getRootURL = function(req, res) {
  readFile(exports.paths.siteAssets + '/index.html', (data) => {
    res.end(data);
  });
};

exports.getStyles = function(req, res) {
  readFile(exports.paths.siteAssets + '/styles.css', (data) => {
    res.end(data);
  });
};

exports.getGoogle = function(req, res) {
  readFile(exports.paths.siteAssets + '/index.html', (data) => {
    res.end('you asked for google');
  });
};

exports.postURL = function(req, res) {
  var body = '';
  req.on('data', function(chunk) {
    body += chunk;
  });
  req.on('end', function() {
    if (body[0] !== '{') {
      var parsedInputMessage = querystring.parse(body);
    } else {
      var parsedInputMessage = JSON.parse(body);
    }
    //check if that url exists in sites.txt
    exports.isUrlInList(parsedInputMessage.url, function (isInList) {
      if (isInList) {
        exports.isUrlArchived(parsedInputMessage.url, function(isArchived) {
          if (isArchived) {
            //if it does, try and load it
            var readPath = exports.paths.archivedSites + parsedInputMessage.url;
          } else {
            //read loading.html and return it
            var readPath = exports.paths.siteAssets + '/loading.html';
          }
          readFile(readPath, (data) => {
            res.end(data);
          });
        });
      } else {
        //if it doesn't, call addUrlTolist
        exports.addUrlToList(parsedInputMessage.url, function() {
          res.writeHead(302);
          res.end('adding to list: ' + parsedInputMessage.url);
        });
      }
    });

  });
};

// Used for stubbing paths for tests, do not modify
exports.initialize = function(pathsObj) {
  _.each(pathsObj, function(path, type) {
    exports.paths[type] = path;
  });
};

// The following function names are provided to you to suggest how you might
// modularize your code. Keep it clean!

var readSitesList = function (callback) {
  readFile(exports.paths.list, (data) => {
    callback(data.split('\n'));
  });
};

exports.readListOfUrls = function(callback) {
  readSitesList(function(data) {
    callback(data);
  });
};

exports.isUrlInList = function(url, callback) {
  exports.readListOfUrls(function(data) {
    callback(data.includes(url));
  });
};

exports.addUrlToList = function(url, callback) {
  //assumes that it is not already in the list
  fs.appendFile(exports.paths.list, url + '\n', (err) => {
    if (err) { throw err; }
    if (callback) {
      callback();
    }
  });
};

exports.getArchivedUrls = function(callback) {
  fs.readdir(exports.paths.archivedSites, function(err, files) {
    if (err) { throw err; }
    callback(files);
  });
};

exports.isUrlArchived = function(url, callback) {
  fs.readdir(exports.paths.archivedSites, function(err, files) {
    if (err) { throw err; }
    callback(files.includes(url));
  });
};

exports.downloadUrl = function(url, callback) {
  http.get(url, (res) => {
    var body = '';
    res.on('data', (chunk) => { body += chunk; });
    res.on('end', () => {
      var trimmedUrl = url.slice(7);
      fs.writeFile(exports.paths.archivedSites + '/' + trimmedUrl, body, (err) => {
        if (err) { throw err; }
        if (typeof callback !== 'undefined') {
          console.log('finished writing file: ',trimmedUrl);
          callback(trimmedUrl);
        }
      });
    });
  });
}

exports.downloadUrls = function(urls) {
  for (var i = 0; i < urls.length; i++) {
    console.log('attempting to fetch: ',urls[i]);
    //TODO: sanitize the URL
    exports.downloadUrl('http://' + urls[i], (url) => {
      exports.addUrlToList(url);
    });
  }
};
