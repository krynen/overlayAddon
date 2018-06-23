/* 모듈 내부데이터 설정 */
var message = null;
var config  = null;
var theme   = null;
var emotes  = null;
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
};
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
      if (Array.isArray(struct.classes)) {
        struct.classes.forEach( function(el) { dom.classList.add(el); } );
      }
      if (Array.isArray(struct.variable)) {
        struct.variable.forEach( function(target) {
          var type = target.type;
          var value = new String(target.value);

          /* value의 {name} 수정 */
          if (lowerModule.orimg) {  // 전용이미지 선처리
            value = lowerModule.orimg.method.setDomValue(object, value);
          }
          if (lowerModule.cheer) {  // 응원 선처리
            value = lowerModule.orimg.method.setDomValue(object, value);
          }
          var matches = value.match(/{[^}]+}/g);
          (matches||[]).forEach( function(match) {
            switch(match.replace(/[{}]/g,"")) {
            /* 이름 색상 */
            case "color":
              var color = getColor(object);
              if (color) { value = value.replace(match, color); }
              else       { value = ""; }
              break;

            /* 색채팅시 이름 색상(채팅색과 이름색이 같으므로) */
            case "meColor":
              if (object.me) {
                var color = getColor(object);
                if (color) { value = value.replace(match, color); }
                else       { value = ""; }
              } else { value = null; }
              break;
            
            /* 유저 혹은 이모티콘이나 전용이미지의 이름 */
            case "name":
              if (object.name) {
                value = value.replace(match, object.name);
              }
              break;
            
            /* 메세지 텍스트 혹은 응원이모티콘의 금액 */
            case "text":
              if (object.text) {
                value = value.replace(match, object.text);
              }
              break;
              
            /* 이모티콘 및 전용이미지 URI */
            case "uri":
              if (object.uri) {
                value = value.replace(match, object.uri);
              }
              break;
            
            /* 수치 범위에서 랜덤 */
            case "random":
              if (target.min && target.max && target.interval) {
                var num = Math.random();
                num *= Math.ceil((target.max-target.min)/target.interval) *
                       target.interval;
                num += target.min - num%target.interval;
                
                /* 정수간격이거나 digit이 존재할 경우 부동소수점을 처리 */
                if (Number.isInteger(target.interval)) { num = parseInt(num); }
                else if (target.digit) { num = num.toFixed(target.digit); }
                
                value = value.replace(match, num);
              } else { value = null; }
              break;
              
            /* 목록에서 랜덤 */
            case "listRandom":
              if (Array.isArray(target.list)) {
                var index = Math.floor(Math.random()*target.list.length);
                value = value.replace(match, target.list[index]);
              } else { value = null; }
              break;
              
            default:
              value = null;
              break;
            }
          } );
          
          /* 각 value를 type에 적용 */
          if (value) {
            switch(type[0]) {
            case "data":
              dom.setAttribute(type[1], value);
              break;
              
            case "style":
              dom.style[type[1]] = value;
              break;
              
            case "class":
              dom.classList.add(value);
              break;
              
            case "src":
              dom.src = value;
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
                badge.src = data.versions[index]["image_url_1x"];
              }
              parent.appendChild(badge);
            } );
            break;
            
          case "donationHeader":
            if ((object.cases.indexOf("type-donation")!=-1) && object.header) {
              parent.innerHTML += object.header;
            }
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
var getDom = function(data, struct) {
  var dom = document.createElement("span");
  addRecursive(data, struct, dom);
  var ret = dom.innerHTML;
  delete dom;
  return ret;
}


/* 모듈 메서드 정의 */
var method = {
  load  : function(uniformData) {
    /* 내부데이터에 연결 */
    message = uniformData.message;
    config  = uniformData.config.data.message;
    theme   = uniformData.shared.data.theme;
    emotes  = uniformData.shared.data.emotes;
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
              root.classes.forEach( function(el) { rootDOM.classList.add(el); } );
            }
            document.body.appendChild(rootDOM);
          }
        }    
      } );
    }
  },
  add   : function(object) {
    object.cases = [];
    
    /* 텍스트를 어절별로 처리 */
    var processes = new Array(object.text.length);
    
    if (object.emotes.length > 0) {                                   // 트위치 이모티콘 처리
      var emotesData = [];
      object.emotes.forEach( function(el) {
        var index = Number(el.split(":")[1].split("-")[0]);
        
        emotesData.push( {
          name : object.text.join(" ").slice(index).split(" ")[0],
          id   : el.split(":")[0]
        } );
      } );
      
      emotesData.forEach( function(el) {
        object.text.forEach( function(txt, ind, arr) {
          if (processes[ind] != undefined) { return; }
          if (txt == el.name) {
            var size = emotes.sizes[config.emotes.size];
            var uri = emotes.uri.replace("{id}", el.id).replace("{size}", size);
            arr[ind] = getDom(
              { uri:uri, name:el.name, emote:{} }, theme.normal.emotes);
            processes[ind] = "emote";
          }
        } );
      } );
    }
    if (lowerModule.orimg && config.orimg) {                          // 전용이미지 처리
      var list = lowerModule.orimg.method.get(object, processes);
      
      if (list) {
        list.forEach( function(el) {
          object.text[el.index] = getDom(
            { id:object.id, uri:el.uri, name:el.name, orimg:{method:el.method} },
            theme.normal.orimgs
          );
          processes[el.index] = "orimg";
        } );
      }
    }
    if (Number(object.bits) > 0) {                                    // 응원 메세지
      if (lowerModule.cheer) {
        var list = lowerModule.cheer.method.get(object, processes);

        /* 각 어절을 변환 */
        if (list) {
          list.forEach( function(el) {
            object.text[el.index] = getDom(
              { name:el.name, text:el.value, uri:el.uri }, theme.normal.cheers);
            processes[el.index] = "cheer";
          } );
        }
      }
    }
    {                                                                 // 색채팅 처리
      /* 색채팅 여부 체크 */
      var tail = object.text[object.text.length-1];
      var cond = object.text && object.text[0] && object.text[0]=="ACTION";
      cond = cond && tail && (tail.match(/$/)!=null);
      if (cond) {
        /* 색채팅 표시 여부 체크 */
        cond = config.color.meVisible.some( function(el) {
          if (el == "all") { return true; }
          return object.badges.some( function(badge) {
            return (badge.indexOf(el) == 0);
          } );
        } );
        if (!cond) { return; }
        
        /* 색채팅 강조 여부 체크 */
        cond = config.color.meColored.some( function(el) {
          if (el == "all") { return true; }
          return object.badges.some( function(badge) {
            return (badge.indexOf(el) == 0);
          } );
        } );

        object.text.shift();
        processes.shift();
        object.text[object.text.length-1] = tail.replace(/$/, "");
        
        if (cond) {
          object.cases.push("type-me");
          object.me = 1;
        }
      }
    }

    
    /* text 데이터를 문자열로 변환 */
    object.text = object.text.join(" ");
    

    /* 텍스트를 전체적으로 처리 */
    if (lowerModule.twip && !lowerModule.twip.method.apply(object)) { // 트윕 후원 메세지
      return;
    }
    if (!object.text.match(/^[\s]*$/)) {                              // 길이가 0이 아닌 메세지
      object.cases.push("type-text");
    }
    
    /* DOM생성 및 등록 */
    var root = document.getElementById((((theme||{}).normal||{}).root||{}).id);
    if (root) {
      var struct = JSON.parse(JSON.stringify(theme.normal.struct));
      if (!struct.variable) { struct.variable = []; }
      object.cases.forEach( function(el) {
        struct.variable.push({ type:["data", el], value:"1" });
      } );

      addRecursive(object, struct, root);
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
      addRecursive(object, theme.error.struct, root);
    } else {
      /* message.load()가 없어 root가 생성되지 않았을 때 예외처리 */
      var error = document.createElement("div");
      Object.assign(error.style, { background:"red", color:"white", fontWeight:"bold" });
      error.innerHTML = object.text;
      document.body.appendChild(error);
    }
  }
};


/* 하위 모듈 정의 */
var lowerModule = {
  emote : null,
  orimg : null,
  twip  : null,
  cheer : null
};


/* 정의된 엘리먼트 적용 */
module.exports = new function() {
  this.method = method;
  this.module = lowerModule;
  
  return this;
}();