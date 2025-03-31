
// Module of jslib. Do not import directly!

/**
 * Determining stringiness in JS is impressively stupid.
 * This function is the best I have so far.
 * @param {*} v 
 * @returns {string?} Input if string, null if not
 */
jslib.isString = (v) => {
  if (typeof v === 'string' || v instanceof String) {
    return v;
  }
  return null;
}

gameData.libs.push(() => {
  let util = game.util = class Util {
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
     * Unconventional linear interpolation.
     * Intended to handle interpolating angles in the range of [0, 360].
     * Special cased to include the maximum value as a possible return when reasonable to do so.
     * @param {Number} v Factor
     * @param {Number} a Initial value
     * @param {Number} b Final value
     * @param {Number} min Minimum output
     * @param {Number} max Maximum output
     * @returns {Number}
     */
    static loopLerp(v, a = 0, b = 360, min = 0, max = 360) {
      a = Util.wrap(a, min, max);
      b = Util.wrap(b, min, max);
      let dist = b - a;
      let distLo = (b - (max - min)) - a;
      let distHi = (b + (max - min)) - a;
      let mode = 0;
      let modeDist = Math.abs(dist);
      if (Math.abs(distLo) < modeDist) {
        mode = 1;
        modeDist = Math.abs(distLo);
      }
      if (Math.abs(distHi) < modeDist) {
        mode = 2;
      }
      switch (mode) {
        case 0:
          return Util.lerp(v, a, b);
        case 1:
          return Util.wrap(Util.lerp(v, a, b - (max - min)), min, max);
        case 2:
          return Util.wrap(Util.lerp(v, a, b + (max - min)), min, max);
      }
    }
    /**
     * Linear interpolation between vectors provided as arrays of numbers.
     * Adapts to any dimensionality (array length) of parameters.
     * Uses the minimum dimensionality/length for the output,
     * ignoring all other components even at 0 and 1.
     * @param {Number} v 
     * @param {Array<Number>} a 
     * @param {Array<Number>} b 
     * @returns {Array<Number>}
     */
    static lerpVector(v, a = [0], b = [1]) {
      let ret = [];
      for (let i = 0; i < a.length && i < b.length; i++) {
        ret[i] = v * (b[i] - a[i]) + a[i];
      }
      return ret;
    }
    /**
     * Linear interpolation between vectors provided as arrays of numbers.
     * Similar to lerpVector(), but wraps results according to provided
     * bounds, which can optionally be different for each component.
     * If the bounds array is shorter than the components dimensionality,
     * the final bounds are used for all subsequent components.
     * By default, this is designed to handle HSL[A], ie [0-360, 0-100, 0-100, 0-100...]
     * Uses the minimum dimensionality/length for the output,
     * ignoring all other components even at 0 and 1.
     * Special casing preserves maximum values through wrapping,
     * though this does not extend beyond the base maximum.
     * For example, wrap(100, 0, 100) = 100.
     * However, wrap(200, 0, 100) = 0.
     * @param {Number} v 
     * @param {Array<Number>} a 
     * @param {Array<Number>} b 
     * @param {number[][]} [wrap=[[0, 360], [0, 100]]] 
     * @returns {Array<Number>}
     */
    static lerpWrap(v, a = [0, 0, 100, 50], b = [360, 100, 50], wrap = [[0, 360], [0, 100]]) {
      let ret = [];
      let bounds;
      let temp;
      for (let i = 0; i < a.length && i < b.length; i++) {
        bounds = wrap[Math.min(i, wrap.length - 1)];
        temp = Util.lerp(v, a[i], b[i]);
        if (temp == bounds[1]) {
          ret[i] = temp;
        } else {
          ret[i] = Util.wrap(temp, bounds[0], bounds[1]);
        }
      }
      return ret;
    }

    /**
     * Interpolates between an array of entries with specified stops.
     * Uses the provided function, or lerp by default.
     * @param {Number} v 
     * @param {Array<Array<Number>>} targets
     * @param {function(number, *, *): *} fn
     * @returns {Array<Number>}
     */
    static multigrad(v, targets, fn = null) {
      fn ??= Util.lerp;
      let next = 1;
      while (next < targets.length - 1 && v > targets[next][0]) next++;
      if (next === 0) return null;
      let prev = targets[next - 1];
      next = targets[next];
      return fn((v - prev[0]) / (next[0] - prev[0]), prev[1], next[1]);
    }

    static rgbex = /rgba?\(([\d\.]+),\s*([\d\.]+),\s*([\d\.]+)(?:,\s*([\d\.]+))?\)/;
    /**
     * Uses computed style to translate a css color string to its rgba components.
     * @param {String} str 
     * @returns {Array<number>}
     */
    static csstorgb(str) {
      let temp = document.createElement("div");
      document.body.appendChild(temp);
      temp.style.setProperty("color", str);
      let raw = getComputedStyle(temp).getPropertyValue("color");
      temp.remove();
      let color = raw.match(Util.rgbex);
      color.shift();
      color[0] = +color[0];
      color[1] = +color[1];
      color[2] = +color[2];
      color[3] = +(color[3] ?? 1);
      return color;
    }
    /**
     * Deprecated.
     * @param {*} c 
     * @returns 
     */
    static colorType = (c) => {
      if (Array.isArray(c)) {
        let i = 0;
        while (i < colorSet.length) {
          if (!isNumber(colorSet[i])) return "multigrad";
          i++;
        }
        if (i < 3 || i > 4) return "multigrad";
        return "raw";
      } else {
        return "css";
      }
    }
    /**
     * Method source: [css-tricks](https://css-tricks.com/converting-color-spaces-in-javascript/)
     * @param {Number} r 0-255
     * @param {Number} g 0-255
     * @param {Number} b 0-255
     * @param {Number} a 0-1
     * @param {Boolean} standardPrecision Rounds hue to integer, sat and l to tenths.
     * @returns {Number[]} [h, s, l, a]
     */
    static rgbtohsl(r, g, b, a = 1, standardPrecision = true) {
      r /= 255; g /= 255; b /= 255;
      let min = Math.min(r, g, b);
      let max = Math.max(r, g, b);
      let delta = max - min;
      let h = 0;
      let s = 0;
      let l = 0;
      // Hue stage
      if (delta == 0) {
      } else if (max == r) {
        h = ((g - b) / delta) % 6;
      } else if (max == g) {
        h = (b - r) / delta + 2;
      } else if (max == b) {
        h = (r - g) / delta + 4;
      }
      if (h < 0) h += 1;
      h *= 60;
      // Lightness stage
      l = (min + max) / 2;
      // Saturation stage
      if (delta != 0) {
        s = delta / (1 - Math.abs(l + l - 1));
      } // Otherwise it's just 0
      // Return all normalized to proper range
      if (standardPrecision) {
        return [Math.round(h), +((s * 100).toFixed(1)), +((l * 100).toFixed(1)), +(a.toFixed(1))];
      } else {
        return [h, s * 100, l * 100, a];
      }
    }
    /**
     * Serializes a color channel array into a useable CSS string.
     * @param {Number[]} color rgba/hsla color channel values
     * @param {Boolean} hsl Use HSLA mode instead of RGBA. On by default.
     * @returns {String}
     */
    static cssColor(color, hsl = true) {
      if (hsl)
        return `hsla(${color[0]}, ${color[1]}%, ${color[2]}%, ${color[3] ?? 1})`;
      return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3] ?? 1})`;
    }
    /**
     * Deprecated.
     * @param {*} v 
     * @param {*} colorSet 
     * @param {*} hsl 
     * @returns 
     */
    static rawColorFromGradient(v, colorSet, hsl = true) {
      switch (Util.colorType(colorSet)) {
        case "multigrad":
          colorSet = Util.multigrad(v, colorSet, lerpWrap);
        case "raw":
          colorSet[3] ??= 1;
          return colorSet;
        default:
          return Util.colorFromCSS(colorSet, hsl);
      }
    }
    static smoothVal = class SmoothedValue {
      // DON'T TOUCH THIS
      static __reg = new Set();
      /**
       * @param {Number} val Initial numeric value held by this object.
       * @param {Number} min Minimum expected value. If clamped, this is a hard limit. May be freely changed after creation.
       * @param {Number} max Maximum expected value. If clamped, this is a hard limit. May be freely changed after creation.
       * @param {Number} time Time, in seconds, to animate smoothed from min to max.
       * @param {Boolean} auto If true: automatically update every frame.
       */
      constructor(val, min, max, time = 1, auto = true) {
        /**
         * Current/target numeric value held by this object.
         */
        this.val = val;
        /**
         * Interpolated value which approaches this.val over time.
         */
        this.smoothed = val;
        /**
         * Record of this.smoothed from the previous frame. Utility in case it's useful.
         */
        this.prevSmoothed = val;
        /**
         * Record of this.val from the previous frame. Utility in case it's useful.
         */
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
        if (auto) {
          // Register for automatic updates.
          // Weak reference allows for easy cleanup.
          SmoothedValue.__reg.add(new WeakRef(this));
        }
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

      /**
        * Handles automatic updating and management of all instances.
        * @param {Number} dt 
        */
      static coreUpdate(dt) {
        SmoothedValue.__reg.forEach((raw) => {
          let val = raw.deref();
          if (val === undefined) {
            SmoothedValue.__reg.delete(raw);
          } else {
            val.update(dt);
          }
        });
      }
    }
    /**
     * A multi-stop gradient object with a persistent state for optimization.
     * Handles HSL[A] or RGB[A]. In HSL mode, H is wrapped at 0-360.
     * Each stop is in the format [factor, color], where color is an array of
     * components. For convenience, colors are transformed on construction,
     * allowing use of CSS color strings.
     */
    static gradient = class Gradient {
      constructor(...stops) {
        /** HSL mode toggle. Only effect is wrapping of component 0. */
        this.hsl = true;
        /** Gradient stops. See class description for further info. 
         * @type {[Number, Array<Number>]}
        */
        this.stops = [];
        let v;
        for (let i = 0; i < stops.length; i += 2) {
          v = stops[i + 1];
          if (!Array.isArray(v)) {
            v = game.util.csstorgb(v);
            if (this.hsl) {
              v = game.util.rgbtohsl(...v);
            }
          }
          this.stops.push([stops[i], v]);
        }
        /** Current color read at caret position. */
        this.current = [0, 0, 0, 1];
        /** Most recent color of caret before last modification. Provided for utility. */
        this.prev = [0, 0, 0, 1];
        /** Persistent interpolation factor. Do not write directly. */
        this.__caret = 0;
        /** Interpolation function in the form of fn(factor, start, end). By default, game.util.lerp(). */
        this.interpolator = game.util.lerp;
        // Internally cached values to improve recalculation times when sliding caret smoothly.
        /** Internal cache for optimization of caret. */
        this.__PREVSTOP = this.stops[0];
        /** Internal cache for optimization of caret. */
        this.__NEXTSTOP = this.stops[0];
        /** Internal cache for optimization of read. */
        this.__PREVSTOPDYN = this.stops[0];
        /** Internal cache for optimization of read. */
        this.__NEXTSTOPDYN = this.stops[0];
        this.caret = 0;
      }
      /** Persistent interpolation factor. Automatically recalculates gradient as necessary when set. */
      set caret(v) {
        if (this.stops.length < 1) return;
        if (v != this.__caret) {
          this.prev[0] = this.current[0];
          this.prev[1] = this.current[1];
          this.prev[2] = this.current[2];
          this.prev[3] = this.current[3];
          // Reads interval out into this.current. Avoids creating needless array objects.
          this.getInterval(v, this.current, this.__PREVSTOP, this.__NEXTSTOP);
          this.__PREVSTOP = this.current[0];
          this.__NEXTSTOP = this.current[1];
          // Reads value into this.current
          this.interpolateInterval(v, this.current[0], this.current[1], this.current);
          // Update cache
          this.__caret = v;
        }
      }
      /** Persistent interpolation factor. Automatically recalculates gradient as necessary when set. */
      get caret() { return this.__caret; }

      /**
       * Searches for the target interval of the supplied input factor.
       * If caching is provided, it can circumvent the search entirely.
       * Returns two values which can be used for future caching.
       * @param {Number} fac Input factor, from gradient min to max.
       * @param {Array<[Number, Array<Number>]>?} out Optional output array. If not provided, a new one will be created.
       * @param {[Number, Array<Number>]?} prev Cached lower stop for optimization, if any
       * @param {[Number, Array<Number>]?} next Cached upper stop for optimization, if any
       * @returns {Array<[Number, Array<Number>]>} (out) [lower stop, upper stop]
       */
      getInterval(fac, out = null, prev = null, next = null) {
        prev ??= this.__PREVSTOPDYN;
        next ??= this.__NEXTSTOPDYN;
        if (!(fac >= prev[0] && fac <= next[0])) {
          next = 0;
          while (next < this.stops.length - 1 && fac > this.stops[next][0]) next++;
          if (next === 0) {
            prev = this.stops[0];
            next = this.stops[0];
          } else {
            prev = this.stops[next - 1];
            next = this.stops[next];
          }
        }
        if (out) {
          out[0] = prev;
          out[1] = next;
        } else {
          out = [prev, next];
        }
        return out;
      }

      /**
       * Primarily an internal function.
       * Interpolates along a single provided interval using the
       * set interpolator of the object.
       * @param {*} fac 
       * @param {*} prev 
       * @param {*} next 
       * @param {*} out 
       */
      interpolateInterval(fac, prev, next, out = null) {
        fac = (fac - prev[0]) / (next[0] - prev[0]); // Rescale factor to match subsection
        prev = prev[1];
        next = next[1];
        let lerp = this.interpolator;
        out ??= [];
        for (let i = 0; i < prev.length && i < next.length; i++) {
          out[i] = lerp(fac, prev[i], next[i]);
        }
        // HSL hue wrapping effect
        // with special case to allow h=360
        if (this.hsl && out[0] != 360) {
          out[0] = game.util.wrap(out[0], 0, 360);
        }
        // Ensure alpha channel presence
        out[3] ??= 1;
        return out;
      }

      /** 
       * Directly reads the interpolated value at a target factor.
       * If caching is provided, it may improve performance significantly in some cases.
       * Updated caches are written to __PREVSTOPDYN and __NEXTSTOPDYN.
       * @param {Number} fac 
       * @param {Array<*>?} out Optional output array. If not provided, a new one will be created. a new one will be created.
       * @param {[Number, Array<Number>]?} prev Cached lower stop for optimization, if any
       * @param {[Number, Array<Number>]?} next Cached upper stop for optimization, if any
       * @returns {Array<Number>} (out)
       */
      read(fac, out = null, prev = null, next = null) {
        if (this.stops.length < 1) return;

        out = this.getInterval(fac, out, prev, next);
        this.__PREVSTOPDYN = prev = out[0];
        this.__NEXTSTOPDYN = next = out[1];

        return this.interpolateInterval(fac, prev, next, out);
      }

      get cssColor() {
        return Util.cssColor(this.current, this.hsl);
      }

      set r(v) { this.prev[0] = this.current[0]; this.current[0] = v; }
      get r() { return this.current[0]; }
      set g(v) { this.prev[1] = this.current[1]; this.current[1] = v; }
      get g() { return this.current[1]; }
      set b(v) { this.prev[2] = this.current[2]; this.current[2] = v; }
      get b() { return this.current[2]; }
      set a(v) { this.prev[3] = this.current[3]; this.current[3] = v; }
      get a() { return this.current[3]; }

      set h(v) { this.prev[0] = this.current[0]; this.current[0] = v; }
      get h() { return this.current[0]; }
      set s(v) { this.prev[1] = this.current[1]; this.current[1] = v; }
      get s() { return this.current[1]; }
      set l(v) { this.prev[2] = this.current[2]; this.current[2] = v; }
      get l() { return this.current[2]; }

      get lastH() { return this.prev[0]; }
      get lastS() { return this.prev[1]; }
      get lastL() { return this.prev[2]; }

      get lastR() { return this.prev[0]; }
      get lastG() { return this.prev[1]; }
      get lastB() { return this.prev[2]; }
      get lastA() { return this.prev[3]; }
    }
  }
});