const moduleProcess = require("./module");
const { esProcess } = require("./es");
const scssProcess = require("./scss");

/**
 *
 * @param {import("express").Response} res
 * @param {MediaDescripitor} what
 */
const htmlProcess = (res, what) => {
  res.sendFile(what.diskPath);
};

/**
 *
 * @param {import("express").Response} res
 * @param {MediaDescripitor} what
 */
const styleProcess = (res, what) => {
  res.sendFile(what.diskPath);
};

/**
 *
 * @param {import("express").Response} res
 * @param {MediaDescripitor} what
 */
const jsProcess = (res, what) => {
  res.sendFile(what.diskPath);
};

/**
 *
 * @param {import("express").Response} res
 * @param {MediaDescripitor} what
 */
const imageProcess = (res, what) => {
  res.sendFile(what.diskPath);
};

/**
 *
 * @param {import("express").Response} res
 * @param {MediaDescripitor} what
 */
const textProcess = (res, what) => {
  res.sendFile(what.diskPath);
};

module.exports = {
  textProcess,
  imageProcess,
  jsProcess,
  styleProcess,
  htmlProcess,
  moduleProcess,
  scssProcess,
  esProcess,
};
