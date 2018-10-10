/********************************************************
 * 빌드 자동화 스크립트                                 *
 *                                                      *
 * js파일들을 browserify로 병합하여                     *
 * uglify-es로 압축한 후                                *
 * client.html에 끼워넣어 단일파일로 출력               *
 *                                                      *
 * start와 debug 파라미터를 받을 수 있게 만들어         *
 * npm start와 npm debug로 지정                         *
 * 디버그시 스크립트를 압축하지 않으며,                 *
 * 진입점을 바꾸어 스크립트 오브젝트를 접근 가능케 하고 *
 * 테스트를 위해 브라우저를 실행                        *
 *                                                      *
 ********************************************************/

// 빌드 옵션 파일 로드
var BUILD_OPTION = require("./option.json");

// 공통으로 사용되는 라이브러리를 로드
var fs = require("fs");
var through = require("through2");

/**
 * COPY_SOURCE_FILES를 COY_TARGET_DIRECTORY로 복사
 */
var CopyScript = function() {
  var target = BUILD_OPTION.COPY_TARGET_DIRECTORY;

  BUILD_OPTION.COPY_SOURCE_FILES.forEach( function(el) {
    var name = el.split("/").pop();
    fs.createReadStream(el).pipe(fs.createWriteStream(target + name));
  } );
};


/** 
 * HTML_SOURCE_FILE의 body 끝에 진입점으로부터 생성한 스크립트를 끼워넣음
 * @param {string} entrace 진입점 파일의 경로
 * return {bool}
 */
var WriteScript = function(entrance, isUglify) {
  // 진입점으로부터 browserify를 이용해 스크립트 생성
  return new Promise( function(resolve, reject) {
    // 제대로 읽을 수 없는 확장자를 읽기 위해 transform을 구현
    var trans = [ function(filename) {
      // 확장자를 파싱해 목록에 있는지 판별
      var cond = (function(){
        var match = filename.match(BUILD_OPTION.BUILD_TEXTIFY_REGEXP);
        var exetension = (match||[])[1].toLowerCase();

        var list = BUILD_OPTION.BUILD_TEXTIFY_EXETENSIONS.join(".").toLowerCase().split(".");
        return (list.indexOf(exetension) !== -1);
      })();
      if (cond !== true) { return through( function(buf, enc, next) { next(null, buf); } ); }

      // 목록에 있을 경우 텍스트 반환 모듈로 뜯어고쳐 읽게끔 함
      return through(
        function(buf, enc, next) { next(); },
        function(end) {
          this.push(
            "module.exports=" +
            JSON.stringify(fs.readFileSync(filename, "utf8")) +
            ";"
          );
          end();
        }
      );
    } ];

    // browserify하여 클라이언트 html을 생성
    require("browserify")(entrance, { "transform":trans }).bundle( function(err, buf) {
      if (err !== null) { reject(err); }

      // 생성한 스크립트를 uglify
      var script = buf;
      if (isUglify) {
        script = require("uglify-es").minify(script.toString()).code;
      }

      // uglify된 스크립트를 html에 끼워넣기
      var html = fs.readFileSync(BUILD_OPTION.HTML_SOURCE_FILE, "utf8").split("</body>");
      html[html.length-2] += "<script>" + script + "</script>";
      fs.writeFileSync(BUILD_OPTION.HTML_TARGET_FILE, html.join("</body>"));

      resolve(null);
    } );
  } );
};


/**
 * 크롬 브라우저에서 변경된 파일을 실행
 * 지정된 명령줄 파라미터를 사용한다
 *
 */
var ExecuteBrowser = function() {
  // 필요한 각 경로를 추출
  var path = require("path");
  var client = path.resolve(BUILD_OPTION.HTML_TARGET_FILE);
  var chrome = path.resolve(process.env.npm_package_config_chrome);

  // 파라미터 정리
  var parameters = [];
  BUILD_OPTION.CHROME_PARAMETERS.forEach( function(el, ind) {
    if (el.length > 1) {
      var head = el[0];
      var uri = el.reduce( function(acc, cur, ind) {
        if (ind==0) return acc;

        switch(cur.type) {
          case "env":
            return path.resolve(acc, process.env["npm_package_"+cur.value]);
          
          case "string":
            return path.resolve(acc, cur.value);

          default:
            return acc;
        }
      }, path.resolve("./"));

      parameters[ind] = head + "=" + uri;
    } else {
      parameters[ind] = el[0];
    }
  } );
  parameters.unshift(client);

  // 실행 옵션 지정
  var option = { detached:true, stdio:"ignore" };

  // 브라우저 실행
  require("child_process").spawn(chrome, parameters, option).unref();
};


/**
 * 메인 코드 블럭
 * 파라미터로 start, debug를 받아 각 경우를 처리
 */
(function() {
  switch (process.argv[2]) {
    case "debug":
      CopyScript();
      WriteScript(BUILD_OPTION.BUILD_DEBUG_ENTRANCE_FILE, false)
        .then( ExecuteBrowser, console.log );
      break;

    case "start":
      CopyScript();
      WriteScript(BUILD_OPTION.BUILD_START_ENTRANCE_FILE, true)
        .then( ()=>{}, console.log );
      break;

    default:
      throw(module.filename + " : Error - Invalid Parameter.");
      break;
  }
})();