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
  // 트위치 어플리케이션 클라이언트 아이디
  "Key"     : "",

  "Command" : {
    // 명령어 문자(열). 공백이 없을 것
    "Prefix" : "!!",
    "List"   : {
      "clear" : {
        // alias는 무조건 내용이 있어야 함
        // 사용하지 않을 경우 allow를 비울 것
        "allow" : { "type":"replace", "value":["broadcaster/0", "moderator/0"] },
        "alias" : { "type":"replace", "value":["clear"] }
      },
      "style" : {
        "allow" : { "type":"replace", "value":["broadcaster/0"] },
        "alias" : { "type":"replace", "value":["style"] },
        "list"  : {}
      },
      "theme" : {
        "allow"  : { "type":"replace", "value":["broadcaster/0"] },
        "alias"  : { "type":"replace", "value":["theme"] },
        "enbale" : true
      }
    }
  },

  "Data"    : {
    // 추가로 불러올 (웹상의) json 설정 파일
    // (내부 설정과) 세션 설정을 통해서만 입력할 수 있음
    "Uris"  : {
      "type"  : "replace",
      "value" : []
    }
  },

  "Theme"   : {
    // 테마 템플릿들의 상위 경로
    "BaseUri"   : "./example/theme/",
    // 테마 파일명
    "FileName"  : ""
  },

  "Message" : {
    // 표시할 메세지의 최대 갯수 (0-100)
    "Maximum" : 10,
    // 메세지 자동 삭제 시간(초). 0으로 무제한
    "Timeout" : 20,

    "Color"   : {
      // 이름 색, 색채팅 등을 사용할지 여부
      "Enable" : true,
      // 이름 색을 설정하지 않은 유저를 위한 기본 이름색 목록
      "List" : {
        "type"  : "replace",
        "value" : [
          "rgb(255,0,0)", "rgb(0,0,255)", "rgb(0,128,0)",
          "rgb(178,34,34)", "rgb(255,127,80)", "rgb(154,205,50)",
          "rgb(46,139,87)", "rgb(255,69,0)", "rgb(218,165,32)",
          "rgb(210,105,30)", "rgb(95,158,160)", "rgb(30,144,255)",
          "rgb(255,105,180)", "rgb(138,43,226)", "rgb(0,255,127)"
        ]
      },
      // 색채팅을 사용할 수 있는 권한 뱃지. 빈 문자열 추가로 무제한
      "ColorChat" : {
        "type"  : "replace",
        "value" : [
          "broadcaster/0", "moderator/0"
        ]
      }
    },

    "Twip"    : {
      "Enable" : true,
      // 트윕 후원 메세지 양식(name, value, text <- 이름, 금액, 메세지)
      "Format" : "{name}({value}원) : {text}"
    },

    "Link"    : {
      "Enable" : true
    }
  },

  "Error" : {
    "Maximum" : 5,
    "Timeout" : 5,
    // 오류 메세지 상세 정보 출력 여부
    "Detailed" : true,
    // 모듈 로드 완료 메세지(로고) 출력 여부
    "Module_Success_Connect" : true,

    // 각 오류 메세지 문자열
    "Message_Fail_Badge"    : "뱃지 정보를 불러오는데 실패했습니다.",
    "Message_Fail_Cheer"    : "응원 이모티콘 정보를 불러오는데 실패했습니다.",
    "Message_Wrong_Cheer"   : "클라이언트 아이디가 없어 응원 정보를 읽지 않습니다.",
    "Message_No_NormalRoot" : "TemplateNormalRoot Template을 찾지 못했습니다.",
    "Message_No_ErrorRoot"  : "TemplateErrorRoot와 TemplateNormalRoot Template을 찾지 못했습니다.",

    "Data_Fail_Config" : "설정 파일을 불러오는데 실패했습니다.",
    "Data_Fail_Theme"  : "테마 템플릿을 불러오는데 실패했습니다.",

    "Irc_Notice"        : "트위치 채팅 서버에 문제가 발생한 것 같습니다.",
    "Irc_Wrong_Channel" : "잘못된 트위치 유저 아이디입니다.",
    "Irc_Fail_Connect"  : "채팅 서버와의 접속에 실패했습니다.",
    "Irc_Close_Connect" : "채팅 서버와의 연결이 종료되었습니다.",
    "Irc_Wrong_Message" : "처리되지 않는 메세지입니다."
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