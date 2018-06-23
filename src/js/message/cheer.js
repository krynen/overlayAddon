/* 모듈 내부데이터 설정 */
var config = null;
var cheers = null;            // load()를 통해 uniformData와 연결


/* 모듈 메서드 정의 */
var method = {
  load        : function(uniformData) {
    config = uniformData.config.data.message.cheer;
    cheers = uniformData.shared.data.cheers;
  },
  get         : function(object, processes) {
    /* 헤더를 추가 */
    if (config.accentFormat && config.accentFormat.length>0) {
      object.cases.push("type-accent", "type-donation");
      object.header = config.accentFormat;
      object.header = object.header.
        replace("{name}", object.name).
        replace("{bits}", object.bits);
    }
    
    /* 각 비트 어절을 추출 */
    var list = [];
    object.text.forEach( function(el, ind, arr) {
      if (processes[ind] != undefined) { return; }      // 이미 처리된 어절 스킵
      if (el.match(/\d+$/) == null)    { return; }      // 숫자로 끝나지 않는 어절 스킵
      
      var value = Number(el.match(/\d+$/)[0]);          // 해당 비트 어절의 금액
      var prefix = el.replace(value, "").toLowerCase(); // 비트 어절의 영문자
      
      /* 데이터에서 어절을 탐색 */
      var detected = cheers.list.every( function(cheer, index) {
        if (cheer.prefix.toLowerCase() == prefix) {
          
          /* 탐색한 데이터에서 URI를 추출 */
          var uri = "";
          cheers.list[index].tiers.every( function(tier) {
            if (value >= tier["min_bits"]) {
              uri = tier.images.light.animated[1];
              return true;
            }
            return false;
          } );
          
          list.push({ index:ind, name:prefix, value:value, uri:uri });
          return false;
        }
        return true;
      } );
    } );
      
    /* 비트 어절의 인덱스와 금액, 인덱스에 해당하는 uri의 목록을 반환 */
    if (list.length != 0) { return list; }
    else                  { return null; }
  },
  setDomValue : function(object, value) {
    /* message의 하위모듈간 포맷을 맞추기 위한 더미 메서드 */
    return value;
  }
};


/* 정의된 엘리먼트 적용 */
module.exports = new function() {
  this.method = method;

  return this;
}();