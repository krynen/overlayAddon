module.exports = new function() {

  this.data = {
    config : {
      channel : "ninja"    // 테스트용 계정. 거의 항상 채팅하는 유저가 있어 유용.
    },
    shared : {},
    module : require("./data/module.js")()
  };
  
  this.objs = {
    message : {},
    config  : require("./data/config.js")(this),
    irc     : require("./irc/main.js")(this)
  };
  
  return this;
}();