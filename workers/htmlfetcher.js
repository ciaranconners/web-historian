// Use the code in `archive-helpers.js` to actually download the urls
// that are waiting.
var archive = require('../helpers/archive-helpers');
var http = require('http');
var fs = require('fs');

exports.fetcher = function(url, callback) {
  var sitesFolder = archive.paths.archivedSites;
  http.get(url, (res) => {
    var body = '';
    res.on('data', (chunk) => { body += chunk; });
    res.on('end', () => {
      url = url.slice(7);
      fs.writeFile(sitesFolder + '/' + url, body, (err) => {
        if (err) { throw err; }
        if (callback) {
          console.log('finished writing file: ',url);
          callback(url);
        }
      });
    });
  });
};