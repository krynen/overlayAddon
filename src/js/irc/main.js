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
      
      /* 채널 아이디 초기화 */
      uniformData.data.shared.channel.id = null;
      
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
      
      /* IRC 기본 프로토콜을 포함한, :로 시작하는 메세지 처리 */
      else if (arguments[0][0] == ":") {
        arguments[0] = arguments[0].substring(1);

        var name = arguments[0].split("!")[0];
        
        switch (arguments[1]) {
        default:
          throw ["ircWrongMessage", arguments[1]];
        }
      }
      
      /* Twitch-specific commands를 포함한, @로 시작하는 메세지 처리 */
      else if (arguments[0][0] == "@") {
        arguments.removePrefix = function(num) {
          for (var i=0; i<num; ++i) { this.shift(); }
          this[0] = this[0].replace(/^:/, "");
        };
        
        var subArguments = (function(args) {
          var ret = [];
          args.forEach( function(el) {
            var kv = el.split("=");
            ret[kv[0]] = kv[1];
          } );
          return ret;
        })(arguments.shift().substring(1).split(";"));
        
        var message = setSubArgs(subArguments);
        
        switch (arguments[1]) {
        case "ROOMSTATE":                     // 채널 접속 및 방 상태 변경 등 여러 상황에서 호출
          if (!uniformData.data.shared.channel.id && subArguments["room-id"]) {
            uniformData.data.shared.channel.id = Number(subArguments["room-id"]);
          }
          break;
          
        case "PRIVMSG":                       // 일반 메세지 수신
          arguments.removePrefix(3);
          Object.assign(message, {
            text : arguments.join(" ")
          } );
          uniformData.objs.message.add(message);
          break;
          
        default:
          throw ["ircWrongMessage", arguments[1]];
        }
      }
      
      else {
        throw ["ircWrongMessage", line];
      }
    };
    
    return this;
  })();
};

var setSubArgs = function(subArguments) {
  var ret = {};
  
  ret.name = subArguments["display-name"];
  ret.badges = subArguments["badges"];
  if (ret.badges && ret.badges.length>0) { ret.badges = ret.badges.split(","); }
  else                                   { ret.badges = [] }
  
  return ret;
}