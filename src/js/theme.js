/***************************************************
 * 테마 관리 모듈                                  *
 * 기본, 혹은 외부 테마 파일로부터 템플릿을 읽어옴 *
 *                                                 *
 ***************************************************/

// 모듈 인터페이스
var methods = {};
var data = {
  template : {} // 파싱된 테마 템플릿
};

// 포인터 정의
var api    = null;
var config = null;
var done   = null;


/**
 * 테마 파일에서 템플릿을 불러오는 메서드
 * @param {string} response에서 읽어온 stringify된 html template
 */
methods.Parse = function(response) {
  // 기존 템플릿을 제거
  var keys = Object.keys(data.template);
  for (var i=0; i<keys.length; ++i) { delete data.template[keys[i]]; }
  var styles = document.head.querySelectorAll("*[theme-type=style]");
  for (var i=0; i<styles.length; ++i) { document.head.removeChild(styles[i]); }

  // 바탕이 될 DOM Element를 생성해 response를 추출
  var element = document.createElement("template");
  element.innerHTML = response;

  // 최상위 template element 각각을 아이디에 따라 분류
  var length = element.content.children.length;
  var someFunc = function(el)  {
    if (el.nodeName !== "#text") { return true; }
    if (el.nodeValue.match(/^\s*$/) === null) { return true; }

    node.removeChild(el);
    return false;
  };
  for(var i=0; i<length; ++i) {
    var child = element.content.children[i];
    var node = child.content;

    // 각 template에서 주석을 제거
    for (var j=0; j<node.childNodes.length; ++j) {
      if (node.childNodes[j].nodeName === "#comment") {
        node.removeChild(node.childNodes[j--]);
      }
    }
    // template 안의 양끝단의 공백 텍스트노드를 제거
    var spaces = Array.from(node.childNodes).reverse();
    spaces.some(someFunc);
    spaces.reverse().some(someFunc);

    if (child.id !== undefined) { data.template[child.id] = node.childNodes; }
  }

  // 스타일 템플릿을 페이지에 추가
  if (data.template["Style"] !== null) {
    data.template["Style"].forEach( function(el) {
      el.setAttribute("theme-type", "style");
      document.head.appendChild(el);
    } );
  }
};


/**
 * 테마 연결 메서드
 * 설정이 불러와져야 하므로 모듈 로드가 끝난 후 호출됨
 */
methods.Connect = async function() {
  var theme = config.Theme||{};

  if (theme.BaseUri === "" || theme.FileName === "") {
    methods.Parse(this.Module.Default);
  } else {
    var uri = theme.BaseUri + "/" + theme.FileName + ".html";
    if (await api.Get("theme", uri) !== null ) {
      // 로드 실패시 기본 테마 적용
      methods.Parse(this.Module.Default);
    }
  }
  done.Done("theme");
};


/**
 * 모듈 Load 메서드
 * main.js에서 연결된 이후에 호출됨
 * @param {Object} uniformData 메인 모듈 오브젝트
 */
methods.Load = function(uniformData) { 
  done = uniformData.Done;

  api    = uniformData.Data;
  config = uniformData.Data.config;
};


/**
 * 모듈 오브젝트
 * 전달받은 메서드로 모듈 내부 메서드와 데이터를 자기자신과 연결하여 반환
 */
module.exports = function(InitModule) { return InitModule.call({}, methods, data); };