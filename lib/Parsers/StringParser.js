const Chance = require("chance");
const chance = new Chance();
const RandExp = require("randexp");

module.exports = class StringParser {
  canParse(node) {
    return node.type === "string";
  }

  parse(node) {
    return this.parseString(node);
  }

  parseString(node) {
    if (node.pattern) return new RandExp(node.pattern).gen();

    let options = this.resolveChanceOptions(node);
    return node._objectKey || chance.string(options);
  }

  resolveChanceOptions(node) {
    let options = node["x-type-options"] || {};

    if (node.maxLength && node.minLength)
      options.length = chance.integer({
        max: node.maxLength,
        min: node.minLength
      });
    else options.length = options.length || node.maxLength || node.minLength;

    return options;
  }
};
