const Chance = require("chance");
const chance = new Chance();

module.exports = class AllOfParser {
  constructor(parser) {
    this.parser = parser;
  }

  canParse(node) {
    return !!node.allOf;
  }

  parse(node) {
    return this.generateObject(node);
  }

  generateObject(node) {
    return node.allOf.reduce(
      (s, o) => Object.assign(s, this.parser.parse(o)),
      {}
    );
  }
};
