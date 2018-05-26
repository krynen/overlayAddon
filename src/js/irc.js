/* 모듈 내부데이터 설정 */
var ws      = null;           // 웹소켓 정의
var message = null;
var config  = null;
var shared  = null;
var irc     = null;           // load()를 통해 uniformData와 연결


/* 내부 메서드 정의 */
var send = function(txt) {    // ws.send()에 CRLF 추가
  ws.send(txt + String.fromCharCode(13) + String.fromCharCode(10));
};
var removePrefix = function(target, num) {
  target.splice(0, num);
  if (target.length != 0) { return target.join(" ").replace(/^:/, ""); }
  else { return ""; }
}

/* 모듈 메서드 정의 */
var method = {
  load       : function(uniformData) {
    message = uniformData.message.method;
    config  = uniformData.config.data;
    shared  = uniformData.shared.data;
    irc     = uniformData.irc;
  },
  connect    : function() {
    /* 채널 이름 로드 및 예외처리 */
    var channel = config.channel.name;
    if (typeof channel!="string" || channel.match(/^[A-Za-z0-9_]+$/)==null) {
      message.error("ircWrongChannel", { channel:channel });
      return;
    }

    /* 채널 아이디 데이터를 초기화 */
    shared.channel.id = null;
    
    /* 웹소켓을 열고 초기 메세지 발송 설정 */
    try { ws = new WebSocket(shared.irc.uri); }
    catch(event) {
      message.error("ircConnectFail", { error:event.message });
      return;
    }
    ws.onopen = function() {      
      send("PASS " + shared.irc.pass);
      send("NICK " + shared.irc.nick);
      send("CAP REQ :" + shared.irc.capabilities.join(" "));
      send("JOIN #" + channel);
    };
    
    ws.onmessage = function(event) {
      var lines = event.data.toString().split(/\r\n|\r|\n/);
      lines.forEach( function(line) {
        if (!line.match(/^[\s]*$/)) { irc.method.response(line); }
      } );
    };
    
    ws.onclose = function(event) { message.error("ircClosed", { error:event.code }); }
    ws.addEventListener("close", irc.method.connect);
  },
  disconnect : function() {
    if(ws.removeEventListener) {
      ws.removeEventListener("close", irc.method.connect);
    }
    if(ws.close) {
      ws.close();
    }
  },
  response   : function(line) {
    var arguments = line.split(/\s/);
    
    /* 핑퐁을 통해 접속 유지 */
    if (arguments[0] == "PING") {
      send("PONG");
      return;
    }
    
    var prefix = arguments[0][0];
    arguments[0] = arguments[0].substring(1);
    
    /* 첫글자가 :인 IRC 기본 프로토콜을 포함한 메세지 */
    if (prefix == ":") {
      switch(arguments[1]) {
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
        uniformData.error("ircNotice", { error:text });
        break;
        
      default:
        uniformData.error("ircWrongMessage", { notice:arguments[1] });
        break;
      }
      
      return;
    }
    
    /* 첫글자가 @인 Twitch-specific commands를 포함한 메세지 */
    if (prefix == "@") {
      subArgs = arguments.shift().split(";");
      for(var i=subArgs.length-1; i>=0; --i) {
        subArgs[subArgs[i].split("=")[0]] = subArgs[i].split("=")[1];
        subArgs.splice(i);
      }
      subArgs = Object.assign({}, subArgs);

      var object = {
        id     : subArgs["user-id"],
        name   : subArgs["display-name"],
        badges : subArgs["badges"],
        color  : subArgs["color"]
      };
      if ((object.badges||{}).length||0 > 0) { object.badges = object.badges.split(","); }
      else                                   { object.badges = [] }
      
      switch(arguments[1]) {
      case "ROOMSTATE":                     // 채널 접속 및 방 상태 변경 등
        /* 해당 메세지로 첫 접속을 감지 */
        if (!shared.channel.id && subArgs["room-id"]) {
          shared.channel.id = Number(subArgs["room-id"]);
          irc.dispatchEvent(new Event("connect"));
        }
        break;
        
      case "PRIVMSG":                       // 일반 메세지 수신
        object.text = removePrefix(arguments, 3);
        message.add(object);
        break;
        
      case "CLEARCHAT":
        break;
        
      case "USERNOTICE":                    // 유저 구독 등
        switch(subArgs["msg-id"]) {
          case "sub":
          case "resub":                     // 유저 구독 및 재구독(2개월 이상 연속 구독)
            object.type = "sub";
            object.month = Number(subArgs["msg-param-months"]);
            object.text = removePrefix(arguments, 3);
            message.add(object);
            break;
            
          case "subgift":                   // 타 유저의 구독 선물
            object.type = "subgift";
            object.target = subArgs["msg-param-recipient-display-name"];
            /* 구독 선물은 메세지를 추가할 수 없으므로 빈 문자열로 */
            object.text = "";
            message.add(object);
            break;
            
          case "raid":                      // 타 채널의 레이드(채팅을 포함한 호스팅)
            object.type = "raid";
            /* 레이드도 메세지를 추가할 수 없는것으로 보임 */
            object.text = "";
            message.add(object);
            break;
            
          default:
            message.error("ircWrongMessage", { error:removePrefix(arguments, 2) });
            break;
        }
        break;
        
      case "NOTICE":                        // 방 상태 변경
          switch(subArgs["msg-id"]) {
          case "subs_on":                       // 구독자 전용 채팅 모드
          case "subs_off":
          case "host_on":
          case "host_target_went_offline":
          case "host_off":                      // 타 채널을 호스팅
          case "emote_only_on":                 // 이모티콘 채팅만 허용
          case "emote_only_off":
          case "slow_on":                       // 채팅 딜레이 모드
          case "slow_off":
            break;
            
          default:
            message.error("ircWrongMessage", { error:removePrefix(arguments, 2) });
            break;
          }
          break;
        
      default:
        message.error("ircWrongMessage", { error:arguments[2] });
        break;
      }
      return;
    }
    
    message.error("ircWrongMessage", line);
  }
};


/* 정의된 엘리먼트 적용 */
module.exports = new function() {
  this.method = method;
  
  return this;
}();