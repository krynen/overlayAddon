/****************************************************************
 * 전용이미지 하위모듈                                          *
 * 스트리머가 직접 지정할 수 있는 전용 이미지를 표시            *
 *                                                              *
 * 이미지 상위 URI를 통일하거나                                 *
 * 목록에서 경우에 따른 특정 이미지만 표시하는 확장을 사용 가능 *
 *                                                              *
 ****************************************************************/

// 모듈 인터페이스
var methods = {};
var data = {
  list   : {}, // 이미지의 KeyValuePair
  groups : {}, // 방법과 목록을 저장
  alias  : {}, // 키워드와 이미지를 연결
  counts : {}, // sequence group의 사용 수를 저장
};

// 포인터 정의
var config = null;
var shared = null;
var parent = null;


/**
 * 유저 색상을 가져오고 색채팅 권한이 있는지 판별
 * @param {Object} message 출력할 메세지의 색상 정보
 * @param {string} message.name fixed group 전용 이미지에 사용할 유저 이름
 * @param {string[]} text 어절별로 분리된 메세지 문자열
 * @param {bool[]} done 각 어절의 처리 여부
 */
methods.Replace = function(message, text, done) {
  text.forEach( function(el, ind) {
    // 이미 처리된 어절 무시
    if (done[ind] === true) { return; }

    // 이스케이핑된 텍스트를 이용
    var element = document.createElement("span");
    element.innerHTML = el;
    el = element.innerText;

    // 전용이미지 어절이 아니면 무시
    if (el.match(new RegExp("^"+config.Message.Orimg.Prefix)) === null) { return; }
    var name = el.replace(config.Message.Orimg.Prefix, "");
    if (data.alias[name] === undefined) { return; }

    if (data.list[name] === undefined) {
      // 그룹 이미지 처리
      var group = data.groups[name];

      switch(group.method) {
        case "random":
          name = group.list[Math.floor(Math.random()*(group.list.length))];
          break;

        case "sequence":
          if (data.counts[name] === undefined) { data.counts[name] = 0; }
          name = group.list[data.counts[name]++];
          data.counts[name] %= group.list.length;
          break;

        case "fixed":
          var findex = message.name.charCodeAt(0);
          var lindex = message.name.charCodeAt(message.name.length-1);
          console.log(findex, lindex, group.list.length);
          name = group.list[(findex+lindex) % group.list.length];
          break;
      }
    }

    // 문자열을 이미지로 변환
    done[ind] = true;
    element.innerHTML = "";
    parent.AddSubElement(
      "Orimg",
      {
        "parent" : element,
        "attr"   : { "type":name },
        "image"  : config.Message.Orimg.UriBase + data.list[data.alias[name]],
        "text"   : el
      }
    );
    text[ind] = element.innerHTML;
  } );
};


/**
 * 설정 데이터 정리 메서드
 */
methods.Connect = function() {
  // Images를 연결
  config.Message.Orimg.Images.forEach( function(el) {
    data.list[el.name] = el.uri;
    data.alias[el.name] = el.name;

    (el.alias||[]).forEach( function(al) {
      data.alias[al] = el.name;
    } );
  } );

  // Groups를 연결
  config.Message.Orimg.Groups.forEach( function(el) {
    if (el.method === "none") { return; }
    if (data.alias[el.name] === undefined) {
      if ((el.rule || el.list) === undefined) { return; }

      data.alias[el.name] = el.name;
      data.groups[el.name] = { "method":el.method, "list":el.list };
      if (el.list === undefined) {
        data.groups[el.name].list = [];
        var rule = new RegExp(el.rule);

        Object.keys(data.list).forEach( function(key) {
          if (key.match(rule) === null) { return; }
          data.groups[el.name].list.push(key);
        } );
      }
    }
  } );

  done.Done("orimg");
};


/**
 * 모듈 Load 메서드
 * 포인터를 메인 모듈과 연결
 * @param {object} uniformData 메인 모듈 오브젝트
 */
methods.Load = function(uniformData) {
  done = uniformData.Done;

  config = uniformData.Data.config;
  shared = uniformData.Data.shared;
  parent = uniformData.Message;
};


/**
 * 모듈 오브젝트
 * 전달받은 메서드로 모듈 내부 메서드와 데이터를 자기자신과 연결하여 반환
 */
module.exports = function(InitModule) { return InitModule.call({}, methods, data); };