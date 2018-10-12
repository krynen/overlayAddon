/*******************************************************
 * 데이터 모듈                                         *
 * 공유 데이터 파일과 기본 설정 파일(data/*.json) 로드 *
 * 추가 설정 파일들을 로드하여 기본 설정과 병합        *
 *                                                     *
 *******************************************************/ 

// 모듈 인터페이스
var methods = {};
var data = {
  shared  : {},  // 모듈들간의 공유 데이터
  config  : {},  // 사용자 설정 데이터
  default : {}   // 기본 설정 데이터
};

// 포인터 정의
var api     = null;
var done    = null;
var message = null;
var theme   = null;


/**
 * 데이터 로드 메서드
 * 로컬 파일과 URI로부터 데이터를 읽어옴
 * @param {string} type 불러올 데이터의 종류 혹은 출처의 구분
 * @param {string|RegExp} [key] 로컬 파일의 종류, 웹 파일의 URI, 세션 파일의 정규 표현식 등
 */
methods.Get = async function(type, key) {
  var ret = {};

  // type에 따라 switch문 전개
  switch (type) {
    case "config":  // URI로부터 설정 로드
      await api.Get( {uri:key} )
        .then(
          function(res) { ret = JSON.parse(res); },
          function(err) { message.Error("Data_Fail_Config", err); }
        );
      break;

    case "session": // sessionStorage에 저장된 설정 로드
      Object.keys(sessionStorage).some( function(el) {
        if (el.match(key) !== null) {
          ret = JSON.parse(sessionStorage.getItem(el));
          sessionStorage.removeItem(el);
          return true;
        }
        return false;
      } );
      break;

    case "theme":
      await api.Get( {uri:key} )
        .then(
          function(res) { ret = theme.Parse(res); },
          function(err) { message.Error("Data_Fail_Theme", err); }
        );
      break;

    default:
      break;
  }
  return ret;
};


/**
 * 추가로 불러온 설정을 기본 설정과 병합
 * @param {Object} target 병합될 목적 오브젝트
 * @param {Object} source 병합할 재료 오브젝트
 */
methods.Merge = function(target, source) {
  Object.keys(source).forEach( function(el) {
    if ((target[el] === null) && (source[el] === null)) { return; }

    // 존재하지 않았던 값 추가
    if ((target[el] === undefined) || (target[el] === null)) {
      // source[el]이 배열일 경우도 고려하여 추가함
      // 배열일 경우를 보증해줄 target[el]이 존재하지 않으므로 확실히 체크할 것
      var cond1 = typeof source[el].type === "string";
      var cond2 = Array.isArray(source[el].value);
      
      if (cond1 && cond2) { target[el] = source[el].value; }
      else { target[el] = source[el]; }
      return;
    }

    if (typeof target[el] === "object")
    {
      // target[el], source[el]이 배열일 경우
      if (Array.isArray(target[el])) {
        // 기존 값에 추가
        if (source[el].type === "append") {
          target[el] = target[el].concat(source[el].value);
          return;
        }

        // 기존 값을 대체
        if (source[el].type === "replace") {
          target[el] = source[el].value;
          return; 
        }
      }

      // 일반적인 오브젝트의 경우 재귀호출로 덮어쓰기를 최소화
      methods.Merge(target[el], source[el]);
      return;
    }

    target[el] = source[el];
  } );
};


/**
 * URI 파싱 메서드
 * uri로부터 일부 설정값을 받아 적용한다
 */
methods.ParseUri = function() {
  var uri = location.href.split("?");
  if (uri.length <= 1) { return; }

  uri.reverse()[0].split("&").forEach( function(el) {
    // 각 설정값이 올바른지 판정
    if (el.split("=").length !== 2) { return; }
    var key = el.split("=")[0].toLowerCase();
    var value = el.split("=")[1];

    // 설정값을 적용
    switch(key) {
      case "channel":
        data.config.Channel = value;
        break;

      case "client-key":
        data.config.Key = value;
        break;

      case "theme":
        data.config.Theme.FileName = value;
        break;

      case "theme-enable":
        switch(value) {
          case "0":
          case "false":
          case "no":
            data.config.Command.List.theme.enable = false;
            break;

          /*
          case "1":
          case "true":
          case "yes":
          case "":
          */
          default:
            data.config.Command.List.theme.enable = true;
        }
        break;

      case "zoom":
        data.config.Command.List.style.list.zoom = value;
        break;

      default:
        break;
    }
  } );
}


/**
 * 모듈 Load, 핵심 메서드
 * 모듈에 하위 모듈들로부터 불러온 데이터를 추가
 * @param {Object} uniformData 메인 모듈 오브젝트
 */
methods.Load = async function(uniformData) {
  // 포인터를 연결
  api     = uniformData.Api;
  message = uniformData.Message;
  theme   = uniformData.Theme;

  // 내부 데이터를 연결
  Object.assign(data.shared, uniformData.Shared);
  Object.assign(data.default, uniformData.Default);
  Object.assign(data.config, uniformData.Default);

  // 세션 설정을 연결
  while(1) {
    var session = await methods.Get("session", new RegExp(data.shared.Data.SessionStorageFormat));
    if (Object.keys(session).length === 0) { break; }
    methods.Merge(data.config, session);
  }

  // 웹 설정을 로드
  var uris = JSON.parse( JSON.stringify(data.config.Data.Uris) );
  var webConfigs = await Promise.all( uris.map( async function(el) {
    return await methods.Get("config", el);
  } ) );

  // 로드한 웹 설정을 연결
  webConfigs.forEach( function(el) { methods.Merge(data.config, el); } );
  // URI 설정을 연결
  methods.ParseUri();

  // 모듈 로드 완료 등록
  uniformData.Done.Done("data");
};


/**
 * 모듈 오브젝트
 * 전달받은 메서드로 모듈 내부 메서드와 데이터를 자기자신과 연결하여 반환
 */
module.exports = function(InitModule) { return InitModule.call({}, methods, data); };