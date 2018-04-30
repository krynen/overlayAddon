module.exports = function(uniformData) {
  return new (function() {
    this.channel = "ninja";
    
    this.debugText = {
      "loadApiFail"     : "{1} API를 불러올 수 없었습니다.",
      "loadDataFail"    : "{1} 데이터를 불러올 수 없었습니다.",
      "loadModuleFail"  : "{1} 모듈을 불러올 수 없었습니다.",
      
      "ircWrongMessage" : "처리되지 않은 메세지입니다.\n{1}",
      "ircNotice"       : "트위치 : {1}",
      "ircClosed"       : "서버와의 접속이 종료되었습니다.\n 에러코드 {1}",
      "ircConnectFail"  : "서버와의 접속에 실패했습니다.\n{1}",
      "ircWrongChannel" : "채널 접속에 실패했습니다."
    };
    
    return this;
  })();
};