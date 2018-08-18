/********************************************************
 * API 로드 모듈                                        *
 * API 엔드포인트로부터 받은 리스폰스를 반환하는 모듈   *
 * 응원 이모티콘 등 내부에서 해결할 수 없는 부분을 처리 *
 *                                                      *
 ********************************************************/

// 모듈 인터페이스
var methods = {};
var data = null;


/**
 * 외부 API를 불러오는데 사용할 Http 리퀘스트 메서드
 * @param {string} data.uri 요청할 URI
 * @param {number} [data.timeout] 요청 제한시간
 * @param {array} [data.header] 클라이언트 ID 등의 리퀘스트 헤더
 */
methods.Get = async function(data) {
  return new Promise( async function(resolve, reject) {
    // Request 열기
    var request = new XMLHttpRequest();
    request.open("GET", data.uri);

    // 타임아웃 설정
    if (typeof data.timeout === "number") { request.timeout = data.timeout; }

    // 헤더 설정
    if (Array.isArray(data.header)) {
      data.header.forEach( function(el) {
        request.setRequestHeader(el.key, el.value);
      } );
    }

    // Request 콜백 설정
    request.onload = function(evt) {
      if (request.readyState === 4) {
        if (request.status === 200) { resolve(request.responseText); }
        else { return request.statusText; }
      }
    };
    request.onerror = function(err) { reject(request.statusText); }
    request.ontimeout = function(err) { reject(err); }
    request.send();
  } );
};


/**
 * 모듈 오브젝트
 * 전달받은 메서드로 모듈 내부 메서드와 데이터를 자기자신과 연결하여 반환
 */
module.exports = function(InitModule) { return InitModule.call({}, methods, data); };