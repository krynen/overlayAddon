/*********************
 * 테스트용 IRC 모듈 *
 *                   *
 *********************/ 

// 모듈 인터페이스
var methods = {};
var data = null;


/**
 * 테스트용 로드 메서드
 * main.js에서 연결된 이후에 호출됨
 * @param {object} uniformData 메인 모듈 오브젝트
 */
methods.Load = function(uniformData) {};


/**
 * 모듈 오브젝트
 * 전달받은 메서드로 모듈 내부 메서드와 데이터를 자기자신과 연결하여 반환
 */
module.exports = function(InitModule) { return InitModule.call({}, methods, data); };