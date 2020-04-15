var fs = require("fs");
var CodeGen = require("./codegen").CodeGen;
var template = require("./template").tpl;
var templateV2 = require("./template-v2").tpl;
var mockdata = require("./mock.js").fn;

function writeFile(filename, content) {
  var fullpath = process.cwd() + filename;
  var path = fullpath.substring(0, fullpath.lastIndexOf("/"));

  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
  fs.writeFile(process.cwd() + filename, content, { encoding: "utf8" }, err => {
    if (err) return console.error(err);
    console.log("写入成功!");
  });
}

const mustache = {
  isPageRequest: function() {
    return String(this.target).startsWith("PageRequest");
  },
  hasRows: function() {
    if (
      this.properties !== undefined &&
      this.properties !== undefined &&
      this.properties.properties !== undefined
    ) {
      const hasrows = this.properties.properties.find(
        item => item.name === "rows"
      );
      return hasrows !== undefined;
    } else {
      return false;
    }
  },
  isMapObject: function() {
    return String(this.name) === "MapObject" || String(this.name) === "MapObject"
  }
};

exports.CodeGen = {
  getCode: function(options) {
    var swagger = options.swagger;
    var version = options.version !== "" ? options.version : "";
    var modulePath = options.moduleName !== "" ? "/" + options.moduleName : "";
    var moduleName = options.moduleName !== "" ? "." + options.moduleName : "";
    var unittest = options.unittest !== "" ? options.unittest : false;

    var current_template = ''
    if (version === '2') {
      current_template = templateV2
    } else {
      current_template = template
    }


    var moduleUPEPRCASE =
      options.moduleName !== ""
        ? "_" + String(options.moduleName).toUpperCase()
        : "";
    var moduleLowercase =
      options.moduleName !== ""
        ? "/" + String(options.moduleName).toLowerCase()
        : "";

    var dtsSourceCode = CodeGen.getCustomCode({
      moduleName: "typing" + moduleName,
      className: "service",
      swagger: swagger,
      lint: false,
      template: {
        class: current_template.dts,
        method: current_template.dtsMethod,
        type: current_template.type
      },
      mustache: mustache,
      exclude: options.exclude
    });

    writeFile(`/src/types/typing${moduleName}.d.ts`, dtsSourceCode);

    var servicesSourceCode = CodeGen.getCustomCode({
      moduleName: "typing" + moduleName,
      className: options.className,
      swagger: swagger,
      lint: false,
      template: {
        class: current_template.class,
        method: current_template.method,
        type: current_template.methodType
      },
      mustache: {},
      exclude: options.exclude
    });

    writeFile(
      `/src/services${modulePath}/services.auto.ts`,
      servicesSourceCode
    );

    if (unittest) {
      var servicesSourceCode = CodeGen.getCustomCode({
        moduleName: "typing" + moduleName,
        className: options.className,
        swagger: swagger,
        lint: false,
        template: {
          class: current_template.classMock,
          method: current_template.methodMock,
          type: current_template.methodType
        },
        mustache: {},
        exclude: options.exclude
      });

      mustache.moduleUPEPRCASE = moduleUPEPRCASE;
      mustache.moduleLowercase = moduleLowercase;

      writeFile(
        `/src/services${modulePath}/services.mock.ts`,
        servicesSourceCode
      );

      var servicesTestCode = CodeGen.getCustomCode({
        moduleName: "typing" + moduleName,
        className: options.className,
        swagger: swagger,
        lint: false,
        template: {
          class: current_template.unittest,
          method: current_template.method,
          type: current_template.unittestType
        },
        mustache: mustache,
        exclude: options.exclude
      });

      writeFile(
        `/tests/unit${modulePath}/services.auto.spec.ts`,
        servicesTestCode
      );

      var servicesTestCode = CodeGen.getCustomCode({
        moduleName: "typing" + moduleName,
        className: options.className,
        swagger: swagger,
        lint: false,
        template: {
          class: current_template.unittestParams,
          method: current_template.method,
          type: current_template.unittestType
        },
        mustache: mustache,
        exclude: options.exclude
      });

      writeFile(
        `/tests/unit${modulePath}/services.auto.spec.params.ts`,
        servicesTestCode
      );

      mockdata.mock(
        swagger,
        `./src/services${modulePath}/services.mockData.json`
      );
    }
  }
};
