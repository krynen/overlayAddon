/**********************************************************
 * 메세지 모듈                                            *
 * IRC 모듈에서 정리된 데이터를 사용해 DOM Element를 추가 *
 * 추가에 필요한 테마를 파싱하는 역할도 겸함              *
 *                                                        *
 **********************************************************/

// 모듈 인터페이스
var methods = {};
var data = {
  theme      : {}, // Load()에서 재정의되어 모듈의 대부분에서 사용
  entryPoint : {}  // GetRootEntry()에서 사용
};

// 포인터 정의
var config = null;

// 상수값
var DEFAULT_THEME = require("../html/theme.html");


/**
 * 최상위 Element 설정 메서드
 * 아이디를 통해 DOM Element가 생성되지 않았을 경우 생성하며
 * 하위 Element를 추가할 지점을 반환한다
 * @param {string} type Element의 종류. 대소문자를 구분. Normal, Error.
 */
var GetRootEntry = function(type) {
  // 올바르지 않은 타입이 입력되었을 경우 예외처리
  switch(type) {
    case "Normal":
    case "Error":
      break;

    default:
      // 내부함수이므로 콘솔출력으로 충분
      console.error(`GetRootEntry, type, ${type}`);
      return;
  }

  // 최상위 Element가 이미 존재하는지 판별해 존재할 경우 바로 반환
  if (data.entryPoint[type] !== undefined) { return data.entryPoint[type];}

  // 최상위 Element가 생성되어있지 않을 경우 새로 생성
  var theme = data.theme[`Template${type}Root`];
  if (theme === undefined && type === "Error") { theme = data.theme["TemplateNormalRoot"]; }
  if (theme === undefined) {
    var messageTemplate = config.Error;
    if (type === "Error") {
      methods.NativeError(messageTemplate["Error_Message_No_ErrorRoot"]);
    } else { methods.NativeError(messageTemplate["Error_Mesage_No_NormalRoot"]); }

    return;
  }
  theme.forEach( function(el) {
    var cloned = el.cloneNode(true);
    document.body.appendChild(cloned);
  } );

  // 하위 Element를 생성할 포인트를 찾고 정리
  entry = document.getElementsByName("TemplateMessageRoot")[0];
  entry.removeAttribute("name");

  // 찾은 포인트를 data.entryPoint에 등록하고 반환
  data.entryPoint[type] = entry;
  return entry;
};


/**
 * 하위 Element 생성 메서드
 * 덧붙일 Element를 만들어 상위 Element에 appendChild
 * @param {string} type Element의 종류.
 * @param {message.parent} object append할 부모 노드
 * @param {message.text} string 추가할 Element의 문자열 부분
 */
var AddSubElement = function(type, message) {
  switch(type) {
    case "ErrorMessage":
      // 생성
      var doc = document.implementation.createHTMLDocument();
      data.theme["TemplateErrorMessage"].forEach( function(el) {
        doc.body.appendChild(el.cloneNode(true));
      } );

      // 포인트를 뽑아내고 이름을 정리함
      var points = {
        "Name": Array.from(doc.getElementsByName("TemplateNameRoot")),
        "Text": Array.from(doc.getElementsByName("TemplateTextRoot"))
      };
      Object.keys(points).forEach( function(key)  {
        points[key].forEach( function(el) { el.removeAttribute("name"); } );
      } );

      // 각 포인트로부터 parent만 바꾸어 재귀 호출
      Object.keys(points).forEach( function(key) {
        points[key].forEach( function(el) {
          var childMessage = JSON.parse(JSON.stringify(message));
          childMessage.parent = el;
          AddSubElement(key, childMessage);
        } );
      } );

      // 생성한 Element를 추가
      doc.body.childNodes.forEach( function(el)  {
        message.parent.appendChild(el);
      } );
      break;

    case "Text":
      message.parent.innerHTML += message.text;
      break;

    default:
      break;
  }
};


/**
 * 테마 파일에서 템플릿을 불러오는 메서드
 * @param {string} response에서 읽어온 stringify된 html template
 * @return {Object} 불러온 템플릿
 */
methods.ParseTheme = function(response) {
  // 바탕이 될 DOM Element를 생성해 response를 추출
  var element = document.createElement("template");
  element.innerHTML = response;

  // 최상위 template element 각각을 아이디에 따라 분류
  var ret = [];
  var length = element.content.children.length;
  for(var i=0; i<length; ++i) {
    var child = element.content.children[i];
    var node = child.content;

    // 각 template 안의 양끝단의 공백 텍스트노드를 제거
    var spaces = [ node.childNodes[0], node.childNodes[node.childNodes.length-1] ];
    spaces.forEach( function(el) {
      if (el.nodeName !== "#text") { return; }
      if (el.nodeValue.match(/^\s*$/) === null) { return; }

      node.removeChild(el);
    } );

    ret[child.id] = node.childNodes;
  }
  return ret;
};


/**
 * 오류 메세지 출력용 기본 메서드
 * methods.Error에 문제가 발생하였을 때 사용되는 대체품
 * @param {string} message 출력할 오류 문자열
 */
methods.NativeError = function(message)  {
  var err = document.createElement("div");
  Object.assign(err.style, {
    "background" : "red",
    "color"      : "white",
    "fontWeight" : "bold",

    "whiteSpace" : "pre-wrap",
    "wordBreak"  : "keep-all"
  });
  err.innerHTML = message;

  document.body.appendChild(err);
};


/**
 * 오류, 디버그 메세지 출력 메서드
 * data.theme의 TemplateErrorMessage에 따라 메세지를 출력한다
 * try-catch문 이용해 출력 실패시 NativeError로 재시도
 * @param {string} message 출력할 오류의 종류
 * @param {string[]} option 출력할 문자열에 추가할 수 있는 값
 */
methods.Error = function(message, option) {
  try {
    // 메세지에 해당되는 문자열 불러오기
    var str = "";
    if (message === "custom") { str = message; }
    else { str = config.Error[message]; }

    // 문자열에 {\d}이 있을 경우 옵션을 해당부분에 치환시킴
    var match = str.match(/{[^}]+}/g);
    var indexes = [];
    if (match !== null) {
      match.forEach( function(el, ind) {
        var num = Number.ParseInt(el.replace(/[{}]/g, ""));
        indexes.push(num);
        str = str.replace(el, option[ind]);
      } );
    }
    // 치환되고 남은 옵션들을 개행 후 배열시킴
    if (Array.isArray(option)) {
      str += "\n";
      option.forEach( function(el, ind) {
        if (indexes.indexOf(ind) === -1) { str += el; }
      } );
      str = str.replace(/\n$/, "");
    }

    // 최상위 Element의 존재를 파악
    var parent = GetRootEntry("Error");
    AddSubElement("ErrorMessage",
      {
        "parent" : parent,
        "text"   : str
      } );
  } catch(err) {
    if (Array.isArray(option)) { methods.NativeError(`${message}\n${option}\n\n${err}`) }
    else { methods.NativeError(`${message}\n\n${err}`); }
  }
};


/**
 * 모듈 Load 메서드
 * main.js에서 연결된 이후에 호출됨
 * @param {Object} uniformData 메인 모듈 오브젝트
 */
methods.Load = function(uniformData) {
  config = uniformData.Data.config;

  Object.assign(data.theme, methods.ParseTheme(DEFAULT_THEME));
};


/**
 * 모듈 오브젝트
 * 전달받은 메서드로 모듈 내부 메서드와 데이터를 자기자신과 연결하여 반환
 */
module.exports = function(InitModule) { return InitModule.call({}, methods, data); };