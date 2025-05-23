let DEBUG = true;
var jslib = {};

/**
 * Clears the parent array of all items.
 * Sets all entries to null, then sets length to 0.
 */
Array.prototype.clear = function () {
  let l = this.length;
  for (let i = 0; i < l; i++) {
    this[i] = null;
  }
  this.length = 0;
}
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
String.prototype.capitalize = function() {
  return this.replace(/\b\w/g, (c) => c.toUpperCase());
}

async function loadelement(type, src) {
  let ready, fail;
  let promise = new Promise((resolve, reject) => {
    ready = resolve;
    fail = reject;
  });
  let element = document.createElement(type);
  element.onload = ready;
  element.onerror = fail;
  if (jslib.isString(src)) {
    element.src = src;
  } else {
    jslib.setProps(element, src);
  }
  await promise;
  return element;
}

jslib.loadimg = async (src) => {
  return await loadelement("img", src);
}

/**
 * @deprecated
 * Creates a script element to load the indicated source directory.\
 * Returns the element when it finishes loading.
 * @param {string} src 
 * @returns {Element}
 */
jslib.loadscript = async (src) => {
  let ready, fail;
  let promise = new Promise((resolve, reject) => {
    ready = resolve;
    fail = reject;
  });
  let element = document.createElement("script");
  element.onload = ready;
  element.onerror = fail;
  element.src = src;
  document.getElementById("scripts").appendChild(element);
  await promise;
  return element;
}
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
/**
 * @param {string} src 
 */
jslib.loadjs = async (src) => {
  let elmt = await loadelement("script", src);
}

// HTML/CSS utility functions
const svgns = "http://www.w3.org/2000/svg";
/**
 * Applies provided styles table to the element. Correctly handles wrapped elements.
 * @param {Element} elmt
 * @param {{}} css Table of style properties to be applied. Most CSS properties with `-` are replaced with camel case equivalents.
 * @returns {Element}
 */
function setCSS(elmt, css) {
  let ret = elmt;
  // Handle element wrappers
  if (elmt.element) {
    elmt = elmt.element;
  }
  // Apply css properties
  for (const k in css) {
    elmt.style[k] = css[k];
  }
  return ret;
}
jslib.setCSS = setCSS;

/**
 * Used to determine how a property is set on html elements,
 * due to the inconsistent functionality.
 */
jslib.propertyTypesRegistry = {};
[ // elmt[k] = v;
  "innerHTML",
  "textContent",
].forEach((v) => {
  jslib.propertyTypesRegistry[v] = 1;
});
[ // elmt.setAttribute(k, v);
  "class"
].forEach((v) => {
  jslib.propertyTypesRegistry[v] = 2;
});
/**
 * Applies attributes from the provided tables to the element.
 * Correctly handles wrapped elements and some cases in which `setAttribute()` fails to work as expected.
 * @param {Element} elmt
 * @param {{}?} properties Attributes to be applied to the element directly. Correctly handles innerHTML, textContent, and style.
 * @param {{}?} css Style attributes to be applied to the element. Uses `setCSS()`.
 * @returns {Element}
 */
function setProps(elmt, properties = null, css = null) {
  // Shortcut return to allow derivative functions to easily
  // make properties fully optional
  if (!properties) return css ? jslib.setCSS(elmt, css) : elmt;
  let ret = elmt;
  // Handle element wrappers
  if (elmt.element) {
    elmt = elmt.element;
  }
  // Apply properties from table
  for (const k in properties) {
    if (k === "style") {
      // Allow styling nested in properties
      // Avoids confusion and allows more explicit syntax
      jslib.setCSS(ret, properties[k]);
    } else {
      switch (jslib.propertyTypesRegistry[k]) {
        case 1:
          elmt[k] = properties[k];
          break;
        case 2:
        default:
          elmt.setAttribute(k, properties[k]);
          break;
      }
    }
  }
  return css ? jslib.setCSS(ret, css) : ret;
}
jslib.setProps = setProps;

/**
 * Unused utility.
 * @param {Element} elmt 
 * @param {string} classes 
 * @returns 
 */
jslib.addClasses = function(elmt, classes) {
  // Add all classes to the element instead of completely overwriting
  classes.split(/\s+/g).forEach((v) => {
    elmt.classList.add(v);
  });
  return elmt;
}

/**
 * 
 * @param {String} tag 
 * @returns {Element}
 */
function newElement(tag, properties = null, css = null) {
  return setProps(document.createElement(tag), properties, css);
}
jslib.newElement = newElement;
/**
 * 
 * @param {Element} parent 
 * @param {String | Element} elmt Either the element to append or the string id of a tag. If the latter, creates the new element.
 * @param {{}} [properties] HTML properties that will be assigned to the object. Dynamic behavior for "innerHTML", "textContent", and "style"
 * @param {{}} [css] CSS properties that will be assigned to the object. Completely overridden by properties.style if present.
 * @returns {Element} Either the element passed or the new element created if necessary.
 */
function appendElement(parent, elmt, properties = null, css = null) {
  if (elmt instanceof Element) {
    setProps(elmt, properties, css);
  } else if (elmt instanceof game.ui.element) {
    elmt = setProps(elmt.element, properties, css);
  } else {
    elmt = newElement(elmt, properties, css);
  }
  parent.appendChild(elmt);
  return elmt;
}
jslib.appendElement = appendElement;
/**
 * 
 * @param {String} tag 
 * @returns {SVGElement}
 */
function newSVG(tag, properties = {}, css = {}) {
  let elmt = document.createElementNS(svgns, tag);
  if ("style" in properties) {
    css = properties.style;
    delete properties.style;
  }
  for (const k in properties) {
    if (k === "innerHTML") {
      elmt.innerHTML = properties[k];
    } else {
      elmt.setAttribute(k, properties[k]);
    }
  }
  return setCSS(elmt, css);
}
jslib.newSVG = newSVG;
/**
 * 
 * @param {Element} parent 
 * @param {String} tag 
 * @returns {SVGElement}
 */
function appendNewSVG(parent, tag, properties = {}, css = {}) {
  let elmt = newSVG(tag, properties, css);
  parent.appendChild(elmt);
  return elmt;
}
jslib.appendNewSVG = appendNewSVG;

/**
 * Create element from tag if necessary and apply given properties using `setProps()`.\
 * If a string tag is provided and the properties table contains `svg: true`, element is created with SVG namespace.\
 * Handles JSLib wrapped elements correctly.\
 * A better-constructed and more modern alternative to `newElement()`.
 * @param {Element | string} tag 
 * @param {{}?} properties Table of attributes to apply directly. See `jslib.setProps()`
 * @param {{}?} css Table of style attributes to apply. See `jslib.setCSS()`
 * @returns {Element} Provided element or result of construction by tag.
 */
jslib.buildElement = (tag, properties = null, css = null) => {
  let ret = tag;
  if (jslib.isString(tag)) {
    // Construct basic element if necessary
    if (properties?.svg)
      ret = document.createElementNS(svgns, tag);
    else
      ret = document.createElement(tag);
  }
  return jslib.setProps(ret, properties, css);
}