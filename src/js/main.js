module.exports = new function() {
  this.error = function() {
    arguments = Array.prototype.slice.call(arguments)
    if (this.objs && this.objs.message && this.objs.message.debug) {
      this.objs.message.debug(arguments);
      return false;
    } else {
      /* 에러 메세지 표시 함수가 준비되기도 전에 오류가 발생했을 경우 */
      var error = document.createElement("div");
      Object.assign(error.style, { background:"red", color:"white", fontWeight:"bold" });
      error.innerHTML = arguments;
      document.body.appendChild(error);
      return true;
    }
  }.bind(this);
  
  this.objs = { event : require("./event.js") };
  this.data = {
    config : require("./data/config.js")(this),
    shared : require("./data/shared.js")(this),
    module : require("./data/module.js")(this)
  };
  
  Object.assign(this.objs, {
    message : require("./message/main.js")(this),
    config  : require("./data/config.js")(this),
    irc     : require("./irc/main.js")(this)
  } );

  /*
    1. 메세지 모듈을 초기화해 이후 모듈에서 오류가 나도 제대로 표시되도록 하고
    2. 설정을 불러와 접속할 채널을 정한 뒤
    3. IRC에 접속해 api에 필요한 채널 id를 받아오고
    4. API를 로드
  */
  this.objs.message.init();
  
  this.data.config.addEventListener("load", function(evt) {
    this.objs.irc.connect();
  }.bind(this) );

  this.objs.irc.addEventListener("connect", function(evt) {
    this.data.shared.loadApi("all");
  }.bind(this) );
  
  this.data.config.load();
  
  return this;
}();