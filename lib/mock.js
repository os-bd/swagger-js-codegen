const fs = require("fs");
const swaggerParser = require("swagger-parser");
const mockParser = require("./Parser");

exports.fn = {
  mock(swaggerFile, mockFile, cb) {
    if (!swaggerFile) {
      throw new Error("missing swagger file path");
    }
    let parserPromise = new Promise(resolve => {
      swaggerParser.dereference(swaggerFile, (err, swagger) => {
        if (err) throw err;
        resolve(swagger);
      });
    });
    parserPromise.then(api => {
      let result = {};
      let paths = api.paths;
      try {
        for (let path in paths) {
          if (paths.hasOwnProperty(path)) {
            for (let action in paths[path]) {
              if (paths[path].hasOwnProperty(action)) {
                if (paths[path][action].responses) {
                  for (let resCode in paths[path][action].responses) {
                    if (paths[path][action].responses.hasOwnProperty(resCode)) {
                      let schema =
                        paths[path][action].responses[resCode].schema;
                      if (schema) {
                        // if example is defined and not empty,on override just skip it
                        if (schema.example && schema.example !== "") {
                          continue;
                        } else {
                          var actionName = "";
                          var pathwords = path.split("/");
                          for (i = pathwords.length - 1; i > 0; i--) {
                            actionName += pathwords[i].replace(/^([a-z])/gi, function(all, letter) {
                              return letter.toUpperCase();
                            });
                          }
                          actionName += action.toLocaleUpperCase();
                          
                          // const actionName = String(
                          //   path + "/" + action.toLocaleUpperCase()
                          // ).replace(/\/([a-z])/gi, function(all, letter) {
                          //   return letter.toUpperCase();
                          // });
                          result[actionName] = new mockParser().parse(schema);
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        let cache = [];
        fs.writeFile(
          mockFile || "swaggerWithMock.json",
          JSON.stringify(result),
          "utf-8",
          err => {
            if (err) throw err;
            if (cb) cb();
          }
        );
        cache = null;
      } catch (e) {
        console.log(e);
      }
    });
  }
};
