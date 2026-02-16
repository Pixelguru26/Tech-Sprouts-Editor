import { TabManager, Tab } from './Tabs/TabManager.js';
import ConsoleManager from "./Tabs/console.js";
import JSLib from './Tabs/lib.js';
import DocsData from './Tabs/docs.js';
import Editor from './Tabs/code.js';
import SproutCore from './SproutCore/neocore.js';

export default class PageManager {
  constructor(container) {
    this.container = container;
    this.tabs = new TabManager(container);

    // Docs tab
    let docscontent = JSLib.buildElement("div", { class: "docs-content" });
    docscontent.append(...DocsData);
    this.tabs.addTab(new Tab(
      "docs", "Documentation", docscontent
    ));

    // Game tab
    let gameCanvas = JSLib.buildElement("canvas", {
      class: "game-canvas",
      width: 900,
      height: 600
    });
    let gameUI = JSLib.buildElement("div", {
      class: "game-ui",
      style: {
        width: "900px",
        height: "600px"
      }
    });
    this.tabs.addTab(new Tab(
      "game", "Game", JSLib.build([
        "div", {
          class: "centercontainer",
          style: { height: "100%" }
        },
        gameCanvas,
        [
          "div", {
            style: { position: "absolute" }
          },
          gameUI
        ]
      ])
    ));

    // Code tab
    let editor = new Editor("./main.py");
    editor.loadOrDefault("# from pylib.games.shooter import game");
    this.tabs.addTab(new Tab("code", "Code", editor.editorElement));
    editor.init();

    this.console = new ConsoleManager(this.tabs.body);

    // Initialize SproutCore
    this.sproutCore = SproutCore;
    this.sproutCore.graphics.bindCanvasContext(gameCanvas.getContext("2d"));
    this.sproutCore.addEventListener("print", (str) => {
      this.console.print(str);
    });
    this.sproutCore.addEventListener("error", (err, str, arr) => {
      this.console.print(str, true, true);
    });
    this.console.addInputEventListener((text) => {
      this.sproutCore.callPyEvent("input", text);
    });
    this.sproutCore.addEventListener("setui", (...elements) => {
      gameUI.replaceChildren(...elements);
    });
    document.addEventListener("keydown", (evt) => {this.sproutCore.keydown(evt);});
    document.addEventListener("keyup", (evt) => {this.sproutCore.keyup(evt);});
    document.addEventListener("mousedown", (evt) => {this.sproutCore.mousedown(evt);});
    document.addEventListener("mouseup", (evt) => {this.sproutCore.mouseup(evt);});
    this.sproutCore.run();
  }
}