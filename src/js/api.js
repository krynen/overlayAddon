/* 내부 메서드 정의 */
var method = {
  load : function(key, uri, lifetime, callback) {
    var storage = sessionStorage.getItem(key);
    
    if (storage && storage!="") {
      callback(JSON.parse(storage));
    } else {
      var request = new XMLHttpRequest();
      request.open("GET", uri);
      
      request.onreadystatechange = (function(evt) {
        if (evt.target.readyState == 4) {
          if ((evt.target.status==200) || (evt.target.status==0&&evt.target.responseText)) {
            var storage = evt.target.responseText;
            sessionStorage.setItem(key, storage);
            
            if (lifetime > 0) {
              var timeout = setTimeout(function() {
                clearTimeout(timeout);
                sessionStorage.removeItem(key);
              }, lifetime*1000);
            }
            
            callback(JSON.parse(storage));
          }
        }
      });
      
      request.onerror = function() { callback(null); }
      request.send();
    }
  }
};


/* 정의된 엘리먼트 적용 */
module.exports = new function() {
  this.method = method;
  
  return this;
}();