var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var HTMLFetch = require('../workers/htmlfetcher');



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

exports.getRootURL = function(req, res) {
  fs.readFile(exports.paths.siteAssets + '/index.html', (err, data) => {
    if (err) { throw err; }
    console.log(data);
    res.end(data);
  });
};

exports.getStyles = function(req, res) {
  fs.readFile(exports.paths.siteAssets + '/styles.css', (err, data) => {
    if (err) { throw err; }
    console.log(data);
    res.end(data);
  });
};

exports.getGoogle = function(req, res) {
  fs.readFile(exports.paths.siteAssets + '/index.html', (err, data) => {
    if (err) { throw err; }
    console.log('get request for www.google.com');
    res.end('you asked for google');
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
  fs.readFile(exports.paths.list, 'utf8', (err, data) => {
    if (err) { throw err; }
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

exports.isUrlArchived = function(url, callback) {
  fs.readdir(exports.paths.archivedSites, function(err, files) {
    if (err) { throw err; }
    callback(files.includes(url));
  });
};

exports.downloadUrls = function(urls) {
  for (var i = 0; i < urls.length; i++) {
    console.log('attempting to fetch: ',urls[i]);
    //TODO: sanitize the URL
    HTMLFetch.fetcher('http://' + urls[i], (url) => {
      exports.addUrlToList(url);
    });
  }
};
