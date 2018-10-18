(function() {
  var key = "data/config/" + (document.scripts.length - 1);
  var value = {"Message":{"Orimg":{"Groups":{"type":"replace","value":[]},"Images":{"type":"replace","value":[]},"Prefix":"~","UriBase":"dat/orimgs/"}}};
  sessionStorage.setItem(key, JSON.stringify(value));
})();