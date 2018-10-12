/***************************************
 * 명령어 모듈                         *
 * 특정 메세지에서 명령을 추출해 처리  *
 * 하위 모듈로 명령어 종류를 확장 가능 *
 *                                     *
 ***************************************/

// 모듈 인터페이스
var methods = {};
var data = {
  rule : {
    expression : null,
    result     : []
  }
};

// 포인터 정의
var config = null;


/**
 * 명령 탐색 메서드
 * 명령어인지, 존재하는 명령어인지 판별해 실행
 * @param {Object}
 * @param {string[]} message.badges 권한 파악을 위한 유저 뱃지 목록
 * @param {string[]} text 어절별로 분리된 메세지 문자열
 * @param {bool} master 권한 파악을 우회할 마스터 옵션
 */
methods.Get = function(message, text, master) {
  // 메세지 처리 종료 여부 반환
  var ret = false;

  // 명령어가 아니면 처리 종료
  var regExp = new RegExp(
    "^"+config.Command.Prefix.replace(/[-/\\^$*+?.()|[\]]/g, "\\$&")+"(.*)"
  );
  var match = text[0].match(regExp);
  if (match === null) { return; }

  // 명령 탐색
  Object.keys(config.Command.List).forEach( function(key) {
    if (config.Command.List[key].alias.some( function(el) {
      return el.toLowerCase() === match[1].toLowerCase();
    } ) === false) { return; }

    // 명령 권한 파악
    if ((master !== true) && (config.Command.List[key].allow.some( function(el) {
      var tier = Number(el.split("/")[1]);
      var name = el.split("/")[0];

      // 각 유저 뱃지가 색채팅 권한 설정에 포함되어있는지 확인
      return message.badges.some( function(badge) {
        var badgeName = badge.split("/")[0];
        if (badgeName !== name) { return false; }
        var badgeTier = Number(badge.split("/")[1]);
        if (badgeTier >= tier) { return true; }
        return false;
      } );
    } ) === false)) { return; }

    // 명령 실행
    var command = this.Module||{};
    command = command[ key[0].toUpperCase() + key.slice(1).toLowerCase() ]||{};
    var phrase = Array.from(text);
    phrase.shift();
    if (command.Execute !== undefined) { ret = command.Execute(phrase); }
  }, this);

  return ret;
};


/**
 * 하위 모듈 데이터 로드 메서드
 * 설정과 연동되는 명령어에 설정을 적용함
 */
methods.Connect = function() {
  // 설정 스타일을 적용
  Object.keys(config.Command.List.style.list).forEach( function(key) {
    this.Get(null, [key].concat(config.Command.style.list[key].split(" ")), true);
  } );
};


/**
 * 모듈 Load 메서드
 * 포인터를 메인 모듈과 연결
 * @param {object} uniformData 메인 모듈 오브젝트
 */
methods.Load = function(uniformData) {
  config = uniformData.Data.config;
};


/**
 * 모듈 오브젝트
 * 전달받은 메서드로 모듈 내부 메서드와 데이터를 자기자신과 연결하여 반환
 */
module.exports = function(InitModule) { return InitModule.call({}, methods, data); };