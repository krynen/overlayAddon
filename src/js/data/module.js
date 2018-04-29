module.exports = function(uniformData) {
  return new (function() {
    this.irc = {
      uri  : "wss://irc-ws.chat.twitch.tv:443",                  // 트위치 IRC 서버
      nick : "justinfan" + Math.random().toString().slice(2,7),  // 게스트 닉네임
      pass : Math.random().toString().slice(2,10),               // 게스트이므로 아무 텍스트나 가능
      capabilities : [                                           // 사용시 각 이벤트의 메세지를 수신
        "twitch.tv/tags",
        "twitch.tv/commands",
        "twitch.tv/membership" ]
    };
    
    this.message = {
      root      : {
        tag       : "div",
        id        : "root"
      },
      struct    : {
        tag       : "div",
        classes   : ["msg"],
        children  : [
          {
            tag     : "span",
            classes : ["name"],
            children : ["name"]
          },
          {
            tag      : "span",
            classes  : ["badges"],
            children : ["badges"]
          },
          { tag      : "br" },
          {
            tag      : "span",
            classes  : ["text"],
            children : ["text"]
          }
        ]
      },
      
      debug     : {
        root      : {
          tag       : "div",
          id        : "debugRoot"
        },
        struct    : {
          tag       : "div",
          classes   : ["msg"],
          children  : ["text"]
        }
      }
    };
    
    return this;
  })();
};