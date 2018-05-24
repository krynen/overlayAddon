/* 모듈 메서드 정의 */
var method = {
  apply : function(parent) {
    Object.keys(parent).forEach( function(target) {
      Object.assign(parent[target], {
        eventListeners        : {},
        addEventListener      : function(type, callback) {
          if (!(type in this.eventListeners)) this.eventListeners[type] = [];
          this.eventListeners[type].push(callback);
        },
        removeEventListener   : function(type, callback) {
          if (!(type in this.eventListeners)) return;
          
          var stack = module.exports.eventListeners[type];
          for (var i=0; i<stack.length; ++i) {
            if (stack[i] === callback) {
              stack.splice(i, 1);
              return this.removeEventListener(type, callback);
            }
          }
        },
        dispatchEvent         : function(event) {
          if (!(event.type in this.eventListeners)) return;
          
          var stack = this.eventListeners[event.type];
          event.target = this;
          for (var i=0; i<stack.length; ++i) stack[i].call(this, event);
        }
      } );
    } );
  }
};


/* 정의된 엘리먼트 적용 */
module.exports = new function() {
  this.method = method;
  
  return this;
}();