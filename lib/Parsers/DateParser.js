const Chance = require("chance");
const chance = new Chance();

let isDate = RegExp.prototype.test.bind(/^date([Tt]ime)?$/);

module.exports = class DateParser {
  canParse(node) {
    return isDate(node.type);
  }

  parse(node) {
    return chance.date(node["x-type-options"]);
  }
};
