SproutCore.registerLib("stateDeath", ["state"], (game) => {
  game.gameStates["gameover"] = new (class g extends game.gameState {
    showPlayer = false;
    load() {
      super.load();
      let button = JSLib2.build("button", {
        textContent: "Exit",
        onclick: () => { game.setState("menu"); },
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
      });
      button.addEventListener("pointerover", () => {
        button.style.backgroundColor = "#1C4D3D";
      });
      button.addEventListener("pointerout", () => {
        button.style.backgroundColor = "#122D1E";
        button.style.padding = "6px 18px";
        button.style.boxShadow = "none";
        button.style.color = "white";
      });
      button.addEventListener("pointerdown", () => {
        button.style.backgroundColor = "#122D1E";
        button.style.padding = "8px 18px 4px 18px";
        button.style.boxShadow = "0 2px #07150D inset";
        button.style.color = "lightslategray";
      });
      button.addEventListener("pointerup", () => {
        button.style.backgroundColor = "#122D1E";
        button.style.padding = "6px 18px";
        button.style.boxShadow = "none";
        button.style.color = "white";
      });
      let ui = JSLib2.buildTree(["div", {
        style: {
          width: "100%",
          height: "100%",
          display: "flex"
        }
      }, [
          ["div", { style: {flexGrow: 1} }],
          ["div", {
            style: {
              display: "flex",
              flexDirection: "column"
            }
          }, [
            ["h1", {
              textContent: "Game over",
              style: {
                paddingTop: "100px",
                paddingBottom: "100px",
                color: "darkred"
              }
            }],
            ["h2", {
              id: "game-score",
              textContent: "--",
            }],
            button
          ]],
          ["div", { style: {flexGrow: 1} }]
        ]
      ]);
      this.uiElements.push(ui);
    }
  })();
});