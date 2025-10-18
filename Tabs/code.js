import JSLib from "./lib.js";

export default () => {
  let tab = document.getElementById("tab-code");

  let editorElement = JSLib.build([
    "div", {
      id: "editor",
      style: {
        height: "100%"
      }
    }, []
  ], tab);

  let editor = ace.edit( editorElement, {
    mode: "ace/mode/python",
    theme: "ace/theme/monokai",
    autoScrollEditorIntoView: true
  });

  // Editor autosave system
  let editorTimeStamp = Date.now();
  let editorDirty = false;
  let editorSaveLoop = (async () => {
    while (true) {
      if (editorDirty && Date.now() > (editorTimeStamp + 1000)) {
        window.localStorage.setItem("./main.py", editor.getValue());
        editorDirty = false;
        editorTimeStamp = Date.now();
      }
      await new Promise(r => setTimeout(r, 1000));
    }
  })();
  // Store thread to return
  editor.autosaveThread = editorSaveLoop;

  editor.addEventListener("change", (delta) => {
    editorDirty = true;
    editorTimeStamp = Date.now();
  });

  let save = window.localStorage.getItem("./main.py");
  if (save && save !== "") {
    editor.setValue(save);
  } else {
    // todo: default python
  }

  return editor;
}