const Chance = require("chance");
const chance = new Chance();

module.exports = class BooleanParser {
  canParse(node) {
    return node.type === "boolean";
  }

  parse(node) {
    return chance.bool(node["x-type-options"]);
  }
};
