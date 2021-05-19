const fs = require("fs");
const FCodeGen = require("./founder").CodeGen;
const mockdata = require("./mock.js").fn;

let content = fs.readFileSync("./json/swagger.json", "utf-8");
content = content.replace(/Map«string,object»/gi, "MapObject");
content = content.replace(/Map«string,List»/gi, "MapObject");
content = content.replace(/Map«string,List«.*?»»/gi, "MapObject");
content = content.replace(/Map«string,string»/gi, "MapObject");
content = content.replace(/«/gi, "$").replace(/»/gi, "$");

var swagger;
swagger = JSON.parse(content);

result = FCodeGen.getCode({
  moduleName: "",
  className: "Test",
  swagger: swagger,
  lint: false,
  beautify: false,
  exclude: ["/proxy"],
  version: "3"
});
console.log(result);

// mockdata.mock(swagger, "./src/services/services.mockData.json");
