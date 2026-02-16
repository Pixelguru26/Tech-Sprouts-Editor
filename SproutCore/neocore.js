import GameWorld from "./world.js";
import Entity from "./entity.js";
import Geo from "./geometry.js";
import Asset from "./asset.js";
import Graphics from "./graphics.js";
import JSLib from "./../Tabs/lib.js";
import Pylib from "./pylib/index.js";

const PrePy = `
import SproutCore
from pylib.game import GameClass
SproutCore.game = GameClass()

`;

const SproutCoreClass = class SproutCore {

  // ==========================================
  // API access
  GameWorld = GameWorld;
  Entity = Entity;
  Geo = Geo;
  Asset = Asset;

  // ==========================================

  constructor() {
    this.pyInitialized = false;
    this.py = null;
    this.eventListeners = {};
    this.graphics = new Graphics(900, 600);

    Entity.SproutCore = this;
    GameWorld.SproutCore = this;
    Geo.SproutCore = this;
    Asset.SproutCore = this;
  }
  
  /**
   * 
   * @param {string} eventType print, error, pyodideLoaded, setui
   * @param {*} listener 
   */
  addEventListener(eventType, listener) {
    if (!this.eventListeners[eventType]) {
      this.eventListeners[eventType] = [];
    } else if (eventType === "setui") {
      throw new Error("Cannot have connect multiple ui receivers.");
    }
    this.eventListeners[eventType].push(listener);
  }

  removeEventListener(eventType, listener) {
    if (!this.eventListeners[eventType]) return;
    const index = this.eventListeners[eventType].indexOf(listener);
    if (index !== -1) {
      this.eventListeners[eventType].splice(index, 1);
    }
  }

  publishEvent(eventType, ...args) {
    if (!this.eventListeners[eventType]) return;
    try {
      for (let listener of this.eventListeners[eventType]) {
        listener(...args);
      }
    } catch (e) {
      console.error(`Error in event listener for ${eventType}:`, e);
    }
  }

  setUI(...elements) {
    this.publishEvent("setui", ...elements);
  }

  /**
   * Augments error messages to make them more readable
   * and prints them to connected consoles.
   * @param  {...any} errs 
   */
  error(...errs) {
    let data;
    for (let err of errs) {
      // Pyodide requires a handler for multiple errors
      if (err instanceof Error) {
        // Add some labels for readability
        data = [err.message, `Caused by: ${err.cause}`];
        // Split error into array for printing
        if (err.stack) {
          data.push("Stacktrace:");
          data.push(...err.stack.split(/\s+/));
        }
        this.publishEvent("error", err, data.join('\n'), data);
      } else {
        // Pyodide error, better handled by tostring
        this.publishEvent("error", err, toString(err), [toString(err)]);
      }
    }
  }

  /**
   * Prints text or serializable objects to connected consoles.
   * @param  {...any} items 
   */
  print(...items) {
    for (let i = 0; i < items.length; i++) {
      items[i] = items[i]?.toString?.() ?? "null";
    }
    let str = items.join(" ");
    console.log(str);
    this.publishEvent("print", [str]);
  }

  /**
   * Clears connected consoles.
   */
  clear() {
    this.publishEvent("clear");
  }

  /**
   * Pauses execution and opens the browser debugging console.
   * Helpful for advanced users and devs.
   */
  debug() {
    debugger;
  }

  /**
   * Executes the specified Python event with handling
   * for errors.
   * @param {string} id 
   * @param  {...any} args 
   * @returns 
   */
  callPyEvent(id, ...args) {
    if (this.pyInitialized && this.running) {
      try {
        this.game?.[id]?.(...args);
        return this.userpy?.[id]?.(...args);
      } catch (e) {
        e = new Error(`Error while executing Python event: ${id}`, { cause: e });
        this.error(e);
      }
    }
  }

  /**
   * @param {CanvasRenderingContext2D} ctx 
   */
  bindCanvasContext(ctx) {
    this.graphics.bindCanvasContext(ctx);
  }

  keydown(evt) {
    if (!evt.repeat) {
      if (evt.key === 'p' && evt.ctrlKey) {
        console.log("Restart requested");
        evt.preventDefault();
        this.run();
      } else {
        this.callPyEvent("keydown", evt.key);
      }
    }
  }
  keyup(evt) {
    if (!evt.repeat) this.callPyEvent("keyup", evt.key);
  }
  /**
   * 
   * @param {MouseEvent} evt 
   */
  mousedown(evt) {
    let bounds = this.graphics.canvasContext?.canvas?.getBoundingClientRect?.();
    if (bounds) {
      this.callPyEvent("mousedown", evt.button, evt.x - bounds.left, evt.y - bounds.top);
    } else {
      this.callPyEvent("mousedown", evt.button, evt.x, evt.y);
    }
  }
  mouseup(evt) {
    let bounds = this.graphics.canvasContext?.canvas?.getBoundingClientRect?.();
    if (bounds) {
      this.callPyEvent("mouseup", evt.button, evt.x - bounds.left, evt.y - bounds.top);
    } else {
      this.callPyEvent("mouseup", evt.button, evt.x, evt.y);
    }
  }

  async run() {
    if (this.running) {
      // Stop previous thread first if already running
      this.running = false;
      if (this.thread) await this.thread;
    }
    this.thread = (async () => {
      try {
        this.py = await loadPyodide();
        this.py.setStderr({
          batched: (...err) => {
            return this.error(...err);
          }
        });
        this.py.setStdout({
          batched: (str) => {
            this.print(str);
          }
        });
        // Patch in API
        this.py.registerJsModule("SproutCore", this);
        this.py.registerJsModule("JSLib", JSLib);
        // Import pylib
        this.py.FS.mkdir('/home/pyodide/pylib');
        // Temporary solution for nested directories
        this.py.FS.mkdir('/home/pyodide/pylib/games');
        for (let key in Pylib) {
          if (key === "games") {
            for (let subkey in Pylib[key]) {
              this.py.FS.writeFile(`/home/pyodide/pylib/${key}/${subkey}.py`, Pylib[key][subkey]);
            }
          } else {
            this.py.FS.writeFile(`/home/pyodide/pylib/${key}.py`, Pylib[key]);
          }
        }
        // Update listeners
        this.pyInitialized = true;
        this.publishEvent("pyodideLoaded", this.py);
        this.py.FS.writeFile("/home/pyodide/main.py", PrePy + (window.localStorage.getItem("./main.py") ?? ""));

        this.userpy = this.py.pyimport("main");
        // this.game = this.userpy["game"];
      } catch (e) {
        this.error(new Error("Initialization failed", { cause: e }));
        return;
      }

      // Global try as a final failsafe for Python
      try {
        let lastTime = 0;
        let currentTime = Date.now();
        this.running = true;
  
        this.callPyEvent("init");
        while (this.running) {
          lastTime = currentTime;
          currentTime = Date.now();
          let dt = (currentTime - lastTime) / 1000;
          this.callPyEvent("update", dt);
          this.graphics.fillCanvas("black");
          this.callPyEvent("draw");

          // Waiting on performance testing to determine which is better
          // await new Promise(r => setTimeout(r, (1000/60 - (currentTime - lastTime))));
          await new Promise(requestAnimationFrame);
        }
      } catch(e) {
        this.error(e);
      } finally {
        this.running = false;
      }
    })();
  }
}
/** @type {SproutCoreClass} */
const SproutCore = new SproutCoreClass();

export default SproutCore;