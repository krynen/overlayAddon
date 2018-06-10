/* 모듈 내부데이터 설정 */
var id     = 115581168;       // Twipkr 계정의 아이디
var config = null;            // load()를 통해 uniformData와 연결


/* 데이터 기본값(기본 설정) */
var data = {
  list    : ["{닉네임}", "{금액}", "{메시지}"],
  indexes : [],
  regExp  : null
};


/* 모듈 메서드 정의 */
var method = {
  load  : function(uniformData) {
    config = uniformData.config.data.message.module.twip;
    
    var replacer = new RegExp("(?:" + data.list.join(")|(?:") + ")", "g");
    data.indexes = config.originalFormat.match(replacer);
    var format = config.originalFormat.replace(/[-\/\\^$*+?.()|[\]]/g, "\\$&");
    data.regExp = new RegExp(format.replace(replacer, "([^\\u0001]*)"));
  },
  apply : function(object) {
    if (object.id != id) { return true; }  // 처리하지 않음
    if (!config.visible) { return false; } // 표시하지 않음
    
    var matches = object.text.match(data.regExp);
    if (matches) {
      matches.shift();
      if (data.indexes.indexOf("{닉네임}")!=-1) {
        var ind = data.indexes.indexOf("{닉네임}");
        
        /* 익명 처리 */
        if (matches[ind] == "") { matches[ind] = "익명"; }
        
        /* 이름 변조 */
        if (config.replaceName) {
          object.name = matches[ind];
        }
      }
      
      /* 텍스트 변조 및 헤더 추가 */
      object.text = config.textFormat;
      object.header = config.accentFormat;
      object.cases.push("type-accent", "type-donation");
      matches.forEach( function(el, ind) {
        object.text = object.text.replace(data.indexes[ind], el);
        object.header = object.header.replace(data.indexes[ind], el);
      } );
    }
    return true;
  }
};


/* 정의된 엘리먼트 적용 */
module.exports = new function() {
  this.method = method;
  this.data = data;

  return this;
}();