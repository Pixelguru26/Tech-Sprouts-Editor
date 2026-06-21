import JSLib from "../SproutCore/lib.js";

function removeMatching(array, item) {
  let ret = 0;
  for (let i = 0; i < array.length; i++) {
    if (array[i] === item) {
      array.splice(i, 1);
      ret++;
      i--;
    }
  }
  return ret;
}

export class Tab {
  constructor(options) {
    this._element = document.createElement("div");
  }
  init(params) {
    this._element.textContent = params?.title ?? "Unnamed Tab";
  }
  get element() { return this._element; }
}

export class Panel {
  constructor(options) {
    this._element = JSLib.buildElement("div", {
      style: {
        width: "100%", height: "100%",
        overflow: "scroll"
      }
    });
  }
  init(params) {
    this._element.replaceChildren(...params.params.contents);
  }
  get element() { return this._element; }
}

export class HeaderLogoComponent {
  constructor(group) {
    this._element = JSLib.buildElement("div", {
      class: "dockview-header-logo"
    });
  }
  init(params) {
  }
  dispose() {}
}

export class HeaderPlayButtonComponent {
  constructor(group) {
    this._element = JSLib.buildElement("div", {
      class: "dv-header"
    });
  }
  static running = false;
  static locked = false;
  init(params) {
    this._element.appendChild(JSLib.buildElement("i", {
      name: "game-play-button",
      class: "fa fa-play refresh-button animated game-play-button",
      onclick: (evt) => {
        if (HeaderPlayButtonComponent.running) {
          HeaderPlayButtonComponent.stop();
          for (let listener of HeaderPlayButtonComponent.listeners) listener(false);
        } else {
          HeaderPlayButtonComponent.start();
          for (let listener of HeaderPlayButtonComponent.listeners) listener(true);
        }
      }
    }));
  }
  get element() { return this._element; }
  dispose() {}

  static listeners = [];
  static addEventListener(listener) {
    if (!this.listeners.includes(listener)) {
      this.listeners.push(listener);
    }
  }
  static removeEventListener(listener) {
    return removeMatching(this.listeners, listener);
  }
  static start() {
    if (!this.locked && !this.running) {
      this.running = true;
      document.getElementsByName("game-play-button").forEach((v) => {
        v.classList.add("animated");
        v.classList.remove("fa-play");
        v.classList.add("fa-stop");
      });
    }
  }
  static stop() {
    if (!this.locked && this.running) {
      this.running = false;
      document.getElementsByName("game-play-button").forEach((v) => {
        v.classList.remove("animated");
        v.classList.remove("fa-stop");
        v.classList.add("fa-play");
      });
    }
  }
}

export class HeaderComponent {
  constructor(group) {
    this._element = JSLib.buildElement("div", {
      class: "dockview-groupcontrol"
    });
  }
  init(params) {
    const group = params.group;
    const content = JSLib.buildElement("span", {
      class: "dockview-groupcontrol-content",
      textContent: "henlo"
    });
    this._element.appendChild(content);
  }
  get element() { return this._element; }
  dispose() {}
}