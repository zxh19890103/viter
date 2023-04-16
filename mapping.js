const {
  htmlProcess,
  jsProcess,
  styleProcess,
  textProcess,
  imageProcess,
  moduleProcess,
  esProcess,
} = require("./handlers");

/**
 * @type {Record<MediaType, (res, what) => void>}
 */
const MediaType2Process = {
  html: htmlProcess,
  css: styleProcess,
  js: jsProcess,
  txt: textProcess,
  json: jsProcess,
  pic: imageProcess,
  ts: moduleProcess,
  scss: moduleProcess,
  es: esProcess,
};

module.exports = {
  MediaType2Process,
};
