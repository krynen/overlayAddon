/**************************************************************
 * 이모티콘 하위모듈                                          *
 * 트위치 공용 및 구독자 전용 이모티콘이 포함된 메세지를 처리 *
 * 이모티콘 위치-아이디 정보를 받아 해당 문자열을 수정함      *
 *                                                            *
 **************************************************************/

// 모듈 인터페이스
var methods = {};
var data = {};

// 포인터 정의
var shared  = null;
var parent  = null;


/**
 * 상위 모듈의 메세지 정보를 설정
 * @param {Object} message Replace()와 동일한 message
 * @param {bool} message.only 메세지에 이모티콘 외의 텍스트가 없는지
 * @param {Object} parentMessage parent.AddSubElement()의 message
 */
methods.Set = function(message, parentMessage) {
  if ((message||{}).only === true) {
    if (parentMessage.root === undefined) { parentMessage.root = {}; }
    parentMessage.root["emote-only"] = "1";
  }
};

/**
 * 이모티콘 문자열 대체 메서드
 * @param {Object} message 출력할 메세지의 정보
 * @param {string} message.index 이모티콘의 아이디와 위치. id:from-to,from-to/id:from-to ...
 * @param {string[]} text 어절별로 분리된 메세지 문자열
 * @param {bool[]} done 각 어절의 처리 여부
 */
methods.Replace = function(message, text, done) {
  if (message === undefined) { return; }

  // 색채팅을 배제하고 탐색
  var textString = text.join(" ").replace(/^ACTION ([^]+)$/, "$1");

  // 이모티콘 어절을 추출
  var ids = [];
  var values = [];
  message.index.split("/").forEach( function (el) {
    var id = el.split(":");
    var index = id.pop().split(",")[0].split("-").map(ind => Number(ind));
    id = id[0];


    var str = textString.slice(index[0], index[1]+1);
    ids.push(id);
    values.push(str);
  } );

  // 이모티콘 어절을 변환
  text.forEach( function(el, ind) {
    if (done[ind] === true) { return; }              // 이미 처리된 어절 무시

    var emoteIndex = values.indexOf(el);
    if (emoteIndex === -1) { return; }               // 이모티콘이 아닌것같으면 무시

    var element = document.createElement("span");
    parent.AddSubElement(
      "Emote",
      {
        "parent" : element,
        "root"   : { "type":el, "id":ids[emoteIndex] },
        "image"  : shared.Message.EmoteUri.replace("{id}", ids[emoteIndex]),
        "text"   : el
      }
    );
    text[ind] = element.innerHTML;
  } );
};


/**
 * 모듈 Load 메서드
 * 포인터를 메인 모듈과 연결
 * @param {object} uniformData 메인 모듈 오브젝트
 */
methods.Load = function(uniformData) {
  shared = uniformData.Data.shared;
  parent = uniformData.Message;
};


/**
 * 모듈 오브젝트
 * 전달받은 메서드로 모듈 내부 메서드와 데이터를 자기자신과 연결하여 반환
 */
module.exports = function(InitModule) { return InitModule.call({}, methods, data); };