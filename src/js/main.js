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
  
  this.data = {
    config : require("./data/config.js")(this),
    shared : require("./data/shared.js")(this),
    module : require("./data/module.js")(this)
  };
  
  this.objs = { event : require("./event.js") };
  Object.assign(this.objs, {
    message : require("./message/main.js")(this),
    config  : require("./data/config.js")(this),
    irc     : require("./irc/main.js")(this)
  } );

  this.objs.message.init();  
  this.objs.irc.addEventListener("connect", function(evt) {
    this.data.shared.loadApi("all");
  }.bind(this) );
  this.objs.irc.connect();
  
  return this;
}();