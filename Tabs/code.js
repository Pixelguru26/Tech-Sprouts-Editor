import JSLib from "../SproutCore/lib.js";
import snips from "./autocompletes.js";

const completer = {
  getCompletions: (editor, session, pos, prefix, callback) => {
    const suggestions = snips.map(keyword => {
      if (JSLib.isString(keyword)) {
        return { name: keyword, value: keyword, score: 1000 };
      } else {
        return keyword;
      }
    });
    callback(null, suggestions);
  }
};

export default class Editor {
  #stopThread = null; // Current function to interrupt the autosave thread. Updated each time autosave cycles.

  constructor() {
    this.editorElement = JSLib.buildElement("div", {
      class: "editor-container"
    });
    ace.require("ace/ext/language_tools");
    ace.require("ace/ext/code_lens");
    ace.require("ace/ext/command_bar");
    ace.require("ace/ext/searchbox");
    ace.require("ace/ext/inline_autocomplete");
    ace.require("ace/ext/keybinding_menu");
    ace.require("ace/ext/options");
    ace.require("ace/ext/settings_menu");
    let snipper = ace.require("ace/snippets").snippetManager;
    this.editor = ace.edit(this.editorElement, {
      mode: "ace/mode/python",
      theme: "ace/theme/monokai",
      autoScrollEditorIntoView: true,
      useSoftTabs: true,
      copyWithEmptySelection: true,
      mergeUndoDeltas: true,
      scrollPastEnd: 1
    });
    // add command to lazy-load keybinding_menu extension
    this.editor.commands.addCommand({
      name: "showKeyboardShortcuts",
      bindKey: { win: "Ctrl-Alt-h", mac: "Command-h" },
      exec: function (editor) {
        ace.config.loadModule("ace/ext/keybinding_menu", function (module) {
          module.init(editor);
          editor.showKeyboardShortcuts()
        })
      }
    });
    this.editor.setOptions({
      enableBasicAutocompletion: [completer],
      enableSnippets: true,
      enableLiveAutocompletion: true
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
    if (!window.localStorage.getItem("hasShownKeyboardShortcuts")) {
      window.localStorage.setItem("hasShownKeyboardShortcuts", Date.now());
      this.editor.execCommand("showKeyboardShortcuts");
    }
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