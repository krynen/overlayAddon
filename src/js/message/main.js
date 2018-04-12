module.exports = function(uniformData) {
  return new (function() {
    /* 필드 초기화 */
    this.init = function() {};
    this.add = function(message) {};
    this.data = {};
    
    this.init = function() {
      /* 데이터 로드 */
      try { this.data = uniformData.data.module.message; }
      catch(event) { throw ["loadDataFail", "Error"]; }
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
      switch(el) {
      case "name":
        parent.innerHTML = message.name;
        break;
        
      case "text":
        parent.innerHTML = message.text;
        break;
        
      default :
        addRecursive(message, el, parent);
        break;
      }
    } );
  }
  return parent;
};