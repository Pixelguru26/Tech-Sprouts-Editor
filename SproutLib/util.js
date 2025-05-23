SproutCore.registerLib("util", [], (game) => {
  game.util = class Util {
    /**
     * Simple regex for extracting css rgb function data.
     * Match is returned in the form [throwaway, r, g, b, a?]
     */
    static rgbex = /rgba?\(([\d\.]+),\s*([\d\.]+),\s*([\d\.]+)(?:,\s*([\d\.]+))?\)/;
    static isNumber(n) { return !isNaN(parseFloat(n)) && !isNaN(n - 0) }
    /**
     * Linear interpolation
     * @param {Number} v Interpolation factor, based on 0-1.
     * @param {Number} a Initial value (factor = 0)
     * @param {Number} b Final value (factor = 1)
     * @returns {Number}
     */
    static lerp(v, a, b) {
      return v * (b - a) + a;
    }
    /**
     * Returns v limited to the range of [a, b].
     * 
     * 0-1 by default.
     * @param {Number} v Value
     * @param {Number} a Minimum
     * @param {Number} b Maximum
     * @returns {Number}
     */
    static clamp(v, a = 0, b = 1) {
      return (v < a) ? a : ((v > b) ? b : v);
    }
    /**
     * Advanced wrapping function which accounts for negative and floating point values.
     * 
     * Returns v wrapped to the range [a, b). 0-1 by default.
     * @param {Number} v Value
     * @param {Number} a Minimum
     * @param {Number} b Maximum
     * @returns {Number}
     */
    static wrap(v, a = 0, b = 1) {
      if (v < a) {
        let diff = a - v - 1;
        diff = diff % (b - a);
        return b - diff - 1;
      }
      return ((v - a) % (b - a)) + a;
    }
    /**
     * Not yet implemented.
     * @param {Number} v Value
     * @param {Number} a Minimum
     * @param {Number} b Maximum
     */
    static pingpong(v, a, b) {
      // TODO
    }
    /**
     * Safely extracts the sign (-1, 0, 1) of a supplied value without errors.
     * Invalid value types return 0.
     * 
     * Boolean values are special cased to return 0 or 1.
     * @returns {Number}
     */
    static sign(v) {
      if (isNaN(v) || !v) return 0;
      if (v < 0) return -1;
      if (v > 0 || v === true) return 1;
      return 0;
    }
    /**
     * Utility function for intersection tests.
     * 
     * Returns true if and only if a and b are numbers with opposite signs,
     * counting 0 as positive. If both are 0, still returns false.
     * @param {Number} a 
     * @param {Number} b 
     * @returns {Boolean}
     */
    static signsOpposite(a, b) {
      return (a < 0 && b >= 0) || (a >= 0 && b < 0);
    }
    /**
     * Small css gradient management class
     * used in health bar display
     */
    static gradient = class Gradient {
      stops = [];
      /**
       * @param  {...Array<ColorStop>} stops 
       */
      constructor(...stops) {
        let stop;
        for (let i = 0; i < stops.length; i++) {
          this.stops.push(stops[i])
        }
      }
      /**
       * @param {number} x 
       * @param {string} left 
       * @param {string} right 
       */
      addStop(x, left, right = null) {
        let stop = new Gradient.colorStop(x, left, right);
      }
      /**
       * Stops have a position and separate colors for left and right.
       */
      static colorStop = class ColorStop {
        /**
         * @param {number} x 
         * @param {string} left 
         * @param {string?} right Defaults to matching left
         */
        constructor(x, left, right = null) {
          this.x = x;
          this.left = left;
          this.right = right ?? left;
        }
      }
    }
  };
  /**
   * Root class which allows subscription to the game core update function.
   */
  game.autoUpdateUtil = class AutoUpdateUtil {
    // DON'T TOUCH THIS
    static __reg = new Set();
    /**
     * @param {boolean?} attach default: `true`; If false, instance is not automatically updated.
     */
    constructor(attach = true) {
      if (attach) this.attach();
    }
    /**
     * Registers this object for automatic updates, if it has not already been registered.
     */
    attach() {
      if (!this.weakRef) {
        this.weakRef = new WeakRef(this);
        AutoUpdateUtil.__reg.add(this.weakRef);
      }
    }
    /**
     * Removes this object from the automatic update registry and destroys the associated weakref.
     */
    detach() {
      if (this.weakRef) {
        AutoUpdateUtil.__reg.delete(this.weakRef);
        delete this.weakRef;
      }
    }
    /**
     * Called every frame when this object is registered.\
     * The default exists only to be overridden, it does nothing and does not need to be called in the derived class.
     * @param {number} dt delta time, in seconds. Usually close to `0.01`.
     */
    update(dt) {}
    /**
     * Globally updates all instances. Should only be called by core.
     * @param {number} dt 
     */
    static update(dt) {
      this.__reg.forEach((raw) => {
        let val = raw.deref();
        if (val === undefined) {
          this.__reg.delete(raw);
        } else {
          val.update?.(dt);
        }
      });
    }
  }
  game.smoothVal = class SmoothedValue extends game.autoUpdateUtil {
    /**
     * @param {Number} val Initial numeric value held by this object.
     * @param {Number} min Minimum expected value. If clamped, this is a hard limit. May be freely changed after creation.
     * @param {Number} max Maximum expected value. If clamped, this is a hard limit. May be freely changed after creation.
     * @param {Number} time Time, in seconds, to animate smoothed from min to max.
     * @param {Boolean} auto If true: automatically update every frame.
     */
    constructor(val, min, max, time = 1, auto = true) {
      super(auto);
      /** Current/target numeric value held by this object. */
      this.val = val;
      /** Interpolated value which approaches this.val over time. */
      this.smoothed = val;
      /** Record of this.smoothed from the previous frame. Utility in case it's useful. */
      this.prevSmoothed = val;
      /** Record of this.val from the previous frame. Utility in case it's useful. */
      this.prev = val;
      /**
       * Minimum expected value. Primarily affects animation speed.
       * If this.clamp is true, this is enforced during update.
       */
      this.min = min;
      /**
       * Maximum expected value. Primarily affects animation speed.
       * If this.clamp is true, this is enforced during update.
       */
      this.max = max;
      /**
       * Time, in seconds, for this.smoothed to interpolate
       * between this.min and this.max.
       * Lower values result in faster animation.
       */
      this.time = time;
      /** If true, enforces this.min/max during update. */
      this.clamp = true;
    }

    /**
      * Expected to be called every frame.
      * If the object is registered as automatically handled,
      * it is unnecessary to call this manually.
      * Handles animation of this.smoothed, updating of this.prev, and clamping.
      * @param {Number} dt 
      */
    update(dt) {
      // Clamping
      if (this.clamp) {
        this.val = Util.clamp(this.val, this.min, this.max);
      }
      this.prevSmoothed = this.smoothed;
      // Decreasing value animation
      if (this.val < this.smoothed) {
        this.smoothed -= dt * (this.max - this.min) / this.time;
        if (this.val > this.smoothed) {
          this.smoothed = this.val;
        }
        // Increasing value animation
      } else {
        this.smoothed += dt * (this.max - this.min) / this.time;
        if (this.val < this.smoothed) {
          this.smoothed = this.val;
        }
      }
      this.prev = this.val;
    }
  }
  /**
   * An attempt to abstract away physics integration properly.\
   * Handles integration of one independent axis entirely.\
   * To apply force on this axis, set the instance `accel` value
   * to the appropriate acceleration. In the next update step,
   * `this.accel` will be applied.\
   * Additionally, `this.vel` exposes the velocity of this
   * value, which can be set to apply a velocity instantaneously
   * (equivalent to infinite acceleration) or read as a
   * simulation output.
   */
  game.verletVal = class VerletVal extends game.autoUpdateUtil {
    constructor(val = 0, auto = true) {
      super(auto);
      this.val = val;
      this.accel = 0;
      this.vel = 0;
    }

    update(dt) {
      this.val += (this.vel + 0.5*this.accel*dt)*dt;
      this.vel += this.accel * dt;
    }
  }
  /**
   * A 3d point with automatic verlet integration.
   * Acceleration is a constant input which is not modified internally.
   */
  game.verletCoord = class VerletCoord extends game.autoUpdateUtil {
    constructor(x = 0, y = 0, z = 0, auto = true) {
      super(auto);
      this.x = x;
      this.y = y;
      this.z = z;
      /** @type {number} x-velocity */
      this.vx = 0;
      /** @type {number} y-velocity */
      this.vy = 0;
      /** @type {number} z-velocity */
      this.vz = 0;
      /** @type {number} x-acceleration */
      this.ax = 0;
      /** @type {number} y-acceleration */
      this.ay = 0;
      /** @type {number} z-acceleration */
      this.az = 0;
    }
    update(dt) {
      // position + integral of velocity (delta position) + double integral of acceleration (integrated delta velocity)
      this.x += (this.vx + 0.5 * this.ax * dt) * dt;
      this.y += (this.vy + 0.5 * this.ay * dt) * dt;
      this.z += (this.vz + 0.5 * this.az * dt) * dt;
      // velocity + integral of acceleration (delta velocity)
      this.vx += this.ax * dt;
      this.vy += this.ay * dt;
      this.vz += this.az * dt;
    }
  }

  // Some explanation required for the following code:
  // 
  // Entity/bullet deletion may have user-supplied callbacks
  // with side effects, including creation of new entities or bullets.
  // This is mostly used for explosion effects, scattering shot, etc.
  // 
  // These functions are designed to ensure absolutely clean
  // entity and bullet lists once they finish regardless.
  // In order to maintain stability, the function
  // executes several cycles of normal deletion with proper callbacks,
  // clearing up to the depth indicated by `forceClearCycles`.
  // 
  // If there are still stragglers after this process, however,
  // the arrays are forcefully cleared, ignoring callbacks,
  // and a warning is printed in the console.

  let forceClearCycles = 10;
  /** Filter lambda */
  let deleteAllInPlace = (v) => {
    if (v.alive) v.delete();
    return v.alive;
  }
  /**
   * Recursively clears all living and queued entities from the game.
   */
  game.forceClearEntities = () => {
    let es = game.entities;
    let eq = game.entityque;
    for (let cycle = 0; cycle < forceClearCycles; cycle++) {
      if (es.length < 1 && eq.length < 1) break;
      es.filterInPlace(deleteAllInPlace);
      eq.filterInPlace(deleteAllInPlace);
    }
    if (es.length > 0 || eq.length > 0) {
      (print ?? console.warn)?.("Entity force clear overflow");
      es.clear();
      eq.clear();
    }
  }
  /**
   * Recursively clears all active and queued bullets from the game.
   */
  game.forceClearBullets = () => {
    let bs = game.bullets;
    let bq = game.bulletque;
    for (let cycle = 0; cycle < forceClearCycles; cycle++) {
      if (bs.length < 1 && bq < 1) break;
      bs.filterInPlace(deleteAllInPlace);
      bq.filterInPlace(deleteAllInPlace);
    }
    if (bs.length > 0 || bq.length > 0) {
      (print ?? console.warn)?.("Bullet force clear overflow");
      bs.clear();
      bq.clear();
    }
  }
  /**
   * Recursively clears both entities and bullets from the game,
   * preventing cycle avoidance.
   */
  game.forceClearAll = () => {
    let es = game.entities;
    let eq = game.entityque;
    let bs = game.bullets;
    let bq = game.bulletque;
    for (let cycle = 0; cycle < forceClearCycles; cycle++) {
      if (es.length < 1 && eq.length < 1 && bs.length < 1 && bq < 1) break;
      es.filterInPlace(deleteAllInPlace);
      eq.filterInPlace(deleteAllInPlace);
      bs.filterInPlace(deleteAllInPlace);
      bq.filterInPlace(deleteAllInPlace);
    }
    if (es.length > 0 || eq.length > 0 || bs.length > 0 || bq.length > 0) {
      (print ?? console.warn)?.("Force clear overflow");
      es.clear();
      eq.clear();
      bs.clear();
      bq.clear();
    }
  }
});