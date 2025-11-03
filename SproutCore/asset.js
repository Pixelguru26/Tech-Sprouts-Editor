

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
}

Asset.AnimImageAsset = class AnimImageAsset extends Asset.ImageAsset {
  /**
   * 
   * @param {string} src 
   * @param {number?} frameRate 
   * @param {string?} animStyle Any of `loop`, `single`, `pingpong`, `still`, `dynamic`
   * @param {number?} x 
   * @param {number?} y 
   * @param {number?} w 
   * @param {number?} h 
   * @param {number?} gapX 
   * @param {number?} gapY 
   */
  constructor(src, abs = false, frameRate = 30, animStyle = "loop", x=0, y=0, w=-1, h=-1, gapX=0, gapY=0) {
    super(src, abs);
    this.frameRate = frameRate;
    this.animStyle = animStyle;
    this.frames = [];
    this.cutX = x;
    this.cutY = y;
    this.cutW = w;
    this.cutH = h;
    this.gapX = gapX;
    this.gapY = gapY;
    this.autoSliceType = 0;
  }

  /** @type {number} Width is the maximum width of all frames */
  get w() {
    if (this.frames.length < 1) return super.w;
    let ret = 0;
    for (let f of this.frames) {
      ret = Math.max(ret, f.w);
    }
    return ret;
  }
  /** @type {number} Height is the maximum height of all frames */
  get h() {
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
    let r = Math.min(x + w, super.w);
    let d = Math.min(y + h, super.h);
    x = Math.max(x, 0);
    y = Math.max(y, 0);
    if (r <= x || d <= y) {
      console.log("Null frame warning");
      return;
    }
    let ret = new Gamepad.geo.rec(x, y, r-x, d-y);
    this.frames.push(ret);
    return ret;
  }
  /**
   * Clears all frame divisions from the list
   */
  clear() { this.frames.length = 0; }

  slice(x, y, w, h, dx, dy) {
    let fw = super.w;
    let fh = super.h;
    w = w < 0 ? fw : w;
    h = h < 0 ? fh : h;
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
      default: return 0;
    }
  }
}

export default Asset;