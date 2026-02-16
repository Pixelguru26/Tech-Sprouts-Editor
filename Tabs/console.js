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
    if (!ret || ret == "") return 1;
    return +ret;
  }
  set count(v) {
    if (v === 0 || v === 1)
      this.elementCounter.textContent = "";
    else
      this.elementCounter.textContent = v.toString();
  }

  setCurrent() {
    this.date = (new Date()).toLocaleTimeString();
  }
}

export default class ConsoleManager {
  constructor(parent) {
    this.que = [];
    this.queValues = [];
    this.parent = parent;
    this.inputEventListeners = [];
    this.printEventListeners = [];
    this.container = JSLib.build([
      "div", {
        class: "console-container"
      }, [
        [
          "div", { class: "console-bound" }
        ]
      ]
    ], parent);
    this.consoleElement = JSLib.buildElement("table", {
      class: "console"
    });
    this.container.firstChild.appendChild(this.consoleElement);
    this.inputElement = JSLib.buildElement("div", {
      class: "console-input",
      contenteditable: true,
      onkeydown: (event) => {
        if (event.key.toLowerCase() == "enter" && !event.shiftKey) {
          event.preventDefault();
          let tmp = this.inputElement.textContent;
          this.inputElement.textContent = "";
          this.input(tmp);
        }
      }
    }
    );
    this.container.appendChild(this.inputElement);
  }

  print(str, multiline = true, error = false) {
    if (!(str instanceof String)) {
      str = str.toString();
    }

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
        if (error) ret.element.classList.add("error");
        this.consoleElement.append(ret.element);
      }
    }

    while (this.que.length > this.queLength) {
      // Truncate que to specified max length
      this.que.shift();
      this.queValues.shift();
    }
  }

  /**
   * 
   * @param {function(string)} listener 
   */
  addInputEventListener(listener) {
    if (!this.inputEventListeners.includes(listener)) {
      this.inputEventListeners.push(listener);
    }
  }

  /**
   * 
   * @param {function(string)} listener 
   */
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
      // evt = new CustomEvent("consoleInput", { detail: {value: str}, target: this });
      this.inputEventListeners[i](str);
    }
  }

  clear() {
    this.consoleElement.replaceChildren();
  }
}