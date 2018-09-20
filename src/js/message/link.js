/**************************************************************
 * 비디오 링크 하위모듈                                       *
 * 트위치나 유튜브 링크를 파싱해 섬네일과 제목, 제작자를 표시 *
 *                                                            *
 **************************************************************/

// 모듈 인터페이스
var methods = {};
var data = {
  youtube : {}, // 유튜브 비디오 링크
  clip    : {}, // 트위치 클립 링크
  twitch  : {}  // 트위치 비디오 링크
};

// 포인터 정의
var api    = null;
var config = null;
var shared = null;
var parent = null;


/**
 * 링크 문자열 대체 메서드
 * @param {null} message 하위 모듈간 포맷 통일을 위한 파라미터
 * @param {string[]} text 어절별로 분리된 메세지 문자열
 * @param {bool[]} done 각 어절의 처리 여부
 */
methods.Replace = async function(message, text, done) {
  for (var i=0; i<text.length; ++i) {
    // 이미 처리된 어절 무시
    if (done[i] === true) { continue; }

    // 링크 파싱
    var youtube = text[i].replace(data.youtube.replacer, "").match(data.youtube.regExp);
    var clip = text[i].match(data.clip.regExp);
    var twitch = text[i].match(data.twitch.regExp);

    var id = "";
    var type = "";

    // 각 경우 정보 추출
    if (youtube !== null) {
      if (youtube[1].split("&").some( function(el) {
        if ((el.split("=")||[])[0] !== "v") { return false; }
        else {
          var id = el.split("=")[1];
          var type = "youtube";
          return true;
        };
      } ) === false) { continue; }
    }
    else if (clip !== null) {
      id = clip[1];
      type = "clip";
    }
    else if (twitch !== null) {
      id = twitch[1];
      type = "twitch";
    }
    else { continue; }


    // API 모듈을 호출하여 정보 수집
    var name = "";
    var author = "";
    var image = "";
    await api.Get( {uri:data[type].uri.replace(/{id}/g, id)} ).then(
      function(res) {
        var obj = JSON.parse(res);
        if (obj.error !== undefined) { return; }

        name = obj.title;
        author = obj.curator_name || obj.author_name; // 클립 || 비디오
        image = obj.thumbnail_url;
      },
      function(err) { }
    );

    done[i] = true;
    var element = document.createElement("span");
    var obj = {
      "parent" : element,
      "attr"   : { "type":type, "id":id, "name":name, "value":text[i] },
      "name"   : name,
      "image"  : image,
      "text"   : author
    };
    if (image === "") { obj.attr.invalid = "1"; }
    parent.AddSubElement("Video", obj);
    text[i] = element.innerHTML;
  }
};


/**
 * 추가 데이터 로드 및 연결 메서드
 * 설정값을 사용하므로 추가 설정 로드 후 호출됨
 */
methods.Connect = function() {
  Object.keys(shared.Message.Link).forEach( function(el) {
    var dat = shared.Message.Link[el];

    data[el].uri = dat.uri;
    data[el].regExp = new RegExp(dat.regExp);
    if (dat.replacer) { data[el].replacer = dat.replacer; }
  } );
};


/**
 * 모듈 Load 메서드
 * 포인터를 메인 모듈과 연결
 * @param {object} uniformData 메인 모듈 오브젝트
 */
methods.Load = function(uniformData) {
  api    = uniformData.Api;
  config = uniformData.Data.config;
  shared = uniformData.Data.shared;
  parent = uniformData.Message;
};


/**
 * 모듈 오브젝트
 * 전달받은 메서드로 모듈 내부 메서드와 데이터를 자기자신과 연결하여 반환
 */
module.exports = function(InitModule) { return InitModule.call({}, methods, data); };