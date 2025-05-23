// This file provides patches to vanilla javascript
// adding basic utilities common to most other languages

// ==========================================
// Array Utilities
// ==========================================

/**
 * Iterates over the items in an array in order.\
 * Usage: `for (let [i,v] of ipairs(arr)) ...`\
 * Works on strings too, surprisingly.
 * @param {Array<*>} arr
 * @returns {[number, *]} [index, value]
 */
function* ipairs(arr) {
  for (let i = 0; i < arr.length; i++) {
    yield [i, arr[i]];
  }
}

/**
 * Iterates over the items of an array in reverse.\
 * Usage: `for (let [i,v] of rpairs(arr)) ...`
 * Works on strings too, surprisingly.
 * @param {Array<*>} arr
 * @returns {[number, *]} [index, value]
 */
function* rpairs(arr) {
  for (let i = arr.length-1; i > -1; i--) {
    yield [i, arr[i]];
  }
}

/**
 * Iterates over the direct key/value pairs of a supplied table.\
 * Usage: `for (let [k,v] of pairs(obj)) ...`
 * @param {*} obj
 * @returns {[string, *]} [key, value]
 */
function* pairs(obj) {
  for (let k in obj) {
    if (obj.hasOwnProperty(k)) yield [k, obj[k]];
  }
}
/**
 * Clears the parent array of all items.\
 * Sets all entries to null, then sets length to 0.\
 * This method ensures data safety across browsers.
 * @returns {Array} this (for chaining)
 */
Array.prototype.clear = function () {
  let l = this.length;
  for (let i = 0; i < l; i++) {
    this[i] = null;
  }
  this.length = 0;
  return this
}
/**
 * insert, because `arr.splice(i, 0, v)` is much less clear.
 * @param {any} v The new item to be inserted
 * @param {number?} i Index of insertion. By default, pushes to the end of the arry.
*/
Array.prototype.insert = function (v, i = null) {
  this.splice(i ?? this.length, 0, v);
}

/**
 * Executes the supplied function on every member of the array.
 * Mutates the original array to remove any members on which
 * the function returned false.\
 * The function is executed on each item in order, starting from arr[0].
 * @param {(value:*, index: number, array: Array<*>) => boolean} fn 
 * @returns `this`, the original array, mutated.
 */
Array.prototype.filterInPlace = function (fn) {
  let l = this.length;
  for (let i = 0; i < l; i++) {
    if (!(this[i] = fn(v, i, this))) {
      // Shifts iterator back a step
      // This allows the function to be called
      // in normal, non-reverse order.
      this.splice(i--, 1);
      l--;
    }
  }
  return this;
}

/**
 * Gets/sets the first item in the array.
 * Semantically clearer in some cases than `arr[0]`
 * and demanded by the existence of `arr.last`.
 */
Object.defineProperty(Array.prototype, "first", {
  /**
   * @returns The first item in the array, or null if the array is empty.
   */
  get: function () { return this[0]; },
  /**
   * Sets the first item in the array. This is always index 0.
   * @param {*} v 
   */
  set: function (v) { this[0] = v; }
});
/**
 * Convenient way to get/set the last item in the array.
 * Significantly clearer and easier to use than
 * `arr[arr.length-1]`.
 */
Object.defineProperty(Array.prototype, "last", {
  /**
   * @returns The last item in the array, or null if the array is empty.
   */
  get: function () { return this[this.length - 1]; },
  /**
   * Sets the last item in the array. Shortcut for arr[arr.length - 1] = v
   * @param {*} v 
   */
  set: function (v) { this[this.length - 1] = v; }
});

/**
 * @returns {string} a new string with every word capitalized.
 */
String.prototype.capitalize = function () {
  return this.replace(/\b\w/g, (c) => c.toUpperCase());
}