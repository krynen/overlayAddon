/*******************************************
 * 예시용 세션 설정 파일                   *
 * 브라우저의 sessionStorage에 설정을 추가 *
 * 모듈에서 불러올 수 있도록 함            *
 *                                         *
 *******************************************/

var value =
/******************************************
 * 이하 블록을 수정하여 설정을 변경       *
 ******************************************/
{
  "Channel" : "ninja",
  "Data"    : {
    "Uris"  : {
      "type"  : "replace",
      "value" : []
    }
  }
}
;

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