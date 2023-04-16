const { extname } = require("path");
const { serveOptions } = require("./options");

/**
 * @param {string} path
 * @returns {MediaType}
 */
const resolveMediaType = (path) => {
  const ext = extname(path);
  switch (ext) {
    case ".tsx":
    case ".ts":
      return "ts";
    case ".js":
      return "js";
    case ".css":
      return "css";
    case ".scss":
      return "scss";
    case ".txt":
      return "txt";
    case ".json":
      return "json";
    case ".jpg":
    case ".jpeg":
    case ".png":
    case ".gif":
      return "pic";
    case ".es":
      return "es";
    case ".html":
    default:
      return "html";
  }
};

/**
 * @param {string} path
 * @returns {MediaDescripitor}
 */
const getIs = (path) => {
  return {
    diskPath: serveOptions.resolveDiskPath(path),
    mediaType: resolveMediaType(path),
    path,
  };
};

module.exports = {
  getIs,
  resolveMediaType,
};
