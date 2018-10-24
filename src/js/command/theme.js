/******************************************
 * 테마 변경 하위모듈                     *
 * 지정 테마로 URI 옵션을 지정해 새로고침 *
 *                                        *
 ******************************************/

// 모듈 인터페이스
var methods = {};
var data = {};

// 포인터 정의
var config  = null;
var message = null;
var theme   = null;


/**
 * 테마 변경 메서드
 * @param {string[]} text 어절별로 분리된 메세지 문자열
 */
methods.Execute = async function(text) {
  if (config.Command.List.theme.enable !== true) { return; }
  
  var uri = location.href.split("?");
  if (uri.length === 1) { location.href = uri[0] + `?theme=${text[0]}`}
  else {
    if (uri[1].match(/theme=([^&]*)/) !== null) {
      uri[1] = uri[1].replace(/theme=([^&]*)/, `theme=${text[0]}`)
    } else {
      uri[1] = uri[1] + `&theme=${text[0]}`;
    }
  }
  location.href = uri.join("?");
};


/**
 * 모듈 Load 메서드
 * 포인터를 메인 모듈과 연결
 * @param {object} uniformData 메인 모듈 오브젝트
 */
methods.Load = function(uniformData) {
  config  = uniformData.Data.config;
  message = uniformData.Message;
  theme   = uniformData.Theme;
};


/**
 * 모듈 오브젝트
 * 전달받은 메서드로 모듈 내부 메서드와 데이터를 자기자신과 연결하여 반환
 */
module.exports = function(InitModule) { return InitModule.call({}, methods, data); };