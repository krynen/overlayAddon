module.exports = function(uniformData) {
  return new (function() {
    /* 필드 초기화 */
    this.connect = function() {};
    this.response = function() {};
    this.ws = {};
    
    var CRLF = String.fromCharCode(13) + String.fromCharCode(10);
    var response = this.response;
    var ws = this.ws;
    
    this.connect = function() {
      /* 데이터 로드 */
      var channel = "";
      var data = {};
      try { channel = uniformData.data.config.channel; }
      catch(event) { throw ["loadConfigFail", "Error"]; }
      try { data = uniformData.data.module.irc; }
      catch(event) { throw ["loadDataFail", "Error"]; }
      
      /* 메세지 모듈 로드 */
      var message = {};
      try { message = uniformData.objs.message; }
      catch(event) { throw ["loadModuleMessageFail", "Error"]; }
      
      /* 채널 이름 예외처리 */
      if (channel==null || channel.match(/^[A-Za-z0-9_]+$/)==null) { throw ["ircWrongChannel", "Error"]; }
      
      /* 웹소켓을 열고 초기 발신 메세지를 설정 */
      try { ws = new WebSocket(data.uri); }
      catch(event) { throw ["ircConnectFail", "Error", event.message]; }
      ws.onopen = function() {
        ws.send("PASS " + data.pass + CRLF);
        ws.send("NICK " + data.nick + CRLF);
        ws.send("CAP REQ :" + data.capabilities.join(" ") + CRLF);
        ws.send("JOIN #" + channel + CRLF);
      };
      
      /* 메세지 수신부 설정 */
      ws.onmessage = function(event) {
        var lines = event.data.toString().split(/\r\n|\r|\n/);
        if (lines[lines.length-1].length == 0) { lines.pop(); }
        lines.forEach( function(line) { response(line); } );
      };
      
      /* 브라우저가 켜져 있는 동안 항시 접속을 유지하므로,
         비정상적으로 연결이 해제되었을 경우엔 예외처리 */
      ws.onclose = function(event) {
        throw ["ircClosed", "Error", "error code "+event.code];
      };
    };
    
    this.response = function(line) {
      var arguments = line.split(/\s/);
      
      /* PING-PONG을 통한 접속 유지 */
      if (arguments[0].toLowerCase() == "ping") {
        ws.send("PONG" + CRLF);
      }
      
      /*
          PING 이외의 메세지에 대한 반응 추가해야 함
      */
    };
    
    return this;
  })();
};