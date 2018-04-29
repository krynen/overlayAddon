module.exports = new function() {
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
  window.addEventListener("error", function(evt) {
    this.objs.message.debug(evt.error);
  }.bind(this) );
  
  this.objs.irc.addEventListener("connect", function(evt) {
    this.data.shared.loadApi("all");
  }.bind(this) );
  this.objs.irc.connect();
  
  return this;
}();