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
  constructor(console) {
    this.console = console;
    this.que = [];
    this.queValues = [];
    this.queLength = 1;
  }

  print(str) {
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
      // Append new log item
      let ret = new ConsoleEntry(
        this.console.childElementCount.toString(),
        (new Date()).toLocaleTimeString(),
        str
      );
      this.que.push(str);
      this.queValues.push(ret);
      this.console.append(ret.element);
      console.log(str);
    }

    while (this.que.length > this.queLength) {
      // Truncate que to specified max length
      this.que.shift();
      this.queValues.shift();
    }
  }
}

export default () => {
  let tab = document.getElementById("tab-cons");

  let container = JSLib.build([
    "div", {
      id: "console-container"
    }
  ], tab);
  let console = JSLib.build([
    "table", {
      id: "console"
    }
  ], container);

  return new ConsoleManager(console);
}