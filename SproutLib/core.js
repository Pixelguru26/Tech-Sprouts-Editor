// SproutLib core
// Loads and coordinates the rest of the library

/**
 * Executes a callback in the user-supplied Python game,
 * if it exists. Returns the results, or prints a
 * report and exits if the callback throws an error.
 * @param {string} id 
 * @param  {...any} args 
 * @returns 
 */
SproutCore.callback = function(id, ...args) {
  try {
    return SproutCore.usrgame?.[id]?.(...args);
  } catch (e) {
    SproutCore.print(e);
    game.running = false;
  }
};

/**
 * Structures and systems for dependency resolution
 */
(() => {
  let libCompleteFunctions = {};
  SproutCore.libs = {};
  SproutCore.libCount = 0;
  SproutCore.libPromises = [];
  SproutCore.lib = class Lib {
    constructor(id) {
      this.id = id;
      this.valid = true;
      this.loaded = false;
      this.complete = false;
      let containingLib = this;
      this.promise = new Promise((resolve) => {
        libCompleteFunctions[id] = () => {
          containingLib.loaded = true;
          resolve();
        }
      })
      SproutCore.libCount++;
      SproutCore.libPromises.push(this.promise);
    }
  }
  /**
   * Begin loading a library
   * @param {string} id Must be registered by library to complete loading
   * @param {string} src Source javascript file name from the root directory `./SproutLib/`
   */
  SproutCore.requireLib = function(id, src) {
    SproutCore.libs[id] = new SproutCore.lib(id);
    document.body.append(JSLib2.build("script", { src: `./SproutLib/${src}.js` }));
  }
  /**
   * Called by a library to confirm it has finished loading
   * @param {string} id Must mirror required id exactly
   * @param {Array<string>} reqs List of required library ids which must all complete their functions before this one
   * @param {function(game)} fn Function to be executed when all dependencies are met
   */
  SproutCore.registerLib = function(id, reqs, fn) {
    let ret = SproutCore.libs[id];
    let resolve = libCompleteFunctions[id];
    if (!(ret && resolve)) {
      console.error(`Library missmatch on id ${id}`);
      return;
    }
    // Resolve indicates that library has registered its function
    // and is therefore ready to complete loading
    // if all dependencies are met
    ret.reqs = reqs;
    ret.fn = fn;
    resolve();
    return ret;
  }
})();

/**
 * Register modules
 */
SproutCore.modules = [
  "util", "state", "ui", "geometry",
  "asset", "graphics", "utilTimer",
  "entity", "entitySplode",
  "entityBullet", "entityPlayer",
  "entityEnemy", "stateGame",
  "stateMenu", "stateDeath"
];
SproutCore.modules.forEach((v) => {
  SproutCore.requireLib(v, v);
});

/**
 * Resolve dependencies and import all modules
 * @param {HTMLCanvasElement} canvas 
 * @param {HTMLElement} uiElement 
 */
