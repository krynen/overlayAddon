/**************************
 * 테마 세부조절 하위모듈 *
 * CSS 변수를 조절        *
 *                        *
 **************************/

// 모듈 인터페이스
var methods = {};
var data = {};

// 포인터 정의
var config  = null;
var message = null;


/**
 * 테마 세부조절 메서드
 * @param {string[]} text 어절별로 분리된 메세지 문자열
 */
methods.Execute = async function(text) {
  for(var i=text.length-1; i>=0; --i) { 
    if (text[i].match(/^\s*$/) !== null) { test.splice(i, 1); }
  }

  if (text.length < 2) { return; }
  var property = text.shift();
  var value = text.join(" ");
  var element = document.documentElement;

  element.style.setProperty(`--${property}`, value);
  element.setAttribute(`data-${property}`, value);
  return false;
};


/**
 * 모듈 Load 메서드
 * 포인터를 메인 모듈과 연결
 * @param {object} uniformData 메인 모듈 오브젝트
 */
methods.Load = function(uniformData) {
  config  = uniformData.Data.config;
  message = uniformData.Message;
};


/**
 * 모듈 오브젝트
 * 전달받은 메서드로 모듈 내부 메서드와 데이터를 자기자신과 연결하여 반환
 */
module.exports = function(InitModule) { return InitModule.call({}, methods, data); };