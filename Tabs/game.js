import JSLib from "./lib.js";

export default () => {
  let tab = document.getElementById("tab-game");

  JSLib.build([
    "canvas", {
      id: "game-canvas",
      width: 900,
      height: 600
    }
  ], tab);
  JSLib.build([
    "div", {
      style: {
        position: "absolute",
      }
    }, [
      [
        "div", {
          id: "game-ui",
          style: {
            position: "relative",
            width: "900px",
            height: "600px"
          }
        }
      ]
    ]
  ], tab);

  let reloadIcon = JSLib.buildElement("i", {
    id: "game-reload",
    class: "fa fa-refresh refresh-button",
    style: {
      float: "right",
      padding: "0px 4px",
      fontSize: "1.17em",
    }
  });
  reloadIcon.spinnerAnimation = reloadIcon.animate([
    { transform: "rotate(0deg)" },
    { transform: "rotate(360deg)" }
  ], {
    duration: 2000,
    easing: "linear",
    iterations: Infinity
  });
  reloadIcon.spinnerAnimation.pause();
  let navbar = document.getElementById("navbar");
  navbar.append(reloadIcon);
  reloadIcon.addEventListener("pointerdown", async () => {
    reloadIcon.spinnerAnimation.play();
  });
  reloadIcon.addEventListener("pointerout", () => {
    reloadIcon.spinnerAnimation.pause();
  });
}