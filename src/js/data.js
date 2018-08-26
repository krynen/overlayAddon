/*******************************************************
 * 데이터 모듈                                         *
 * 공유 데이터 파일과 기본 설정 파일(data/*.json) 로드 *
 * 추가 설정 파일들을 로드하여 기본 설정과 병합        *
 *                                                     *
 *******************************************************/ 

// 모듈 인터페이스
var methods = {};
var data = {};

// 포인터 정의
var api = null;

// 상수값
var SHARED_DATA = require("../json/shared.json");
var DEFAULT_CONFIG = require("../json/default.json");
var SESSION_CONFIG_REGEX = /^data\/config\/*/;


/**
 * 데이터 로드 메서드
 * 로컬 파일과 URI로부터 데이터를 읽어옴
 * @param {string} type 불러올 데이터의 종류 혹은 출처의 구분
 * @param {object} [id] 로컬 파일의 종류, 웹 파일의 URI, 세션 파일의 정규 표현식 등
 */
methods.Get = async function(type, key) {
  var ret = {};

  // type에 따라 switch문 전개
  switch (type) {
    case "shared":  // 모듈 공용 데이터 로드
      ret = SHARED_DATA;
      break;

    case "default": // 기본 설정 로드
      ret = DEFAULT_CONFIG;
      break;

    case "config":  // URI로부터 설정 로드
      await api.Get( {uri:key} )
        .then( function(res) { ret = JSON.parse(res); } );
      break;

    case "session": // sessionStorage에 저장된 설정 로드
      Object.keys(sessionStorage).some( function(el) {
        if (el.match(key)) {
          ret = JSON.parse(sessionStorage.getItem(el));
          sessionStorage.removeItem(el);
          return true;
        }
        return false;
      } );
      break;

    case "theme":
      await api.Get( {uri:key} )
        .then( function(res) { ret = message.ParseTheme(res); } );
      break;

    default:
      break;
  }
  return ret;
};


/**
 * 추가로 불러온 설정을 기본 설정과 병합
 * @param {object} target 병합될 목적 오브젝트
 * @param {object} source 병합할 재료 오브젝트
 */
methods.Merge = function(target, source) {
  Object.keys(source).forEach( function(el) {
    // 존재하지 않았던 값 추가
    if (typeof target[el] === undefined || target[el] === null) {
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
 * 모듈 Load, 핵심 메서드
 * 모듈에 하위 모듈들로부터 불러온 데이터를 추가
 * @param {object} uniformData 메인 모듈 오브젝트
 */
methods.Load = async function(uniformData) {
  // 포인터를 연결
  api = uniformData.Api;

  // 내부 데이터를 연결
  this.shared = data.shared = await methods.Get("shared");
  this.config = data.config = await methods.Get("default");

  // 세션 설정을 연결
  methods.Merge(data.config, await methods.Get("session", SESSION_CONFIG_REGEX));

  // 웹 설정을 로드
  var uris = JSON.parse( JSON.stringify(data.config.Data.Uris) );
  var webConfigs = await Promise.all( uris.map( async function(el) {
    return await methods.Get("config", el);
  } ) );

  // 로드한 웹 설정을 연결
  webConfigs.forEach( function(el) {
    methods.Merge(data.config, el);
  }, this);
};


/**
 * 모듈 오브젝트
 * 전달받은 메서드로 모듈 내부 메서드와 데이터를 자기자신과 연결하여 반환
 */
module.exports = function(InitModule) { return InitModule.call({}, methods, data); };