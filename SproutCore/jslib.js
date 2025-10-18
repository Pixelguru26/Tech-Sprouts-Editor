/**
 * A range of utilities to make writing code in javascript
 * suck less.
 */

const JSLib = class JSLib {
  // Useful constants
  static svgns = "http://www.w3.org/2000/svg";

  // ==========================================

  /**
   * Returns the supplied argument if it is a string, or null if it isn't.
   * @param {*} v 
   * @returns {string|null}
   */
  static isString(v) {
    return (((typeof v) === "string") || (v instanceof String)) ? v : null;
  }

  /**
   * Returns v if it is a valid, non-empty string, or null if it isn't.
   * @param {*} v 
   * @returns {string|null}
   */
  static isVString(v) {
    v = JSLib.isString(v);
    return (v && v != "") ? v : null;
  }

  // ==========================================

  // HTML Utils

  /** Identifies events to handle them non-destructively. */
  static HTMLEvents = {};
  /** Aliases for certain properties to make attributes more intuitive. */
  static HTMLAliases = {};

  /**
   * Sets many style attributes of an element at once from a mapped table.\
   * Intended only for internal use.
   * @param {HTMLElement} obj 
   * @param {string|CSSStyleDeclaration} style Either a string containing inline style attributes, or a map of properties
   * @returns {HTMLElement}
   */
  static style(obj, style) {
    if (this.isString(style)) {
      obj.style.cssText += style;
    } else {
      let t = obj.style;
      for (let k in style) t[k] = style[k];
    }
    return obj;
  }
  /**
   * Sets many attributes of an element at once from a mapping table.\
   * Includes special casing for many attributes, including style, content, and events.
   * Largely internal, build() is usually preferable.
   * @param {HTMLElement} obj The target element whose attributes will be assigned to
   * @param {HTMLElement} data A table of element properties to be assigned
   * @returns {HTMLElement}
   */
  static attr(obj, data) {
    if (!data) return obj;
    let lowerk, altk, evtk, v;
    for (let k in data) {
      v = data[k];
      lowerk = k.toLowerCase();
      switch (lowerk) {
        case "style":
          this.style(obj, v);
          break;
        case "innerhtml":
        case "textcontent":
          obj["textContent"] = v;
          break;
        case "class": // Included to indicate that it doesn't work otherwise
        default:
          altk = this.HTMLAliases[lowerk];
          evtk = this.HTMLEvents[altk ?? lowerk];
          if (evtk) {
            // Events are added instead of replaced where possible
            obj.addEventListener(evtk, v);
          } else if (typeof v === "function") {
            obj[k] = v;
          } else {
            // Normal attribute (probably)
            obj.setAttribute(altk ?? k, v);
          }
          break;
      }
    }
    return obj;
  }

  /**
   * Creates an element (if necessary) and sets many attributes at once from a mapping table.\
   * Includes special casing for many attributes, including style, content, and events.
   * @param {string|HTMLElement} tag Either a string indicating the tag to construct an element from, or the element itself.
   * @param {HTMLElement} data A table of element properties to be assigned
   * @returns {HTMLElement}
   */
  static buildElement(tag, data) {
    if (this.isString(tag)) {
      try {
        tag = document.createElement(tag);
      } catch (e) {
        console.log(tag, e);
        debugger;
      }
    }
    return this.attr(tag, data);
  }

  /**
   * A complex, but powerful recursive system
   * for building an entire element tree at once
   * from an array template.\
   * Basic usage is as follows:\
   * `buildTree(["tag", properties, ...childTags]);`\
   * A more complete example:\
   * ```
   * let result = buildTree(["div", {
   *     attribute: "value"
   *   }, [
   *     ["div", {
   *       foo: "bar"
   *     }],
   *     ["div", {
   *       baz: "qux"
   *     }],
   *     ...
   *   ]
   * ]);
   * ```
   * @param {Array} data Array containing the element tree to be built
   * @param {HTMLElement?} parent If supplied, the result is appended to this.
   * @returns {HTMLElement|Array<HTMLElement>}
   */
  static build(data, parent = null) {
    if (!data) return;

    // Build simple text node when a string is passed
    if (this.isVString(data)) {
      let t = document.createTextNode(data);
      parent?.appendChild?.(t);
      return t;
    }

    // Simple append case
    if (data instanceof Node && parent instanceof Node) {
      // Parent is not null
      parent.appendChild(data);
      return data;
    }

    // Batch construction (used in recursion)
    if (!this.isString(data[0])) {
      let ret = [];
      for (let element of data)
        ret.push(this.build(element, parent));
      return ret;
    }

    // Construct element and its children (user case)
    let element;
    let start = 1;
    
    // Root element construction
    if (data[start] instanceof Node) {
      element = document.createElement(data[0]);
    } else {
      // If first element is tag,
      // construct an element using data[1] as arguments,
      // then use that element as the root.
      element = this.buildElement(data[0], data[start++]);
    }
    
    // Recursion
    for (let i = start; i < data.length; i++) {
      this.build(data[i], element);
    }

    parent?.appendChild?.(element);
    return element;
  }

  /**
   * Builds an element and awaits either completed loading or error before returning it.\
   * By necessity, adds an event listener to "load" and "error."
   * @param {string|HTMLElement} tag Either a string indicating the tag to construct an element from, or the element itself.
   * @param {HTMLElement} data A table of element properties to be assigned
   * @returns {HTMLElement}
   */
  static async awaitBuild(tag, data) {
    // Link promise finalizers
    let ready, fail;
    let promise = new Promise((resolve, reject) => {
      ready = resolve;
      fail = reject;
    });

    // Construct and link element
    let element = this.build(tag, data);
    element.addEventListener("load", ready);
    element.addEventListener("error", fail);

    // Return
    await promise;
    return element;
  }

  // ==========================================

  // Object utilities

  /**
   * Accesses a static property of the provided instance's class.
   * Climbs the inheritance chain until it is found, allowing static inheritance as it should have been.
   * @param {*} instance 
   * @param {string} property 
   * @returns {*} The value of the nearest static property of the matching name
   */
  static getStatic(instance, property) {
    let proto = Object.getPrototypeOf(instance);
    while (proto?.constructor && !Object.hasOwn(proto.constructor, property)) {
      proto = Object.getPrototypeOf(proto);
    }
    return proto?.constructor?.[property];
  }

  /**
   * Provides access to static properties as if they were defaults
   * for instance values.
   * @param {*} instance 
   * @param {string} property 
   * @returns {*}
   */
  static getStaticDefault(instance, property) {
    if (Object.hasOwn(instance, property)) return instance["property"];
    else return this.getStatic(instance, property);
  }
};


// Add aliases for events
(() => {
  let evts = `
    cancel change error load copy cut paste drag
    dragend dragenter dragleave dragover dragstart
    drop beforetoggle toggle
    afterscriptexecute beforeinput beforematch
    beforescriptexecute beforexrselect
    contentvisibilityautostatechange
    input securitypolicyviolation wheel
    animationcancel animationend animationiteration
    animationstart
    compositionend compositionstart compositionupdate
    blur focus focusin focusout
    fullscreenchange fullscreenerror
    keydown keypress keyup
    auxclick click contextmenu dblclick domactivate
    dommousescroll
    mousedown mouseenter mouseleave mousemove
    mouseout mouseover mouseup
    gotpointercapture lostpointercapture
    pointercancel pointerdown pointerenter
    pointerleave pointermove pointerout
    pointerover pointerrawupdate pointerup
    scroll scrollend
    touchcancel touchend touchmove touchstart
    transitioncancel transitionend transitionrun
    transitionstart
  `.split(/[\s\,]+/g);
  for (let evt in evts) {
    JSLib.HTMLAliases["on" + evt] = evt;
    JSLib.HTMLEvents[evt] = evt;
    JSLib.HTMLEvents["on" + evt] = evt;
  }
})();

export default JSLib;