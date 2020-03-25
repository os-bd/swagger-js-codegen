const Chance = require("chance");
const chance = new Chance();

module.exports = class EnumParser {
  canParse(node) {
    return !!node.enum;
  }

  parse(node) {
    return this.parseEnum(node.enum);
  }

  parseEnum(enumNode) {
    let index = chance.integer({ min: 1, max: enumNode.length - 1 });
    return enumNode[index];
  }
};
