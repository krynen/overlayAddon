/* 모듈 내부데이터 설정 */
var api     = null;
var message = null;
var config  = null;
var data    = null;
var method  = null;          // load()를 통해 uniformData와 연결


/* 데이터 기본값(기본 설정) */
var data = {
  channel   : {
    "id"       : null                                  // IRC 접속으로 재정의
  },
  
  badges    : {
    uris : [
      "https://badges.twitch.tv/v1/badges/global/display",
      "https://badges.twitch.tv/v1/badges/channels/{channel}/display"
    ],
    "list"     : {}                                    // load("badges")로 로드
  },
  
  irc       : {
    "uri"      : "wss://irc-ws.chat.twitch.tv:443",    // 트위치 IRC 서버
    "nick"     : "justinfan" + Math.random().toString().slice(2,7),
                                                       // IRC에 접속할 게스트 닉네임
    "pass"     : Math.random().toString().slice(2,10), // 암호로는 아무 텍스트나 사용 가능
    "capabilities" : [                                 // 해당 이벤트의 메세지를 수신케 함
      "twitch.tv/tags",
      "twitch.tv/commands",
      "twitch.tv/membership"
    ]
  },
  
  theme     : {
    normal     : {                                     // 일반적 메세지의 구조
      "root"       : { tag:"div", id:"root" },         // tag, id는 반드시 포함해야 함
                                                       // cases, children은 포함할 수 없음
      "struct"     : {
        tag       : "div",
        classes   : ["msg"],
        children  : [
          {
            tag      : "span",
            variable : {
              color    : { type:["style", "color"], value:"{color}" }
            },
            classes  : ["name"],
            children : ["name"]
          },
          {
            tag      : "span",
            classes  : ["badges"],
            children : ["badges"]
          },
          { tag      : "br" },
          {
            cases    : ["type-donation"],
            children : [
              { 
                tag      : "div",
                classes  : ["donation"],
                children : ["donationHeader"]
              },
              { tag      : "br" }
            ]
          },
          {
            tag      : "span",
            variable : {
              color     : { type:["style", "color"], value:"{meColor}" },
              border    : { type:["style", "border"], value:"1px solid {meColor}" }
            },
            cases    : ["type-text"],
            classes  : ["text"],
            children : ["text"]
          }
        ]
      }
    },
    error      : {
      "root"       : { tag:"div", id:"errorRoot" },
      "struct"     : {
        tag       : "div",
        classes   : ["msg"],
        children  : ["text"]
      }
    }
  }
};


/* 내부 메서드 정의 */
var loadBadge = function() {
  /* uri 채널 아이디, storageKey 지정 */
  data.badges.uris.forEach( function(uri) {
    uri = uri.replace("{channel}", data.channel.id);
    var key = uri.split(/[^/]\/badges/)[1]
      .split("/display")[0]
      .replace("channels", "")
      .replace("/", ".");
    
    /* api.method.load()를 호출 */
    var lifetime = config.api.session.timeout;
    api.load(key, uri, lifetime, function(storage) {
      if (storage) {
        /* 불필요한 부분 제거 */
        if (storage["badge_sets"]) {
          storage = storage["badge_sets"];
          sessionStorage.setItem(key, JSON.stringify(storage));
        }
        
        /* 불러온 설정값 적용 */
        Object.keys(storage).forEach( function(key) {
          if (data.badges.list[key]) {
            Object.assign(data.badges.list[key].versions, storage[key].versions);
          } else {
            data.badges.list[key] = storage[key];
          }
        } );
      } else {
        message.error("loadDataFail", { data:"뱃지" });
      }
    } );
  } );
};
  

/* 모듈 메서드 정의 */
var method = {
  load      : function(uniformData, type) {
    api     =     api || uniformData.api.method;
    message = message || uniformData.message.method;
    config  =  config || uniformData.config.data;
    data    =    data || uniformData.shared.data;
    method  =  method || uniformData.shared.method;
    
    switch(type) {
    case "badges":
      loadBadge();
      break;
      
    default:
      loadBadge();
      break;
    }
  }
};


/* 정의된 엘리먼트 적용 */
module.exports = new function() {
  this.data = data;
  this.method = method;

  return this;
}();