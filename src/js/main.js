module.exports = new function() {
  /* * 데이터 모듈 불러오기
   *
   * uri     : uri에서 파라미터를 불러오기 위한 모듈
   *
   * config  : 기본 설정과 설정 파일을 불러오는 메서드를 포함
   *           api 모듈에 종속
   *
   * shared  : 여러 모듈들에서 사용되는 데이터를 포함
   *           api 모듈에 종속
   *
   * */
  this.uri     = require("./data/uri.js");
  this.config  = require("./data/config.js");
  this.shared  = require("./data/shared.js");
  
  /* * 오브젝트 모듈 불러오기
   *
   * api     : 웹에 제공된 API를 이용해 데이터를 불러올 때 이용하는 메서드를 포함
   *
   * irc     : 트위치 채팅 IRC서버와 연결하고 메세지를 주고받고 가공하는 모듈
   *
   * message : 받은 메세지를 종류에 따라 처리해 DOM으로 생성하는 모듈
   *
   * */
  this.api     = require("./api.js");
  this.message = require("./message.js");
  this.irc     = require("./irc.js");
  
  /* * 오브젝트 하위 모듈 불러오기
   *
   * message/twip.js : 트윕(Twipkr)을 통한 후원 메세지를 처리하는 모듈
   *
   * */
  this.message.module.twip = require("./message/twip.js");
  
  /* 각 모듈 초기화 및 로드 */
  require("./event.js").method.apply(this);
  
  this.uri.method.load(this);
  this.message.method.load(this);
  this.irc.method.load(this);
  
  this.config.addEventListener("load", function(evt) {
    this.message.module.twip.method.load(this);
    
    this.irc.addEventListener("connect", function(evt) {
      this.shared.method.load(this);
    }.bind(this) );
    this.irc.method.connect();
  }.bind(this) );
  this.config.method.load(this);
  
  return this;
}();