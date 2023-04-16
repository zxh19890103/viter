"global";

type ModuleID = string;

class ModuleDependencyNode {
  id: ModuleID;
  dependents: Record<ModuleID, ModuleDependencyNode>;
  dependencies: Record<ModuleID, ModuleDependencyNode>;

  constructor(id: ModuleID, ...dependencies: ModuleDependencyNode[]) {
    this.id = id;
    this.dependencies = Object.fromEntries(
      dependencies.map((dep) => {
        return [dep.id, dep];
      })
    );
  }

  addDependency(dep: ModuleDependencyNode) {
    this.dependencies[dep.id] = dep;
  }
}

class ModuleDependencyGraph {
  root: ModuleDependencyNode;
}

type ModuleType = "scss" | "ts";

class ModulesManager extends Map<
  string,
  { run: VoidFunction; moduleType: ModuleType }
> {
  loaded = {};
  dependencyGraph = new ModuleDependencyGraph();

  main: string = null;

  push(name: string, moduleFactory: any, moduleType: ModuleType) {
    if (this.has(name)) {
      // update
      console.log("update mod", name);

      const isLoaded = !!this.loaded[name];

      this.loaded[name] = null;

      this.set(name, { run: moduleFactory, moduleType });

      if (isLoaded) {
        this.load(name);
      }

      return;
    }

    if (this.isMainModule(name)) {
      this.main = name;
    }

    this.set(name, { run: moduleFactory, moduleType });
  }

  isMainModule(name: string) {
    return /(bootstrap|main)/i.test(name);
  }

  load(name: string) {
    if (this.loaded[name]) {
      return this.loaded[name];
    }

    /**
     * reload if the module not exist
     */
    if (!this.has(name)) {
      // window.location.reload();
      console.log("has no this module", name);
      return;
    }

    const { run } = this.get(name);
    const mod = run();
    this.loaded[name] = mod;

    return mod;
  }

  unload(name: string) {
    this.loaded[name] = null;
  }

  unloadAll() {
    for (const k in this.loaded) {
      const m = this.loaded[k];
      m.teardown?.();
    }

    this.loaded = {};
  }
}

const $h = window["React"].createElement;
const __cwd__ = [];
const __modules__ = new ModulesManager();
const __externals__ = {
  react: "React",
  "react-dom": "ReactDOM",
  ...window["__externals__"],
};

const __resolve__ = (name: string) => {
  if (/\.(tsx?|scss)$/.test(name)) {
    return name;
  }

  let _name = `${name}.ts`;
  if (__modules__.has(_name)) {
    return _name;
  }

  _name = `${name}.tsx`;
  if (__modules__.has(_name)) {
    return _name;
  }

  return name;
};

const __require__ = function (name: string) {
  if (__externals__[name]) {
    return window[__externals__[name]];
  }

  if (name[0] === "/") {
    return __modules__.load(__resolve__(name));
  } else {
    return __modules__.load(__resolve__(__get_abs_cwd__() + name.substring(1)));
  }
};

const __get_abs_cwd__ = () => {
  return __cwd__[__cwd__.length - 1]
};

Object.defineProperty(globalThis, "require", { value: __require__ });

type EsMessageType =
  | "pingpong"
  | "reload"
  | "message"
  | "notification"
  | "moduleUpdate";

interface EsMessage {
  type: EsMessageType;
  data: any;
  [k: string]: any;
}

const runApp = () => {
  if (!__modules__.main) {
    console.log("Warn: no main module specified!");
    return;
  }

  const es = new EventSource("/random.es");

  es.onmessage = (e) => {
    const msg = JSON.parse(e.data) as EsMessage;

    switch (msg.type) {
      case "pingpong": {
        console.log("pingpong", msg.data);
        break;
      }
      case "message": {
        break;
      }
      case "notification": {
        break;
      }
      case "moduleUpdate": {
        const { name, mediaType } = msg.data;
        if (mediaType === "ts") {
          __modules__.unloadAll();
          executeScript(name, () => {
            require(__modules__.main);
          });
        } else if (mediaType === "scss") {
          executeScript(name);
        } else {
          console.log("... unknown module update.");
        }
        break;
      }
      case "reload": {
        window.location.reload();
        break;
      }
    }
  };

  require(__modules__.main);
};

const executeScript = (url: string, done?: VoidFunction) => {
  const scriptTag = document.createElement("script");
  scriptTag.src = url;
  document.head.appendChild(scriptTag);
  scriptTag.onload = () => {
    document.head.removeChild(scriptTag);
    done && done();
  };
};

setTimeout(runApp, 0);
