const fs = require("fs");
const FCodeGen = require("./founder").CodeGen;
const mockdata = require("./mock.js").fn;

let content = fs.readFileSync("./json/run.json", "utf-8");
content = content.replace(/Map«string,object»/gi, "Map<string,object>");
content = content.replace(/«/gi, "$").replace(/»/gi, "$");

var swagger;
swagger = JSON.parse(content);

result = FCodeGen.getCode({
  moduleName: "run",
  className: "Test",
  swagger: swagger,
  lint: false,
  beautify: false
});
console.log(result);

// mockdata.mock(swagger, "./src/services/services.mockData.json");
