import JSLib from "../lib.js";

/**
 * Appends the lowest number necessary to produce an
 * id string that does not refer to any existing element on the document.
 * @param {string} id 
 * @returns {string}
 */
function uid(id) {
  let uid = id;
  let i = 0;
  while (document.getElementById(uid)) uid = `${id}-${++i}`;
  return uid;
}

/**
 * Constructs a collapsible section without id metadata.
 * Intended for subsections that can be identified by their parent section.
 * @param {string} header 
 * @param  {...(HTMLElement|string)} children 
 * @returns {HTMLElement}
 */
export function subsec(header, ...children) {
  let ret = JSLib.buildElement("details", {});
  if (JSLib.isString(header)) {
    ret.appendChild(JSLib.buildElement("summary", {
      textContent: header
    }));
  } else {
    let summary = JSLib.buildElement("summary", {});
    summary.append(header);
    ret.appendChild(summary);
  }
  if (children.length > 0) {
    ret.append(...children);
  }
  return ret;
}

/**
 * Constructs a collapsible section with id metadata.
 * @param {string} id 
 * @param {string} header 
 * @param {...(HTMLElement|string)} children 
 * @returns {HTMLElement}
 */
export function section(id, header, ...children) {
  let ret = subsec(header, ...children);
  ret.id = id;
  return ret;
}

/**
 * Constructs a span element containing the provided content.
 * Named to be easy to type, because "text" is awkward.
 * @param  {...any} text 
 * @returns {HTMLSpanElement}
 */
export function str(...text) {
  let ret = JSLib.buildElement("span");
  ret.append(...text);
  return ret;
}

/**
 * Constructs a table row containing argument information.
 * Used with methodoc to build the argument table.
 * @param {string} name 
 * @param {string} type 
 * @param {string|HTMLElement} desc 
 * @returns {HTMLTableRowElement}
 */
export function argument(name, type, desc) {
  return JSLib.build([
    "tr", {}, [
      ["td", {}, [
        ["code", {}, name]
      ]],
      ["td", {}, ":", ["code", {}, type], ":"],
      ["td", {}, desc]
    ]
  ]);
}

export function code(text) {
  return JSLib.buildElement("code", {
    textContent: text
  });
}
/**
 * Constructs a code element containing the provided text.
 * Removes the smallest indentation level to allow proper formatting in source.
 * After that, uses a pre element.
 * @param {string} text 
 * @returns {HTMLElement}
 */
export function codeblock(text) {
  // Clean up extra indentation from original code
  let tabCount = 0;
  let minCount = Number.MAX_SAFE_INTEGER;
  text = text.split('\n');
  // Search for least indentation
  for (let line of text) {
    tabCount = 0;
    for (let chr of line) {
      if (chr === " " || chr === "\t")
        tabCount++;
      else break;
    }
    if (tabCount < minCount && line.length > 1) minCount = tabCount;
  }
  // Apply indentation cleanup
  for (let i = 0; i < text.length; i++) {
    if (text[i].length > 1) text[i] = text[i].substring(minCount);
  }
  if (text[0].length <= 1) text.shift(); // Clean leading lines from formatting
  text = text.join('\n');

  // Construct final element tree
  let ret = JSLib.build([
    "code", { style: {
      position: "relative"
    }}, [
      ["pre", { textContent: text }],
      ["div", { class: "code-copy-button prevent-select", style: {
        position: "absolute",
        top: "2px",
        right: "8px"
      }, onclick: (evt) => {
        navigator.clipboard.writeText(text).then(function () {
          console.log('Async: Copy to clipboard was successful!');
          evt.target.textContent = "Copied!";
          setTimeout(() => {
            evt.target.textContent = "Copy";
          }, 3000);
        }, function (err) {
          console.error('Async: Could not copy text: ', err);
        });
      }}, "Copy"]
    ]
  ]);
  ret.classList.add("codeblock");
  return ret;
}

/**
 * Wraps provided HTML in a div element
 * @param {string} code 
 * @returns {HTMLDivElement}
 */
export function html(code) {
  let ret = document.createElement("div");
  ret.innerHTML = code;
  return ret;
}