SproutCore.load = async (canvas, uiElement) => {
  SproutCore.canvas = canvas;
  SproutCore.uiElement = uiElement;
  // Main game object
  SproutCore.game ??= {
    title: "Tech Sprouts Shooter",
    keystates: {},
    entities: [],
    entityque: [],
    bullets: [],
    bulletque: [],
    gameStates: {}
  };
  // ==========================================
  // Dependency graph resolution for libraries
  // Require all libraries to load contents before resolving dependency graph
  await Promise.all(SproutCore.libPromises);
  let loaded = 0;
  let i = 0;
  let lib;
  let reqsSatisfied;
  while (loaded < SproutCore.libCount) {
    loaded = 0;
    // Safeguard against infinite loops
    if (i++ > 1000) {
      throw new Error("Dependency graph overflow");
    }
    // Check all libraries for dependencies
    for (let libID in SproutCore.libs) {
      lib = SproutCore.libs[libID];
      if (lib.valid) {
        if (lib.complete) {
          loaded++;
        } else {
          // Check that all dependencies are complete
          reqsSatisfied = true;
          for (let reqID of lib.reqs) {
            if (SproutCore.libs[reqID]) {
              // Requirement still loading
              if (!(SproutCore.libs[reqID]?.complete)) {
                reqsSatisfied = false;
                break;
              }
            } else {
              // Requirement is not even registered
              console.error(`Missing library: ${reqID} in: ${libID}`);
              lib.valid = false;
              reqsSatisfied = false;
              SproutCore.libCount--;
            }
          }
          // Complete lib
          if (reqsSatisfied) {
            await lib.fn(SproutCore.game);
            lib.complete = true;
            loaded++;
          }
        }
      }
    }
  }
  // ==========================================
  // Game setup
  let game = SproutCore.game;
  game.uiElement = uiElement;
  game.running = true;
  game.time = 0;
  game.graphics.init(canvas.getContext("2d"));
  game.cullbox = new game.entity();
  game.cullbox.w = canvas.width;
  game.cullbox.h = canvas.height;
  game.root = "/home/pyodide";
  let lastTime, dt, currentTime;
  game.update = async () => {
    if (lastTime) lastTime = currentTime;
    else lastTime = Date.now();
    currentTime = Date.now();
    dt = (currentTime - lastTime) / 1000; // Convert from ms to s
    if (game.running) {
      game.time += dt;
      game.timer.update(dt);
      game.autoUpdateUtil.update(dt);
      await game.asset.flush();
      await game.state.update?.(dt);
      await game.asset.flush();
      // If game halted during update, discard next draw
      if (game.running) {
        game.graphics.canvas.fillStyle = "black";
        game.graphics.canvas.fillRect(0, 0, canvas.width, canvas.height);
        await game.state.draw?.();
        game.graphics.reset();
      }
    }
  }
  // Events for the game
  SproutCore.events = {};
  SproutCore.events.mousedown = function (evt) {
    if (game?.running) {
      let boundrect = canvas.getBoundingClientRect();
      game.mousedown(evt.button, evt.x - boundrect.left, evt.y - boundrect.top);
    }
  };
  canvas.addEventListener("mousedown", SproutCore.events.mousedown);
  SproutCore.events.mouseup = function (evt) {
    if (game?.running) {
      let boundrect = canvas.getBoundingClientRect();
      game.mousedown(evt.button, evt.x - boundrect.left, evt.y - boundrect.top);
    }
  };
  canvas.addEventListener("mouseup", SproutCore.events.mouseup);
  // These events have to be tied to the body, otherwise they're ignored
  // half the time due to focus shenanigans with the canvas.
  SproutCore.events.keydown = async function (evt) {
    if (game?.running) {
      if (!evt.repeat) {
        game.keystates[(evt.key).toLowerCase()] = true;
        game.state?.keydown?.(evt.key.toLowerCase());
      }
    }
  };
  document.body.addEventListener("keydown", SproutCore.events.keydown);
  SproutCore.events.keyup = async function (evt) {
    if (game?.running) {
      if (!evt.repeat) {
        game.keystates[(evt.key).toLowerCase()] = false;
        game.state?.keyup?.(evt.key.toLowerCase());
      }
    }
  };
  document.body.addEventListener("keyup", SproutCore.events.keyup);
  // ==========================================
  console.log("SproutCore: Game loaded");
  return true;
}

SproutCore.unload = async () => {
  SproutCore.game.state?.exit?.();
  SproutCore.callback("exitState", SproutCore.game.state?.name);
  SproutCore.game.running = false;
  SproutCore.game.player.reset();
  SproutCore.canvas.removeEventListener("mousedown", SproutCore.events.mousedown);
  SproutCore.canvas.removeEventListener("mouseup", SproutCore.events.mouseup);
  document.body.removeEventListener("keydown", SproutCore.events.keydown);
  document.body.removeEventListener("keyup", SproutCore.events.keyup);
  SproutCore.uiElement.textContent = '';
}

/**
 * Initialize core async process.
 * Process runs until the game is terminated.
 */
SproutCore.run = async () => {
  SproutCore.game.state = null;
  SproutCore.game.setState("menu");
  while (SproutCore.game.running) {
    SproutCore.game.update();
    // Yield to browser/os. Required to avoid freezing.
    await new Promise(r => setTimeout(r, 1));
  }
}