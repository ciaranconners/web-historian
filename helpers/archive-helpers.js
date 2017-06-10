var fs = require('fs');
var path = require('path');
var _ = require('underscore');
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

var readSitesList = function (callback) {
  readFile(exports.paths.list, (data) => {
    callback(data.split('\n').map((curFile) => {
      var last5 = curFile.slice(0, -5);
      //console.log('last5: ',last5);
      if (last5 === '.html') {
        //console.log('slicing html: ',curFile);
        return curFile.slice(0, curFile.length - 5);
      } else {
        //console.log('NOT slicing html: ',curFile);
        return curFile;
      }
    }));
  });
};

exports.getRootURL = function(req, res) {
  readFile(exports.paths.siteAssets + '/index.html', (data) => {
    //console.log('getting root');
    //console.log(data);
    readSitesList((sites) => {
      var bodyEndsAt = data.indexOf('</body>');
      var linksString = sites.map((cur) => {
        return '<a href="/' + cur + '">' + cur + '</a><br />\n';
      });
      var newData = data.slice(0, bodyEndsAt) + linksString + data.slice(bodyEndsAt);
      //call readSitesList
      // on callback: edit data to insert a string of links based on the sites array
      // loop through sites array
      //<a href='../archives/sites/' + curSite + '></a><br />'
      res.end(newData);
    });
  });
};

exports.getStyles = function(req, res) {
  readFile(exports.paths.siteAssets + '/styles.css', (data) => {
    res.end(data);
  });
};

exports.getSite = function(req, res) {
  var parsedQuery = querystring.parse(req.url);
  var readPath = exports.paths.archivedSites + '/' + parsedQuery.url;
  readFile(readPath, (data) => {
    res.end(data);
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
        console.log('isInList');
        exports.isUrlArchived(parsedInputMessage.url, function(isArchived) {
          if (isArchived) {
            //if it is, try and load it
            var readPath = exports.paths.archivedSites + '/' + parsedInputMessage.url;
          } else {
            //read loading.html and return it
            var readPath = exports.paths.siteAssets + '/loading.html';
          }
          readFile(readPath, (data) => {
            res.end(data);
          });
        });
      } else {
        //if it isn't, call addUrlTolist
        console.log('isNotInList');
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



exports.readListOfUrls = function(callback) {
  readSitesList(function(data) {
    callback(data);
  });
};

exports.isUrlInList = function(url, callback) {
  exports.readListOfUrls(function(data) {
    // console.log('checking list of urls', data, url, data.includes(url));
    callback(data.includes(url));
  });
};

exports.addUrlToList = function(url, callback) {
  //assumes that it is not already in the list
  console.log('adding url to list: ', url);
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
          console.log('finished writing file: ', trimmedUrl);
          callback(trimmedUrl);
        }
      });
    });
  });
};

exports.downloadUrls = function(urls) {
  for (var i = 0; i < urls.length; i++) {
    //console.log('attempting to fetch: ', urls[i]);
    //TODO: sanitize the URL
    exports.downloadUrl('http://' + urls[i], (url) => {
      //exports.addUrlToList(url);
    });
  }
};
