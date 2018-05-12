module.exports = function(uniformData) {
  return new (function() {
    uniformData.objs.event.init(this);
    this.uri = "./dat/config.json";
    this.load = function() {
      var storageKey = "data.config.contents";
      var storage = JSON.parse(sessionStorage.getItem(storageKey));
      
      if(storage) {
        /* 기본값에 불러온 값을 덮어씌움 */
        Object.assign(this.contents, storage);
        this.dispatchEvent(new Event("load"));
      }
      else {
        var request = new XMLHttpRequest();
        request.open("GET", this.uri);
        request.onreadystatechange = (function(evt) {
          if (evt.target.readyState == 4) {
            /* local uri일 경우 status==0이기 때문에 양쪽 모두 조건 처리 */
            if (evt.target.status == 200 || (evt.target.status==0&&evt.target.responseText)) {
              var storage = JSON.parse(evt.target.responseText);
              sessionStorage.setItem(storageKey, evt.target.responseText);
              var timeout = setTimeout(function() {
                clearTimeout(timeout);
                sessionStorage.removeItem(storageKey);
              }, this.contents.storageTimeout*1000);
              
              Object.assign(this.contents, storage);
              this.dispatchEvent(new Event("load"));
            }
          }
        }).bind(this);
        request.onerror = function() {
          uniformData.error("loadConfigFail", request.readyState+", "+request.status);
        };
        request.send();
      }
    };
    
    this.contents = {
      channel         : "",
      storageTimeout  : 1800, // 각 sessionStorage 유효기간
      debugText       : {
        "loadApiFail"     : "{1} API를 불러올 수 없었습니다.",
        "loadConfigFail"  : "설정을 불러오는 데 실패했습니다. 에러코드 {1}" +
                            "\n기본값을 사용합니다.",
        "loadDataFail"    : "{1} 데이터를 불러올 수 없었습니다.",
        "loadModuleFail"  : "{1} 모듈을 불러올 수 없었습니다.",
        
        "ircWrongMessage" : "처리되지 않은 메세지입니다.\n{1}",
        "ircNotice"       : "트위치 : {1}",
        "ircClosed"       : "서버와의 접속이 종료되었습니다.\n 에러코드 {1}",
        "ircConnectFail"  : "서버와의 접속에 실패했습니다.\n{1}",
        "ircWrongChannel" : "채널 접속에 실패했습니다."
      },
      customText      : {
      
      }
    };
    
    return this;
  })();
};