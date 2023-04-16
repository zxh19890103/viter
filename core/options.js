const paths = require("./paths");
/**
 * @type {ServerOptions}
 */
const serveOptions = {
  resolveDiskPath: (path) => {
    return join(paths.cwd, "./", path);
  },
  isBootReq: (path) => /boot\.tsx?/.test(path),
  
};

module.exports = {
  serveOptions,
};
