const fs = require("fs");
const {
  join: p_join,
  dirname: p_dirname,
  relative: p_relative,
} = require("path");

const sass = require("sass");
const ts = require("typescript");
const paths = require("../core/paths");
const { serveOptions } = require("../core/options");

const tsConfig = require(p_join(paths.cwd, "./tsconfig.json"));

/**
 * @param {import("express").Response} res
 * @param {MediaDescripitor} what
 */
module.exports = (res, what) => {
  if (serveOptions.isBootReq(what.diskPath)) {
    shipWhole(res);
  } else {
    shipMoudle(res, what);
  }
};

/**
 * @param {import("express").Response} res
 * @param {MediaDescripitor} what
 */
const shipWhole = (res) => {
  res.setHeader("Content-Type", "application/javascript");

  res.write(transpileTs(p_join(__dirname, "./runtime.client.ts")));
  res.write("\n");

  walk(
    p_join(paths.src),
    (path, name, type) => {
      res.write(`// === begin ${name} ===\n`);

      switch (type) {
        case "ts": {
          res.write(transpileTs(path, name));
          break;
        }
        case "scss": {
          res.write(transpileScss(path, name));
          break;
        }
      }

      res.write(`\n// === end ${name} ===\n`);
    },
    "/src/"
  );

  res.end();
};

/**
 * @param {import("express").Response} res
 * @param {MediaDescripitor} what
 */
const shipMoudle = (res, what) => {
  res.setHeader("Content-Type", "application/javascript");

  const { diskPath } = what;

  const name = `/${p_relative(paths.cwd, diskPath)}`;

  if (/.tsx?$/.test(diskPath)) {
    res.write(transpileTs(diskPath, name));
  } else if (/.scss?$/.test(diskPath)) {
    res.write(transpileScss(diskPath, name));
  }

  res.end();
};

/**
 * @param {string} path
 * @param {string} name
 * @returns
 */
const transpileTs = (path, name) => {
  const source = ch.readFile(path);

  if (source.indexOf('"global"') === 0) {
    const output = ts.transpile(source, {
      ...tsConfig.compilerOptions,
      module: "None",
    });

    return output;
  } else {
    const output = ts.transpile(source, tsConfig.compilerOptions);
    return wrap(output, name, getCwdFilePath(path), "ts");
  }
};

const getCwdFilePath = (path) => {
  return "/" + p_relative(paths.cwd, path);
};

const transpileScss = (path, name) => {
  const result = sass.compile(path);

  return wrap(
    `
const nodeId = 'style_${name.replace(/[\.\/\-]/g, "_")}';

const element = document.head.querySelector(\`#$\{nodeId\}\`) ?? document.createElement('style');
element.id = nodeId;

if (!element.isConnected) {
  document.head.appendChild(element);
}

const css = \`${result.css}\`;

element.innerHTML = css;

exports.teardown = () => {
  document.head.removeChild(element);
}

exports.default = css;
  `,
    name,
    getCwdFilePath(path),
    "scss"
  );
};

/**
 *
 * @param {string} dir
 */
const walk = (dirpath, doWork, cwd) => {
  const dir = fs.opendirSync(dirpath);

  /**
   * @type {fs.Dirent}
   */
  let dirent = null;

  while ((dirent = dir.readSync())) {
    const _path = p_join(dirpath, dirent.name);
    const _cwd = `${cwd}${dirent.name}`;

    if (dirent.isDirectory()) {
      walk(_path, doWork, _cwd + "/");

      ifpkg(_path, (file) => {
        console.log("pkg", file, _cwd);
        doWork(file, _cwd, "ts");
      });
    } else if (dirent.isFile()) {
      if (/.tsx?$/.test(dirent.name)) {
        doWork(_path, _cwd, "ts");
      } else if (/.scss?$/.test(dirent.name)) {
        doWork(_path, _cwd, "scss");
      }
    }
  }

  dir.closeSync();
};

const ch = ts.createCompilerHost({
  ...tsConfig.compilerOptions,
});

/**
 *
 * @param {string} script
 * @param {string} modulename
 * @param {string} file
 * @param {'ts' | 'scss'} mediaType
 * @returns
 */
const wrap = (script, modulename, file, mediaType = "ts") => {
  return `__modules__.push('${modulename}', function () {
    const exports = { id: '${modulename}', mediaType: '${mediaType}' };
    __cwd__.push('${p_dirname(file)}');
    // Script Begin
    ${script}
    // Script End
    __cwd__.pop();
    return exports;
    })`;
};

/**
 * @param {string} dir
 * @param {(file: string) => void} hit
 */
const ifpkg = (dir, hit) => {
  const head = (path) => {
    return fs.existsSync(p_join(dir, path));
  };

  /**
   * @type {string}
   */
  let main = null;

  if (head("./package.json")) {
    try {
      main = require.resolve(dir);
    } catch (e) {}
  }

  if (head("./index.tsx")) {
    main = p_join(dir, "./index.tsx");
  }

  if (head("./index.ts")) {
    main = p_join(dir, "./index.ts");
  }

  if (main) {
    hit(main);
  }
};
