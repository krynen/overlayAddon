/***********************************
 * 구독 하위모듈                   *
 * 구독 관련 메세지를 처리         *
 * 정기 구독, 구독 연장, 구독 선물 *
 *                                 *
 ***********************************/

// 모듈 인터페이스
var methods = {};
var data = {};

// 포인터 정의
var config = null;
var parent = null;


/**
 * 상위 모듈의 메세지 정보를 설정하고 헤더를 추가하는 메서드
 * @param {Object} message Replace()와 동일한 message
 * @param {Object} parentMessage parent.AddSubElement()의 message
 */
methods.Set = function(message, parentMessage) {
  if (message.subs === undefined && message.gift === undefined) { return; }

  if (parentMessage.attr === undefined) { parentMessage.attr = {}; }
  if (message.subs !== undefined) { parentMessage.attr["subs"] = "1"; }
  if (message.gift !== undefined) { parentMessage.attr["gift"] = "1"; }

  if (parentMessage.root === undefined) { parentMessage.root = {}; }
  if (message.subs !== undefined) {
    parentMessage.root.SubsHead = {
      "attr" : { "name":message.tier, "value":message.subs },
      "name" : parentMessage.name,
      "text" : message.subs
    };
  }
  if (message.gift !== undefined) {
    parentMessage.root.GiftHead = {
      "attr" : { "name":message.tier, "value":message.gift },
      "name" : parentMessage.name,
      "text" : message.gift
    };
  }
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