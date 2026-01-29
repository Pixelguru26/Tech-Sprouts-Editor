import JSLib from "./lib.js";

export class ConsoleEntry {
  constructor(row, date, data, count = 0) {
    this.element = JSLib.buildElement("tr", {
      class: "console-entry"
    });
    this.elementRow = JSLib.build(["td", {
      class: "console-row-number",
      textContent: row
    }], this.element);
    this.elementDate = JSLib.build(["td", {
      class: "console-date",
      textContent: `[${date}]: `
    }], this.element);
    this.elementText = JSLib.build(["td", {
      class: "console-text",
      textContent: data
    }], this.element);
    this.elementCounter = JSLib.build(["td", {
      class: "console-repeat-counter",
      textContent: (count == 0 ? "" : count)
    }], this.element);
  }

  get rowNumber() {return +(this.elementRow.textContent);}
  set rowNumber(v) {this.elementRow.textContent = toString(v);}

  get date() {return this.elementDate.textContent;}
  set date(v) {this.elementDate.textContent = `[${v}]: `;}

  get text() {return this.elementText.textContent;}
  set text(v) {this.elementText.textContent = v;}

  get count() {
    let ret = this.elementCounter.textContent;
    if (!ret || ret == "") return 0;
    return +ret;
  }
  set count(v) {
    if (v === 0)
      this.elementCounter.textContent = "";
    else
      this.elementCounter.textContent = toString(v);
  }

  setCurrent() {
    this.date = (new Date()).toLocaleTimeString();
  }
}

export class ConsoleManager {
  constructor(container, consoleElement, inputElement) {
    this.container = container;
    this.consoleElement = consoleElement;
    this.inputElement = inputElement;
    this.inputEventListeners = [];
    this.printEventListeners = [];
    this.que = [];
    this.queValues = [];
    this.queLength = 1;
  }

  print(str, multiline = true) {
    // Search for duplicate messages; these will be consolidated
    let i = -1;
    for (let j = 0; j < this.que.length; j++) {
      if (this.que[j] === str) i = j;
    }

    if (i > -1) {
      // Duplicate found
      // Update table entry
      /** @type {ConsoleEntry} */
      let ret = this.queValues[i];
      ret.setCurrent();
      ret.count = ret.count + 1;
    } else {
      if (multiline) {
        for (let line of str.split("\n")) {
          this.print(line, false);
        }
      } else {
        // Append new log item
        let ret = new ConsoleEntry(
          this.consoleElement.childElementCount.toString(),
          (new Date()).toLocaleTimeString(),
          str
        );
        this.que.push(str);
        this.queValues.push(ret);
        this.consoleElement.append(ret.element);
      }
    }

    while (this.que.length > this.queLength) {
      // Truncate que to specified max length
      this.que.shift();
      this.queValues.shift();
    }
  }

  addInputEventListener(listener) {
    if (!this.inputEventListeners.includes(listener)) {
      this.inputEventListeners.push(listener);
    }
  }

  removeInputEventListener(listener) {
    let i = this.inputEventListeners.indexOf(listener);
    if (i != -1) {
      this.inputEventListeners.splice(i, 1);
    }
  }

  clearInputEventListeners() {
    this.inputEventListeners.length = 0;
  }

  addPrintEventListener(listener) {
    if (!this.printEventListeners.includes(listener)) {
      this.printEventListeners.push(listener);
    }
  }
  
  removePrintEventListener(listener) {
    let i = this.printEventListeners.indexOf(listener);
    if (i != -1) {
      this.inputEventListeners.splice(i, 1);
    }
  }

  clearPrintEventListeners() {
    this.printEventListeners.length = 0;
  }

  input(str) {
    this.print(str);

    let evt;
    for (let i = 0; i < this.inputEventListeners.length; i++) {
      evt = new CustomEvent("consoleInput", { detail: {value: str}, target: this });
      this.inputEventListeners[i](evt);
    }
  }

  clear() {
    this.consoleElement.replaceChildren();
  }
}

export default (target) => {
  target ??= document.getElementById("tab-cons");
  let ret;

  let container = JSLib.build([
    "div", {
      class: "console-container"
    }, [
      [ "div", { class: "console-bound" }]
    ]
  ], target);
  let consoleElement = JSLib.build([
    "table", {
      class: "console"
    }
  ], container.firstChild);
  let input;
  /**
   * @param {KeyboardEvent} event 
   */
  let inputfunc = function (event) {
    if (event.key.toLowerCase() == "enter" && !event.shiftKey) {
      event.preventDefault();
      let tmp = input.textContent;
      input.textContent = "";
      ret.input(tmp);
    }
  }
  input = JSLib.build([
    "div", {
      class: "console-input",
      contenteditable: true,
      onkeydown: inputfunc
    }
  ], container);

  ret = new ConsoleManager(container, consoleElement, input);
  return ret;
}