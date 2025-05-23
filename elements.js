var JSECore = class {
  static mousemove(evt) {

  }
  static mouseup(evt) {

  }
  static mousedown(evt) {

  }
  /**
   * 
   * @param {MouseEvent} evt 
   */
  static mouseEvent(evt) {
    switch (evt.type) {
      case "mousemove":
        this.mousemove(evt);
        break;
      case "mouseup":
        this.mouseup(evt);
        break;
      case "mousedown":
        this.mousedown(evt);
        break;
    }
  }
};

class JSEBase extends HTMLElement {
  /** @type {HTMLTemplateElement} Template used for all instances of this element once set. */
  static template = null;
  /** @type {Array<HTMLSlotElement>} Container for template slots, which will be replaced once filled. */
  templateSlots = [];
  slotProgress = 0;
  constructor() { super(); }

  /**
   * Internal function used to recursively search an element tree.
   * @param {HTMLElement} parent 
   * @param {string} id 
   */
  static getSubElementById(parent, id) {
    if (parent.id === id) return parent;
    let ret;
    for (let child of parent.children) {
      ret = JSEBase.getSubElementById(child, id);
      if (ret) return ret;
    }
    return null;
  }
  /**
   * Recursively searches an element tree until the search function returns true.
   * @param {HTMLElement} parent 
   * @param {function(HTMLElement):boolean} fn 
   * @returns {HTMLElement?}
   */
  static getSubElementByFn(parent, fn) {
    if (fn(parent)) return parent;
    let ret;
    for (let child of parent.children) {
      ret = JSEBase.getSubElementByFn(child, fn);
      if (ret) return ret;
    }
    return null;
  }
  /**
   * Provides similar functionality to the dom function,
   * but restricted to the scope of this element and its children.
   * @param {string} id 
   * @returns {HTMLElement}
   */
  getElementById(id) {
    return JSEBase.getSubElementById(this, id);
  }

  /**
   * Fills a flat array with all slot elements
   * in an element tree for templating purposes.
   * @param {HTMLElement} element 
   * @param {Array<HTMLElement>} slots 
   */
  static readTemplateSlots(element, slots) {
    let v;
    for (let i = 0; i < element.children.length; i++) {
      v = element.children[i];
      if (v.tagName === "SLOT") {
        slots.push(v);
      } else {
        this.readTemplateSlots(v, slots);
      }
    }
    return slots;
  }

  /**
   * Root method provides templating and observer functionality.\
   * Highly recommended to keep it in derived classes.
   */
  connectedCallback() {
    // A stupid guard because web is stupid and calls this multiple times
    if (!this.__initialized) {
      let proto = this.__proto__.constructor;
      let collected = Array.from(this.children);
      // Import template
      if (proto.template) {
        this.replaceChildren(proto.template.content.cloneNode(true));
        JSEBase.readTemplateSlots(this, this.templateSlots);
        for (let i = 0; i < collected.length; i++) {
          if (this.onAddElement(collected[i])) {
            this.append(collected[i]);
          }
        }
      } else {
        for (let i = 0; i < collected.length; i++) {
          if (!this.onAddElement(collected[i])) {
            this.removeChild(collected[i]);
          }
        }
      }
      // Process initial children
      // Attach observer
      this.observer = new MutationObserver((changes) => {
        for (let change of changes) {
          if (change.target === this) {
            if (!this.onChanged(change)) {
              // Automatically revert external changes if not explicitly allowed.
              for (let node of change.addedNodes) {
                this.removeChild(node);
              }
            }
          } else {
            this.onChildChanged?.(change);
          }
        }
      });
      this.__initialized = true;
    }
  }

  /**
   * Tests a candidate element against the parameters of the slot.
   * Currently supports "type" filter.
   * @param {HTMLSlotElement} slot 
   * @param {HTMLElement} candidate 
   * @returns {boolean}
   */
  static slotFilter(slot, candidate, approveEmpty = true) {
    let attr = slot.getAttribute("type");
    if (!attr && approveEmpty) return true;
    if (attr.toUpperCase() == candidate.tagName) return true;
    return false;
  }
  static slotEmpty(slot) {
    return !(slot.getAttribute("type"));
  }
  /**
   * Fires whenever an element is added, either on initialization or later.\
   * The inverse does not exist, use onChanged instead.
   * @param {HTMLElement} element
   * @returns {boolean} true if the original element should be kept, false if it should be consumed.
   */
  onAddElement(element) {
    /** @type {HTMLElement} */
    let slot;
    for (let i = 0; i < this.templateSlots.length; i++) {
      slot = this.templateSlots[i];
      if (JSEBase.slotFilter(slot, element)) {
        if (slot.getAttribute("multi")) {
          // Elements are added, but the slot remains, allowing future insertions.
          slot.before(element);
        } else {
          // By default, the slot is entirely replaced with the candidate node,
          // and removed from the tree.
          slot.replaceWith(element);
          this.templateSlots.splice(i, 1);
        }
        return;
      }
    }
    for (let i = 0; i < this.templateSlots.length; i++) {
      slot = this.templateSlots[i];
      if (JSEBase.slotEmpty(slot)) {
        if (slot.getAttribute("multi")) {
          slot.before(element);
        } else {
          slot.replaceWith(element);
          this.templateSlots.splice(i, 1);
        }
        return;
      }
    }
    // Candidate element did not fit into any slots.
    // May eventually add "overflow" slot here.
  }
  /**
   * Fires whenever a direct child of this element is added or removed.\
   * Not required for onAddElement() to function.
   * @param {MutationRecord} change 
   */
  onChanged(change) {

  }
}
class JSEDocFunction extends JSEBase {
  static template = document.getElementById("template-doc-fn");
  constructor() {
    super();
  }
  onAddElement(element) {
    super.onAddElement(element);
  }
}
customElements.define("jse-docfn", JSEDocFunction);
class JSEDocFunctionParam extends JSEBase {
  static template = document.getElementById("template-doc-fn-param");
  constructor() {
    super();
  }
}
customElements.define("jse-docfn-param", JSEDocFunctionParam);

