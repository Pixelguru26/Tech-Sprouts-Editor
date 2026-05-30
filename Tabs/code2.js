import JSLib from "../SproutCore/lib.js";

export default class Editor {
  #stopThread = null; // Current function to interrupt the autosave thread. Updated each time autosave cycles.

  constructor() {
    this.editorElement = JSLib.buildElement("div", {
      class: "editor-container"
    });
    this.editor = ace.edit(this.editorElement, {
      mode: "ace/mode/python",
      theme: "ace/theme/monokai",
      autoScrollEditorIntoView: true,
      useSoftTabs: true,
      copyWithEmptySelection: true,
      mergeUndoDeltas: true,
      scrollPastEnd: 1
    });

    /** @type {string} */
    this.path = null;
    /** @type {number} Autosave interval in seconds. */
    this.saveInterval = 1;

    this.timeStamp = Date.now();
    this.dirty = false;
    this.editor.addEventListener("change", (delta) => {
      this.markDirty();
    });
  }

  init() {
    this.startAutoSave();
  }

  startAutoSave() {
    this.stopAutoSave();
    // Create save thread
    this.autoSaveThread = (async () => {
      let running = true;
      while (running) {
        if (this.path !== null && this.dirty) {
          if (Date.now() > (this.timeStamp + this.saveInterval * 1000)) {
            this.autoSave();
          }
        }
        await new Promise(r => {
          // Ensure thread abort is always up to date
          this.#stopThread = () => {
            running = false;
            r();
          };
          setTimeout(r, this.saveInterval * 1000);
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
    // Todo: integrate with Pyodide file system
    // Or perhaps not? I just remembered that the game fetches local storage "files" into Pyodide as needed. This might be sufficient.
    if (this.path !== null) {
      window.localStorage.setItem(`FILE-${this.path}`, this.editor.getValue());
    }
    this.dirty = false;
    this.timeStamp = Date.now();
  }

  open(py, path) {
    this.path = path;
    let text = window.localStorage.getItem(`FILE-${this.path}`);
    this.editor.setValue(text);
  }
}