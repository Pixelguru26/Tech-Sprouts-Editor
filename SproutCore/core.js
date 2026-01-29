import GameWorld from "./world.js";
import Entity from "./entity.js";
import Geo from "./geometry.js";
import Asset from "./asset.js";
import Graphics from "./graphics.js";
import JSLib from "./../Tabs/lib.js";


import Pylib from "./pylib/index.js";
import PyShooter from "./pylib/games/shooter.py.js";

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

  constructor() {
    // this.assets = new UAssetManager();
    this.pyInitialized = false;
    this.py = null;
    this.pyReceivers = [];
  }
  async init(consoleManager) {
    this.consoleManager = consoleManager;
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

    // Link console input
    let sproutcore = this; // Because JS is too stupid to maintain context
    this.consoleManager.addInputEventListener(function (evt) {
      sproutcore.callback("input", evt.detail.value);
    });

    this.thread = this.run();
  }

  async restart() {
    let reloadIcon = document.getElementById("game-reload");
    reloadIcon.spinnerAnimation.play();
    reloadIcon.classList.remove("fa-play");
    reloadIcon.classList.add("fa-stop");
    try {
      this.consoleManager.clear();
      await this.init(this.consoleManager);
    } catch (e) {
      console.error(e);
    }
    reloadIcon.spinnerAnimation.cancel();
    reloadIcon.classList.remove("fa-stop");
    reloadIcon.classList.add("fa-play");
  }

  /**
   * @param {KeyboardEvent} evt 
   */
  keydown(evt) {
    if (!evt.repeat) {
      if (evt.key === 'p' && evt.ctrlKey) {
        this.restart();
        evt.preventDefault();
      } else {
        this.callback("keydown", evt.key);
      }
    }
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

  addPyReceiver(fn) {
    if (!this.pyReceivers.includes(fn)) {
      this.pyReceivers.push(fn);
      if (this.py !== null) {
        fn(this.py);
      }
    }
  }

  /**
   * Sets up entire Python environment.
   * Begins game as a side effect.
   * Should not be called externally
   */
  async initPy() {
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

    // Import sproutcore pylib
    this.py.FS.mkdir("/home/pyodide/pylib");
    for (let key in Pylib) {
      this.py.FS.writeFile(`/home/pyodide/pylib/${key}.py`, Pylib[key]);
    }
    // Import games
    this.py.FS.mkdir("/home/pyodide/pylib/games");
    this.py.FS.writeFile("/home/pyodide/pylib/games/shooter.py", PyShooter);
    // Dispatch pyodide loaded event
    this.pyReceivers.forEach((v) => v(this.py));

    // Load user code
    this.py.FS.writeFile(
      "/home/pyodide/main.py",
      "from pylib.shared import game\n" +
      "global game\n" + 
      "from pylib.game import GameClass\n" +
      "game = GameClass()\n" +
      (window.localStorage.getItem("./main.py") ?? "")
    );
    try {
      this.userpy = this.py.pyimport("main");
      this.game = this.userpy["game"];
    } catch (e) {
      this.error(e);
      this.running = false;
      return;
    }
  }

  callback(fn, ...args) {
    if (!this.running) return;
    try {
      this.game?.[fn]?.(...args);
      return this.userpy?.[fn]?.(...args);
    } catch (e) {
      e = new Error(`Error while executing callback: ${fn}`, { cause: e });
      this.error(e);
    }
  }

  /**
   * Adds a timestamp and prints errors to the user-facing console.
   * @param {Error} err 
   */
  error(err) {
    if (this.consoleManager?.print) {
      if (err instanceof Error) {
        this.consoleManager.print(err.message);
        this.consoleManager.print(`Caused by: ${err.cause}`);
        this.consoleManager.print(`Stacktrace:`);
        if (err.stack) {
          for (let line of err.stack.split(/\s/)) {
            if (line != "") {
              this.consoleManager.print(`\t> ${line}`);
            }
          }
        }
      } else {
        // This handles Pyodide errors better
        this.consoleManager.print(toString(err));
      }
    }
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
      this.consoleManager?.print?.(str);
      console.log(str);
    } catch (e) {
      e = new Error("Failed to print: non-serializable items encountered.", { cause: e });
      this.error(e);
    }
  }

  /**
   * Clears the console
   */
  cls() {
    this.consoleManager.clear();
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
        if (this.game) {
          this.game["state"] = null;
          this.game?.["setState"]?.("menu");
        }
      } catch (e) {
        e = new Error("Error while entering menu state", { cause: e });
        this.error(e);
        return;
      }
      try {
        this.game?.["load"]?.();
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
          this.game?.["update"](Math.max(1 / 60, (currentTime - lastTime) / 1000));
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
          this.game?.["draw"]();
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