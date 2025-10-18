import GameWorld from "./world.js";
import Entity from "./entity.js";
import Geo from "./geometry.js";
import CorePy from "./sproutcore.py.js";
import Asset from "./asset.js";
import Graphics from "./graphics.js";
import JSLib from "./../Tabs/lib.js";

const DEVMODE = false;

const SproutCoreClass = class SproutCore {
  // ==========================================
  // API access
  GameWorld = GameWorld;
  Entity = Entity;
  Geo = Geo;
  Asset = Asset;

  // ==========================================

  /** @type {WebGLRenderingContext} */
  gl = null;
  /** @type {CanvasRenderingContext2D} */
  ctx = null;
  /** @type {Graphics} */
  g = null;

  constructor(constab) {
    // this.assets = new UAssetManager();
    this.pyInitialized = false;
  }
  async init(constab) {
    this.constab = constab;
    if (this.running) {
      // In case this is a restart
      this.running = false;
      if (this.thread) await this.thread;
    }
    
    // Initialize graphics

    /** @type {HTMLCanvasElement} */
    this.canvas = document.getElementById("game-canvas");
    /** @type {CanvasRenderingContext2D} */
    let ctx = this.canvas.getContext("2d");
    /** @type {CanvasRenderingContext2D} */
    this.ctx = ctx;
    /** @type {Graphics} */
    this.g = new Graphics(this.ctx);

    // Todo: use webgl for faster rendering
    /** @type {WebGLRenderingContext} */
    // let gl = this.canvas.getContext("webgl");
    // if (!gl) {
    //   alert("WebGL initialization failed. System cannot run.");
    //   this.running = false;
    //   return;
    // }
    // this.gl = gl;

    // Connect callbacks
    const core = this;
    document.body.addEventListener("keydown", (evt) => { core.keydown(evt); });
    document.body.addEventListener("keyup", (evt) => { core.keyup(evt); });
    this.canvas.addEventListener("mousedown", (evt) => { core.mousedown(evt); });
    this.canvas.addEventListener("mouseup", (evt) => { core.mouseup(evt); });
    Entity.clearIDs();

    await this.initPy();
    this.thread = this.run();
  }

  keydown(evt) {
    if (!evt.repeat) this.callback("keydown", evt.key);
  }
  keyup(evt) {
    if (!evt.repeat) this.callback("keyup", evt.key);
  }
  mousedown(evt) {
    let bounds = this.canvas.getBoundingClientRect();
    this.callback("mousedown", evt.button, evt.x - bounds.left, evt.y - bounds.top);
  }
  mouseup(evt) {
    let bounds = this.canvas.getBoundingClientRect();
    this.callback("mouseup", evt.button, evt.x - bounds.left, evt.y - bounds.top);
  }

  /**
   * Sets up entire Python environment.
   * Begins game as a side effect.
   * Should not be called externally
   */
  async initPy() {
    // let restart = false;
    // if (!this.py) {
    //   // In case this is a restart
    //   restart = true;
    // }
    this.py = await loadPyodide();
    
    // Link console output
    let core = this;
    this.py.setStderr({ batched: (...err) => {
      return core.multiError(...err)
    } });
    this.py.setStdout({ batched: (str) => {
      return core.print(str);
    } });

    // Patch in API
    this.py.registerJsModule("SproutCore", this);
    this.py.registerJsModule("JSLib", JSLib);

    // Initialize python game object
    // Write "file"
    if (DEVMODE) {
      // When in dev mode, assume fetch works appropriately.
      // Allows use of local sproutcore.py without annoying extra steps.
      let data = await fetch("./SproutCore/sproutcore.py");
      this.py.FS.writeFile("/home/pyodide/sproutcore.py", await data.text());
    } else {
      this.py.FS.writeFile("/home/pyodide/sproutcore.py", CorePy);
    }
    // Load to Python
    let env = this.py.pyimport("sproutcore");
    this.game = env["game"];

    // Load user code
    this.py.FS.writeFile(
      "/home/pyodide/main.py",
      "from sproutcore import game\n" +
      window.localStorage.getItem("./main.py") ?? ""
    );
    try {
      // if (restart) {
      //   let env = this.py.runPython(`
      //     import sproutcore
      //     import main
      //     import importlib
      //     global game
      //     sproutcore.game = None
      //     game = sproutcore.GameClass()
      //     sproutcore.game = game
      //     game.init()

      //     importlib.reload(main)
      //   `);
      //   this.game = env["game"];
      // } else {
      // }
      this.userpy = this.py.pyimport("main");
    } catch (e) {
      this.error(e);
      this.running = false;
      return;
    }
  }

  callback(fn, ...args) {
    if (!this.running) return;
    try {
      this.game[fn]?.(...args);
      return this.userpy?.[fn]?.(...args);
    } catch (e) {
      e = new Error(`Error while executing callback: ${fn}`, { cause: e });
      this.error(e);
    }
  }

  /**
   * Adds a timestamp and prints errors to the user-facing console.
   * Includes special cases for pyodide errors and nesting.
   * @param {Error} err 
   */
  error(err) {
    // Todo: add actual console
    // let timeStamp = `${(new Date()).toLocaleTimeString()}`;
    // let msg;
    // if (err instanceof this.py._api.PythonError) {
    //   msg = toString(err);
    //   msg = `[${timeStamp}] Err: ${msg}${msg[msg.length - 1] == '\n' ? '' : '\n'}`;
    // } else {
    //   msg = err.message;
    //   msg = `[${timeStamp}] Err: ${msg}${msg[msg.length - 1] == '\n' ? '' : '\n'}`;
    // }
    // console.error(msg);
    console.error(err);
    this.constab?.print?.(toString(err));
    // debugger;
    // for (let k in err) {
    //   console.log(k, err[k]);
    // }
    // console.error(err.message);
    // if (err.cause) {
    //   console.log("Caused by:");
    //   this.error(err.cause);
    // } else if (err["cause"]) {
    //   console.log("Caused by:");
    //   this.error(err["cause"]);
    // }
  }

  /**
   * Prints multiple errors. Used for Pyodide.
   * @param  {...Error} err 
   */
  multiError(...err) {
    err.forEach(this.error);
  }

  /**
   * Prints one or more items, serializing as necessary.
   * @param  {...any} items 
   */
  print(...items) {
    try {
      for (let i = 0; i < items.length; i++) {
        items[i] = items[i]?.toString?.() ?? "null";
      }
      let str = items.join(' ');
      this.constab?.print?.(str);
      console.log(str);
    } catch (e) {
      e = new Error("Failed to print: non-serializable items encountered.", { cause: e });
      this.error(e);
    }
  }

  /**
   * Function thread will persist until game end
   */
  async run() {
    // Global try as a final failsafe for python
    try {
      let lastTime = 0;
      let currentTime = Date.now();
      this.running = true;
      try {
        this.game["state"] = null;
        this.game["setState"]("menu");
      } catch (e) {
        e = new Error("Error while entering menu state", { cause: e });
        this.error(e);
        return;
      }
      try {
        this.game["load"]();
      } catch (e) {
        e = new Error("Error while loading game", {cause: e});
        this.error(e);
        return;
      }

      // Core loop
      while (this.running) {
        lastTime = currentTime;
        currentTime = Date.now();
        // Update
        try {
          this.game["update"](Math.max(1 / 60, (currentTime - lastTime) / 1000));
          this.userpy?.["update"]?.(Math.max(1 / 60, (currentTime - lastTime) / 1000));
        } catch (e) {
          e = new Error("Error while updating", {cause: e});
          this.error(e);
          return;
        }
        if (!this.running) break;

        // Draw
        try {
          this.g.c.resetTransform();
          this.g.c.fillStyle = "black";
          this.g.c.fillRect(0, 0, this.g.c.canvas.width, this.g.c.canvas.height);
          this.game["draw"]();
          this.userpy?.["draw"]?.();
        } catch (e) {
          e = new Error("Error while rendering frame", {cause: e});
          this.error(e);
          return;
        }

        // Yield to browser/os. Required to avoid freezing.
        await new Promise(r => setTimeout(r, 1));
      }
    } catch(e) {
      e = new Error("Error in core loop", {cause: e});
      this.error(e);
    }
  }

  debug() {
    debugger;
  }
}
const SproutCore = new SproutCoreClass();

// Access for dependencies
Entity.SproutCore = SproutCore;
GameWorld.SproutCore = SproutCore;
Geo.SproutCore = SproutCore;
Asset.SproutCore = SproutCore;

export default SproutCore;