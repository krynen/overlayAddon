/* 모듈 내부데이터 설정 */
var api     = null;
var message = null;
var config  = null;
var data    = null;
var method  = null;          // load()를 통해 uniformData와 연결


/* 데이터 기본값(기본 설정) */
var data = {
  channel : {
    "id"     : null                                    // IRC 접속으로 재정의
  },
  
  badges  : {
    "uris"   : [
      "https://badges.twitch.tv/v1/badges/global/display",
      "https://badges.twitch.tv/v1/badges/channels/{channel}/display"
    ],
    "list"   : {}                                      // load("badges")로 로드
  },
  
  cheers  : {
    "uri"    : "https://api.twitch.tv/kraken/bits/actions?api_version=5&channel_id={channel}",
    "list"   : {}                                      // load("cheers")로 로드
  },
  
  irc       : {
    "uri"      : "wss://irc-ws.chat.twitch.tv:443",    // 트위치 IRC 서버
    "nick"     : "justinfan" + Math.random().toString().slice(2,7),
                                                       // IRC에 접속할 게스트 닉네임
    "pass"   : Math.random().toString().slice(2,10),   // 암호로는 아무 텍스트나 사용 가능
    "caps"   : [ /* capabilities */                    // 해당 이벤트의 메세지를 수신케 함
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
            variable : [
              { type:["style", "color"], value:"{color}" }
            ],
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
            tag      : "div",
            variable : [
              { type:["style", "color"], value:"{meColor}" },
              { type:["style", "border"], value:"1px dotted {meColor}" }
            ],
            cases    : ["type-text"],
            classes  : ["text"],
            children : [
              {
                tag      : "span",
                cases    : ["type-donation"],
                classes  : ["donation", "header"],
                children : [
                  "donationHeader",
                  { tag    : "br" }
                ]
              },
              "text"
            ]
          }
        ]
      },
      "bits"       : {
        tag       : "span",
        classes   : ["bitNum"],
        children  : [
          {
            tag      : "img",
            variable  : [ { type:["src"], value:"{bitImg}" } ]
          },
          "text"
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
    var key = "shared.data.badges";
    if (uri.indexOf("{channel}") != -1) {
      uri = uri.replace("{channel}", data.channel.id);
      key += "." + data.channel.id;
    } else {
      key += ".global";
    }
    
    /* api.method.load()를 호출 */
    var lifetime = config.api.session.timeout;
    api.load(key, uri, lifetime, null, function(storage) {
      if (storage) {
        if (typeof storage == "string") { storage = JSON.parse(storage); }
        
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
var loadCheer = function() {
  var uri = data.cheers.uri;
  
  if (uri.indexOf("{channel}") != -1) {
    uri = uri.replace("{channel}", data.channel.id);
    var key = "shared.data.cheers." + data.channel.id;
    var lifetime = config.api.session.timeout;
    
    api.load(key, uri, lifetime, config.id, function(storage) {
      if (storage) {
        if (typeof storage ==  "string") { storage = JSON.parse(storage); }
        
        if (storage["actions"]) {
          storage = storage["actions"];
          sessionStorage.setItem(key, JSON.stringify(storage));
        }
      
        if (storage["error"] == undefined) {
          data.cheers.list = storage;
          return;
        }
      }
      message.error("loadDataFail", { data:"응원 이모티콘" });
    } );
  } else {
    message.error("loadDataFail", { data:"응원 이모티콘" });
  }
}
  

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
      
    case "cheers":
      loadCheer();
      break;
      
    case "all":
    default:
      loadBadge();
      loadCheer();
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