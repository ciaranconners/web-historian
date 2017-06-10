// Use the code in `archive-helpers.js` to actually download the urls
// that are waiting.
var archive = require('../helpers/archive-helpers');

exports.fetcher = function() {
  archive.readListOfUrls((sitesListUrls) => {
    archive.getArchivedUrls((archivedUrls) => {
      archive.downloadUrls(sitesListUrls.reduce(function(uniqueUrls, cur, index, array) {
        if (!archivedUrls.contains(cur)) {
          uniqueUrls.push(cur);
        }
        return uniqueUrls;
      }, [])
      );
    });
  });
};

