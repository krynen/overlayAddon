module.exports = function(uniformData) {
  return new (function() {
    this.channel = {
      id        : null            // irc 접속으로 재정의
    };
    
    this.badges = {
      uris      : [
        "https://badges.twitch.tv/v1/badges/global/display",
        "https://badges.twitch.tv/v1/badges/channels/{channel}/display"
      ],
      load      : function() {},  // loadBadges(uri)로 재정의
      list      : {}
    };
    
    var loadBadges = (function(uri) {
      var list = {};
      
      uri = Array.prototype.concat(uri, this.badges.uris).filter( function(el, ind, arr) {
        return (el) && (arr.indexOf(el) == ind);
      } );
      uri.forEach( function(el) {
        el = el.replace("{channel}", this.channel.id);
        var storageKey = "message."+el.split(/v\d\//)[1].split("/display")[0].replace("/",".");
        var storage = JSON.parse(sessionStorage.getItem(storageKey));
        
        if(storage) {
          storage = storage["badge_sets"];
          Object.keys(storage).forEach( function(key) {
            if (list[key]) { Object.assign(list[key].versions, storage[key].versions); }
            else { list[key] = storage[key]; }
          } );
        } else {
          var request = new XMLHttpRequest();
          request.open("GET", el);
          request.onreadystatechange = function(evt) {
            if (evt.target.readyState == 4) {
              if (evt.target.status == 200) {
                var storage = JSON.parse(evt.target.responseText)["badge_sets"];
                Object.keys(storage).forEach( function(key) {
                  if (list[key]) { Object.assign(list[key].versions, storage[key].versions); }
                  else { list[key] = storage[key]; }
                } );
                sessionStorage.setItem(storageKey, evt.target.responseText);
              } else { throw["loadApiFail", "badges"]; }
            }
          };
          request.onerror = function() { uniformData.error("loadApiFail", "뱃지"); };
          request.send();
        }
      }, this);      
      return list;
    }).bind(this);
    this.badges.load = loadBadges;
    
    this.loadApi = function(type, uri) {
      switch(type) {
        case "badges":
          this.badges.list = loadBadges(uri);
          break;
          
        case "all":
        default :
          this.badges.list = loadBadges(uri);
      }
    };
    
    return this;
  })();
};