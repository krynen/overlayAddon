/***************************************************
 * 채팅 청소 하위모듈                              *
 * 기존 메세지를 정리                              *
 * 유저 이름 입력으로 특정 유저 메세지만 정리 가능 *
 *                                                 *
 ***************************************************/

// 모듈 인터페이스
var methods = {};
var data = {};

// 포인터 정의
var config  = null;
var message = null;
var theme   = null;


/**
 * 채팅 청소 메서드
 * @param {string[]} text 어절별로 분리된 메세지 문자열
 */
methods.Execute = function(text) {
  if (text.length === 0) {
    // 모든 채팅 삭제
    Object.keys(message.nodes).forEach( function(el) {
      while ((message.nodes[el]||[]).length > 0) {
        message.nodes[el].shift().forEach( function(node) {
          message.entryPoint[el].removeChild(node);
        } );
      }
    } );

    return true;
  } else {
    // 특정 유저 채팅 삭제
    text.forEach( function(el) {
      for (var i=0; i<(message.nodes["Normal"]||[]).length; ++i) {
        if (message.nodes["Normal"][i].some( function(node) {
          var element = node.getAttribute("data-name") === el;
          var children = node.querySelectorAll(`*[data-name=${el}]`).length > 0;
          return element || children;
        } ) === true) {
          message.nodes["Normal"].splice(i--, 1)[0].forEach( function(node) {
            message.entryPoint["Normal"].removeChild(node);
          } );
        }
      }
    } );

    return false;
  }
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