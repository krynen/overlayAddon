/* 모듈 내부데이터 설정 */
var message = null;
var config  = null;
var theme   = null;
var badges  = null;           // load()를 통해 uniformData와 연결


/* 내부 메서드 정의 */
var getColor = function(object) {
  /* 설정값에 따라 유저 이름 색을 가져옴 */
  if (config.color.userColor) {
    if (config.color.customColor && object.color!="") {
      return object.color;
    } else {
      var list = config.color.defaultColor;
      return list[object.id % list.length];
    }
  } else { return null; }
}

var addRecursive = function(object, struct, parent) {
  var condition = (!Array.isArray(struct.cases) || struct.cases.length==0);
  /* struct에 cases가 존재할 경우 메세지 출력 조건을 판단 */
  if (!condition) {
    condition = object.cases.some(function(el) {
      return struct.cases.indexOf(el) != -1;
    });
  }
  
  if (condition) {
    if (struct.tag) {
      /* tag가 존재할 경우 DOM을 생성 */
      var dom = document.createElement(struct.tag);
      if (Array.isArray(struct.classes)) { dom.classList.add(struct.classes); }
      if (struct.variable) {
        Object.keys(struct.variable).forEach( function(name) {
          var type = struct.variable[name].type;
          var value = struct.variable[name].value;
          
          /* value의 {name} 수정 */
          value.match(/{[^}]+}/g).forEach( function(match) {
            switch(match.replace(/[{}]/g,"")) {
            /* 이름 색상 */
            case "color":
              var color = getColor(object);
              if (color) { value = value.replace(match, color); }
              else       { value = ""; }
              break;

            /* 색채팅시 이름 색상(채팅색과 이름색이 같으므로) */
            case "meColor":
              var cond = config.color.meColored.some( function(el) {
                if (el == "all") { return true; }
                return object.badges.some( function(badge) {
                  return (badge.indexOf(el) == 0);
                } );
              } );
              cond &= object.me == 1;
              
              if (cond) {
                var color = getColor(object);
                if (color) { value = value.replace(match, color); }
                else       { value = ""; }
              }
              break;
              
            default:
              value = null;
              break;
            }
          } );
          
          /* 각 value를 type에 적용 */
          if (value) {
            switch(type[0]) {
            case "style":
              dom.style[type[1]] = value;
              break;
              
            default:
              break;
            }
          }
        } );
      }
      parent.appendChild(dom);
      parent = dom;
    }
    if (Array.isArray(struct.children)) {
      /* children이 존재할 경우 하위 처리 및 재귀 호출 */
      struct.children.forEach( function(el) {
        if (typeof el == "object") { addRecursive(object, el, parent); }
        else {
          switch(el) {
          case "badges":
            object.badges.forEach( function(el) {
              var badge = document.createElement("img");
              badge.classList.add(el);
              
              var data = badges.list[el.split("/")[0]];
              if (data) {
                var index = el.split("/")[1];
                /* 다른 서브뱃지가 없을 경우 최소 뱃지를 표시
                   유저 구독뱃지를 로드하는데 실패했을 때 기본 구독뱃지를 표시함 */
                if (!data.versions[index]) {
                  index = Math.min.apply(null, Object.keys(data.versions));
                }
                badge.src = data.versions[index]["image_url_4x"];
              }
              parent.appendChild(badge);
            } );
            break;
            
          case "name":
          case "text":
          default:
            if (object[el]) { parent.innerHTML += object[el]; }
            break;
          }
        }
      } );
    }
  }
  
  return parent;
};


/* 모듈 메서드 정의 */
var method = {
  load  : function(uniformData) {
    /* 내부데이터에 연결 */
    message = uniformData.message;
    config  = uniformData.config.data.message;
    theme   = uniformData.shared.data.theme;
    badges  = uniformData.shared.data.badges;
    
    if (!config) {
      message.method.error("loadConfigFail");
      return;
    }
    
    /* 최상위 DOM 체크 및 생성 */
    with (uniformData.shared.data.theme) {
      [error, normal].forEach( function(el) {
        with (el) {
          var rootDOM = document.getElementById(root.id);
          if (!rootDOM) {
            rootDOM = document.createElement(root.tag);
            rootDOM.id = root.id;
            if (Array.isArray(root.classes)) {
              rootDOM.classList.add(root.classes);
            }
            document.body.appendChild(rootDOM);
          }
        }    
      } );
    }
  },
  add   : function(object) {
    object.cases = [];
    
    /* 텍스트가 있는 메세지 처리 */
    if (!object.text.match(/^[\s]*$/)) { object.cases.push("type-text"); }
    /* 응원이 있는 메세지 처리 */
    if (Number(object.bits)>0) { object.cases.push(["type-donation", "type-cheer"]); }
    /* 색채팅 처리 */
    if (object.text.match(/ACTION [^]+/)) {
      object.text = object.text.replace(/ACTION ([^]+)/, "$1");
      object.cases.push(["type-me"]);
      object.me = 1;
    }
    
    /* DOM생성 및 등록 */
    var root = document.getElementById((((theme||{}).normal||{}).root||{}).id);
    if (root) {
      addRecursive(object, theme.normal.struct, root);
    } else {
      message.method.error("loadDataFail", { data:"테마" });
    }
  },
  error : function(key, option) {
    var object = Object.assign(
      { text: config.errorText[key] }, config.moderator);
    
    if (object.text && option) {
      Object.keys(option).forEach( function(key) {
        object.text = object.text.replace("{"+key+"}", option[key]);
      } );
    }
    
    var root = document.getElementById(theme.error.id);
    if (root) {
      addReculsive(object, theme.error.struct, root);
    } else {
      /* message.load()가 없어 root가 생성되지 않았을 때 예외처리 */
      var error = document.createElement("div");
      Object.assign(error.style, { background:"red", color:"white", fontWeight:"bold" });
      error.innerHTML = object.text;
      document.body.appendChild(error);
    }
  }
};


/* 정의된 엘리먼트 적용 */
module.exports = new function() {
  this.method = method;
  
  return this;
}();