class JSENewTabbedPanel extends HTMLElement {
  static __id = 0;

  tabs = [];
  lastTab = null;
  
  constructor() {
    super();
    this.attachShadow({mode: "open"});
    this.shadowRoot.append(JSLib2.build("link", {
      rel: "stylesheet",
      type: "text/css",
      href: "./JSEStyles/JSETabContainer.css",
    }));
    this.navbar = JSLib2.build("nav");
    this.shadowRoot.append(this.navbar);
    this.body = JSLib2.build("main");
    this.shadowRoot.append(this.body);
    this.__id = JSENewTabbedPanel.__id++;
  }
  
  updateNodes(nodes) {
    for (let node of nodes) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        this.removeChild(node);
        if (["STYLE", "SCRIPT", "LINK"].includes(node.tagName)) {
          this.shadowRoot.prepend(node);
        } else {
          this.addTab(node);
        }
      }
    }
  }

  connectedCallback() {
    JSLib2.style(this, {
      width: "100%",
      height: "100%",
      position: "relative",
      display: "flex",
      flexDirection: "column",
      borderRadius: "4px",
      overflow: "hidden",
      border: "2px solid #122"
    });
    this.updateNodes(this.childNodes);
    this.observer = new MutationObserver((changes) => {
      for (let change of changes) {
        if (change.target === this) {
          this.onChanged(change);
        }
      }
    });
    this.observer.observe(this, {childList: true});
  }

  /**
   * @param {MutationRecord} change 
   */
  onChanged(change) {
    this.updateNodes(change.addedNodes);
  }

  static tab = class Tab {
    /**
     * @param {HTMLElement} content 
     */
    constructor(parent, content, title = null) {
      this.parent = parent;
      // Sequential priorities for possible titles
      title ||= (content.title != "") && content.title;
      title ||= (content.id != "") && content.id?.capitalize();
      title ||= "New Tab"; // Default if no others specified
      this.title = title;

      this.label = JSLib2.build("div", {
        class: "jse-tab prevent-select",
        textContent: title,
        style: {
          position: "relative"
        }
      });
      let tooltip;
      for (const element of content.children) {
        if (element.tagName === "SUMMARY") {
          tooltip = element;
          break;
        }
      }
      if (tooltip) {
        tooltip.remove();
        this.tooltip = JSLib2.build("div", {
          class: "jse-tab-tooltip",
          style: {
            position: "absolute"
          }
        });
        this.tooltip.append(tooltip);
        this.label.append(this.tooltip);
      }
      this.label.tabParent = this;
      this.content = content;
      this.__content_original_display = content.style.display;
      content.style.display = "none";
      this.label.onclick = function(evt) {
        this.tabParent.parent.setTab(this.tabParent);
      }
    }

    set contentVisible(v) {
      this.content.style.display = v ? this.__content_original_display : "none";
    }
    get contentVisible() {
      return this.content.style.display !== "none";
    }

    toggleContentVisible() {
      this.contentVisible = !this.contentVisible;
    }

    activate() {
      this.contentVisible = true;
      this.label.classList.add("active");
    }
    deactivate() {
      this.contentVisible = false;
      this.label.classList.remove("active");
    }
  }

  addTab(content, title = null) {
    let tab = new JSENewTabbedPanel.tab(this, content, title);
    this.tabs.push(tab);
    this.navbar.append(tab.label);
    this.body.append(tab.content);
    if (this.tabs.length < 2) {
      this.setTab(tab);
    } else {
      let usrstoreid = `JSENewTabbedPanel#${this.__id}.tabState`;
      if (window.localStorage.getItem(usrstoreid) == tab.title) this.setTab(tab);
    }
    return tab;
  }
  setTab(tab) {
    tab = this.tabs[tab] || tab;
    if (tab instanceof JSENewTabbedPanel.tab) {
      this.lastTab?.deactivate();
      tab.activate();
      if (this.tabs.length > 1) {
        let usrstoreid = `JSENewTabbedPanel#${this.__id}.tabState`;
        window.localStorage.setItem(usrstoreid, tab.title);
      }
      this.lastTab = tab;
      return tab;
    }
  }
}
customElements.define("jse-tab", JSENewTabbedPanel.tab);
customElements.define("jse-new-tabbed-panel", JSENewTabbedPanel);

class Gradient {
  stops = [];
  constructor(...stops) {
    let stop;
    for (let i = 0; i < stops.length; i++) {
      this.stops.push(stops[i])
    }
  }

  addStop(x, left, right = null) {
    let stop = new Gradient.ColorStop(x, left, right);
  }

  static ColorStop = class ColorStop {
    constructor(x, left, right = null) {
      this.x = x;
      this.left = left;
      this.right = right ?? left;
    }
  }
}

class JSEScrep extends HTMLElement {
  static __cache = {};
  static __lastID = 0;
  constructor() {
    super();
    JSEScrep.__cache[this.id = JSEScrep.__lastID++] = this;
  }
  connectedCallback() {
    let content = this.textContent;
  }
}
