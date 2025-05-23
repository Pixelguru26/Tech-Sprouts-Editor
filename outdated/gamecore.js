
gameData.build = () => {
  game = {};
  for (let lib of gameData.libs) {
    lib();
  }
}

gameData.libs.push(
  () => {
    game.keystates = {};
    game.entities = [];
    game.entityque = [];
    game.bullets = [];
    game.bulletque = [];

    game.state = null;
    game.gameStates = {};
    /** @type{HTMLElement} */
    game.uielement = null;
    game.setState = function (targetState) {
      if (game.gameStates[targetState]) {
        let tgt = game.gameStates[targetState];
        let old = game.state;
        if (tgt === old) return;
        jslib.usrgame?.exitState?.(old.name);
        old?.exit(targetState);
        game.state = tgt;
        if (!tgt.initialized) {
          tgt.load();
          try {
            jslib.usrgame?.loadState?.(targetState);
          } catch (e) {
            print(e);
            game.running = false;
            return;
          }
        }
        tgt.enter();
        try {
          jslib.usrgame?.enterState?.(targetState);
        } catch (e) {
          print(e);
          game.running = false;
          return;
        }
      }
    }
    game.gameState = class GameState {
      constructor(name) {
        this.name = name;
        this.initialized = false;
        this.uiElements = [];
      }

      load() {
        this.initialized = true;
      }

      enter() {
        this.uiElements.forEach(element => {
          game.uielement.appendChild(element);
        });
      }
      exit(targetState) {
        // Clears old ui entirely
        game.uielement.textContent = '';
      }

      update(dt) {
        // Abstract
      }
      draw(canv) {
        // Abstract
      }

      keydown(key) {
        // Abstract
      }
      keyup(key) {
        // Abstract
      }
      mousedown(b, x, y) {
        // Abstract
      }
      mouseup(b, x, y) {
        // Abstract
      }
      scroll(x, y, dx, dy) {
        // Abstract
      }

      addElement(elmt = "div", properties = {}, css = {}) {
        if (elmt instanceof Element) {
          setProps(elmt, properties, css);
        } else if (elmt instanceof game.ui.element) {
          elmt = setProps(elmt.element, properties, css);
        } else {
          elmt = newElement(elmt, properties, css);
        }
        this.uiElements.push(elmt);
        return elmt;
      }

      reset() {
        // Abstract
      }
    }

    game.Asset = class Asset {
      static assets = {};
      constructor(default_value) {
        this.loadfunctions = [];
        this.loaded = false;
        this.value = default_value;
      }
      async load() {
        // Abstract method
      }

      onLoad() {
        let fns = this.loadfunctions;
        for (let i = 0; i < fns.length; i++) {
          fns[i](this);
        }
        this.loadfunctions = null;
      }

      addCallback(fn) {
        if (!this.loaded)
          if (!this.loadfunctions.includes(fn))
            this.loadfunctions.push(fn);
      }

      static que = [];
      // Loads all queued assets
      static async flush() {
        let a = game.Asset.que;
        let len = a.length;
        for (let i = 0; i < len; i++) {
          await a[i].load();
          a[i] = null;
        }
        a.length = 0;
        return len;
      }
      // Adds an asset to the queue
      static push(v) {
        if (!game.Asset.que.includes(v))
          game.Asset.que.push(v);
        return v;
      }
      // Removes the oldest asset from the queue
      static pop() {
        let a = game.Asset.que;
        if (a.length > 0) {
          return a.shift();
        }
        return null;
      }
    }
    game.Asset.AssetImage = class AssetImage extends game.Asset {
      constructor(src) {
        super(game.Asset.AssetImage.default);
        this.src = src;
        game.Asset.que.push(this);
      }
      async load() {
        let internal = this;
        await jslib.loadimg(this.src).then(
          (value) => {
            internal.value = value;
            internal.loaded = true;
            internal.promise = null;
            internal.onLoad();
          }
        );
      }
      blit(c, x, y) {
        c.drawImage(this.value, x, y);
      }
      get w() {
        return this.value.naturalWidth;
      }
      get h() {
        return this.value.naturalHeight;
      }
      getOrLoad(src) {
        return game.Asset.assets[src] ?? (game.Asset.assets[src] = new game.Asset.AssetImage(src));
      }
      radiusToScale(r) {
        return r * 2 / Math.max(this.w, this.h);
      }
    }
    game.Asset.AssetImageAnimated = class AssetImageAnimated extends game.Asset.AssetImage {
      static animStyles = [
        "loop", "single", "pingpong", "still", "dynamic"
      ];

      constructor(src, framerate = 30, animStyle = "loop", x = 0, y = 0, w = -1, h = -1, spacex = 0, spacey = 0) {
        super(src);
        this.framerate = framerate;
        this.animStyle = animStyle;
        this.frames = [];
        this.cutx = x;
        this.cuty = y;
        this.cutw = w;
        this.cuth = h;
        this.spacex = spacex;
        this.spacey = spacey;
        this.autoslicetype = 0;
      }

      static genAutoSlicedAlt(src, properties) {
        return AssetImageAnimated.genAutosliced(
          src,
          properties.framerate ?? 30,
          properties.x ?? properties.bounds?.x ?? 0,
          properties.y ?? properties.bounds?.y ?? 0,
          properties.slicex ?? properties.slice ?? 1,
          properties.slicey ?? properties.slice ?? 1,
          properties.spacex ?? properties.space ?? properties.margin ?? 0,
          properties.spacey ?? properties.space ?? properties.margin ?? 0
        );
      }

      static genAutosliced(src, framerate = 30, animStyle = "loop", x = 0, y = 0, slicex = 1, slicey = 1, spacex = 0, spacey = 0) {
        let ret = new game.Asset.AssetImageAnimated(src, framerate, animStyle, x, y, slicex, slicey, spacex, spacey);
        ret.autoslicetype = 1;
        return ret;
      }

      // Dimensions of an animated image are determined by the largest frames
      // in either direction independently.
      get w() {
        if (this.frames.length < 1) {
          return super.w;
        }
        let ret = 0;
        for (let i = 0; i < this.frames.length; i++) {
          ret = Math.max(ret, this.frames[i].w);
        }
        return ret;
      }
      get h() {
        if (this.frames.length < 1) {
          return super.h;
        }
        let ret = 0;
        for (let i = 0; i < this.frames.length; i++) {
          ret = Math.max(ret, this.frames[i].h);
        }
        return ret;
      }

      get duration() {
        return (1 / this.framerate) * this.frames.length;
      }

      onLoad() {
        switch (this.autoslicetype) {
          case 0:
            this.slice(this.cutx, this.cuty, this.cutw, this.cuth, this.spacex, this.spacey);
            break;
          case 1:
            this.slice(this.cutx, this.cuty, this.w / this.cutw, this.h / this.cuth, this.spacex, this.spacey);
            break;
        }
        super.onLoad();
      }

      // Adds a single frame to the registry of this animated image.
      // Each frame is a rectangle of pixels defining a piece of the source image
      // to display at the appropriate time.
      addFrame(x, y, w, h) {
        let r = x + w;
        let d = y + h;
        r = Math.min(r, super.w);
        d = Math.min(d, super.h);
        x = Math.max(x, 0);
        y = Math.max(y, 0);
        if (r <= x || d <= y) {
          console.log("Null frame warning");
          return;
        }
        let ret = new game.geo.rec(x, y, r - x, d - y);
        this.frames.push(ret);
        return ret;
      }

      // Convenience function to clear all frame boundaries from the registry.
      clear() {
        this.frames.clear();
      }

      // Automatically generate frame rectangles for the image
      // starting at the offset of (x, y).
      // Each frame has a width and height of (w, h)
      // If either or both are -1, sets them to full source image bounds,
      // which is kind of useless.
      // dx and dy are the gaps between columns and rows, respectively.
      slice(x, y, w, h, dx, dy) {
        w = w < 0 ? super.w : w;
        h = h < 0 ? super.h : h;
        let cx = x;
        let cy = y;
        while (cy < super.h) {
          while (cx < super.w) {
            this.addFrame(cx, cy, w, h);
            cx += w + dx;
          }
          cx = x;
          cy += h + dy;
        }
      }

      // Automatically generate frame rectangles for the image
      // starting at the offset of (x, y).
      // slicex and slicey determine how many frames
      // to cut the image into in each direction.
      // dx and dy are the gaps between columns and rows, respectively.
      autoslice(x, y, slicex, slicey, dx, dy) {
        return this.slice(x ?? 0, y ?? 0, (this.w - x) / slicex - dx, (this.h - y) / slicey - dy, dx, dy);
      }

      getFrameIndex(clock) {
        if (this.frames.length < 1) return -1;
        let frame = Math.floor(this.framerate * clock);
        switch (this.animStyle) {
          case "loop":
            return frame % (this.frames.length);
          case "single":
            return Math.min(frame, this.frames.length - 1);
          case "pingpong":
            return game.util.pingpong(frame, 0, this.frames.length - 1);
          default: // Unless overridden, "dynamic" defaults to the same behavior as "still"
            return 0;
        }
      }

      blit(c, x, y, clock = 0) {
        let frame = this.getFrameIndex(clock);
        if (frame < 0) {
          c.drawImage(this.value, x, y)
        } else {
          frame = this.frames[frame];
          c.drawImage(this.value, frame.x, frame.y, frame.w, frame.h, x, y, frame.w, frame.h);
        }
      }

      getOrLoad(src, framerate = 30, animStyle = "loop", x = 0, y = 0, w = -1, h = -1, spacex = 0, spacey = 0) {
        return game.Asset.assets[src] ?? (game.Asset.assets[src] = new game.Asset.AssetImageAnimated(src, framerate, animStyle, x, y, w, h, spacex, spacey));
      }

      getOrLoadAutosliced(src, framerate = 30, animStyle = "loop", x = 0, y = 0, slicex = -1, slicey = -1, spacex = 0, spacey = 0) {
        return game.Asset.assets[src] ?? (game.Asset.assets[src] = game.Asset.AssetImageAnimated.genAutosliced(src, framerate, animStyle, x, y, slicex, slicey, spacex, spacey));
      }
    }

    game.timer = class Timer {
      static timers = {};
      static __OPENIDS = [];
      static __IDLAST = -1;

      constructor(interval = 1, fn = null) {
        this.alive = false;

        this.interval = interval
        this.internal_clock = 0;
        this.internal_last = 0;
        this.running = false;
        this.function = fn;
        this.repeats = true;
        this.sustain_mode = false;
        this.internal_sustained = false;
        this.resultque = [];
        this.keepResults = false;
        this.callWhenStopped = false;
      }

      poll_results(count = 1) {
        return this.resultque.length >= count;
      }

      pop_result() {
        return this.resultque.shift();
      }

      push_result(time, lag, ...values) {
        this.resultque.push([time, lag, ...values])
        return values;
      }

      internal_function(time, lag) {
        let ret = this.function?.(this, time, lag);
        if (this.keepResults)
          this.push_result(time, lag, ret);
        return ret;
      }

      static update(dt) {
        for (const key in this.timers) {
          if (Object.prototype.hasOwnProperty.call(this.timers, key)) {
            const element = this.timers[key];
            if (element != null) {
              element.update(dt);
            }
          }
        }
      }

      update(dt) {
        if (this.sustain_mode) {
          if (this.internal_sustained) {
            this.internal_sustained = false;
          } else {
            this.sustain_mode = false;
            let res;
            if (this.keepResults) {
              return this.push_result(this.internal_clock + dt, 0, this.stop(this.callWhenStopped, this.internal_clock + dt, 0));
            } else {
              return this.stop(this.callWhenStopped, this.internal_clock + dt, 0);
            }
          }
        }
        if (this.running) {
          this.internal_clock += dt;
          while (this.internal_clock - this.internal_last >= this.interval) {
            this.internal_last += this.interval;
            let lag = this.internal_clock - this.internal_last;
            this.internal_function(this.internal_last, lag);
            if (!this.repeats) {
              if (this.keepResults) {
                return this.push_result(this.internal_clock + dt, 0, this.stop(this.callWhenStopped, this.internal_clock + dt, 0));
              } else {
                return this.stop(this.callWhenStopped, this.internal_clock + dt, 0);
              }
            }
          }
        }
      }

      stop(call = false, time = 0, lag = 0) {
        let ret = null;
        if (this.running) {
          if (call) {
            ret = this.internal_function(time, lag);
          }
          game.timer.timers[this.id] = null;
          game.timer.__OPENIDS.push(this.id);
          this.id = null;
        }
        this.running = false;
        return ret;
      }

      // Starts the timer and resets the clock to 0
      start(call = false, time = 0, lag = 0) {
        this.reset();
        return this.resume(call, time, lag);
      }

      resume(call = false, time = 0, lag = 0) {
        this.id = game.timer.__OPENIDS.shift() ?? (++game.timer.__IDLAST);
        game.timer.timers[this.id] = this;
        this.running = true;
        if (call) {
          return this.internal_function(time, lag);
        }
      }

      reset() {
        this.internal_clock = 0;
        this.internal_last = 0;
        this.sustain_mode = false;
        this.internal_sustained = false;
      }

      // Designed for frame-by-frame timers which reset as soon as they are not sustained.
      // Call this every frame to sustain the timer, which will act normally during that time.
      // When sustain is not called in this mode, the timer will automatically stop.
      // When a timer starts/restarts in sustain mode, it is automatically reset.
      sustain(call = false, time = 0, lag = 0) {
        let ret = null;
        if (!this.sustain_mode) {
          if (!this.running)
            ret = this.start(call, time, lag);
          this.sustain_mode = true;
        }
        this.internal_sustained = true;
        return ret;
      }
      static randomTimer = class RandomTimer extends Timer {
        constructor(intervalMin = 0, intervalMax = 1, fn = null) {
          super(Math.random() * (intervalMax - intervalMin) + intervalMin, fn);
          this.intervalMin = intervalMin;
          this.intervalMax = intervalMax;
        }

        internal_function(time, lag) {
          this.interval = Math.random() * (this.intervalMax - this.intervalMin) + this.intervalMin;
          return super.internal_function(time, lag);
        }

        reset() {
          this.interval = Math.random() * (this.intervalMax - this.intervalMin) + this.intervalMin;
          return super.reset();
        }
      }
    }

    game.graphics = class {
      static init(canvasContext) {
        game.graphics.canvas = canvasContext;
        game.graphics.transformDepth = 0;
      }

      static rotate(r, cx = 0, cy = 0) {
        r = (r / 180) * Math.PI;
        if (cx != 0 || cy != 0) {
          game.graphics.canvas.translate(cx, cy);
          game.graphics.canvas.rotate(r);
          game.graphics.canvas.translate(-cx, -cy);
        } else {
          game.graphics.canvas.rotate(r);
        }
      }

      static translate(dx, dy) {
        game.graphics.canvas.translate(dx, dy);
      }

      static scale(sx, sy) {
        game.graphics.canvas.scale(sx, sy);
      }

      static push() {
        game.graphics.canvas.save();
        game.graphics.transformDepth++;
      }

      static transform(scalex = 1, skewvert = 0, skewhoriz = 0, scaley = 1, dx = 0, dy = 0) {
        game.graphics.canvas.transform(scalex, skewvert, skewhoriz, scaley, dx, dy);
      }

      static pop() {
        if (game.graphics.transformDepth > 0) {
          let ret = game.graphics.canvas.getTransform();
          game.graphics.canvas.restore();
          return ret;
        }
        return null;
      }

      static blit(img, x, y, buffer = null) {
        if (img instanceof game.Asset) {
          if (img instanceof game.Asset.AssetImageAnimated) {
            img.blit(game.graphics.canvas, y, buffer, x); // arguments are different
          } else {
            img.blit(game.graphics.canvas, x, y);
          }
        } else {
          game.graphics.canvas.drawImage(img, x, y);
        }
      }

      // WARNING: Pushes directly to the drawing transform stack.
      // All subsequent operations will be affected until `game.graphics.pop()` is called.
      static transformDraw(x, y, r = 0, sx = 1, sy = null) {
        sy ??= sx;
        game.graphics.push();
        game.graphics.translate(x, y);
        if (r != 0) game.graphics.rotate(r);
        if (sx != 1 || sy != 1) game.graphics.scale(sx, sy);
      }
      // WARNING: Pushes directly to the drawing transform stack.
      // All subsequent operations will be affected until `game.graphics.pop()` is called.
      static transformDrawCentered(img, x, y, r = 0, sx = 1, sy = null) {
        sy ??= sx;
        let w = 0;
        let h = 0;
        if (img instanceof game.Asset.AssetImage) {
          w = img.w;
          h = img.h;
        } else {
          w = img.naturalWidth;
          h = img.naturalHeight;
        }
        game.graphics.transformDraw(x, y, r, sx, sy);
        game.graphics.translate(-w / 2, -h / 2);
      }

      /**
       * @overload
       * @param {*} img 
       * @param {*} x 
       * @param {*} y 
       * @param {*} r 
       * @param {*} sx 
       * @param {*} sy 
       */

      /**
       * @overload
       * @param {*} img
       * @param {number} clock
       * @param {number} x
       * @param {number} y
       * @param {number} r
       * @param {number} sx
       * @param {number} sy
       */
      static draw(img, x, y, r = 0, sx = 1, sy = null, buffer = null) {
        if (img instanceof game.Asset.AssetImageAnimated) {
          let clock = x;
          x = y;
          y = r;
          r = sx;
          sx = sy;
          sy = buffer;
          game.graphics.transformDraw(x, y, r, sx, sy);
          img.blit(game.graphics.canvas, 0, 0, clock);
        } else {
          game.graphics.transformDraw(x, y, r, sx, sy);
          game.graphics.blit(img, 0, 0);
        }
        game.graphics.pop();
      }

      /**
       * @overload
       * @param {*} img 
       * @param {*} x 
       * @param {*} y 
       * @param {*} r 
       * @param {*} sx 
       * @param {*} sy 
       */

      /**
       * @overload
       * @param {*} img
       * @param {number} clock
       * @param {number} x
       * @param {number} y
       * @param {number} r
       * @param {number} sx
       * @param {number} sy
       */
      static draw_centered(img, x, y, r = 0, sx = 1, sy = null, buffer = null) {
        if (img instanceof game.Asset.AssetImageAnimated) {
          let clock = x;
          x = y;
          y = r;
          r = sx;
          sx = sy;
          sy = buffer;
          game.graphics.transformDrawCentered(img, x, y, r, sx, sy);
          img.blit(game.graphics.canvas, 0, 0, clock);
        } else {
          game.graphics.transformDrawCentered(img, x, y, r, sx, sy);
          game.graphics.blit(img, 0, 0);
        }
        game.graphics.pop();
      }
    }

    { // Geometry
      let g;

      game.geo = class G {
        // ==========================================
        // Utilities
        // ==========================================

        // Returns the Euclidean distance between a pair of two-dimensional points, (ax, ay) and (bx, by).
        static dist(ax, ay, bx, by) {
          return Math.sqrt((bx - ax) * (bx - ax) + (by - ay) * (by - ay));
        }

        // Returns the dot product of the vectors (ax, ay) and (bx, by).
        static dot(ax, ay, bx, by) {
          return ax * bx + ay * by;
        }

        // Projects point (ax, ay) onto vector (bx, by).
        // Returns result as [x, y]
        static project(ax, ay, bx, by) {
          let dotprod = (ax * bx + ay * by) / (bx * bx + by * by);
          return [dotprod * bx, dotprod * by];
        }

        // Returns a tuple of (x, y) representing the point v interpolated along the line.
        // Convenience function for [lerp(v, x1, x2), lerp(v, y1, y1)]
        static lineLerp(v, ax, ay, bx, by) {
          return [
            v * (bx - ax) + ax,
            v * (by - ay) + ay
          ];
        }

        // Inverse of lineLerp.
        // This technically just returns the normalized dot product of the point (vx,vy) onto the line.
        // To get the actual projection, you would use result*(p2-p1)+p1
        // where p1 = (x1,y1) and p2 = (x2,y2)
        // @untested
        static lineDelerp(vx, vy, x1, y1, x2, y2) {
          let dx = x2 - x1;
          let dy = y2 - y1;
          return ((vx - x1) * dx + (vy - v1) * dy) / (dx * dx + dy * dy);
        }

        // Returns the so-called "2-dimensional cross product" of (x1,y1) and (x2,y2)
        // This can be thought of as the area of a parallelogram formed from these vectors.
        // Unlike area, however, this result is signed.
        // When (x2,y2) is on the "right" side of (x1,y1), the area is positive.
        // When (x2,y2) is on the "left" side of (x1,y1), the area is negative.
        // When (x2,y2) lies along (x1,y1), the area is 0.
        static cross(x1, y1, x2, y2) {
          return x1 * y2 - y1 * x2;
        }

        // Rotates the point (x, y) 90 degrees clockwise about the origin (ox, oy)
        static rotate90(ox, oy, x, y) {
          return [
            ox - (y - oy),
            oy + (x - ox)
          ]
        }

        // Checks if a point is within the bounds of the provided parallelogram.
        // The parallelogram must have one point on the origin,
        // and be defined by two vectors corresponding to A->B and A->D
        // @untested
        static intersectPointParallelogram(px, py, ax, ay, bx, by) {
          // Orthogonal vectors a' and b'
          let apx = -ay;
          let apy = ax;
          let bpx = -by;
          let bpy = by;

          // Oriented vectors a" and b" ((a) (d)ouble (p)rime)
          let adpsign = game.util.sign(game.geo.dot(apx, apy, bx, by));
          let adpx = adpsign * apx;
          let adpy = adpsign * apy;
          adpsign = game.util.sign(game.geo.dot(ax, ay, bpx, bpy));
          bdpx = bdpsign * bpx;
          bdpy = bdpsign * bpy;
          // Boundary check
          let check = game.geo.dot(adpx, adpy, px, py);
          let bound = game.geo.dot(adpx, adpy, bx, by);
          if (!(0 <= check && check <= bound)) return False;
          check = game.geo.dot(bdpx, bdpy, px, py);
          bound = game.geo.dot(ax, bx, bdpx, bdpy);
          return (0 <= check && check <= bound);
        }

        // Returns the vector (x, y) scaled to a length of 1.
        static normalize(x, y) {
          let l = Math.sqrt(x * x + y * y);
          return [x / l, y / l];
        }

        // ==========================================
        // Point inclusion checks
        // ==========================================

        static pointInAABB(x, y, ax, ay, aw, ah) {
          return (x >= ax) && (x <= ax + aw) && (y >= ay) && (y <= ay + ah);
        }

        static pointInCircle(x, y, ax, ay, ar) {
          return g.dist(x, y, ax, ay) <= ar;
        }

        // ==========================================
        // Intersection tests (boolean)
        // ==========================================

        // Tests two circles defined by center coordinates and radius for intersection.
        static intersectCircle(ax, ay, ar, bx, by, br) {
          return (Math.sqrt((bx - ax) * (bx - ax) + (by - ay) * (by - ay)) <= (ar + br));
        }

        // Tests two axis aligned rectangles for intersection.
        static intersectAABBs(ax, ay, aw, ah, bx, by, bw, bh) {
          return ((bx <= (ax + aw)) && ((bx + bw) >= ax) && (by <= (ay + ah)) && ((by + bh) >= ay));
        }

        // Tests the bounding boxes of two provided shapes for intersection.
        static intersectBroadphase(shape1, shape2) {
          let [ax, ay, aw, ah] = shape1.bounds;
          let [bx, by, bw, bh] = shape2.bounds;
          return this.intersectAABBs(ax, ay, aw, ah, bx, by, bw, bh);
        }

        static intersectionTests = {};

        static setIntersectionTest(shape1, shape2, test) {
          let a = shape1.shape;
          let b = shape2.shape;
          let tests = this.intersectionTests;
          tests[a] ??= {};
          tests[b] ??= {};
          tests[a][b] = [test, false];
          tests[b][a] = [test, true];
          return test;
        }

        static intersect(shape1, shape2) {
          if (!g.intersectBroadphase(shape1, shape2)) return false;
          if (!g.intersectionTests[shape1.constructor.shape]) {
            return false
          }
          let [test, invert] = g.intersectionTests[shape1.constructor.shape][shape2.constructor.shape];
          if (invert) {
            return test(shape2, shape1);
          }
          return test(shape1, shape2);
        }

        static vec = class Vec extends Victor {
          intersect(other) {
            switch (other.shape) {
              case "lineseg":
                return other.includesPoint(this.x, this.y);
              case "circle":
                return game.geo.dist(this.x, this.y, other.x, other.y) <= other.r;
              case "rec":
                return (this.x >= other.x) && (this.x <= other.x + other.w) && (this.y >= other.y) && (this.y <= other.y + other.h);
              default:
                return false;
            }
          }
        }


      };
      g = game.geo;

      g.shape = class Shape {
        static shape = "none";
        constructor() {
          // Abstract
        }

        get bounds() {
          return [this.x, this.y, this.w, this.h];
        }

        get cx() { return this.x + this.w / 2; }
        get cy() { return this.y + this.h / 2; }

        set cx(x) {
          this.x = x - this.w / 2;
        }
        set cy(y) {
          this.y = y - this.h / 2;
        }

        includesPoint(x, y) {
          let [tx, ty, tw, th] = this.bounds;
          return (x >= tx) && (x <= tx + tw) && (y >= ty) && (y <= ty + th);
        }

        intersects(other) {
          return g.intersect(this, other);
        }
      };

      // Respects geo.shape interface
      g.lineseg = class Lineseg extends g.shape {
        static shape = "lineseg";
        constructor(ax, ay, bx, by) {
          super()
          this.ax = ax;
          this.ay = ay;
          this.bx = bx;
          this.by = by;
        }

        get a() { return new Victor(this.ax, this.ay); }
        set a(value) {
          this.ax = value.x;
          this.ay = value.y;
        }
        get b() { return new Victor(this.bx, this.by); }
        set b(value) {
          this.bx = value.x;
          this.by = value.y;
        }

        get cx() { return (this.ax + this.bx) / 2; }
        get cy() { return (this.ay + this.by) / 2; }
        set cx(x) {
          let cx = this.cx;
          let dax = this.ax - cx;
          let dbx = this.bx - cx;
          this.ax = x + dax;
          this.bx = x + dbx;
        }
        set cy(y) {
          let cy = this.cy;
          let day = this.ay - cy;
          let dby = this.by - cy;
          this.ay = y + day;
          this.by = y + dby;
        }

        get length() {
          return g.dist(this.ax, this.ay, this.bx, this.by);
        }
        // Setting the length moves point (bx, by) to match the provided distance.
        set length(value) {
          let len = g.dist(this.ax, this.ay, this.bx, this.by);
          this.bx = (this.bx - this.ax) / len * value;
          this.by = (this.by - this.ay) / len * value;
        }

        get dx() { return this.bx - this.ax; }
        set dx(value) {
          this.bx = this.ax + value;
        }
        get dy() { return this.by - this.ay; }
        set dy(value) {
          this.by = this.ay + value;
        }

        get d() {
          return new Victor(
            this.bx - this.ax,
            this.by - this.ay
          );
        }
        set d(value) {
          this.dx = value.x;
          this.dy = value.y;
        }

        get minx() {
          return this.bx < this.ax ? this.bx : this.ax;
        }
        set minx(value) {
          if (this.bx < this.ax)
            this.bx = value;
          this.ax = value;
        }
        get miny() {
          return this.by < this.ay ? this.by : this.ay;
        }
        set miny(value) {
          if (this.by < this.ay)
            this.by = value;
          this.ay = value;
        }

        get maxx() {
          return this.bx < this.ax ? this.ax : this.bx;
        }
        set maxx(value) {
          if (this.bx < this.ax)
            this.ax = value;
          this.bx = value;
        }
        get maxy() {
          return this.by < this.ay ? this.ay : this.by;
        }
        set maxy(value) {
          if (this.by < this.ay)
            this.ay = value;
          this.by = value;
        }

        // Setting the center position translates the line segment to the new position
        get cx() { return (this.ax + this.bx) / 2; }
        set cx(value) {
          let cx = (this.ax + this.bx) / 2;
          this.ax = this.ax - cx + value;
          this.bx = this.bx - cx + value;
        }
        get cy() { return (this.ay + this.by) / 2; }
        set cy(value) {
          let cy = (this.ay + this.by) / 2;
          this.ay = this.ay - cy + value;
          this.by = this.by - cy + value;
        }

        get c() {
          return new Victor(
            (this.ax + this.bx) / 2,
            (this.ay + this.by) / 2
          );
        }
        set c(value) {
          this.cx = value.x;
          this.cy = value.y;
        }

        // Multiplies the distance between the endpoints and the center of the line.
        // To set length from the center, use lineseg.scaleFromCenter(newlength/lineseg.length)
        // @untested
        scaleFromCenter(scalar) {
          let cx = (this.ax + this.bx) / 2;
          let cy = (this.ay + this.by) / 2;
          this.ax = (this.ax - cx) * scalar + cx;
          this.ay = (this.ay - cy) * scalar + cy;
          this.bx = (this.bx - cx) * scalar + cx;
          this.by = (this.by - cy) * scalar + cy;
        }

        // Returns the y value of the provided line at the x coordinate xtest.
        // Does not check if xtest is within line boundaries.
        // If the line is vertical, returns NaN.
        // @untested
        xtoy(xtest) {
          // Trivial cases
          if (this.ax == this.bx) return NaN;
          if (this.ay == this.by) return this.ay;
          // Reinterpolation
          return (xtest - this.ax) / (this.bx - this.ax) * (this.by - this.ay) + this.ay;
        }

        // Returns the x value of the provided line at the y coordinate ytest.
        // Does not check if ytest is within line boundaries.
        // If the line is horizontal, returns NaN.
        // @untested
        ytox(ytest) {
          // Trivial cases
          if (this.ax == this.bx) return this.ax;
          if (this.ay == this.by) return NaN;
          // Reinterpolation
          return (ytest - this.ay) / (this.by - this.ay) * (this.bx - this.ax) + this.ax;
        }

        // Returns a tuple of (x, y) representing the point v interpolated along this line.
        // Convenience function for [lerp(v, x1, x2), lerp(v, y1, y1)]
        // @untested
        lerp(v) {
          return [
            v * (this.bx - this.ax) + this.ax,
            v * (this.by - this.ay) + this.ay
          ];
        }

        // Inverse of lerp.
        // This technically just returns the normalized dot product of the point (x,y) onto the line.
        // To get the actual projection, you would use result*(p2-p1)+p1
        // where p1 = (ax,ay) and p2 = (bx,by)
        // @untested
        delerp(x, y) {
          let dx = this.bx - this.ax;
          let dy = this.by - this.ay;
          return ((x - this.ax) * dx + (y - this.ay) * dy) / (dx * dx + dy * dy);
        }

        // Returns the slope of this line as dy/dx.
        // If the line is vertical, returns NaN.
        get slope() {
          if (this.ax == this.bx) return NaN;
          return (this.by - this.ay) / (this.bx - this.ax);
        }

        // @untested
        setByCenter(dax, day, dbx, dby, ox = null, oy = null) {
          ox ??= (this.ax + this.bx) / 2;
          oy ??= (this.ay + this.by) / 2;
          this.ax = ox + dax;
          this.ay = oy + day;
          this.bx = ox + dbx;
          this.by = ox + dby;
        }

        // Rotates both points of this line segment 90 degrees clockwise
        // about the provided center coordinates.
        // If a center point is not provided, rotates about the center of the line.
        // @untested
        rotate90(ox = null, oy = null) {
          ox ??= (this.ax + this.bx) / 2;
          oy ??= (this.ay + this.by) / 2;
          let dax = this.ax - ox;
          let day = this.ay - oy;
          let dbx = this.bx - ox;
          let dby = this.by - oy;
          this.ax = ox - (day - oy);
          this.ay = oy + (dax - ox);
          this.bx = ox - (dby - oy);
          this.by = oy + (dbx - ox);
        }

        // @untested
        quicknormal() {
          return [this.ay - this.by, this.bx - this.ax];
        }
        // @untested
        normal() {
          return g.normalize(this.ay - this.by, this.bx - this.ax);
        }

        // @untested
        intersectTU(other) {
          // Credit: https://stackoverflow.com/a/565282
          let thisa = this.a;
          let thisb = this.b;
          let othera = other.a;
          let otherb = other.b;

          let thisdelta = thisb - thisa;
          let otherdelta = otherb - othera;

          let deltao = otherb - thisa;
          let rxs = thisdelta.cross(otherdelta);
          if (rxs == 0) {
            // Collinear, may or may not intersect
            if (deltao.cross(thisdelta) == 0) return [NaN, NaN];
            // Parallel, non-intersecting
            return [Infinity, Infinity];
          }
          // Lines intersect, bounds still need to be checked.
          return [
            deltao.cross(otherdelta) / rxs,
            deltao.cross(thisdelta) / rxs
          ];
        }

        // Returns (x, y) indicating the point where the lines intersect.
        // If the lines do not intersect, returns (NaN, NaN)
        // @untested
        intersectionPointUnbounded(other) {
          let [t, u] = this.intersectTU(other);
          if (isFinite(t) && !isNaN(t))
            return this.lerp(t);
          return [NaN, NaN];
        }

        // Returns (a, x, y) where a is a boolean indicating whether the lines intersect at all
        // @untested
        intersectionPoint(other) {
          let [t, u] = this.intersectTU(other);
          // No intersection
          if (!isFinite(t) || isNaN(t)) return [false, t, u];
          // Intersection is out of bounds
          if (t < 0 || t > 1 || u < 0 || u > 1) return [false, NaN, NaN];
          // Intersection
          let [x, y] = this.lerp(t);
          return [true, x, y];
        }

        nearestPoint(x, y) {
          let [px, py] = g.project(x - this.ax, y - this.ay, this.bx - this.ax, this.by - this.ay);
          return [
            px + this.ax,
            py + this.ay
          ];
        }

        broadphaseAABB(x, y, w, h) {
          return g.broadphaseAABBAABB(this.minx, this.miny, Math.abs(this.dx), Math.abs(this.dy), x, y, w, h);
        }

        broadphaseLine(other) {
          return g.broadphaseAABBAABB(this.minx, this.miny, Math.abs(this.dx), Math.abs(this.dy), other.minx, other.miny, Math.abs(other.dx), Math.abs(other.dy));
        }

        broadphaseCircle(x, y, r) {
          return g.broadphaseAABBAABB(x - r, y - r, r * 2, r * 2, this.minx, this.miny, Math.abs(this.dx), Math.abs(this.dy));
        }

        includesPoint(x, y, range = 0.001) {
          let [px, py] = this.nearestPoint(x, y);
          return g.dist(x, y, px, py) <= range;
        }

        pointBehind(x, y) {
          return g.cross(this.dx, this.dy, x - this.ax, y - this.ay) <= 0;
        }

        intersectAABB(x, y, w, h) {
          if (!this.broadphaseAABB(x, y, w, h)) return false;
          if (g.pointInAABB(this.ax, this.ay, x, y, w, h)) return true;
          if (g.pointInAABB(this.bx, this.by, x, y, w, h)) return true;
          // Check each side for crossing in clockwise order from top left corner
          // Separated into individual statements for readability
          if (this.intersectLine(new lineseg(x, y, x + w, y))) return true;
          if (this.intersectLine(new lineseg(x + w, y, x + w, y + h))) return true;
          if (this.intersectLine(new lineseg(x + w, y + h, x, y + h))) return true;
          if (this.intersectLine(new lineseg(x, y + h, x, y))) return true;
          return false;
        }

        intersectCircle(x, y, r) {
          if (!this.broadphaseCircle(x, y, r)) return false;
          let dotprod = this.delerp(x, y);
          if (dotprod < 0 || dotprod > 1) {
            return g.dist(this.ax, this.ay, x, y) <= r || g.dist(this.bx, this.by, x, y) <= r;
          }
          let projx = dotprod * this.dx + this.ax;
          let projy = dotprod * this.dy + this.ay;
          return g.dist(x, y, projx, projy) <= r;
        }

        get bounds() {
          return [this.minx, this.miny, Math.abs(this.dx), Math.abs(this.dy)];
        }
      };

      g.circle = class Circle extends g.shape {
        static shape = "circle";
        constructor(x, y, r) {
          super()
          this.x = x;
          this.y = y;
          this.r = Math.abs(r);
        }

        get cx() { return this.x; }
        get cy() { return this.y; }
        set cx(x) { this.x = x; }
        set cy(y) { this.y = y; }

        get bounds() {
          return [this.x - this.r, this.y - this.r, this.r * 2, this.r * 2];
        }
      };

      g.rec = class Rec extends g.shape {
        static shape = "rec";
        constructor(x, y, w, h) {
          super()
          if (x instanceof g.lineseg) {
            this.x = x.minx;
            this.y = x.miny;
            this.w = Math.abs(x.dx);
            this.h = Math.abs(x.dy);
          } else if (x instanceof g.circle) {
            this.x = x.x - x.r;
            this.y = x.y - x.r;
            this.w = x.r * 2;
            this.h = x.r * 2;
          } else {
            this.x = x;
            this.y = y;

            if (w < 0) {
              this.x += w;
              this.w = -w;
            } else {
              this.w = w;
            }
            if (h < 0) {
              this.y += h;
              this.h = -h;
            } else {
              this.h = h;
            }
          }
        }

        get bounds() {
          return [this.x, this.y, this.w, this.h];
        }

        // Gets and sets the bottom right coordinates independently,
        // changing the dimensions of the rectangle to match.
        // If set to negative dimensions, renormalizes the rectangle,
        // which does change position as well as dimensions.
        get r() { return this.x + this.w; }
        get d() { return this.y + this.h; }
        set r(value) {
          if (value < this.x) {
            this.w = this.x - value;
            this.x = value;
          } else {
            this.w = value - this.x;
          }
        }
        set d(value) {
          if (value < this.y) {
            this.h = this.y - value;
            this.y = value;
          } else {
            this.h = value - this.y;
          }
        }

        // Flips the rectangle when necessary to ensure that dimensions are positive,
        // without moving or resizing it.
        normalize() {
          if (this.w < 0) {
            this.w = -this.w;
            this.x -= this.w;
          }
          if (this.h < 0) {
            this.h = -this.h;
            this.y -= this.h;
          }
        }

        /**
         * @overload
         * @param {Rec} ox Target rectangle object
         * @returns {boolean} True if intersecting
         *//**
       * @param {number} ox x position of target rectangle
       * @param {number} oy y position of target rectangle
       * @param {number} ow width of target rectangle
       * @param {number} oh height of target rectangle
       * @returns {boolean} True if intersecting
       */
        intersectAABB(ox, oy = null, ow = null, oh = null) {
          if (ox instanceof g.rec) {
            oy = ox.y;
            ow = ox.w;
            oh = ox.h;
            ox = ox.x;
          }

          return (this.x <= ox + ow) && (this.x + this.w >= ox) && (this.y <= oy + oh) && (this.y + this.h >= oy);
        }

        // Returns the overlapping area with another rectangle
        // as a new rectangle object, or null if they do not intersect.
        // @untested
        intersection(other) {
          if (!this.intersectAABB(other)) return null;
          let x = Math.max(this.x, other.x);
          let y = Math.max(this.y, other.y);
          let r = Math.min(this.r, other.r);
          let d = Math.min(this.d, other.d);
          return new g.rec(x, y, r - x, y - d);
        }

        // Returns the section of the given line segment
        // which intersects with this rectangle, or null if they do not intersect.
        // @untested
        clipLine(line) {
          let box = new g.rec(line.ax, line.ay, line.dx, line.dy);
          box = this.intersection(box);
          if (box == null) return null;
          if (line.dx > 0) {
            if (line.dy > 0) {
              return new g.lineseg(box.x, box.y, box.r, box.d);
            } else {
              return new g.lineseg(box.x, box.d, box.r, box.y);
            }
          } else {
            if (line.dy > 0) {
              return new g.lineseg(box.r, box.y, box.x, box.d);
            } else {
              return new g.lineseg(box.r, box.d, box.x, box.y);
            }
          }
        }
      };
      g.setIntersectionTest(g.lineseg, g.lineseg, (a, b) => {
        if (!a.broadphaseLine(b)) return false;
        let [t, u] = a.intersectTU(b);
        return isFinite(t) && !isNaN(t) && t >= 0 && t <= 1 && u >= 0 && u <= 1;
      });
      g.setIntersectionTest(g.lineseg, g.circle, (a, b) => {
        let dotprod = a.delerp(b.x, b.y);
        if (dotprod < 0 || dotprod > 1) {
          return g.dist(a.ax, a.ay, b.x, b.y) <= b.r || g.dist(a.bx, a.by, b.x, b.y) <= b.r;
        }
        let projx = dotprod * a.dx + a.ax;
        let projy = dotprod * a.dy + a.ay;
        return g.dist(b.x, b.y, projx, projy) <= b.r;
      });
      g.setIntersectionTest(g.lineseg, g.rec, (a, b) => {
        if (g.pointInAABB(a.ax, a.ay, b.x, b.y, b.w, b.h)) return true;
        if (g.pointInAABB(a.bx, a.by, b.x, b.y, b.w, b.h)) return true;
        // Check each side for crossing in clockwise order from top left corner
        // Separated into individual statements for readability
        if (a.intersectLine(new g.lineseg(b.x, b.y, b.x + b.w, b.y))) return true;
        if (a.intersectLine(new g.lineseg(b.x + b.w, b.y, b.x + b.w, b.y + b.h))) return true;
        if (a.intersectLine(new g.lineseg(b.x + b.w, b.y + b.h, b.x, b.y + b.h))) return true;
        if (a.intersectLine(new g.lineseg(b.x, b.y + b.h, b.x, b.y))) return true;
      });
      g.setIntersectionTest(g.rec, g.rec, (a, b) => {
        // This function only triggers if the broadphase is true, which in this case is the whole test.
        return true;
      });
      g.setIntersectionTest(g.rec, g.circle, (a, b) => {
        let ax = a.x;
        let ay = a.y;
        let aw = a.w;
        let ah = a.h;
        let bx = b.x;
        let by = b.y;
        let cr = b.r;
        if (g.pointInAABB(bx, by, ax, ay - cr, aw, ah + cr * 2)) return true;
        if (g.pointInAABB(bx, by, ax - cr, ay, aw + cr * 2, ah)) return true;
        if (bx < ax + aw / 2) { // Left side
          if (by < ay + ah / 2) { // Top left
            return g.pointInCircle(ax, ay, bx, by, cr);
          } else { // Bottom left
            return g.pointInCircle(ax, ay + ah, bx, by, cr);
          }
        } else { // Right side
          if (by < ay + ah / 2) { // Top right
            return g.pointInCircle(ax + aw, ay, bx, by, cr);
          } else { // Bottom right
            return g.pointInCircle(ax + aw, ay + ah, bx, by, cr);
          }
        }
      });
      g.setIntersectionTest(g.circle, g.circle, (a, b) => {
        return Math.sqrt((b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y)) <= (a.r + b.r);
      });
    }

    // ==========================================
    // Prototype game state
    // ==========================================

    game.gameStates["empty"] = new (class EmptyGameState extends game.gameState {
      load() {
        super.load();
      }

      enter() {
        super.enter();
        game.player.reset();
        game.time = 0;
        game.spawntimemin = 0.5;
        game.spawntimemax = 2;
        game.spawntimer = game.spawntimemax;
      }

      update(dt) {
        game.time += dt;
        game.timer.update(dt);

        // Entities and bullets must not be added to their respective
        // lists directly during traversal. This is a workaround to ensure
        // that they are added safely.
        for (let i = 0; i < game.entityque.length; i++) {
          game.entities.push(game.entityque[i]);
          game.entityque[i] = null;
        }
        game.entityque.length = 0;
        for (let i = 0; i < game.bulletque.length; i++) {
          game.bullets.push(game.bulletque[i]);
          game.bulletque[i] = null;
        }
        game.bulletque.length = 0; // Clear the bullet queue

        // Bullet update; collisions handled in entity phase
        for (let i = 0; i < game.bullets.length; i++) {
          game.bullets[i].update(dt);
        }

        // Entity update phase
        game.entities.forEach(entity => {
          entity.update(dt);
          if (!entity.alive) return; // Entity could potentially be deleted at any stage

          // Offscreen culling
          if (!entity.intersects(game.cullbox) && entity.age > 0) {
            entity.delete("outofbounds");
          }
          if (!entity.alive) return; // Entity could potentially be deleted at any stage

          // Bullet collisions
          game.bullets.forEach((bullet) => {
            if (bullet.intersects(entity)) {
              bullet.touch(entity);
            }
          });
          if (!entity.alive) return; // Entity could potentially be deleted at any stage

          // Entity-entity collisions
          game.entities.forEach(other => {
            if (entity == other) return;
            if (entity.intersects(other)) {
              entity.touch(other);
            }
          });
        });

        // Cull offscreen bullets
        // Final stage to ensure all possible contacts occur
        for (let i = 0; i < game.bullets.length; i++) {
          if (!game.bullets[i].intersects(game.cullbox)) {
            game.bullets[i].delete();
          }
        }

        // Remove dead entities
        // Iterating in reverse prevents concurrent traversal + modification issues
        for (let i = game.entities.length - 1; i > -1; i--) {
          if (!game.entities[i].alive) {
            game.entities.splice(i, 1);
          }
        }
        // Remove dead bullets
        for (let i = game.bullets.length - 1; i > -1; i--) {
          if (!game.bullets[i].alive) {
            game.bullets.splice(i, 1);
          }
        }
      }

      draw(c) {
        super.draw(c);
        for (let i = 0; i < game.bullets.length; i++) {
          game.bullets[i].draw(c);
        }
        for (let i = 0; i < game.entities.length; i++) {
          game.entities[i].draw(c);
        }
        game.graphics.canvas.resetTransform();
      }

      keydown(key) {
        game.bullets.forEach(ent => {
          ent.keydown?.(key);
        })
        game.entities.forEach(ent => {
          ent.keydown?.(key);
        });
      }
    });

    // ==========================================
    // Main game state
    // ==========================================

    // const display1 = new game.ui.circleDisplay(8, 100);

    game.gameStates["game"] = new (class extends game.gameState {
      load() {
        super.load();
        game.time = 0;
        game.testimg = new game.Asset.AssetImage("core//assets/image/player/player_red.png");
        game.player = new game.entity.player();
        game.player.sprite = new game.Asset.AssetImage("core//assets/image/player/player_red.png");
        game.Asset.assets["bullet_base"] = new game.Asset.AssetImage("core//assets/image/projectile/bullet_base.png");
        game.Asset.assets["bullet_rocket"] = new game.Asset.AssetImage("core//assets/image/projectile/bullet_rocket.png");
        game.Asset.assets["enemy_base"] = new game.Asset.AssetImage("core//assets/image/enemy/enemy_base.png");
        game.Asset.assets["splode"] = game.Asset.AssetImageAnimated.genAutosliced("core//assets/image/projectile/splode.png", undefined, undefined, undefined, undefined, 4, 4);
        game.Asset.assets["lance"] = game.Asset.AssetImageAnimated.genAutosliced("core//assets/image/projectile/lance.png", undefined, undefined, undefined, undefined, 4, 4);
        game.Asset.assets["lance"].animStyle = "single";
        game.Asset.assets["bg2"] = new game.Asset.AssetImage("core//assets/image/bg/Starfield2.png");
        game.Asset.assets["bg3"] = new game.Asset.AssetImage("core//assets/image/bg/Starfield3.png");
        this.healthBar = new game.ui.barDisplay(200, 20);
        this.healthBar.addLayer(
          new game.ui.barDisplay.gradientLayer(null, 100,
            new game.util.gradient(
              0, [0, 100, 20], // Dark red
              10, [0, 100, 50], // Bright red
              75, [128, 100, 50], // Bright green
              100, [128, 100, 20] // Dark green
            ),
            new game.util.gradient(
              0, "darkred",
              100, "darkred"
            )
          )
        );
        this.addElement(this.healthBar);
      }

      enter() {
        super.enter();
        game.player.reset();
        game.time = 0;
        game.spawntimemin = 0.5;
        game.spawntimemax = 2;
        game.spawntimer = game.spawntimemax;
      }

      update(dt) {
        super.update(dt);
        game.time += dt;
        // display1.value++;
        // display1.value %= 100;

        game.timer.update(dt);

        // let cstyle = getComputedStyle(game.uielement.children[0].children.namedItem("load1"));
        // // console.log(cstyle.getPropertyValue("--progress"));
        // let progress = Number(cstyle.getPropertyValue("--progress"));
        // progress += dt * 10;
        // if (progress >= 100) {
        //   progress = 0;
        // }
        // game.uielement.children[0].children.namedItem("load1").style.setProperty("--progress", progress);
        // display1.value += 1;
        // display1.value %= 100;

        game.spawntimer -= dt;
        while (game.spawntimer <= 0) {
          game.spawntimer += game.spawntimemin + Math.random() * (game.spawntimemax - game.spawntimemin);
          game.addEnemy(Math.random() * game.cullbox.w, 0);
        }

        // Entities and bullets must not be added to their respective
        // lists directly during traversal. This is a workaround to ensure
        // that they are added safely.
        for (let i = 0; i < game.entityque.length; i++) {
          game.entities.push(game.entityque[i]);
          game.entityque[i] = null;
        }
        game.entityque.length = 0;
        for (let i = 0; i < game.bulletque.length; i++) {
          game.bullets.push(game.bulletque[i]);
          game.bulletque[i] = null;
        }
        game.bulletque.length = 0;

        // Player controls
        if (game.keystates["w"] || game.keystates["ArrowUp"]) {
          game.player.forward(game.player.speed * dt);
        }
        if (game.keystates["a"] || game.keystates["ArrowLeft"]) {
          game.player.left(game.player.speed * dt);
        }
        if (game.keystates["s"] || game.keystates["ArrowDown"]) {
          game.player.backward(game.player.speed * dt);
        }
        if (game.keystates["d"] || game.keystates["ArrowRight"]) {
          game.player.right(game.player.speed * dt);
        }
        // Keep player on screen
        game.player.x = game.util.clamp(game.player.x, game.cullbox.x, game.cullbox.x + game.cullbox.w);
        game.player.y = game.util.clamp(game.player.y, game.cullbox.y, game.cullbox.y + game.cullbox.h);
        game.player?.update(dt);
        // Bullets collide with player
        for (let i = 0; i < game.bullets.length; i++) {
          game.bullets[i].update(dt);
          if (game.bullets[i].intersects(game.player)) {
            game.bullets[i].touch(game.player);
          }
        }

        // Entity update phase
        game.entities.forEach(entity => {
          entity.update(dt);
          if (!entity.alive) return; // Entity could potentially be deleted at any stage

          // Offscreen culling
          if (!entity.intersects(game.cullbox) && entity.age > 0) {
            entity.delete("outofbounds");
          }
          if (!entity.alive) return; // Entity could potentially be deleted at any stage

          // Bullet collisions
          game.bullets.forEach((bullet) => {
            if (bullet.intersects(entity)) {
              bullet.touch(entity);
            }
          });
          if (!entity.alive) return; // Entity could potentially be deleted at any stage

          // Contact damage with player
          if (game.entity.relationship(entity, game.player) == "hostile") {
            if (entity.intersects(game.player)) {
              game.player.damage(entity.attack ?? entity.health);
              entity.delete("crash");
            }
          }
          if (!entity.alive) return; // Entity could potentially be deleted at any stage

          // Entity-entity collisions
          game.entities.forEach(other => {
            if (entity == other) return;
            if (entity.intersects(other)) {
              entity.touch(other);
            }
          });
        });
        this.healthBar.layers[0].value = game.player.health;
        this.healthBar.update(dt);

        // Cull offscreen bullets
        // Final stage to ensure all possible contacts occur
        for (let i = 0; i < game.bullets.length; i++) {
          if (!game.bullets[i].intersects(game.cullbox)) {
            game.bullets[i].delete();
          }
        }

        // Remove dead entities
        // Iterating in reverse prevents concurrent traversal + modification issues
        for (let i = game.entities.length - 1; i > -1; i--) {
          if (!game.entities[i].alive) {
            game.entities.splice(i, 1);
          }
        }
        // Remove dead bullets
        for (let i = game.bullets.length - 1; i > -1; i--) {
          if (!game.bullets[i].alive) {
            game.bullets.splice(i, 1);
          }
        }

        if (game.player.health <= 0) {
          game.setState("menu");
        }
      }

      drawbg(bg, offsetx = 0, offsety = 0, scale = 1) {
        let w = bg.w * scale;
        let h = bg.h * scale;
        for (let y = -h + (offsety * h) % h; y < game.cullbox.h; y += h) {
          for (let x = -w + (offsetx * w) % w; x < game.cullbox.w; x += w) {
            game.graphics.draw(bg, x, y, 0, scale);
          }
        }
      }

      draw(c) {
        super.draw(c);
        c.globalCompositeOperation = "lighter";
        c.globalAlpha = 0.25;
        this.drawbg(game.Asset.assets["bg3"], 0.25, game.time / 20, 0.25);
        c.globalAlpha = 0.5
        this.drawbg(game.Asset.assets["bg2"], 0.5, game.time / 15, 1);
        c.globalAlpha = 1;
        this.drawbg(game.Asset.assets["bg2"], 0, game.time / 10, 1, 2);
        c.globalCompositeOperation = "source-over";
        for (let i = 0; i < game.bullets.length; i++) {
          game.bullets[i].draw(c);
        }
        for (let i = 0; i < game.entities.length; i++) {
          game.entities[i].draw(c);
        }
        game.player?.draw(c);
        // game.graphics.draw_centered(game.testimg, 100, 100, 30, 0.1, 0.1);
        game.graphics.canvas.resetTransform();
      }

      keydown(key) {
        game.player.keydown?.(key);
        game.bullets.forEach(ent => {
          ent.keydown?.(key);
        })
        game.entities.forEach(ent => {
          ent.keydown?.(key);
        });
      }

      mousedown(b, x, y) {
      }
    })();

    // ==========================================
    // Main menu state
    // ==========================================

    game.gameStates["menu"] = new (class MenuState extends game.gameState {
      load() {
        super.load();
        game.menu = this;
        // Title bar. Unreasonably complicated tbh.
        this.addElement("h1", {
          textContent: "Python Shooter",
          style: {
            textAlign: "center",
            margin: "auto",
            padding: "100px",
            color: "white"
          }
        });
        this.menuPanel = this.addElement("div", {
          style: {
            margin: "auto",
            display: "flex"
          }
        });
        appendElement(this.menuPanel, "div", {
          style: {
            flexGrow: 1,
            top: 0,
            bottom: 0
          }
        });
        this.buttons = appendElement(this.menuPanel, "div", {
          style: {
            margin: "auto",
            flexGrow: 1,
            top: 0,
            bottom: 0
          }
        });
        appendElement(this.menuPanel, "div", {
          style: {
            flexGrow: 1,
            top: 0,
            bottom: 0
          }
        });
        appendElement(this.buttons, "div", {
          class: "button",
          textContent: "Play"
        }).addEventListener("click", (evt) => {
          game.setState("game");
        });
      }

      addButton(text, fn) {
        let button = appendElement(this.buttons, "div", {
          class: "button",
          textContent: text
        });
        button.addEventListener("click", (evt) => {
          jslib.usrgame?.onButtonClick?.(this, evt);
          fn?.(this, evt);
        });
        return button;
      }
    })();

    // ==========================================
    // Simple util functions directly available
    // ==========================================

    game.addEnemy = function (x, y, angle = 90) {
      if (x instanceof game.entity) {
        game.entityque.push(x);
        return x;
      } else {
        let ret = new game.entity.enemy(x, y, angle);
        game.entityque.push(ret);
        return ret;
      }
    }

    // ==========================================
    // Static game system infrastructure
    // ==========================================

    /**
     * @param {any} usrgame Pyodide object containing user-supplied callback methods
     * @param {HTMLElement} uielement The parent element containing the game's ui
     */
    game.load = async function (uielement) {
      game.uielement = uielement;
      await jslib.loadimg("core//assets/image/misc/error.png").then((value) => {
        game.Asset.AssetImage.default = value;
      });
      // await new Promise(r => setTimeout(r, 1));
      game.cullbox = new game.entity("none", 0, 0, 0, 1, "aabb", 900, 600);
      game.gameStates.game.load(); // Preload important features
      game.setState("menu");
    }

    game.update = async function (dt) {
      dt = Math.min(dt, .1); // Capped delta time on lag spikes
      game.state?.update(dt);
      game.util.smoothVal.coreUpdate(dt);
    }

    game.draw = async function (canvctx) {
      canvctx.fillStyle = "black";
      canvctx.fillRect(0, 0, 900, 900);

      game.state?.draw(canvctx);
    }

    game.keydown = function (evt) {
      game.keystates[evt.key] = true;
      if (!evt.repeat) {
        game.state?.keydown(evt.key);
      }
    }

    game.keyup = function (evt) {
      game.keystates[evt.key] = false;
      if (!evt.repeat) {
        game.state?.keyup(evt.key);
      }
    }

    game.mousedown = function (b, x, y) {
      game.state?.mousedown(b, x, y);
    }

    game.mouseup = function (b, x, y) {
      game.state?.mouseup(b, x, y);
    }
  }
);