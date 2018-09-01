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