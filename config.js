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
  // 접속할 채널 아이디
  "Channel" : "ninja",

  "Data"    : {
    // 추가로 불러올 (웹상의) json 설정 파일
    "Uris"  : {
      "type"  : "replace",
      "value" : []
    }
  },

  "Error" : {
    // 오류 메세지 상세 정보 출력 여부
    "Detailed" : true,

    // 각 오류 메세지 문자열
    "Message_No_NormalRoot" : "TemplateNormalRoot Template을 찾지 못했습니다.",
    "Message_No_ErrorRoot"  : "TemplateErrorRoot와 TemplateNormalRoot Template을 찾지 못했습니다.",

    "Data_Fail_Config" : "설정 파일을 불러오는데 실패했습니다.",
    "Data_Fail_Theme"  : "테마 템플릿을 불러오는데 실패했습니다.",

    "Irc_Notice"          : "트위치 채팅 서버에 문제가 발생한 것 같습니다.",
    "Irc_Wrong_Channel"   : "잘못된 트위치 유저 아이디입니다.",
    "Irc_Success_Connect" : "채팅 서버에 무사히 접속되었습니다.",
    "Irc_Fail_Connect"    : "채팅 서버와의 접속에 실패했습니다.",
    "Irc_Close_Connect"   : "채팅 서버와의 연결이 종료되었습니다.",
    "Irc_Wrong_Message"   : "처리되지 않는 메세지입니다."
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