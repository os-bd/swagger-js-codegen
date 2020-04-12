const fs = require("fs");
const FCodeGen = require("./founder").CodeGen;
const mockdata = require("./mock.js").fn;

let content = fs.readFileSync("./json/swagger-datahub.json", "utf-8");
content = content.replace(/Map«string,object»/gi, "MapObject");
content = content.replace(/Map«string,List»/gi, "MapObject");
content = content.replace(/Map«string,List«OptionalData»»/gi, "MapObject");
content = content.replace(/Map«string,string»/gi, "MapObject");
content = content.replace(/«/gi, "$").replace(/»/gi, "$");

var swagger;
swagger = JSON.parse(content);

result = FCodeGen.getCode({
  moduleName: "run",
  className: "Test",
  swagger: swagger,
  lint: false,
  beautify: false,
  exclude: ['/test']
});
console.log(result);

// mockdata.mock(swagger, "./src/services/services.mockData.json");
