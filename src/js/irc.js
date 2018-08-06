/*********************
 * 테스트용 IRC 모듈 *
 *                   *
 *********************/ 

var methods = {};
methods.test = function(){};

var data = {};
data.test = 0;


/**
 * 모듈 오브젝트
 * 전달받은 메서드로 모듈 내부 메서드와 데이터를 자기자신과 연결하여 반환
 */
module.exports = function(InitModule) { return InitModule.call({}, methods, data); };