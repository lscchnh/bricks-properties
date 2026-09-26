/*
 * Runs on app.bricks.co when the user clicks the "Bricks map" bookmark.
 * It reuses the Bricks.co session (cookies) to read the user's properties, then hands them
 * to the map site through window.postMessage. Credentials never leave app.bricks.co.
 * __SITE_URL__ is replaced when the bookmark link is generated (see bookmarklet.ts).
 */
(function () {
  var SITE_URL = "__SITE_URL__";
  var API_URL = "https://api.bricks.co";
  var siteOrigin = new URL(SITE_URL).origin;

  if (location.hostname !== "app.bricks.co") {
    alert("Bricks map: open https://app.bricks.co, log in, then click this bookmark again.");
    return;
  }

  /* Must happen synchronously in the click handler, otherwise the popup gets blocked. */
  var mapWindow = window.open(SITE_URL, "bricks-properties-map");
  if (!mapWindow) {
    alert("Bricks map: the popup was blocked. Allow popups for app.bricks.co and try again.");
    return;
  }

  var mapReady = false;
  var message = null;

  function deliver() {
    if (mapReady && message) mapWindow.postMessage(message, siteOrigin);
  }

  function onMessage(event) {
    if (event.origin !== siteOrigin || event.source !== mapWindow) return;
    if (event.data && event.data.type === "bricks-map:ready") {
      mapReady = true;
      deliver();
    }
    if (event.data && event.data.type === "bricks-map:received") {
      window.removeEventListener("message", onMessage);
    }
  }
  window.addEventListener("message", onMessage);

  function getJson(path) {
    return fetch(API_URL + path, {
      credentials: "include",
      headers: { Accept: "application/json" },
    }).then(function (response) {
      if (!response.ok) {
        var error = new Error("GET " + path + " answered HTTP " + response.status);
        error.status = response.status;
        throw error;
      }
      return response.json();
    });
  }

  function unwrap(body) {
    return body && typeof body === "object" && body.data && !Array.isArray(body.data)
      ? body.data
      : body;
  }

  function listOf(body) {
    if (Array.isArray(body)) return body;
    if (body && Array.isArray(body.properties)) return body.properties;
    if (body && Array.isArray(body.data)) return body.data;
    if (body && body.data && Array.isArray(body.data.properties)) return body.data.properties;
    return [];
  }

  function isOwned(property) {
    return property && property.investorBricks && Number(property.investorBricks.owned) > 0;
  }

  /* Fetches property details a few at a time to stay gentle with the API. */
  function withDetails(properties) {
    var results = [];
    var index = 0;
    function next() {
      if (index >= properties.length) return Promise.resolve(results);
      var batch = properties.slice(index, index + 4);
      index += batch.length;
      return Promise.all(
        batch.map(function (summary) {
          return getJson("/properties/" + encodeURIComponent(summary.id))
            .then(function (details) {
              return Object.assign({}, summary, unwrap(details));
            })
            .catch(function () {
              return summary;
            });
        }),
      ).then(function (items) {
        results = results.concat(items);
        return next();
      });
    }
    return next();
  }

  getJson("/properties?take=1000&cursor=0")
    .then(function (body) {
      return withDetails(listOf(body).filter(isOwned));
    })
    .then(function (properties) {
      message = {
        type: "bricks-map:properties",
        version: 1,
        fetchedAt: new Date().toISOString(),
        properties: properties,
      };
      deliver();
    })
    .catch(function (error) {
      message = {
        type: "bricks-map:error",
        status: error.status || 0,
        message: String((error && error.message) || error),
      };
      deliver();
    });
})();
