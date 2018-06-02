/* 데이터 기본값(기본 설정) */
var data = {
  "channel" : null,             // config 모듈의 데이터 channel.name을 대체
  "config"  : null              // config 모듈의 내부데이터 uri를 대체
};


/* 모듈 메서드 정의 */
var method = {
  load : function(uniformData) {
    var uri = location.href.split("?");
    if (uri.length <= 1) { return; }
    
    uri = uri[uri.length-1].split("&");
    
    uniformData.uri.data = uri.reduce( function(obj, param) {
      param = param.split("=");
      if (param.length == 2) { obj[param[0]] = param[1]; }
      return obj;
    }, {});
  }
};


/* 정의된 엘리먼트 적용 */
module.exports = new function() {
  this.method = method;
  this.data = data;

  return this;
}();