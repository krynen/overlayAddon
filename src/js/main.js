module.exports = new function() {

  this.data = {
    config : {
      channel : "ninja"    // 테스트용 계정. 거의 항상 채팅하는 유저가 있어 유용.
    },
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