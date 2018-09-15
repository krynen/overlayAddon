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
  badges     : {}, // Connect()에서 재정의되어 뱃지 출력에 사용
  entryPoint : {}, // GetRootEntry()에서 사용
  nodes      : {}  // Add()에서 사용
};

// 포인터 정의
var api    = null;
var config = null;
var shared = null;

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
 * @param {Object} message.parent 추가할 부모 노드
 * @param {Object} message 추가할 메세지의 정보
 * @param {string} message.name 메세지를 보낸 유저의 이름
 * @param {string[]} message.badges 메세지를 보낸 유저의 뱃지 배열
 * @param {string} message.text 추가할 메세지의 문자열
 */
var AddSubElement = function(type, message) {
  switch(type) {
    case "NormalMessage":
    case "ErrorMessage":
      // 생성
      var doc = document.implementation.createHTMLDocument();
      data.theme[`Template${type}`].forEach( function(el) {
        doc.body.appendChild(el.cloneNode(true));
      } );

      // 포인트를 뽑아내고 이름을 정리함
      var points = {
        "Name"   : Array.from(doc.getElementsByName("TemplateName")),
        "Badges" : Array.from(doc.getElementsByName("TemplateBadges")),
        "Text"   : Array.from(doc.getElementsByName("TemplateText"))
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
      var ret = [];
      doc.body.childNodes.forEach( function(el)  {
        ret.push(message.parent.appendChild(el));
      } );

      return ret;

    case "Badges":
      // 뱃지가 로드되지 않았을 경우 생략
      if (Object.keys(data.badges).length === 0) { break; }

      // message.badges의 각 뱃지를 추가
      message.badges.forEach( function(el){
        var element = document.createElement("img");
        var name = el.split("/")[0];
        var version = el.split("/")[1];

        element.classList.add(name, el);

        var uri = (data.badges[name]||{}).versions||{};
        // name/version이 실패하면 name/0, name/1을 순차적으로 시도
        // name/0은 subscriber, name/1은 다른 경우의 예외처리가 됨
        element.src = [version, "0", "1"].reduce( function(acc, cur) {
          if (acc !== null || uri[cur] === undefined) { return acc; }
          return uri[cur];
        }, null )["image_url_1x"];

        if (typeof element.src !== "string" || element.src === "") { return; }
        message.parent.appendChild(element);
      } );
      break;

    case "Name":
      message.parent.innerHTML += message.name;
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

  // 스타일 템플릿을 페이지에 추가
  ret["TemplateStyle"].forEach( function(el) { document.head.appendChild(el); } );

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
  } );
  err.innerHTML = message;

  document.body.appendChild(err);
};


/**
 * 타입에 따른 메세지 출력 메서드
 * @param {Object} message medthods.Add의 message
 * @param {string} type 출력할 메세지의 타입(normal, error)
 * @param {Object} config 출력할 메세지를 담당하는 설정 부분
 */
var AddType = function(message, type, config) {
  var lower = type.toLowerCase();
  var capital = lower[0].toUpperCase() + lower.slice(1);

  var root = GetRootEntry(capital);
  if (!Array.isArray(data.nodes[lower])) { data.nodes[lower] = []; }

  // 메세지를 출력
  var elements = AddSubElement(
    `${capital}Message`,
    Object.assign({"parent":root}, message)
  );

  // 메세지 삭제시간을 적용
  data.nodes[lower].push(elements);
  if (config.Timeout > 0) {
    setTimeout( function() {
      var index = data.nodes[lower].indexOf(elements);
      if (index >= 0) {
        data.nodes[lower].splice(index, 1)[0].forEach( function(el) { root.removeChild(el); } );
      }
    }, config.Timeout * 1000);
  }

  // 메세지가 많을 경우 FIFO로 element를 제거
  if (data.nodes[lower].length > Math.min(config.Maximum, 100)) {
    data.nodes[lower].shift().forEach( function(el) { root.removeChild(el); } );
  }
};


/**
 * 오류, 디버그 메세지 출력 메서드
 * data.theme의 TemplateErrorMessage에 따라 메세지를 출력한다
 * try-catch문 이용해 출력 실패시 NativeError로 재시도
 * @param {string} message 출력할 오류의 종류
 * @param {string} option 출력할 문자열에 추가할 수 있는 값
 */
methods.Error = function(message, option) {
  try {
    // 문자열 불러오고 공백일 경우 더 이상 처리하지 않음
    var str = config.Error[message];
    if (str === "") { return; }

    // 상세표시 설정이 되어있을 경우 옵션들을 개행 후 배열시킴
    if (config.Error.Detailed !== false && typeof option === "string") {
      str += "\n" + option;
    }

    // 메세지 추가
    AddType({ "parent":root, "test":str }, "Error", config.Error);
  } catch(err) {
    if (typeof option === "string") { methods.NativeError(`${message}\n${option}\n\n${err}`) }
    else { methods.NativeError(`${message}\n\n${err}`); }
  }
};


/**
 * 일반 메세지 출력 메서드
 * data.theme의 TemplateNormalMessage에 따라 메세지를 출력한다
 * @param {Object} message 출력할 메세지의 정보
 * @param {string} message.name 메세지를 보낸 유저의 이름
 * @param {string[]} message.badges 메세지를 보낸 유저의 뱃지 배열
 * @param {string} message.text 보낸 메세지의 문자열
 */
methods.Add = function(message) { AddType(message, "Normal", config.Message); };


/**
 * 뱃지 데이터 로드 및 연결 메서드
 * 유저 Id가 식별되어야하므로 IRC에 연결된 후 호출됨
 */
methods.Connect = function() {
  // Promise.all에 쓰일 각 Promise 정의
  var func = function(uri) {
    return function(resolve) {
      api.Get({ uri:uri }).then(
        function(r) { resolve([true, JSON.parse(r)]); },
        function(r) { resolve([false, r]); }
      );
    };
  };

  // 유저 뱃지와 글로벌 뱃지를 모두 로드
  Promise.all( [
    new Promise( func(shared.Message.GlobalUri) ),
    new Promise( func(shared.Message.ChannelUri.replace(/{id}/g, shared.Id)) )
  ] ).then( function(results) {
    // 글로벌 뱃지가 로드
    if (results[0][0] === false) {
      methods.Error("Message_Fail_Badge", results[0][1]);
      return;
    }
    Object.assign(data.badges, results[0][1]["badge_sets"]);

    // 유저 뱃지가 로드
    // 실패했을 때 혹은 유저 뱃지가 존재하지 않으면 그냥 글로벌 뱃지만 사용
    if (results[1][0] === true) {
      Object.assign(data.badges, results[1][1]["badge_sets"]);
    }
  } );
};


/**
 * 모듈 Load 메서드
 * main.js에서 연결된 이후에 호출됨
 * @param {Object} uniformData 메인 모듈 오브젝트
 */
methods.Load = function(uniformData) {
  api = uniformData.Api;
  config = uniformData.Data.config;
  shared = uniformData.Data.shared;

  Object.assign(data.theme, methods.ParseTheme(DEFAULT_THEME));
};


/**
 * 모듈 오브젝트
 * 전달받은 메서드로 모듈 내부 메서드와 데이터를 자기자신과 연결하여 반환
 */
module.exports = function(InitModule) { return InitModule.call({}, methods, data); };