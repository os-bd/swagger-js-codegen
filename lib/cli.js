"use strict";

const fs = require("fs");
const pkg = require("../package.json");
const cli = require("commander");
const yaml = require("js-yaml").safeLoad;
const CodeGen = require("./codegen").CodeGen;
const FCodeGen = require("./founder").CodeGen;

cli
  .version(pkg.version)
  .command("generate <file> [imports...]")
  .alias("gen")
  .description("Generate from Swagger file")
  .option(
    "-t, --type <type>",
    "Code type [typescript]",
    /^(typescript|angular|node|react|founder)$/i,
    "founder"
  )
  .option("-m, --module <module>", "Your module name ", "")
  .option("-c, --class <class>", "Class name [Test]", "Test")
  .option(
    "-l, --lint",
    "Whether or not to run jslint on the generated code [false]"
  )
  .option(
    "-b, --beautify",
    "Whether or not to beautify the generated code [false]"
  )
  .option("-u, --unittest", "With UnitTest and MockData [false]")
  .option("-e, --exclude [path-start1,path-start2]", "Exclude Paths", "")
  .action((file, imports, options) => {
    let new_options = options
    const fnName =
      "get" +
      options.type.charAt(0).toUpperCase() +
      options.type.substr(1) +
      "Code";
    const fn = CodeGen[fnName];
    new_options.lint = options.lint || false;
    new_options.beautify = options.beautify || false;
    new_options.unittest = options.unittest || false;
    if (options.exclude !== undefined) {
      new_options.exclude = String(options.exclude).split(',')
    } else {
      new_options.exclude = [];
    }
    

    let content = fs.readFileSync(file, "utf-8");
    content = content.replace(/Map«string,object»/gi, "MapObject");
    content = content.replace(/Map«string,List»/gi, "MapObject");
    content = content.replace(/Map«string,List«OptionalData»»/gi, "MapObject");
    content = content.replace(/Map«string,string/gi, "MapObject");
    content = content.replace(/«/gi, "$").replace(/»/gi, "$");

    var swagger;
    try {
      swagger = JSON.parse(content);
    } catch (e) {
      swagger = yaml(content);
    }

    let result;

    if (new_options.type === "founder") {
      result = FCodeGen.getCode({
        moduleName: new_options.module,
        className: new_options.class,
        swagger: swagger,
        lint: false,
        beautify: false,
        unittest: new_options.unittest,
        exclude: new_options.exclude
      });
    } else {
      result = fn({
        moduleName: new_options.module,
        className: new_options.class,
        swagger: swagger,
        lint: new_options.lint,
        beautify: new_options.beautify,
        exclude: new_options.exclude
      });
    }
    console.log(result);
  });

cli.parse(process.argv);

if (!cli.args.length) {
  cli.help();
}
