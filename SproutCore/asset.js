import Util from "./util.js";
import {Rectangle} from "./geometry.js";


class Asset {
  /** Global asset registry. Persists between game instances. */
  static reg = {};
  /** Registration queue */
  static que = [];

  /**
   * 
   * @param {string} path 
   * @param {*} defaultVal 
   * @param {string?} name 
   * @param {boolean?} abs 
   */
  constructor(path, defaultVal, name = null, abs = false) {

    this.loaded = false;
    this.value = defaultVal;

    if (abs) this.path = path;
    else this.path = "./Assets/" + path;

    // Remove file extension
    let i = path.lastIndexOf('.');
    if (i > 0) {
      path = path.substring(0, i);
    }

    // Assign short name
    // If none is provided, generate one from path
    if (name) {
      this.name = name;
      Asset.reg[name] = this;
    } else {
      let tmp = path.split('/');
      this.name = tmp.pop();
      if (!this.name) this.name = path;
      Asset.reg[this.name] = this;
    }

    Asset.push(this);
  }

  static getAsset (src) {
    if (src in this.reg) return this.reg[src];
    let tmp = "./Assets/" + src;
    if (tmp in this.reg) return this.reg[tmp];
    return null;
  }

  async load() {}

  /**
   * Executes all loadfunctions registered to this object.
   */
  onLoad() {
    if (!this.loadFunctions) return;
    for (const fn of this.loadFunctions) fn(this);
    delete this.loadFunctions;
  }

  /**
   * Adds a function to be executed as soon as this object finishes loading.
   * If the object is already loaded, it is executed immediately.
   * @param {function(Asset): void} fn 
   */
  addCallback(fn) {
    if (!this.loaded) {
      this.loadFunctions ??= [];
      if (!this.loadFunctions.includes(fn))
        this.loadFunctions.push(fn);
    } else fn(this);
  }

  /**
   * Completes loading of all queued assets
   */
  static async flush() {
    let a = Asset.que;
    let len = a.length;
    for (let i = 0; i < len; i++) {
      if (a[i]) a[i].load?.();
      a[i] = null;
    }
    a.length = 0;
  }
  /**
   * Pushes an asset to the queue for loading by the end of the frame
   * @param {Asset} asset 
   * @returns {Asset}
   */
  static push(asset) {
    if (!Asset.que.includes(asset)) Asset.que.push(asset);
    return asset;
  }
  /**
   * Removes and returns the oldest asset from the queue
   * @returns {Asset}
   */
  static deque() {
    if (Asset.que.length > 0) return Asset.que.shift();
  }
}
Asset.ImageAsset = class ImageAsset extends Asset {
  /**
   * @param {string} path 
   * @param {string?} name 
   * @param {bool?} abs
   */
  constructor(path, name = null, abs = false) {
    super(path, null, name, abs);

    this.element = document.createElement("img");
    this.element.src = this.path;
    (document.getElementById("assets"))?.appendChild?.(this.element);
  }

  get src() { return this.element.src; }
  set src(v) { this.element.src = v; }

  static getImage(src) {
    return Asset.getAsset(src) ?? new ImageAsset(src);
  }

  get width() { return this.element.naturalWidth; }
  get height() { return this.element.naturalHeight; }

  /**
   * 
   * @param {CanvasRenderingContext2D} canvas 
   * @param {number} [clock=0] 
   */
  draw(canvas, clock = 0) {
    canvas.drawImage(this.element, 0, 0);
  }
}

/**
 * Class outline used to provide hints in IDEs
 */
class SliceArgs {
  constructor() {
    /**
     * Looping behavior when animation is complete.
     * @type {"loop"|"single"|"pingpong"|"still"|"dynamic"|"random"}
     */
    this.animStyle = "loop";
    /**
     * Frames per second while animated.
     * @type {number}
     */
    this.frameRate = 30;
    /**
     * Initial (top left) x position.
     * Overrides x.
     * @type {number}
     */
    this.initialx = 0;
    /**
     * Initial (top left) y position.
     * Overrides y.
     * @type {number}
     */
    this.initialy = 0;
    /**
     * Width of each frame.
     * Overrides w.
     * @type {number}
     */
    this.frameWidth = 0;
    /**
     * Height of each frame.
     * Overrides h.
     * @type {number}
     */
    this.frameHeight = 0;
    /**
     * Horizontal gap between frames.
     * Overrides dx.
     * @type {number}
     */
    this.gapX = 0;
    /**
     * Vertical gap between frames.
     * Overrides dy.
     * @type {number}
     */
    this.gapY = 0;
    /**
     * Horizontal frame count.
     * Overrides frameWidth.
     * @type {number}
     */
    this.hSlices = null;
    /**
     * Vertical frame count.
     * Overrides frameHeight.
     * @type {number}
     */
    this.vSlices = null;

    /** @type {number} */
    this.x = null;
    /** @type {number} */
    this.y = null;
    /** @type {number} */
    this.w = null;
    /** @type {number} */
    this.h = null;
    /** @type {number} */
    this.dx = null;
    /** @type {number} */
    this.dy = null;
  }

