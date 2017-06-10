// Use the code in `archive-helpers.js` to actually download the urls
// that are waiting.
var archive = require('../helpers/archive-helpers');

var fetcher = function() {
  archive.readListOfUrls((sitesListUrls) => {
    //exclude the extra empty string that is returned because all files have a new line @ end of file
    sitesListUrls = sitesListUrls.filter(function(cur) {
      if (cur !== '') {
        return true;
      } else {
        return false;
      }
    });
    //console.log('siteslisturls length', sitesListUrls, sitesListUrls.length);
    archive.getArchivedUrls((archivedUrls) => {
      archive.downloadUrls(sitesListUrls.reduce(function(uniqueUrls, cur, index, array) {
        if (!archivedUrls.includes(cur)) {
          uniqueUrls.push(cur);
        }
        return uniqueUrls;
      }, [])
      );
    });
  });
};

fetcher();