/**
 * Constructs a table containing the provided elements
 * with a header including name, type, and description.
 * (plus separator cells)
 * @param  {...HTMLTableRowElement} items 
 * @returns {HTMLTableElement}
 */
export function table(...items) {
  return JSLib.build([
    "table", { class: "docs-members-table" }, [
      "tr", {},
      ["td", {}, "name"],
      ["td", {}, ":"],
      ["td", {}, "type"],
      ["td", {}, ":"],
      ["td", {}, "description"]
    ],
    items
  ]);
}

/**
 * Wraps provided contents in an unordered list element.
 * @param  {...(HTMLElement|string)} items 
 * @returns {HTMLUListElement}
 */
export function list(...items) {
  let ret = document.createElement("ul");
  items.forEach((item) => {
    ret.append(JSLib.build(["li", {}, item]));
  });
  return ret;
}
/**
 * Wraps provided contents in a div element.
 * @param  {...(HTMLElement|string)} children 
 * @returns {HTMLDivElement}
 */
export function div(...children) {
  let ret = document.createElement("div");
  ret.append(...children);
  return ret;
}

export function br() { return document.createElement("br"); }
export function pre(text) {
  return JSLib.buildElement("pre", { textContent: text });
}
export function memberTable(...items) {
  return JSLib.build([
    "table", { class: "docs-members-table" },
    [
      "tr", {},
      [ "td", {}, "name" ],
      [ "td", {}, ":" ],
      [ "td", {}, "type" ],
      [ "td", {}, ":" ],
      [ "td", {}, "description" ]
    ],
    items
  ]);
}
/**
 * 
 * @param {string} signature 
 * @param {string} type 
 * @param {string} desc 
 * @param {string|HTMLElement} meta Extra description data that will be included in a cell below the description
 * @returns {HTMLElement|(HTMLElement[])} Returns array of 2 elements if meta is provided.
 */
export function member(signature, type, desc, meta = null) {
  let ret = JSLib.build([
    "tr", { class: "docs-member" },
    [ "td", {}, [ "code", {}, signature ]],
    [ "td", {}, ":" ],
    [ "td", {}, [ "code", {}, type ]],
    [ "td", {}, ":" ],
    [ "td", {}, desc ]
  ]);
  if (meta !== null) {
    return [ret, JSLib.build([
      "tr", { class: "docs-member" },
      ["td", {}],
      ["td", {}],
      ["td", {}],
      ["td", {}],
      ["td", {}, meta]
    ])];
  }
  return ret;
}
/**
 * 
 * @param {string} str 
 * @param {string} sep 
 */
export function splitFirst(str, sep = ' ', start = 0) {
  if (start < str.length) {
    let index = str.indexOf(sep, start);
    if (index !== -1) return str.substring(start, index);
    return str;
  } return ''
}
/**
 * Returns the first n substrings separated by the provided
 * separator string, like retrieving the first n items of str.split(sep).
 * Appends the rest of the string following the last separator to the end of the list.
 * @param {string} str 
 * @param {number} count 
 * @param {string} sep 
 * @param {number} start 
 * @returns {string[]}
 */
export function splitFirstN(str, count, sep = ' ', start = 0) {
  let ret = [];
  let item;
  for (let i = 0; i < count; i++) {
    if (start < str.length) {
      item = splitFirst(str, sep, start);
      if (item) {
        start += item.length + sep.length;
        ret.push(item);
      } else {
        ret.push(str.substring(start));
        return ret;
      }
    } else return ret;
  }
  ret.push(str.substring(start));
  return ret;
}

/**
 * Constructs a method documentation section with the provided data.
 * @param {string} id 
 * @param {string} returnType 
 * @param {string} signature 
 * @param {string} args 
 * @param {string|HTMLElement} desc 
 * @returns {HTMLElement}
 */
export function methodoc(id, returnType, signature, args, desc) {
  let ret = section(uid("method-" + id), id,
    str("Accessed as: ", code(signature), "; returns: ", code(returnType)),
    JSLib.build(["div", {}, desc]),
    JSLib.build(["table", {}, args])
  );
  return ret;
};

let spantag = function(str, tag) {
  return JSLib.build(["span", { class: tag }, str]);
}

export function highlight(str) {
  // Todo: parse the python somehow
}