  /** List of all valid animation types and end-animation behaviors */
  static animStyles = [
    "loop", "single", "pingpong", "still", "dynamic", "random"
  ];
}
Asset.AnimImageAsset = class AnimImageAsset extends Asset.ImageAsset {
  /**
   * 
   * @param {string} src 
   * @param {string} name
   * @param {bool} abs
   * @param {SliceArgs} args
   */
  constructor(src, name, abs, args) {
    super(src, name, abs);
    this.frameRate = args.frameRate ?? 30;
    this.animStyle = args.animStyle ?? "loop";
    this.frames = [];
    this.slice(args);
  }

  /** @type {number} Width is the maximum width of all frames */
  get width() {
    if (this.frames.length < 1) return super.w;
    let ret = 0;
    for (let f of this.frames) {
      ret = Math.max(ret, f.w);
    }
    return ret;
  }
  /** @type {number} Height is the maximum height of all frames */
  get height() {
    if (this.frames.length < 1) return super.h;
    let ret = 0;
    for (let f of this.frames) {
      ret = Math.max(ret, f.h);
    }
    return ret;
  }
  /** @type {number} Duration of the animation, in seconds */
  get duration() { return this.frames.length / this.frameRate; }

  onLoad() {
    switch (this.autoSliceType) {
      case 0:
        this.autoSliceType(this.cutX, this.cutY, this.cutW, this.cutH, this.gapX, this.gapY);
        break;
      case 1:
        this.autoSliceType(this.cutX, this.cutY, this.w/this.cutW, this.h/this.cutH, this.gapX, this.gapY);
        break;
    }
    return super.onLoad();
  }

  addFrame(x, y, w, h) {
    let r = Math.min(x + w, super.width);
    let d = Math.min(y + h, super.height);
    x = Math.max(x, 0);
    y = Math.max(y, 0);
    if (r <= x || d <= y) {
      console.log("Null frame warning");
      return;
    }
    let ret = new Rectangle(x, y, r-x, d-y);
    this.frames.push(ret);
    return ret;
  }
  /**
   * Clears all frame divisions from the list
   */
  clear() { this.frames.length = 0; }

  slice(x, y, w, h, dx, dy) {
    let fw = super.width;
    let fh = super.height;
    if (typeof x === "object") {
      /** @type {SliceArgs} */
      let args = x;
      x = args.initialx ?? args.x ?? 0;
      y = args.initialy ?? args.y ?? 0;
      if (args.hSlices) w = (fw - x) / args.hSlices;
      else w = args.frameWidth ?? args.w ?? fw;
      if (args.vSlices) h = (fh - y) / args.vSlices;
      else h = args.frameHeight ?? args.h ?? fh;
      dx = args.gapX ?? args.dx ?? 0;
      dy = args.gapY ?? args.dy ?? 0;
    } else {
      w = w < 0 ? fw : w;
      h = h < 0 ? fh : h;
    }
    let vx = x;
    let vy = y;
    while (vy < fh) {
      while (vx < fw) {
        this.addFrame(vx, vy, w, h);
        vx += w + dx;
      }
      vx = x;
      vy += h + dy;
    }
  }

  autoSlice(x, y, hSlices, vSlices, dx, dy) {
    return this.slice(x, y, (this.w-x)/hSlices - dx, (this.h-y)/vSlices - dy, dx, dy);
  }

  frameAt(clock) {
    if (this.frames.length < 1) return -1;
    let frame = Math.floor(this.frameRate * clock);
    
    switch (this.animStyle) {
      case "loop": return frame % this.frames.length;
      case "single": return Math.min(frame, this.frames.length - 1);
      case "random":
        let r = Util.hashString(this.name, frame);
        return r % this.frames.length;
      default: return 0;
    }
  }

  /**
   * 
   * @param {CanvasRenderingContext2D} canvas 
   * @param {number} [clock=0] 
   */
  draw(canvas, clock = 0) {
    let frame = this.frameAt(clock);
    if (frame < 0) canvas.drawImage(this.element, 0, 0);
    else {
      frame = this.frames[frame];
      canvas.drawImage(this.element,
        frame.x, frame.y, frame.w, frame.h,
        0, 0, frame.w, frame.h
      );
    }
  }

}

// Load default assets so they have nice shortcuts
new Asset.ImageAsset("enemy/enemy_base.png", "enemy_base");
new Asset.ImageAsset("enemy/enemy_debris_1.png", "enemy_debris_1");
new Asset.ImageAsset("enemy/enemy_helicopter.png", "helicopter");
new Asset.ImageAsset("enemy/heliblades.png", "heliblades");
new Asset.ImageAsset("enemy/heliblades_spin.png", "heliblades_spin");
new Asset.ImageAsset("player/player_base.png", "player_base");
new Asset.ImageAsset("player/player_gold.png", "player_gold");
new Asset.ImageAsset("player/player_red.png", "player_red");
new Asset.ImageAsset("player/player_skull.png", "player_skull");
new Asset.ImageAsset("projectile/bullet_base.png", "bullet_base");
new Asset.ImageAsset("projectile/bullet_rocket.png", "bullet_rocket");
new Asset.ImageAsset("projectile/bullet_plasma.png", "bullet_plasma");
new Asset.ImageAsset("bg/Starfield2.png", "bg0");
new Asset.ImageAsset("bg/Starfield3.png", "bg1");
// Animated assets
new Asset.AnimImageAsset(
  "projectile/splode.png", "splode", false, {
    frameRate: 30,
    animStyle: "loop",
    hSlices: 4,
    vSlices: 4
  }
);
new Asset.AnimImageAsset(
  "projectile/lance.png", "lance", false, {
    frameRate: 30,
    animStyle: "loop",
    hSlices: 4,
    vSlices: 4
  }
);
new Asset.AnimImageAsset(
  "projectile/bullet_bright.png", "bullet_bright", false, {
    frameRate: 30,
    animStyle: "random",
    hSlices: 5,
    vSlices: 1
  }
);
new Asset.AnimImageAsset(
  "shield.png", "shield", false, {
    frameRate: 30,
    animStyle: "loop",
    hSlices: 10,
    vSlices: 9
  }
);

export default Asset;