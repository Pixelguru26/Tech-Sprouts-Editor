SproutCore.registerLib("stateMenu", ["state"], (game) => {
  game.gameStates["menu"] = new (class g extends game.gameState {
    showPlayer = false;
    load() {
      super.load();
      let ui = JSLib2.buildTree(["div", {
        style: {
          width: "100%",
          height: "100%",
          display: "flex"
        }
      }, [
          ["div", { style: { flexGrow: 1 } }],
          ["div", {
            style: {
              display: "flex",
              flexDirection: "column",
            }
          }, [
            ["h1", {
              id: "game-menu-title",
              textContent: game.title,
              style: {
                paddingTop: "100px",
                paddingBottom: "100px"
              }
            }],
            ["div", {
              id: "game-menu-buttons",
              style: {
                flexGrow: 1,
                marginBottom: "10px",
                overflow: "scroll",
                display: "flex",
                flexDirection: "column"
              }
            }]
          ]],
          ["div", { style: { flexGrow: 1 } }]
        ]
      ]);
      this.title = ui.querySelector("#game-menu-title");
      this.buttonMenu = ui.querySelector("#game-menu-buttons");
      this.uiElements.push(ui);
      this.addMenuButton("Play", () => {
        game.setState("game");
      });
      this.addMenuButton("Test", () => {
        console.log("Test");
      });
    }

    addMenuButton(text, fn) {
      // Todo: Find a way to affect this with stylesheets
      // Possibly templates?
      let ret = JSLib2.buildTree(["button", {
        textContent: text,
        onclick: fn,
        style: {
          backgroundColor: "#122D1E",
          color: "white",
          fontWeight: "bold",
          padding: "6px 18px",
          borderRadius: "5px",
          userSelect: "none",
          border: "none",
          verticalAlign: "middle",
          textAlign: "center",
          cursor: "pointer",
          whiteSpace: "nowrap",
          marginTop: "2px",
          marginBottom: "2px"
        }
      }], this.buttonMenu);
      // Events just to add the effects of hover and click
      ret.addEventListener("pointerover", () => {
        ret.style.backgroundColor = "#1C4D3D";
      });
      ret.addEventListener("pointerout", () => {
        ret.style.backgroundColor = "#122D1E";
        ret.style.padding = "6px 18px";
        ret.style.boxShadow = "none";
        ret.style.color = "white";
      });
      ret.addEventListener("pointerdown", () => {
        ret.style.backgroundColor = "#122D1E";
        ret.style.padding = "8px 18px 4px 18px";
        ret.style.boxShadow = "0 2px #07150D inset";
        ret.style.color = "lightslategray";
      });
      ret.addEventListener("pointerup", () => {
        ret.style.backgroundColor = "#122D1E";
        ret.style.padding = "6px 18px";
        ret.style.boxShadow = "none";
        ret.style.color = "white";
      });
      return ret;
    }

    enter() {
      super.enter();
      // if (game.player) game.player.alive = false;
    }
    exit(tgt) {
      super.exit(tgt);
      // if (game.player) game.player.alive = true;
    }

    update(dt) {
      // Todo: make this actually event driven
      if (game.title !== this.title.textContent && JSLib2.isString(game.title)) {
        this.title.textContent = game.title;
      }
    }
  })();
});