/*********************
 * 테스트용 IRC 모듈 *
 *                   *
 *********************/ 

// 모듈 인터페이스
var methods = {};
var data = {
  socket : null   // IRC에 접속할 웹소켓. 생성자를 사용하므로 그 전까진 참조할 수 없다
};

// 포인터 정의
var config  = null;
var shared  = null;
var message = null;


/**
 * 웹소켓에 메세지 전송
 * @param {...string} text
 */
var send = function(text) {
  for (var i=0; i<arguments.length; ++i) {
    data.socket.send(arguments[i] + "\r\n");
  };
}

/**
 * 트위치 IRC에 접속
 * 이후 onmessage 이벤트를 통해 통신
 */
methods.Connect = function() {
  // 채널이름이 제대로 되었는지 파싱
  var channel = config.Channel;
  if (typeof channel !=="string" || channel.match(/\W/) !== null) {
    message.Error("Irc_Wrong_Channel");
  }

  // 트위치 IRC서버로 접속을 시도
  try { this.socket = data.socket = new WebSocket(shared.Irc.Uri); }
  catch(err) { message.Error("Irc_Fail_Connect", err.message); return; }

  // 접속 성공시 목표 채널 참가를 시도하고 Compability를 설정
  data.socket.onopen = function() {
    // pass는 의미는 없지만 난수로. nick은 justinfan+난수로.
    // justinfan으로 접속시 게스트모드로 참여할 수 있다
    var rand = function(n) { return Math.floor(Math.random()*(`1${"0".repeat(n)}`)) };
    var pass = rand(8);
    var nick = "justinfan" + rand(5);

    send(
      `PASS ${pass}`,
      `NICK ${nick}`,
      `CAP REQ :${shared.Irc.Caps.join(" ")}`,
      `JOIN #${channel}`
    );
  };

  data.socket.onmessage = function(event) {
    event.data.toString().split(/[\r\n]+/).forEach( function(el) {
      if (!el.match(/^[\s]*$/)) { methods.Response(el); }
    } );
  };

  data.socket.onclose = function(event) {
    // 연결중이지 않을 때의 아이디는 null로 고정
    shared.Id = null;
    message.Error("Irc_Close_Connect", event.code);
  };
};

/**
 * 받은 IRC 메세지에 대응
 * @param {string} line 줄별로 나뉘어진 메세지
 */
methods.Response = function(line) {
  // 공백으로 각 구문을 구분
  var arguments = line.split(/\s/);

  // 핑에 자동응답하여 접속을 유지
  if (arguments[0] === "PING") {
    send("PONG");
    return;
  }

  // PING외의 모든 메세지는 :또는 @으로 시작하므로 구분
  var prefix = arguments[0][0];

  // IRC 기본 프로토콜 메세지 처리
  if (prefix === ":") {
    switch (arguments[1]) {
      // 접속시 고정 표시 메세지 무시
      case "001": case "002": case "003": case "004":
      case "375": case "372": case "376": case "366": case "CAP":
      
      // 유저 참가 및 퇴장 메세지 무시
      case "JOIN": case "PART":
      case "MODE": case "353" :

      // 타 채널로 호스팅 메세지 무시
      case "HOSTTARGET":
        return;

      // 트위치 내부 문제가 발생했을 때
      case "NOTICE":
        message.Error("Irc_Notice", arguments.splice(3, arguments.length).join(" ").substring(1));
        return;

      default:
        message.Error("Irc_Wrong_Message", prefix+arguments[1]);
        return;
    }
  }

  // Twitch-specific 메세지 처리
  if (prefix === "@") {
    // 메세지 데이터들을 파싱
    var subArguments = arguments.shift().substring(1).split(";").reduce( function(acc, cur) {
      var keyValue = cur.split("=");
      if (keyValue[1] !== undefined) {
        switch(keyValue[0]) {
          // 필요 없는 데이터 생략
          case "id":          // 메세지 아이디
          case "turbo":       // 트위치 터보 이용 여부
          case "tmi-sent-ts": // 메세지 타임스탬프
          case "user-type":   // 유저 타입("mod", "")
            break;

          // 뱃지 데이터 정리
          case "badges":
            if (keyValue[1] === "") { acc[keyValue[0]] = []; }
            else { acc[keyValue[0]] = keyValue[1].split(","); }
            break;

          // 채널 아이디 (첫 접속 메세지에 필요)
          case "room-id":
            if (shared.Id === null) {
              acc[keyValue[0]] = keyValue[1];
            } else {
              break;
            }

          // 특별히 처리할 필요 없는 데이터 반영
          default:
            acc[keyValue[0]] = keyValue[1];
            break;
        }
      }

      return acc;
    }, {});

    switch (arguments[1]) {
      case "ROOMSTATE":   // 채널 접속 혹은 방의 상태 변경
        if (subArguments["room-id"] !== undefined) {
          shared.Id = subArguments["room-id"];
          message.Error("Irc_Success_Connect");
          message.Connect();
        }
        return;

      case "PRIVMSG":     // 일반 메세지
          message.Add( {
            "name"   : subArguments["display-name"],
            "badges" : subArguments["badges"],
            "text"   : arguments.splice(3, arguments.length).join(" ").substring(1)
          } );
        return;

      case "CLEARCHAT":   // 채팅 전체삭제 혹은 유저 차단
        if (subArguments["ban-reason"] === undefined) {

        } else {

        }
        return;

      case "USERNOTICE":  // 유저 관련 메세지
        switch(subArguments["msg-id"]) {
          case "sub":
          case "resub":       // 신규 구독 및 재구독
            return;

          case "subgift":     // 구독 선물
            return;

          case "raid":        // 다른 채널에서 온 레이드
            return;

          case "ritual":      // 채널에 처음 온 시청자
            return;

          case "rewardgift":  // 응원으로 인한 선물 나눔
            return;

          default:
            message.Error("Irc_Wrong_Message", prefix+arguments[1]+" "+subArguments["msg-id"]);
            return;
        }

      case "NOTICE":      // 방 상태 변경
        return;

      default:
        message.Error("Irc_Wrong_Message", prefix+arguments[1]);
        return;
    }
  }

  message.Error("Irc_Wrong_Message", line);
};


/**
 * 모듈 Load 메서드
 * 포인터를 메인 모듈과 연결
 * @param {object} uniformData 메인 모듈 오브젝트
 */
methods.Load = function(uniformData) {
  config = uniformData.Data.config;
  shared = uniformData.Data.shared;
  message = uniformData.Message;
};


/**
 * 모듈 오브젝트
 * 전달받은 메서드로 모듈 내부 메서드와 데이터를 자기자신과 연결하여 반환
 */
module.exports = function(InitModule) { return InitModule.call({}, methods, data); };