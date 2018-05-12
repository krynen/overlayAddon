module.exports = function(uniformData) {
  return new (function() {
    /* 필드 초기화 */
    uniformData.objs.event.init(this);
    this.connect = function() {};
    this.response = function(line) {};
    this.ws = {};
    
    var CRLF = String.fromCharCode(13) + String.fromCharCode(10);
    
    this.connect = function() {
      /* 데이터 로드 */
      var channel = "";
      var data = {};
      try { channel = uniformData.data.config.contents.channel; }
      catch(event) { uniformData.error("loadConfigFail"); return; }
      try { data = uniformData.data.module.irc; }
      catch(event) { uniformData.error("loadDataFail", "IRC"); return; }
      
      /* 메세지 모듈 로드 */
      var message = {};
      try { message = uniformData.objs.message; }
      catch(event) { uniformData.error("loadModuleFail", "메세지"); return; }
      
      /* 채널 이름 예외처리 */
      if (channel==null || channel.match(/^[A-Za-z0-9_]+$/)==null) {
        uniformData.error("ircWrongChannel"); return;
      }
      
      /* 채널 아이디 초기화 */
      uniformData.data.shared.channel.id = null;
      
      /* 웹소켓을 열고 초기 발신 메세지를 설정 */
      try { this.ws = new WebSocket(data.uri); }
      catch(event) { uniformData.error("ircConnectFail", event.message); return; }
      this.ws.onopen = function() {
        this.send("PASS " + data.pass + CRLF);
        this.send("NICK " + data.nick + CRLF);
        this.send("CAP REQ :" + data.capabilities.join(" ") + CRLF);
        this.send("JOIN #" + channel + CRLF);
      };
      
      /* 메세지 수신부 설정 */
      this.ws.onmessage = (function(event) {
        var lines = event.data.toString().split(/\r\n|\r|\n/);
        lines.forEach( function(line) {
          if (!line.match(/^[\s]*$/)) { this.response(line); }
        }, this);
      }).bind(this);
      
      /* 브라우저가 켜져 있는 동안 항시 접속을 유지하므로,
         비정상적으로 연결이 해제되었을 경우 */
      this.ws.onclose = function(event) {
        uniformData.error("ircClosed", event.code);
        this.connect();
      }.bind(this);
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
        var text = arguments.join(" ").split(":")[1];
        
        switch (arguments[1]) {
        case "001":
        case "002":
        case "003":
        case "004":
        case "375":
        case "372":
        case "376": 
        case "CAP":
        case "366":                           // 접속시 고정 표시 메세지
        case "JOIN":
        case "PART":                          // 유저의 참가 및 퇴장
        case "MODE":                          // 참가 및 퇴장 유저가 매니저인 경우
        case "353":                           // 접속시 유저 목록
        case "HOSTTARGET":                    // 타 채널로 호스팅(중계)
          break;
          
        case "NOTICE":                        // 트위치 서버 문제로 접속이 불가능할 경우(Error logging in)
          uniformData.error("ircNotice", text);
          break;
          
        default:
          uniformData.error("ircWrongMessage", arguments[1]);
          break;
        }
      }
      
      /* Twitch-specific commands를 포함한, @로 시작하는 메세지 처리 */
      else if (arguments[0][0] == "@") {
        arguments.removePrefix = function(num) {
          for (var i=0; i<num; ++i) { this.shift(); }
          if(this.length != 0) { this[0] = this[0].replace(/^:/, ""); }
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
        case "ROOMSTATE":                     // 채널 접속 및 방 상태 변경 등
          if (!uniformData.data.shared.channel.id && subArguments["room-id"]) {
            uniformData.data.shared.channel.id = Number(subArguments["room-id"]);
            this.dispatchEvent(new Event("connect"));
          }
          break;
          
        case "PRIVMSG":                       // 일반 메세지 수신
          arguments.removePrefix(3);
          message.text = arguments.join(" ");
          uniformData.objs.message.add(message);
          break;
          
        case "CLEARCHAT":
          break;
          
        case "USERNOTICE":                    // 유저 구독 등
          switch(subArguments["msg-id"]) {
          case "sub":
          case "resub":                       // 구독 및 재구독(2개월 이상 연속구독)
            message.type = "sub";
            arguments.removePrefix(3);
            message.text = arguments.join(" ");
            uniformData.objs.message.add(message);
            break;
            
          case "subgift":
            message.type = "subgift";
            message.target = subArguments["msg-param-recipient-display-name"];
            message.text = "";
            uniformData.objs.message.add(message);
            break;
            
          case "raid":                        // 타 채널의 레이드(채팅을 포함한 호스팅)
            message.type = "raid";
            message.text = "";
            uniformData.objs.message.add(message);
            break;
            
          
          default:
            arguments.removePrefix(3);
            uniformData.error("ircWrongMessage", arguments.join(" "));
            break;
          }
          break;
          
        case "NOTICE":                        // 방 상태 변경
          switch(subArguments["msg-id"]) {
          case "subs_on":                       // 구독자 전용 채팅 모드
          case "subs_off":
          case "host_on":
          case "host_target_went_offline":
          case "host_off":                      // 타 채널 호스팅
          case "emote_only_on":                 // 이모티콘 채팅만 허용
          case "emote_only_off":
          case "slow_on":                       // 채팅 딜레이 모드
          case "slow_off":
            break;
            
          default:
            arguments.removePrefix(3);
            uniformData.error("ircWrongMessage", arguments.join(" "));
            break;
          }
          break;
          
        default:
          uniformData.error("ircWrongMessage", arguments[1]);
          break;
        }
      }
      
      else {
        uniformData.error("ircWrongMessage", line);
      }
    };
    
    return this;
  })();
};

var setSubArgs = function(subArguments) {
  var ret = {};
  
  ret.id = subArguments["user-id"];
  ret.name = subArguments["display-name"];
  ret.badges = subArguments["badges"];
  if (ret.badges && ret.badges.length>0) { ret.badges = ret.badges.split(","); }
  else                                   { ret.badges = [] }
  
  return ret;
}