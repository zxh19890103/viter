const { join } = require("path");
const cwd = process.cwd();

module.exports = {
  cwd,
  src: join(cwd, "./src"),
};
