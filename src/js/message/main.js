module.exports = function(uniformData) {
  return new (function() {
    /* 필드 초기화 */
    this.init = function() {};
    this.add = function(message) {};
    this.data = {};
    
    this.init = function() {
      /* 데이터 로드 */
      try { this.data = uniformData.data.module.message; }
      catch(event) { throw ["loadDataFail"]; }
    };
    
    this.add = function(message) {
      var root = document.getElementById(this.data.rootId);
      if (!root) { throw ["messageNoRoot"]; }
      addRecursive(message, this.data.struct, root);
    };
    
    return this;
  })();
};


var addRecursive = function(message, struct, parent) {
  if (struct.tag) {
    var dom = document.createElement(struct.tag);
    if (Array.isArray(struct.classes)) { dom.classList.add(struct.classes); }
    parent.appendChild(dom);
    parent = dom;
  }
  if (Array.isArray(struct.children)) {
    struct.children.forEach( function(el) {
      if (typeof el == "object") { addRecursive(message, el, parent); }
      else {
        switch(el) {
        case "name":
          parent.innerHTML += message.name;
          break;
          
        case "text":
          parent.innerHTML += message.text;
          break;
          
        case "badges":
          message.badges.forEach( function(el) {
            parent.innerHTML += el;
          } );
          break;
          
        default :
          break;
        }
      }
    } );
  }
  return parent;
};