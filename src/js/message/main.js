module.exports = function(uniformData) {
  return new (function() {
    /* 필드 초기화 */
    this.init = function() {};
    this.add = function(message) {};
    this.data = {};
    
    this.init = function() {
      /* 데이터 로드 */
      try { this.data = uniformData.data.module.message; }
      catch(event) { uniformData.error("loadDataFail", "메세지"); }
    };
    
    this.add = function(message) {
      var root = document.getElementById(this.data.root.id);
      if (!root)
      {
        root = document.createElement(this.data.root.tag);
        root.id = this.data.root.id;
        document.body.appendChild(root);
      }
      
      addRecursive(message, this.data.struct, root);
    };
    
    this.debug = function(message) {
      var root = document.getElementById(this.data.debug.root.id);
      if (!root)
      {
        root = document.createElement(this.data.debug.root.tag);
        root.id = this.data.debug.root.id;
        document.body.appendChild(root);
      }
      
      var debugMessage = {
        name   : "DEBUG",
        badges : ["moderator/1"],
        text   : message[0]
      };
      
      addRecursive(debugMessage, this.data.debug.struct, root);
    }
    
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
                var badge = document.createElement("img");
                badge.classList.add(el);
                
                var data = uniformData.data.shared.badges.list[el.split("/")[0]];
                if (data) {
                  var index = el.split("/")[1];
                  if (!data.versions[index]) {
                    // 다른 서브뱃지가 없을경우 최소 뱃지를 대신 표시
                    // 유저 구독뱃지를 로드하는데 실패했을 경우 기본뱃지를 대신 띄움
                    index = Math.min.apply(null, Object.keys(data.versions));
                  }
                  badge.src = data.versions[index]["image_url_1x"];
                }
                parent.appendChild(badge);
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
    
    return this;
  })();
};