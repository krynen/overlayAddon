var fs = require("fs");
var path = require("path");
var childProcess = require("child_process");

if (fs.existsSync("./client.html")) { fs.unlink("./client.html", function(){} ); }

var sandbox = path.resolve(process.env.npm_package_config_sandbox).replace(/\\/g, "/");

var upward = function(path) {
  var temp = path.split("/");
  temp.pop();
  path = temp.join("/");
  return path;
};

var reculsive = function(path) {
  childProcess.exec("rmdir \""+path+"\"", function(err, out) {
    if (err == null) {
      reculsive(upward(path));
    }
  } ); 
};

while (!fs.existsSync(sandbox)) {
  sandbox = upward(sandbox);
}

childProcess.exec("rm -r \""+sandbox+"\"", function(err, out) {
  if (err == null) {
    var temp = sandbox.split("/");
    temp.pop();
    sandbox = temp.join("/");
    reculsive(sandbox);
  }
} );