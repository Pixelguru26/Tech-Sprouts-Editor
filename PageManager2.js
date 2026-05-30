import * as dockview from "https://cdn.jsdelivr.net/npm/dockview@6.3.0/+esm";
document.dockview = dockview;

import DocsData from "./Tabs/docs.js";
import JSLib from "./SproutCore/lib.js";
import Editor from "./Tabs/code2.js";
import ConsoleManager from "./Tabs/console.js";
import SproutCore from "./SproutCore/core.js";

import { Tab, Panel, HeaderPlayButtonComponent, HeaderLogoComponent } from "./Tabs/DockviewComponents.js";

export default class PageManager {
  constructor(container) {
    this.container = container;
    this.api = dockview.createDockview(
      container, {
        theme: dockview.themeAbyss,
        createComponent: (options) => new Panel(options),
        createTabComponent: (options) => new Tab(options),
        createPrefixHeaderActionComponent: (group) => new HeaderLogoComponent(group),
        createRightHeaderActionComponent: (group) => new HeaderPlayButtonComponent(group)
      }
    );
    
    // ==========================================
    // DOCUMENTATION
    // ==========================================
    this.docsPanel = this.api.addPanel({
      id: "docs", title: "Documentation",
      component: "default", tabComponent: "default",
      params: {
        contents: DocsData
      }
    });

    // ==========================================
    // GAME CANVAS
    // ==========================================
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
    this.gamePanel = this.api.addPanel({
      id: "game", title: "Game",
      component: "default", tabComponent: "default",
      params: {
        contents: [JSLib.build([
          // Centering container for game screen
          "div", {
            class: "centercontainer",
            style: { height: "100%" }
          },
          // Elements in container
          gameCanvas,
          [ // Container div for UI, required to overlay on top of canvas
            "div", {
              style: { position: "absolute" }
            }, gameUI
          ]
        ])]
      }
    });

    // ==========================================
    // EDITOR
    // ==========================================
    let editor = new Editor();
    this.codePanel = this.api.addPanel({
      id: "code", title: "Code",
      component: "default", tabComponent: "default",
      params: {
        contents: [editor.editorElement]
      }
    });
    editor.init();
    let storagePath = "FILE-./main.py";
    let text = window.localStorage.getItem(storagePath);
    if (text === null) {
      window.localStorage.setItem(storagePath, "# from pylib.games.shooter import game");
    }
    editor.open(null, "./main.py");

    // ==========================================
    // CONSOLE
    // ==========================================
    let consoleElement = JSLib.buildElement("div", {style: {
      width: "100%", height: "100%"
    }});
    this.console = new ConsoleManager(consoleElement);
    this.consolePanel = this.api.addPanel({
      id: "console", title: "Console",
      component: "default", tabComponent: "default",
      position: { referencePanel: "game", direction: "below" },
      params: {
        contents: [consoleElement]
      }
    });

    // ==========================================
    // FUNCTIONALITY
    // ==========================================
    this.sproutCore = SproutCore;
    this.sproutCore.graphics.bindCanvasContext(gameCanvas.getContext("2d"));
    
    // Console input requests waiting
    // Prevents engine commands from interfering with Python input requests
    let requestQue = 0;

    this.sproutCore.addEventListener("print", (str) => {
      this.console.print(str);
    });
    this.sproutCore.addEventListener("error", (err, str, arr) => {
      this.console.print(str, true, true);
    });
    this.sproutCore.addEventListener("clear", () => {
      this.console.clear();
    });
    this.sproutCore.addEventListener("setui", (...elements) => {
      gameUI.replaceChildren(...elements);
    });

    // Resizing
    const layoutChange = () => {
      // Resize game canvas bounds
      const bounds = this.gamePanel.view.content.element.getBoundingClientRect();
      let w = bounds.width;
      let h = bounds.height;
      if (w !== gameCanvas.width || h !== gameCanvas.height) {
        gameCanvas.width = w;
        gameCanvas.height = h;
        gameUI.style.width = ("width", w + "px");
        gameUI.style.height = ("height", h + "px");
        /** @type {CanvasRenderingContext2D} */
        let ctx = gameCanvas.getContext("2d");
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
        this.sproutCore.resize(w, h);
      }
    };
    this.api.onDidLayoutChange(layoutChange);
    setTimeout(layoutChange, 0);
    
    HeaderPlayButtonComponent.addEventListener((start) => {
      HeaderPlayButtonComponent.locked = true;
      if (start) {
        this.sproutCore.run();
      } else {
        this.sproutCore.running = false;
      }
      HeaderPlayButtonComponent.locked = false;
    });
    this.sproutCore.addEventListener("gameStarted", () => {
      HeaderPlayButtonComponent.start();
    });
    this.sproutCore.addEventListener("gameStopped", () => {
      HeaderPlayButtonComponent.stop();
      requestQue = 0;
      this.console.clearInputEventListeners();
    });

    this.sproutCore.requestInput = async (prompt) => {
      requestQue++;
      let ret = await this.console.awaitInput(prompt);
      requestQue--;
      return ret;
    }

    // Engine console commands
    this.console.addInputEventListener((str) => {
      // Prevent engine commands from interfering with Python input requests
      if (requestQue === 0) {
        if (["clear", "cls"].includes(str.toLowerCase())) {
          this.console.clear();
        }
      }
    });

    document.addEventListener("keydown", (evt) => { this.sproutCore.keyDown(evt); });
    document.addEventListener("keyup", (evt) => { this.sproutCore.keyUp(evt); });
    document.addEventListener("mousedown", (evt) => { this.sproutCore.mouseDown(evt); });
    document.addEventListener("mouseup", (evt) => { this.sproutCore.mouseUp(evt); });
  }
}