/**************************************
 * 파일 정리 자동화 스크립트          *
 *                                    *
 * build.js를 통해 생성된 파일을 제거 *
 *                                    *
 **************************************/

// 빌드 옵션 파일 로드
var BUILD_OPTION = require("./option.json");

// 공통으로 사용되는 라이브러리를 로드
var fs = require("fs");



/**
 * build.js의 CopyScript로 복사된 파일을 제거
 */
var RemoveCopiedScript = function() {
  var list = BUILD_OPTION.COPY_SOURCE_FILES;
  var path = BUILD_OPTION.COPY_TARGET_DIRECTORY;
  list.forEach( function(el) {
    var name = el.split("/").pop();
    if (fs.existsSync(path+name)) { fs.unlink(path+name, function(){} ); }
  } );
};

/** 
 * build.js의 WriteScript로 생성된 파일을 제거
 */
var RemoveWrittenScript = function() {
  var target = BUILD_OPTION.HTML_TARGET_FILE;
  if (fs.existsSync(target)) { fs.unlink(target, function(){} ); }
};


/**
 * biuld.js의 ExecuteBrowser로 생성된 파일을 제거
 */
var RemoveBrowserSandbox = function() {
  var path = require("path");
  var child = require("child_process");
  var sandbox = path.posix.join(
    process.env.npm_package_config_test,
    BUILD_OPTION.CHROME_SANDBOX_DIRECTORY
  );

  // 샌드박스 내부 파일 제거 명령어
  var cmd1 = "rm -r \"" + sandbox + "\"";
  // 샌드박스 외부 빈 디렉터리 제거 명령어
  var cmd2 = "rmdir -p \"" + path.join(sandbox, "..") + "\"";
  // 명령어 실행
  child.exec(cmd1, (err) => { if(err===null) { child.exec(cmd2),()=>{} } } );
};


/**
 * 메인 코드 블럭
 * 빌드시 생성됐던 파일을 처리
 */
(function() {
  RemoveCopiedScript();
  RemoveWrittenScript();
  RemoveBrowserSandbox();
}());