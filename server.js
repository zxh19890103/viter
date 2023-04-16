const express = require("express");
const { EventSource } = require("./handlers/es");
const { MediaType2Process } = require("./mapping");
const { getIs } = require("./core/parse");
const paths = require("./core/paths");
const { serveOptions } = require("./core/options");

/**
 *
 * @param {ServerOptions} options
 */
const run = (options) => {
  Object.assign(serveOptions, options);

  const app = express();

  app.get("/*", (req, res) => {
    const what = getIs(req.path);
    console.log(what);
    MediaType2Process[what.mediaType](res, what);
  });

  const port = 2024;

  app.listen(port, () => {
    const eventSource = (EventSource.current = new EventSource());

    eventSource.watch(paths.src);

    console.log("Server is running on port", port);
  });
};

module.exports = { run, paths, serveOptions };
