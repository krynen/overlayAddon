/*******************************************
 * 예시용 전용 이미지 파일                 *
 * 브라우저의 sessionStorage에 설정을 추가 *
 * 모듈에서 불러올 수 있도록 함            *
 *                                         *
 *******************************************/

var orimg = 
/******************************************
 * 이하 블록을 수정하여 설정을 변경       *
 ******************************************/
{
  "Prefix"  : "~",
  "UriBase" : "dat/orimgs/",
  "Groups"  : [
    { "name":"목록",   "method":"none",     "rule":"이미지\\d" },
    { "name":"랜덤",   "method":"random",   "rule":"\\d+" },
    { "name":"순서",   "method":"sequence", "list":["이미지3", "이미지2", "이미지1", "이미지0"] },
    { "name":"아이디", "method":"fixed",    "rule":"\\d+" }
  ],
  "Images"  : [
    { "name":"0", "uri":"0.png", "alias":["이미지0"] },
    { "name":"1", "uri":"1.png", "alias":["이미지1"] },
    { "name":"2", "uri":"2.png", "alias":["이미지2"] },
    { "name":"3", "uri":"3.png", "alias":["이미지3"] },
    { "name":"4", "uri":"4.png" },
    { "name":"5", "uri":"5.png" },
    { "name":"6", "uri":"6.png" },
    { "name":"7", "uri":"7.png" },
    { "name":"8", "uri":"8.png" },
    { "name":"9", "uri":"9.png" }
  ]
}
;

/**
 * 포맷 변환부
 * 설정 포맷으로 orimg를 변환
 */
var value = (function() {
  orimg.Groups = { "type":"replace", "value":orimg.Groups };
  orimg.Images = { "type":"replace", "value":orimg.Images };
  return { "Message":{"Orimg":orimg} };
})();

(
/**
 * 세션 등록부
 * sessionStorage에 value object를 추가
 */
function() {
  var key = "data/config/" + (document.scripts.length - 1);
  sessionStorage.setItem(key, JSON.stringify(value));
}
)();