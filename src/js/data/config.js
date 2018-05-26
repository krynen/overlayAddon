/* 모듈 내부데이터 설정 */
var uri = "./dat/config.json";


/* 데이터 기본값(기본 설정) */
var data = {
  channel : {
    "name"     : ""             // 접속할 IRC 채널 이름
  },
  api     : {
    session    : {
      "timeout"         : 1800  // 각 sessionStorage의 유효시간(초)
    }
  },
  message : {
    moderator  : {                // 에러 메세지를 표시할 유저명
      "name"       : "DEBUG",
      "badges"     : ["moderator/1"]
    },
    color      : {
      "userColor"       : true,   // 유저 색 활성화
      "customColor"     : true,   // 유저 고유 색 사용
      "defaultColor"    : [       // 고유 색 미사용시 사용할 색 리스트  
          "#FF0000", "#0000FF", "#008000", "#B22222", "#FF7F50",
          "#9ACD32", "#FF4500", "#2E8B57", "#DAA520", "#D2691E",
          "#5F9EA0", "#1E90FF", "#FF69B4", "#8A2BE2", "#00FF7F"
      ],
      "meVisible"       : [       // 색채팅(/me) 사용을 허용할 뱃지(유저 등급)
        "all"
      ],
      "meColored"       : [       // 색채팅 사용을 허용할 뱃지(유저 등급)
        "broadcaster", "moderator"
      ]
    },
    errorText  : {                // 오류 메세지의 텍스트
      "loadConfigFail"  : "설정을 불러올 수 없었습니다.",
      "loadDataFail"    : "{data} 데이터를 불러올 수 없었습니다.",
      
      "ircWrongMessage" : "처리되지 않은 메세지입니다.\n{error}",
      "ircNotice"       : "트위치 : {notice}",
      "ircClosed"       : "서버와의 접속이 종료되었습니다.\n 에러코드 {error}",
      "ircConnectFail"  : "서버와의 접속에 실패했습니다.\n{error}",
      "ircWrongChannel" : "{channel}은 올바르지 않은 채널입니다."
    },
    customText : {                // 여러 상황에서의 텍스트
    }
  }
};


/* 내부 메서드 정의 */
var method = {
  load    : function(uniformData) {    
    /* api.method.load()를 호출 */
    uniformData.api.method.load("config.data", uri, 0, function(storage) {
      if (storage) {
        /* config.data.session.timeout이 바뀌었을 수 있으므로 타임아웃을 따로 지정 */
        if (((storage.api||{}).session||{}).timeout >0) {
          var timeout = setTimeout(function() {
            clearTimeout(timeout);
            sessionStorage.removeItem("config.data");
          }, storage.api.session.timeout*1000);
        }
        
        /* 불러온 설정값 적용 */
        Object.keys(storage).forEach( function(name) {
          if (uniformData.config.data[name]) {
            Object.assign(uniformData.config.data[name], storage[name]);
          } else {
            uniformData.config.data[name] = stroage[name];
          }
        } );
        Object.assign(uniformData.config.data, storage);
        uniformData.config.dispatchEvent(new Event("load"));
      } else {
        /* 받아온 storage가 null일 때 */
        uniformData.message.method.error("loadConfigFail");
      }
    } );
  }
};


/* 정의된 엘리먼트 적용 */
module.exports = new function() {
  this.data = data;
  this.method = method;

  return this;
}();