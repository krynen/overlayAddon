/* 모듈 내부데이터 설정 */
var config = null;            // load()를 통해 uniformData와 연결


/* 모듈 내부데이터 설정 */
var config = null;


/* 데이터 기본값 */
var data = {
  "file" : {},
  "list" : {}
};


/* 모듈 메서드 정의 */
var method = {
  load  : function(uniformData) {
    config = uniformData.config.data.message.orimg;
    
    var key = "message.orimg.data.file";
    var lifetime = uniformData.config.data.api.session.timeout;
    uniformData.api.method.load(key, config.uri, lifetime, null, function(storage) {
      if (storage) { data.file = storage; }
      var prefix = "";
      if (data.file.uriPrefix) {
        prefix += data.file.uriPrefix;
        if (prefix>0 && prefix[prefix.length-1] != "/") { preifx += "/"; }
      }
      
      if (Array.isArray(data.file.images)) {
        data.file.images.forEach( function(el) {
          data.list[el.name] = { uri:prefix+el.uri, method:"normal" };
          if (Array.isArray(el.alias)) {
            el.alias.forEach( function(al) {
              data.list[al] = { uri:prefix+el.uri, method:"normal" };
            } );
          }
        } );
      }
      if (data.file.groups) {
        data.file.groups.forEach( function(el) {
          if (el.method == "none") { return; }
          var obj = { uri:[], method:el.method };
          
          if (el.list) {
            el.list.forEach( function(name) {
              obj.uri.push(data.list[name].uri);
            } );
          }
          if (el.rule) {
            var regExp = new RegExp(el.rule);
            Object.keys(data.list).forEach( function(key) {
              if (key.match(regExp) && data.list[key].method=="normal") {
                obj.uri.push(data.list[key].uri);
              }
            } );
          }
          
          if (obj.uri.length > 0) {
            data.list[el.name] = obj;
          }
        } );
      }
    } );
  },
  get   : function(object, processes) {
    /* 각 이미지 어절을 추출 */
    var list = [];
    object.text.forEach( function(el, ind, arr) {
      if (processes[ind] != undefined) { return; }    // 이미 처리된 어절 스킵
      if (el.indexOf(config.prefix) != 0) { return; } // 프리픽스가 사용되지 않은 어절 스킵
      
      var name = el.split(config.prefix);             // 이미지 이름
      name.shift();
      name = name.join("");
      if (data.list[name]) {
        list.push( {
          index  : ind,
          name   : name,
          uri    : data.list[name].uri,
          method : data.list[name].method
        } );
      }
    } );
      
    /* 인덱스와 이름, uri의 목록을 반환 */
    if (list.length != 0) { return list; }
    else                  { return null; }
  }
};


/* 정의된 엘리먼트 적용 */
module.exports = new function() {
  this.method = method;
  this.data = data;

  return this;
}();