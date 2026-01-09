import JSLib from "./lib.js";

export class FileBrowser {
  constructor() {
    this.path = "";
  }
}

export default () => {
  let tab = document.getElementById("tab-test");
  let core = document.SproutCore;
  if (!core) throw new Error("Core not found. Testing cannot be initiated.");

  let container = JSLib.build([
    "div", {
      id: "test-container"
    }
  ], tab);

  let testBrowser = JSLib.build([
    "div", {
      class: "filemgr",
      style: {
        backgroundColor: "black",
        width: "100px",
        height: "100px",
        flexDirection: "column"
      }
    }, [
      ["div", {
        style: {
          backgroundColor: "white"
        }
      }],
      ["div", {
        style: {
          backgroundColor: "green",
          flexDirection: "column"
        }
      }, [
        ["div", {

        }, [

        ]],
        ["div", {

        }, [
          ["nav", {
            class: "navpane"
          }, "Hep"]
        ]]
      ]]
    ]
  ], container);

  return container;
}