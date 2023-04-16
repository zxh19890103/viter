const fs = require("fs");
const http = require("http");
const path = require("path");
const paths = require("../core/paths");

const { join } = path;

class EventSource {
  /**
   * @type {Set<http.ServerResponse>}
   */
  #responses = new Set();

  /**
   * @param {http.ServerResponse} res
   */
  set(res) {
    if (this.#responses.has(res)) {
      return;
    }

    res.on("close", () => {
      this.#responses.delete(res);
    });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Transfer-Encoding", "identity");
    res.writeHead(200);
    res.flushHeaders();
    res.write(":ok\n\n");

    this.#responses.add(res);
  }

  /**
   * @param {EsMessageType} type
   */
  emit(payload, type = "message") {
    const now = Date.now();

    const data = {
      type,
      data: payload,
    };

    const event =
      `
id: ${now.toString(16)}
type: message
data: ${JSON.stringify(data)}
    `.trim() + "\n\n";

    for (const res of this.#responses) {
      res.write(event);
    }
  }

  pingpong(interval = 1000, delay = 500) {
    const tick = () => {
      setTimeout(tick, interval);
      this.emit({ r: Math.random() }, "pingpong");
    };

    setTimeout(tick, delay);
  }

  /**
   * @param {string} dir
   */
  watch(dir) {
    fs.watch(
      dir,
      {
        recursive: true,
      },
      (event, name) => {
        if (event !== "change") return;

        const modulename = `/${path.relative(paths.cwd, join(dir, name))}`;

        if (/\.(html)$/.test(name)) {
          this.emit({ name: modulename, mediaType: "html" }, "reload");
        } else if (/\.(tsx?|js)$/.test(name)) {
          this.emit({ name: modulename, mediaType: "ts" }, "moduleUpdate");
        } else if (/s?css$/.test(name)) {
          this.emit({ name: modulename, mediaType: "scss" }, "moduleUpdate");
        }
      }
    );
  }
}

/**
 * @type {EventSource}
 */
EventSource.current = null;

/**
 *
 * @param {http.ServerResponse} res
 * @param {object} what
 */
const esProcess = (res, what) => {
  if (!EventSource.current) {
    res.end();
    return;
  }

  EventSource.current.set(res);
};

module.exports = {
  EventSource,
  esProcess,
};
