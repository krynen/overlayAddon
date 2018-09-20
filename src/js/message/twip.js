/**********************************************
 * 트윕 후원 하위모듈                         *
 * 트윕 계정을 통해 표시된 후원 메세지를 처리 *
 * 이름, 금액 정보를 분리하여 헤더에 표시     *
 *                                            *
 **********************************************/

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
var parent = null;


/**
 * 상위 모듈의 메세지 정보를 설정하고 헤더를 추가하는 메서드
 * @param {Object} message Replace()와 동일한 message
 * @param {Object} parentMessage parent.AddSubElement()의 message
 */
methods.Set = function(message, parentMessage) {
  if (config.Message.Twip.Enable && message.isTwip !== true) { return; }

  if (parentMessage.attr === undefined) { parentMessage.attr = {}; }
  parentMessage.attr["twip"] = "1";

  if (parentMessage.root === undefined) { parentMessage.root = {}; }
  parentMessage.root.TwipHead = {
    "attr"   : { "value": message.value },
    "name"   : message.name,
    "text"   : message.value
  };
};


/**
 * 유저 색상을 가져오고 색채팅 권한이 있는지 판별
 * @param {Object} message 출력할 메세지의 색상 정보
 * @param {string} message.isTwip 트윕 계정 여부
 * @param {string[]} text 어절별로 분리된 메세지 문자열
 * @param {bool[]} done 각 어절의 처리 여부
 */
methods.Replace = function(message, text, done) {
  // 트윕의 메세지가 아니면 처리 종료
  if (config.Message.Twip.Enable && message.isTwip !== true) { return; }
  // 트윕 관련 설정을 하지 않았다면 처리 종료
  if (data.rule.expression === null) {
    message.isTwip = false;
    return;
  }
  // 포맷이 제대로 되지 않은 것 같으면 처리 종료
  var match = text.join(" ").match(data.rule.expression);
  if ((match||[]).length !== (data.rule.result.length+1)) {
    message.isTwip = false;
    return;
  }

  ["name", "value", "text"].forEach( function(el) {
    message[el] = match[data.rule.result.indexOf(`{${el}}`)+1];
  } );

  while(text.length > 0) {
    text.pop();
    done.pop();
  };

  // 기존 텍스트를 템플릿 텍스트로 대체
  done.push(true);
  var element = document.createElement("span");
  parent.AddSubElement(
    "TwipText",
    {
      "parent" : element,
      "attr"   : { "name":message.name, "value":message.value },
      "text"   : message.text
    }
  );
  text.push(element.innerHTML);
};


/**
 * 추가 데이터 로드 및 연결 메서드
 * 설정값을 사용하므로 추가 설정 로드 후 호출됨
 */
methods.Connect = function() {
  // 트윕 설정으로부터 정규 표현식을 추출
  var format = (config.Message.Twip||{}).Format; 
  if (typeof format !== "string") { return; }

  // 포맷 문자열에서 치환자를 검색해 각 치환자의 종류를 저장하고
  // 해당 치환자에 모든 문자가 대응되는 정규표현식을 작성
  var replacer = new RegExp("(?:{text})|(?:{name})|(?:{value})", "g");
  (format.match(replacer)||[]).forEach( function(el) { data.rule.result.push(el); } );
  if (format === "") { return; }

  data.rule.expression = new RegExp(
    format
      .replace(/[-/\\^$*+?.()|[\]]/g, "\\$&")
      .replace(replacer, "(.*)")
  );
};


/**
 * 모듈 Load 메서드
 * 포인터를 메인 모듈과 연결
 * @param {object} uniformData 메인 모듈 오브젝트
 */
methods.Load = function(uniformData) {
  config = uniformData.Data.config;
  parent = uniformData.Message;
};


/**
 * 모듈 오브젝트
 * 전달받은 메서드로 모듈 내부 메서드와 데이터를 자기자신과 연결하여 반환
 */
module.exports = function(InitModule) { return InitModule.call({}, methods, data); };