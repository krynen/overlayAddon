var fs = require("fs");
var path = require("path");

var html = fs.readFileSync("./src/html/client.html", "utf8");

var mode = "";
switch(process.argv[2]) {
  case "debug":
  case "main":
    mode = process.argv[2];
    break;
  default:
    mode = "main";
    break;
}
var stream = require("browserify")("./src/js/" + mode + ".js");

stream.bundle(function(err, buf) {
  if (err) { console.log(err); return; }
  
  var script = require("uglify-js").minify(buf.toString()).code;

  html = html.split("</body>");
  html[html.length-2] += "<script>" + script + "</script>";
  html = html.join("</body>");
  
  fs.writeFileSync("./client.html", html);
  
  if (mode == "debug") {
    var client = path.resolve("./client.html");
    var chrome = path.resolve(process.env.npm_package_config_chrome);
    var sandbox = "--user-data-dir=" + path.resolve(process.env.npm_package_config_sandbox);
    const browser = require("child_process").spawn(
      chrome,
      [client, "--disable-web-security", sandbox, "--incognito"],
      { detached:true, stdio: "ignore" } );
     browser.unref();
  }
});