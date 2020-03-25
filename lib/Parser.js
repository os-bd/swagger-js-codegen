const StringParser = require("./Parsers/StringParser");
const ObjectParser = require("./Parsers/ObjectParser");
const ArrayParser = require("./Parsers/ArrayParser");
const NumberParser = require("./Parsers/NumberParser");
const DateParser = require("./Parsers/DateParser");
const BooleanParser = require("./Parsers/BooleanParser");
const AllOfParser = require("./Parsers/AllOfParser");
const EnumParser = require("./Parsers/EnumParser");
const Chance = require("chance");
const chance = new Chance();

module.exports = class Parser {
  constructor(options) {
    this.options = options;
  }
  get parsers() {
    return (
      this._parsers ||
      (this._parsers = [
        new EnumParser(),
        new StringParser(),
        new ObjectParser(this),
        new ArrayParser(this),
        new AllOfParser(this),
        new NumberParser(),
        new BooleanParser(),
        new DateParser(),
        new BooleanParser()
      ])
    );
  }

  getParser(node) {
    let parser = this.findParser(p => p.canParse(node));
    if (!parser) {
      // throw new Error(`Can't handle ${node.type || 'Unknown'} type.`);
      return {
        parse: function(node) {
          return "Can't handle " + (node.type || "Unknown") + " type.";
        }
      };
    }
    return parser;
  }

  parse(node) {
    if (node["x-chance-type"] === "fixed") {
      return node["x-type-value"];
    }
    if (node["x-chance-type"]) {
      return chance[node["x-chance-type"]](node["x-type-options"]);
    }
    if (this.options && this.options.useExample && node.example) {
      return node.example;
    }

    return this.getParser(node).parse(node);
  }
  findParser(predicate) {
    if (typeof predicate !== "function") {
      throw new TypeError("predicate must be a function");
    }
    var list = this.parsers;
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return value;
      }
    }
    return undefined;
  }
};
