module.exports = function(uniformData) {
  return new (function() {
    /* 필드 초기화 */
    this.connect = function() {};
    this.response = function(line) {};
    this.ws = {};
    
    var CRLF = String.fromCharCode(13) + String.fromCharCode(10);
    
    this.connect = function() {
      /* 데이터 로드 */
      var channel = "";
      var data = {};
      try { channel = uniformData.data.config.channel; }
      catch(event) { throw ["loadConfigFail"]; }
      try { data = uniformData.data.module.irc; }
      catch(event) { throw ["loadDataFail"]; }
      
      /* 메세지 모듈 로드 */
      var message = {};
      try { message = uniformData.objs.message; }
      catch(event) { throw ["loadModuleMessageFail"]; }
      
      /* 채널 이름 예외처리 */
      if (channel==null || channel.match(/^[A-Za-z0-9_]+$/)==null) { throw ["ircWrongChannel"]; }
      
      /* 웹소켓을 열고 초기 발신 메세지를 설정 */
      try { this.ws = new WebSocket(data.uri); }
      catch(event) { throw ["ircConnectFail", event.message]; }
      this.ws.onopen = function() {
        this.send("PASS " + data.pass + CRLF);
        this.send("NICK " + data.nick + CRLF);
        this.send("CAP REQ :" + data.capabilities.join(" ") + CRLF);
        this.send("JOIN #" + channel + CRLF);
      };
      
      /* 메세지 수신부 설정 */
      this.ws.onmessage = (function(event) {
        var lines = event.data.toString().split(/\r\n|\r|\n/);
        if (lines[lines.length-1].length == 0) { lines.pop(); }
        lines.forEach( function(line) { this.response(line); }, this);
      }).bind(this);
      
      /* 브라우저가 켜져 있는 동안 항시 접속을 유지하므로,
         비정상적으로 연결이 해제되었을 경우엔 예외처리 */
      this.ws.onclose = function(event) {
        throw ["ircClosed", event.code];
      };
    };
    
    this.response = function(line) {
      var arguments = line.split(/\s/);
      
      /* PING-PONG을 통한 접속 유지 */
      if (arguments[0] == "PING") {
        this.ws.send("PONG" + CRLF);
      }
      
      else if (arguments[0][0] == ":") {
      }
      
      else if (arguments[0][0] == "@") {
      }
      
      else {
        throw ["ircWrongMessage"];
      }
    };
    
    return this;
  })();
};