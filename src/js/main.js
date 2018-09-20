/***************************************************************
 * JS 진입점 파일. 메인 모듈                                   *
 * 따로 명명하지 않고 module.exports에 데이터 트리를 만듬      *
 * 내부에서 자기자신을 연결해주거나, 진입점 우회를 사용해야 함 *
 *                                                             *
 ***************************************************************/

/**
 * 메인 모듈 객체
 */
var REQUIRE_MODULES = new function() {
  this["Irc"] = require("./irc.js");
  this["Message"]       = require("./message.js");
  this["Message/Cheer"] = require("./message/cheer.js");
  this["Message/Color"] = require("./message/color.js");
  this["Message/Emote"] = require("./message/emote.js");
  this["Message/Orimg"] = require("./message/orimg.js");
  this["Message/Twip"]  = require("./message/twip.js");
  this["Message/Link"]  = require("./message/link.js");
  this["Theme"]         = require("./theme.js");
  this["Theme/Default"] = require("../html/theme.html");
  this["Data"]    = require("./data.js");
  this["Default"] = require("../json/default.json");
  this["Shared"]  = require("../json/shared.json");
  this["Api"]   = require("./api.js");
  this["Done"]  = require("./done.js"); 

  return this;
}();


/**
 * 문자열을 파스칼케이스PascalCase로 만듬
 * @param {string} text
 * @return {string}
 */
var Pascalize = function(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
};
/**
 * 문자열을 캐멀케이스camelCase로 만듬
 * @param {string} text
 * @return {string}
 */
var Camelize = function(text) {
  return text.charAt(0).toLowerCase() + text.slice(1);
};


/**
 * 파라미터가 {}로 닫힌 오브젝트인지를 확인
 * @param {Object} target 확인 대상 오브젝트
 * @return {boolean}
 */
var CheckObject = function(target) {
  if (target === null)            { return false; }
  if (target === undefined )      { return false; }
  if (typeof target !== "object") { return false; }
  return true;
};

/**
 * 모듈 초기화 메서드
 * 각 모듈에서 실행하여 내부 메소드, 데이터를 모듈과 연결
 * @param {Object} methods 외부에서 접근 가능한 모듈 오브젝트
 * @param {Object} data 외부에서 접근 가능한 모듈 데이터
 * @return {Object} 연결된 모듈을 반환
 */
var InitModule = function(methods, data) {
  // 하위 모듈 오브젝트가 있을 경우 ConnectModule에서 연결
  // this.Module = {};

  // 메소드 연결
  if (CheckObject(methods)) {
    Object.keys(methods).forEach( (el) => { this[Pascalize(el)] = methods[el]; }, this);
  }

  // 데이터 연결
  if (CheckObject(data)) {
    Object.keys(data).forEach( (el) => { this[Camelize(el)] = data[el]; }, this);
  }

  return this;
};


/**
 * require한 모듈을 reculsive하게 연결
 * @param {Object} modules modules[name]==require("./"+name+".js")를 충족하는 오브젝트
 * @return {Object}
 */
var ConnectModules = function(modules) {
  // 각 모듈에 InitModule 메서드를 전달하고
  // 경로의 깊이에 따라 분류
  var list = [];
  Object.keys(modules).forEach( function(el) {
    // 메서드 전달
    if (typeof modules[el] === "function") {
      modules[el] = modules[el](InitModule);
    }

    // 깊이에 따라 분류
    var len = el.split("/").length-1;
    if (list[len] === undefined) { list[len] = []; }
    list[len].push(el);
  } );

  // 깊이 0인 모듈을 연결
  var ret = {};
  list.shift().forEach( function(el) { ret[Pascalize(el)] = modules[el]; } );

  // 깊이 1 이상의 모듈을 연결
  list.forEach( function(len) {
    len.forEach( function(el) {
      // 각 이름의 첫글자를 대문자로
      var name = el.split("/");
      name.forEach( function(el) { el = Pascalize(el); } );

      // 내부 오브젝트로 접근
      var obj = ret;
      while (name.length > 1) { obj = obj[name.shift()]; }

      // 오브젝트에 모듈을 연결
      if (obj.Module === undefined) { obj.Module = {}; }
      obj.Module[name[0]] = modules[el];
    } );
  } );

  return ret;
};


/**
 * 연결된 모듈의 Load 메서드를 호출
 * @param {Object} object 메인 모듈 오브젝트
 * @param {Object} modules ConnectModules에서 파라미터로 사용한 오브젝트
 */
var LoadModules = async function(object, modules) {
  var list = Object.keys(modules);
  for (var i=0; i<list.length; ++i) {
    var name = list[i].split("/");
    var target = object[name.shift()];

    while (name.length >= 1) { target = (target.Module||{})[name.shift()]; }
    if ((target||{}).Load !== undefined) { await target.Load(object); }
  }
};


/**
 * 메인 모듈 오브젝트
 * 모듈 목록을 자기 자신에게 추가하고 반환
 */
module.exports = new function() {
  Object.assign(this, ConnectModules(REQUIRE_MODULES));
  this.Done.Register("data", "message", "cheer", "orimg");

  LoadModules(this, REQUIRE_MODULES)
    .then( () => {
      this.Theme.Connect();
      this.Irc.Connect();
    } );

  return this;
}();