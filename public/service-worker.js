//service worker runs before the window object is created
//self refers to the service worker object here
const APP_PREFIX = "Buget-tracker-";
const VERSION = "version_01";
const CACHE_NAME = APP_PREFIX + VERSION;
const FILES_TO_CACHE = [
  "./index.html",
  "./js/idb.js",
  "./js/index.js",
  "./css/styles.css",
];

self.addEventListener("install", function (e) {
  //dont terminate the service working untill the installing phase is complete
  //wait untill waits for a promise
  e.waitUntil(
    //open our budget tracker cache
    caches.open(CACHE_NAME).then(function (cache) {
      //add all the files to the cache
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

//listen for the activate event on the service worker
self.addEventListener("activate", function (e) {
  e.waitUntil(
    //keys() returns an array of cache names storing them in keylist
    caches.keys().then(function (keyList) {
      //we filter by app prefix because we want the current apps files
      let cacheKeepList = keyList.filter(function (key) {
        return key.indexOf(APP_PREFIX);
      });
      // push the cache name
      cacheKeepList.push(CACHE_NAME);

      //delete all old versions of the cache
      return Promise.all(
        keyList.map(function (key, i) {
          if (cacheKeepList.indexOf(key) === -1) {
            return caches.delete(keyList[i]);
          }
        })
      );
    })
  );
});

//listen for a fetch request
self.addEventListener("fetch", function (e) {
  e.respondWith(
    caches.match(e.request).then(function (request) {
      if (request) {
        return request;
      } else {
        return fetch(e.request);
        //saveRecord(request)
      }
    })
  );
});
