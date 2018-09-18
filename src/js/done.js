/*******************************************************
 * 로드 완료 확인 모듈                                 *
 * 외부 파일을 로드해야 하는 모듈을 등록               *
 * 등록된 모든 모듈이 완료되면 등록 완료 메세지를 표시 *
 *                                                     *
 *******************************************************/

// 모듈 인터페이스
var methods = {};
var data = {
  list : {}  // 등록된 모듈 목록
};

// 포인터 정의
var config  = null;
var shared  = null;
var message = null;


/**
 * 리스트 등록 메서드
 * @param {string} name 모듈의 이름
 */
methods.Register = function(name) { data.list[name] = false; };


/**
 * 모듈 완료 메서드
 * 모든 모듈이 완료되면 완료 메세지를 표시
 * @param {string} name 모듈의 이름
 */
methods.Done = function(name) {
  if (data.list[name] !== undefined) { data.list[name] = true; }
  if (Object.keys(data.list).every( function(el) { return data.list[el]  === true; })) {
    message.Error("Module_Success_Connect", null);
  }
};


/**
 * 모듈 Load 메서드
 * 포인터를 메인 모듈과 연결
 * @param {object} uniformData 메인 모듈 오브젝트
 */
methods.Load = function(uniformData) {
  config  = uniformData.Data.config;
  shared  = uniformData.Data.shared;
  message = uniformData.Message;
};


/**
 * 모듈 오브젝트
 * 전달받은 메서드로 모듈 내부 메서드와 데이터를 자기자신과 연결하여 반환
 */
module.exports = function(InitModule) { return InitModule.call({}, methods, data); };