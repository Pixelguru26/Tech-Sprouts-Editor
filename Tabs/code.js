import JSLib from "../SproutCore/lib.js";

export default class Editor {
  static lastid = 0;
  #stopThread = null;

  constructor(path = null, defaultValue = "") {
    this.defaultValue = defaultValue;
    this.editorElement = JSLib.buildElement("div", {class: "editor-container"});

    this.editor = ace.edit(this.editorElement, {
      mode: "ace/mode/python",
      theme: "ace/theme/monokai",
      autoScrollEditorIntoView: true,
      useSoftTabs: true,
      copyWithEmptySelection: true,
      mergeUndoDeltas: true,
      scrollPastEnd: 1
    });

    /** @type {string} Current autosave path. Defaults to "./autosave-#.txt" with unique #. */
    this.path = path ?? `./autosave-${Editor.lastid++}.txt`;
    /** @type {number} Autosave interval in seconds. */
    this.saveInterval = 1;

    this.timeStamp = Date.now();
    this.dirty = false;

    // Add event to mark editor for saving
    this.editor.addEventListener("change", (delta) => {
      this.markDirty();
    });
  }

  init() {
    this.loadOrDefault(this.defaultValue);
    this.startAutoSave();
  }

  startAutoSave() {
    this.stopAutoSave();
    // Create save thread
    this.autoSaveThread = (async () => {
      // Declared here to ensure multiple threads cannot run simultaneously.
      let running = true;
      while (running) {
        if (this.dirty && Date.now() > (this.timeStamp + this.saveInterval * 1000)) {
          this.autoSave();
        }
        await new Promise(r => {
          this.#stopThread = () => {
            running = false;
            r();
          };
          setTimeout(r, this.saveInterval * 1000)
        });
      }
    })();
  }

  stopAutoSave() {
    this.#stopThread?.();
  }

  markDirty() {
    this.dirty = true;
    this.timeStamp = Date.now();
  }

  autoSave() {
    window.localStorage.setItem(this.path, this.editor.getValue());
    this.dirty = false;
    this.timeStamp = Date.now();
  }

  loadOrDefault(defaultValue = "") {
    let save = window.localStorage.getItem(this.path);
    if (save && save !== "") {
      this.editor.setValue(save);
      this.dirty = false;
      this.timeStamp = Date.now();
    } else {
      this.editor.setValue(defaultValue);
      this.autoSave();
    }
  }
}