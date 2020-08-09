const fs = require("fs");
const path = require("path");
const method = fs.readFileSync(path.join(__dirname ,"../templates/js-method.mustache"), "utf-8");
const service = fs.readFileSync(path.join(__dirname ,"../templates/js-services.mustache"), "utf-8");
const type = fs.readFileSync(path.join(__dirname ,"../templates/js-type.mustache"), "utf-8");

exports.tpl = {
  class: service,
  dts: '',
  dtsMethod: '',
  method,
  methodType: '',
  type: type,
  classMock: '',
  methodMock: '',
  unittest: '',
  unittestType: '',
  unittestParams: ''
};
exports.fileExt = 'js'