import JSLib from './lib.js';

export class Tab {
  static style = null;

  constructor(id, title, content) {
    this.id = id;
    this.title = JSLib.buildElement("span", { textContent: title });
    this.content = content;
    this.head = JSLib.build(["div", { class: "tab-head" }, [this.title]]);
    this.body = JSLib.build(["div", { class: "tab-content hidden" }, [content]]);
    this.eventListeners = {};
    this.head.addEventListener("click", () => {
      this.click();
    });
  }

  addActivateListener(listener) {
    this.eventListeners.activate ??= [];
    this.eventListeners.activate.push(listener);
  }
  addDeactivateListener(listener) {
    this.eventListeners.deactivate ??= [];
    this.eventListeners.deactivate.push(listener);
  }
  addClickListener(listener) {
    this.eventListeners.click ??= [];
    this.eventListeners.click.push(listener);
  }
  clearListeners() {
    if (this.eventListeners.activate) this.eventListeners.activate.length = 0;
    if (this.eventListeners.deactivate) this.eventListeners.deactivate.length = 0;
    if (this.eventListeners.select) this.eventListeners.select.length = 0;
  }

  click() {
    if (this.eventListeners.click) {
      for (let listener of this.eventListeners.click) {
        listener(this);
      }
    }
    this.activate();
  }

  activate() {
    this.head.classList.add("active");
    this.body.classList.remove("hidden");
    if (this.eventListeners.activate) {
      for (let listener of this.eventListeners.activate) {
        listener(this);
      }
    }
  }

  deactivate() {
    this.head.classList.remove("active");
    this.body.classList.add("hidden");
    if (this.eventListeners.deactivate) {
      for (let listener of this.eventListeners.deactivate) {
        listener(this);
      }
    }
  }
}

export class TabManager {
  constructor(parent = null) {
    this.tabs = [];
    this.currentTab = null;
    if (!Tab.style) {
      Tab.style = JSLib.buildElement("link", { rel: "stylesheet", href: "Tabs/TabManager.css" });
      document.head.appendChild(Tab.style);
    }
    this.container = JSLib.buildElement("div", { class: "tab-container" });
    this.navbar = JSLib.buildElement("div", { class: "tab-navbar" });
    this.container.appendChild(this.navbar);
    this.body = JSLib.buildElement("div", { class: "tab-body" });
    this.container.appendChild(this.body);
    parent?.appendChild(this.container);
  }

  addTab(tab, index = -1) {
    if (index === -1 || index >= this.tabs.length) {
      this.tabs.push(tab);
      this.navbar.appendChild(tab.head);
    } else {
      this.tabs.splice(index, 0, tab);
      this.navbar.insertBefore(tab.head, this.navbar.children[index]);
    }
    this.body.appendChild(tab.body);
    tab.addClickListener(() => {
      if (this.currentTab !== tab.id) {
        this.setTab(tab.id);
      }
    });
    // tab.addDeactivateListener(() => {
    //   if (this.currentTab === tab.id) {
    //     let index = this.tabs.findIndex(t => t.id === tab.id);
    //     if (index > 0) {
    //       this.setTab(this.tabs[index - 1].id);
    //     } else if (this.tabs.length > 1) {
    //       this.setTab(this.tabs[1].id);
    //     } else {
    //       this.currentTab = null;
    //     }
    //   }
    // });
    if (this.tabs.length === 1) {
      this.setTab(tab.id);
    }
  }

  remTab(id) {
    let tab, index;
    for (let i = 0; i < this.tabs.length; i++) {
      if (this.tabs[i].id === id) {
        tab = this.tabs[i];
        index = i;
        break;
      }
    }
    if (tab) {
      this.tabs.splice(index, 1);
      tab.head.remove();
      tab.body.remove();
      if (this.currentTab === id) {
        if (index > 0) {
          this.setTab(this.tabs[index - 1].id);
        } else if (this.tabs.length > 0) {
          this.setTab(this.tabs[0].id);
        } else {
          this.currentTab = null;
        }
      }
      return tab;
    }
  }

  getTab(id) {
    for (let tab of this.tabs) {
      if (tab.id === id) return tab;
    }
  }

  setTab(tgtid) {
    if (this.currentTab === tgtid) return true;
    for (let tab of this.tabs) {
      if (tab.id === tgtid) {
        this.currentTab = tgtid;
        tab.activate();
      } else {
        tab.deactivate();
      }
    }
  }
}