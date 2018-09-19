/**********************************************************
 * 색 모듈                                                *
 * /me 명령어가 사용된 색채팅 문자열을 처리               *
 * 유저 개인 색상을 템플릿에서 사용할 수 있게 가공해 전달 *
 **********************************************************/

// 모듈 인터페이스
var methods = {};
var data = {};

// 포인터 정의
var config  = null;
var shared  = null;
var parent  = null;


/**
 * Attribute, Style Variable 추가 메서드
 * @param {Object} message Replace()와 동일한 message
 * @param {bool} message.isColorChat 색채팅을 사용하게 설정된 메세지인지
 * @param {Object} parentMessage parent.AddSubElement()의 message
 */
methods.Set = function(message, parentMessage) {
  if (parentMessage.attr === undefined) { parentMessage.attr = {}; }
  if (parentMessage.var === undefined) { parentMessage.var = {}; }

  if (message.isColorChat === true) { parentMessage.attr["color-chat"] = "1"; }
  parentMessage.var["color"] = message.color;
}


/**
 * 색상 처리 메서드
 * 유저 색상을 가져오고 색채팅 권한이 있는지 판별
 * @param {Object} message 출력할 메세지의 색상 정보
 * @param {string} message.name 색 임의 지정에 사용할 유저 이름
 * @param {string[]} message.badges 색채팅 권환 확인에 사용할 유저 뱃지 목록
 * @param {bool} message.isColorChat 색채팅 처리 유무를 표시할 출력값
 * @param {string} message.color 유저 고유 색상
 * @param {string[]} text 어절별로 분리된 메세지 문자열
 * @param {bool[]} done 각 어절의 처리 여부
 */
methods.Replace = function(message, text, done) {
  // 색채팅 판별
  var isColorChat = text.join(" ").match(new RegExp(
    "^" + shared.Message.Color.Prefix +
    "[\\s\\S]+" +
    shared.Message.Color.Postfix + "$"
  )) !== null;

  // 색채팅 표시문자 제거
  if (isColorChat) {
    text[0] = text[0].replace(new RegExp("^"+shared.Message.Color.Prefix.replace(" ","")), "");
    var index = text.length-1;
    text[index] = text[index].replace(new RegExp(shared.Message.Color.Postfix+"$"), "");
  }

  // 색 설정 미사용시 처리 종료
  if (config.Message.Color.Enable !== true) { delete message.color; return; }

  // 기본 색 미설정시 목록에서 이름에 따라 색 선택
  if (message.color == "") {
    var length = config.Message.Color.List.length;
    var findex = message.name.charCodeAt(0);
    var lindex = message.name.charCodeAt(message.name.length-1);
    message.color = config.Message.Color.List[(findex+lindex) % length];
  }

  // 뱃지로 권한을 확인해 색채팅 처리
  if (isColorChat) {
    // 권한 목록에 빈 문자열이 있을 경우 무조건 통과
    if (config.Message.Color.ColorChat.indexOf[""] > -1) {
      message.isColorChat = true;
      return;
    }

    config.Message.Color.ColorChat.some( function(el) {
      var tier = Number(el.split("/")[1]);
      var name = el.split("/")[0];

      // 각 유저 뱃지가 색채팅 권한 설정에 포함되어있는지 확인
      if (message.badges.some( function(badge) {
        var badgeName = badge.split("/")[0];
        if (badgeName !== name) { return false; }

        var badgeTier = Number(badge.split("/")[1]);
        // 유저 뱃지가 권한 뱃지보다 낮은 등급이 아니면 통과
        if (badgeTier >= tier) { return true; }
        return false;
      } )) {
        message.isColorChat = true;
        return true;
      }

      return false;
    } );
  }
};


/**
 * 모듈 Load 메서드
 * 포인터를 메인 모듈과 연결
 * @param {object} uniformData 메인 모듈 오브젝트
 */
methods.Load = function(uniformData) {
  config = uniformData.Data.config;
  shared = uniformData.Data.shared;
  parent = uniformData.Message;
};


/**
 * 모듈 오브젝트
 * 전달받은 메서드로 모듈 내부 메서드와 데이터를 자기자신과 연결하여 반환
 */
module.exports = function(InitModule) { return InitModule.call({}, methods, data); };