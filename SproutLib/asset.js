SproutCore.registerLib("asset", [], async (game) => {
  game.asset = class Asset {
    static assets = {};
    constructor(defaultVal) {
      this.loaded = false;
      this.value = defaultVal;
    }
    async load() {}

    /**
     * Executes all loadfunctions registered to this object. Ignore it.
     */
    onLoad() {
      if (!this.loadFunctions) return;
      for (const fn of this.loadFunctions) fn(this);
      delete this.loadFunctions;
    }

    /**
     * Adds a function to be executed as soon as this object finishes
     * loading. If the object is already loaded, it is executed
     * immediately.
     * @param {function(game.Asset)} fn 
     */
    addCallback(fn) {
      if (!this.loaded)
        this.loadFunctions ??= [];
        if (!this.loadFunctions.includes(fn))
          this.loadFunctions.push(fn);
      else fn(this);
    }

    /** Asset que */
    static que = [];

    /**
     * Completes loading of all queued assets
     * @returns {number} new length of the que
     */
    static async flush() {
      let a = Asset.que;
      let len = a.length;
      for (let i = 0; i < len; i++) {
        if (a[i]) a[i].load();
        a[i] = null;
      }
      a.length = 0;
      return len;
    }

    /**
     * Pushes an asset to the que for loading by the end of the frame
     * @param {game.Asset} v
     * @returns {game.Asset} the same asset passed in
     */
    static push(v) {
      if (!Asset.que.includes(v)) Asset.que.push(v);
      return v;
    }

    /**
     * Removes and returns the oldest asset from the que
     * @returns {game.Asset}
     */
    static pop() {
      if (Asset.que.length > 0) return Asset.que.shift();
    }
  }
  game.asset.assetImage = class AssetImage extends game.asset {
    /**
     * 
     * @param {string} src Source path for the image, for example:
     * `"assets/image/error.png"`
     */
    constructor(src) {
      super(AssetImage.default);
      this.src = src;
      game.asset.push(this);
    }

    /**
     * Performs necessary loading actions for this asset
     */
    async load() {
      let internal = this; // Needed to maintain scope
      return await JSLib2.awaitBuild("img", {src: this.src}).then(
        (value) => {
          internal.value = value;
          internal.loaded = true;
          delete internal.promise;
          internal.onLoad();
        }
      );
    }

    /**
     * Blits the contained image onto the canvas
     * @param {CanvasImageSource} canvas 
     * @param {number} x 
     * @param {number} y 
     */
    blit(canvas, x, y) {
      canvas.drawImage(this.value, x, y);
    }

    get w() { return this.value.naturalWidth ?? 0; }
    get h() { return this.value.naturalHeight ?? 0; }

    /**
     * Retrieves an asset if it exists, constructs and returns it if it does not.
     * @param {string} src 
     * @returns {game.asset}
     */
    static getOrLoad(src) {
      return game.asset.assets[src] ?? (game.asset.assets[src] = new game.asset.assetImage(src));
    }

    /**
     * Returns the necessary scaling factor to extend this sprite
     * to the edges of a circle with the given radius.
     * @param {number} r 
     * @returns {number}
     */
    radiusToScale(r) {
      return r * 2 / Math.max(this.w, this.h);
    }
  }
  game.asset.assetImage.default = await JSLib2.awaitBuild("img", { src: "core//assets/image/error.png" });
  game.asset.assetImageAnimated = class AssetImageAnimated extends game.asset.assetImage {
    /** List of all valid animation types and end-animation behaviors */
    static animStyles = [
      "loop", "single", "pingpong", "still", "dynamic"
    ];

    /**
     * Parameters will automatically slice the image into
     * frames on load, starting from the top left (x, y)
     * and continuing left to right, top to bottom.
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
    constructor(src, frameRate = 30, animStyle = "loop", x = 0, y = 0, w = -1, h = -1, gapX = 0, gapY = 0) {
      super(src);
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

    /**
     * Automatically generate frame rectangles for the image
     * starting at the top left corner of (x, y).
     * Each frame has a width and height of (w, h).
     * If either or both are -1, they default to full source image bounds.
     * dx and dy are the gaps between columns and rows, respectively.
     * @param {number} x Starting x position
     * @param {number} y Starting y position
     * @param {number} w Frame width
     * @param {number} h Frame height
     * @param {number} dx Gap width
     * @param {number} dy Gap height
     */
    static createAutoSliced(src, frameRate = 30, animStyle = "loop", x = 0, y = 0, sliceX = -1, sliceY = -1, gapX = 0, gapY = 0) {
      let ret;
      if (Number.isFinite(frameRate)) {
        ret = new AssetImageAnimated(src, frameRate, animStyle, x, y, sliceX, sliceY, gapX, gapY);
      } else {
        let p = frameRate;
        ret = new AssetImageAnimated(
          src,
          p.frameRate ?? 30,
          p.x ?? p.bounds?.x ?? 0,
          p.y ?? p.bounds?.y ?? 0,
          p.sliceX ?? p.slice ?? 1,
          p.sliceY ?? p.slice ?? 1,
          p.gapX ?? p.gap ?? p.margin ?? 0,
          p.gapY ?? p.gap ?? p.margin ?? 0
        );
      }
      ret.autoSliceType = 1;
      return ret;
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
    /** @type {number} Duration of the animation in seconds */
    get duration() { return this.frames.length / this.frameRate; }

    /**
     * Automatically slices the image based on parameters set by the constructor
     */
    onLoad() {
      switch (this.autoSliceType) {
        case 0:
          this.slice(this.cutX, this.cutY, this.cutW, this.cutH, this.gapX, this.gapY);
          break;
        case 1:
          this.slice(this.cutX, this.cutY, this.w/this.cutW, this.h/this.cutH, this.gapX, this.gapY);
          break;
      }
      return super.onLoad();
    }
    /**
     * Appends a new frame division to the frames list
     * @param {number} x 
     * @param {number} y 
     * @param {number} w 
     * @param {number} h 
     * @returns {game.geo.rec}
     */
    addFrame(x, y, w, h) {
      let r = Math.min(x + w, super.w);
      let d = Math.min(y + h, super.h);
      x = Math.max(x, 0);
      y = Math.max(y, 0);
      if (r <= x || d <= y) {
        console.log("Null frame warning");
        return;
      }
      let ret = new game.geo.rec(x, y, r-x, d-y);
      this.frames.push(ret);
      return ret;
    }
    /**
     * Convenience function to clear all frame divisions from the list
     */
    clear() { this.frames.clear(); }

    /**
     * Automatically generate frame rectangles for the image
     * starting at the top left corner of (x, y).
     * Each frame has a width and height of (w, h).
     * If either or both are -1, they default to full source image bounds.
     * dx and dy are the gaps between columns and rows, respectively.
     * @param {number} x Starting x position
     * @param {number} y Starting y position
     * @param {number} w Frame width
     * @param {number} h Frame height
     * @param {number} dx Gap width
     * @param {number} dy Gap height
     */
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

    /**
     * Automatically generate frame rectangles for the image
     * starting at the top left corner of (x, y).
     * The image is divided into [hSlices] columns and
     * [vSlices] rows based on its dimensions.
     * dx and dy are the gaps between columns and rows, respectively.
     * @param {number} x Starting x position
     * @param {number} y Starting y position
     * @param {number} hSlices Column divisions
     * @param {number} vSlices Row divisions
     * @param {number} dx Gap width
     * @param {number} dy Gap height
     */
    autoSlice(x, y, hSlices, vSlices, dx, dy) {
      return this.slice(x, y, (this.w-x)/hSlices - dx, (this.h-y)/vSlices - dy, dx, dy);
    }

    /**
     * Returns the frame index of the provided clock time,
     * accounting for animation style.
     * @param {number} clock 
     * @returns {number}
     */
    index(clock) {
      if (this.frames.length < 1) return -1;
      let frame = Math.floor(this.frameRate * clock);
      switch (this.animStyle) {
        case "loop": return frame % this.frames.length;
        case "single": return Math.min(frame, this.frames.length -1);
        case "pingpong": return game.util.pingpong(frame, 0, this.frames.length -1);
        default: return 0;
      }
    }

    /**
     * Override of static "blit" to take a clock argument
     * and draw the corresponding frame.
     * @param {CanvasRenderingContext2D} c 
     * @param {number} x 
     * @param {number} y 
     * @param {number} clock Time into the animation in seconds
     */
    blit(c, x, y, clock = 0) {
      let frame = this.index(clock);
      if (frame < 0)
        c.drawImage(this.value, x, y);
      else {
        frame = this.frames[frame];
        c.drawImage(this.value, frame.x, frame.y, frame.w, frame.h, x, y, frame.w, frame.h);
      }
    }

    /**
     * Automatically generate frame rectangles for the image
     * starting at the top left corner of (x, y).
     * The image is divided into [hSlices] columns and
     * [vSlices] rows based on its dimensions.
     * dx and dy are the gaps between columns and rows, respectively.
     * @param {number} x Starting x position
     * @param {number} y Starting y position
     * @param {number} hSlices Column divisions
     * @param {number} vSlices Row divisions
     * @param {number} dx Gap width
     * @param {number} dy Gap height
     */
    static getOrLoad(id, src, frameRate = 30, animStyle = "loop", x = 0, y = 0, w = -1, h = -1, gapX = 0, gapY = 0) {
      return game.asset.assets[id] ?? (game.asset.assets[id] = new AssetImageAnimated(src, frameRate, animStyle, x, y, w, h, gapX, gapY));
    }
    /**
     * Automatically generate frame rectangles for the image
     * starting at the top left corner of (x, y).
     * The image is divided into [hSlices] columns and
     * [vSlices] rows based on its dimensions.
     * dx and dy are the gaps between columns and rows, respectively.
     * @param {number} x Starting x position
     * @param {number} y Starting y position
     * @param {number} hSlices Column divisions
     * @param {number} vSlices Row divisions
     * @param {number} dx Gap width
     * @param {number} dy Gap height
     */
    static getOrLoadAutoSliced(id, src, frameRate = 30, animStyle = "loop", x = 0, y = 0, hSlices = -1, vSlices = -1, gapX = 0, gapY = 0) {
      return game.asset.assets[id] ?? (game.asset.assets[id] = AssetImageAnimated.createAutoSliced(src, frameRate, animStyle, x, y, hSlices, vSlices, gapX, gapY));
    }
  }
});