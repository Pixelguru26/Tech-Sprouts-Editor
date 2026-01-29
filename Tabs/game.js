import JSLib from "./lib.js";

class GameTab {
  constructor(tab, consoleManager) {
    this.tab = tab;
    this.consoleManager = consoleManager;
    this.container = JSLib.build([
      "div", {
        class: "centercontainer",
        style: { height: "100%" }
      }
    ], tab);
    this.canvas = JSLib.build([
      "canvas", {
        id: "game-canvas",
        width: 900,
        height: 600
      }
    ], this.container);
    this.uiContainer = JSLib.build([
      "div", {
        style: { position: "absolute" }
      }
    ], this.container);
    this.uiCanvas = JSLib.build([
      "div", {
        id: "game-ui",
        style: {
          position: "relative",
          width: "900px",
          height: "600px"
        }
      }
    ], this.uiContainer);
  }
}

export default (consoleManager) => {
  let tab = document.getElementById("tab-game");
  let ret = new GameTab(tab, consoleManager);

  let reloadIcon = JSLib.buildElement("i", {
    id: "game-reload",
    class: "fa fa-play refresh-button",
    style: {
      float: "right",
      padding: "0px 4px",
      fontSize: "1.17em",
      textShadow: "0 0 4px white"
    }
  });
  reloadIcon.spinnerAnimation = reloadIcon.animate([
    {
      textShadow: "0 0 4px white"
    },
    {
      textShadow: "0 0 0px white"
    },
    {
      textShadow: "0 0 4px white"
    }
  ], {
    duration: 1000,
    easing: "linear",
    iterations: Infinity
  });
  reloadIcon.spinnerAnimation.cancel();
  let navbar = document.getElementById("navbar");
  navbar.append(reloadIcon);
  // reloadIcon.addEventListener("pointerdown", async () => {
  //   reloadIcon.classList.remove("fa-play");
  //   reloadIcon.classList.add("fa-stop");
  //   reloadIcon.spinnerAnimation.play();
  // });
  // reloadIcon.addEventListener("pointerout", () => {
  //   reloadIcon.classList.remove("fa-stop");
  //   reloadIcon.classList.add("fa-play");
  //   reloadIcon.spinnerAnimation.pause();
  // });
  return ret;
}