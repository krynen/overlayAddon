/*************************************************
 * 응원 하위모듈                                 *
 * 응원(트위치 자체 후원)이 포함된 메세지를 처리 *
 * 어절별로 분해된 텍스트를 받아 내용을 수정함   *
 *                                               *
 *************************************************/

// 모듈 인터페이스
var methods = {};
var data = {
  list : {}   // cheermotes 목록
};

// 포인터 정의
var api     = null;
var config  = null;
var done    = null;
var shared  = null;
var parent  = null;


/**
 * 응원 문자열 대체 메서드
 * @param {bool} message 출력할 메세지의 정보 (응원이 포함되어 있는지)
 * @param {string[]} text 어절별로 분리된 메세지 문자열
 * @param {bool[]} done 각 어절의 처리 여부
 */
methods.Replace = function(message, text, done) {
  if (message !== true) { return;}

  // 응원 어절을 추출해 변환
  text.forEach( function(el, ind) {
    if (done[ind] === true) { return; }              // 이미 처리된 어절 무시

    var match = el.match(/^(\D+)(\d+)$/);
    if (match === null) { return; }                  // 숫자로 끝나지 않는 어절 무시

    var prefix = match[1].toLowerCase();
    if (data.list[prefix] === undefined) { return; } // 응원 어절이 아닌것같으면 무시

    // 티어 추출
    var value = Number(match[2]);
    var index = data.list[prefix].reduce( function(acc, cur, ind) {
      if (cur["min_bits"] < value) { return ind; }
      return acc;
    }, 0);

    // 이미지 URI 추출
    var image = data.list[prefix][index].images.light.animated;
    var key = Object.keys(image).reduce( function(acc, cur) {
      var num = Number(cur);
      if (num > acc) { return num; }
      else { return acc; }
    }, 0);

    done[ind] = true;
    var element = document.createElement("span");
    parent.AddSubElement(
      "Cheermote",
      {
        "parent" : element,
        "attr"   : { "type": prefix, "tier":data.list[prefix][index].id, "value":value },
        "image"  : image[key],
        "text"   : value
      }
    );
    text[ind] = element.innerHTML;
  } );

  return;
};


/**
 * 추가 데이터 로드 및 연결 메서드
 * 유저 Id가 식별되어야하므로 IRC에 연결된 후 호출됨
 */
methods.Connect = function() {
  if (config.Key !== null && config.Key.length > 0) {
    api.Get( {
      "uri"    : shared.Message.CheerUri.replace(/{id}/g, shared.Id),
      "header" : [{ "key":"Client-ID", "value":config.Key  }]
    } ).then(
      function(res) {
        var list = JSON.parse(res).actions;
        // 응원 모듈의 data.list에 로드된 데이터를 추가
        Object.assign(
          data.list,
          list.reduce( function(acc, cur) {
            var prefix = cur.prefix;
            acc[prefix.toLowerCase()] = cur.tiers;

            return acc;
          }, {})
        );

        done.Done("cheer");
      },
      function(err) { parent.Error("Message_Fail_Cheer", err); }
    );
  } else {
    // 클라이언트 아이디가 입력되지 않으면 응원 모듈 기능을 비활성화
    parent.Error("Message_Wrong_Cheer");
    methods.Replace = function() {};
  }
};


/**
 * 모듈 Load 메서드
 * 포인터를 메인 모듈과 연결
 * @param {object} uniformData 메인 모듈 오브젝트
 */
methods.Load = function(uniformData) {
  done = uniformData.Done;

  api     = uniformData.Api;
  config  = uniformData.Data.config;
  shared  = uniformData.Data.shared;
  parent  = uniformData.Message;
};


/**
 * 모듈 오브젝트
 * 전달받은 메서드로 모듈 내부 메서드와 데이터를 자기자신과 연결하여 반환
 */
module.exports = function(InitModule) { return InitModule.call({}, methods, data); };