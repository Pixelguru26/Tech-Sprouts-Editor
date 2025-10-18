export default class Util {
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
  static Gradient = class Gradient {
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