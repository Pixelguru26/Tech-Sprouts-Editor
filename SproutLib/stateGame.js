SproutCore.registerLib("stateGame", ["state", "entityEnemy"], (game) => {
  game.gameStates["game"] = new (class g extends game.gameState {
    constructor() {
      super();
      this.autoSpawners = [];
    }
    enter() {
      super.enter();
      this.autoSpawners.forEach(spawner => { spawner.start(); });
      // This is necessary due to a bug with leftover special effects
      game.entities.forEach(v => {
        v.delete("delete");
      });
      game.entities.clear();
      game.entityque.clear();
      game.bullets.forEach(v => {
        v.delete("delete");
      })
      game.bullets.clear();
      game.bulletque.clear();
    }
    exit(targetState) {
      super.exit(targetState);
      this.autoSpawners.forEach(spawner => {spawner.stop();});
      game.entities.forEach(v => {
        v.delete("delete");
      });
      game.entities.clear();
      game.entityque.clear();
      game.bullets.forEach(v => {
        v.delete("delete");
      })
      game.bullets.clear();
      game.bulletque.clear();
    }
    load() {
      super.load();

      // Load basic image assets
      game.testimg ??= new game.asset.assetImage("core//assets/image/player/player_red.png");
      game.asset.assets["bullet_base"] ??= new game.asset.assetImage("core//assets/image/projectile/bullet_base.png");
      game.asset.assets["bullet_rocket"] ??= new game.asset.assetImage("core//assets/image/projectile/bullet_rocket.png");
      game.asset.assets["enemy_base"] ??= new game.asset.assetImage("core//assets/image/enemy/enemy_base.png");
      game.asset.assets["enemy_helicopter"] ??= new game.asset.assetImage("./assets/image/enemy/enemy_helicopter.png");
      game.asset.assets["heliblades_spin"] ??= new game.asset.assetImage("./assets/image/enemy/heliblades_spin.png");
      game.asset.assets["splode"] ??= game.asset.assetImageAnimated.createAutoSliced("core//assets/image/projectile/splode.png", undefined, undefined, undefined, undefined, 4, 4);
      game.asset.assets["lance"] ??= game.asset.assetImageAnimated.createAutoSliced("core//assets/image/projectile/lance.png", undefined, undefined, undefined, undefined, 4, 4);
      game.asset.assets["lance"].animStyle = "single";
      game.asset.assets["bg2"] ??= new game.asset.assetImage("core//assets/image/bg/Starfield2.png");
      game.asset.assets["bg3"] ??= new game.asset.assetImage("core//assets/image/bg/Starfield3.png");

      // Construct UI
      this.healthBar = JSLib2.build("jse-bar-display", {
        style: {
          width: "200px",
          height: "20px",
          overflow: "hidden",
          borderRadius: "10px",
          border: "2px solid darkslategray",
          boxShadow: "inset 0px 4px 4px #122",
          backgroundColor: "#233"
        }
      });
      this.uiElements.push(this.healthBar);
      let grad = new game.ui.gradient(
        0, "rgb(78, 0, 26)", // Dark red
        10, "rgb(212, 42, 0)", // Bright red
        75, "rgb(140, 228, 0)", // Bright green
        100, "rgb(0, 70, 15)" // Dark green
      );
      grad.colorSpace = "hsl";
      let layer1 = this.healthBar.addLayer(game.player.health, game.player.__max_health, 0, grad);
      layer1.element.style.boxShadow = "inset 0px 4px 4px rgba(0, 0, 0, 0.5)";
      // this.healthBar.addLayer(
      //   new game.ui.barDisplay.gradientLayer(null, 100,
      //     new game.util.gradient(
      //       0, [0, 100, 20], // Dark red
      //       10, [0, 100, 50], // Bright red
      //       75, [128, 100, 50], // Bright green
      //       100, [128, 100, 20] // Dark green
      //     ),
      //     new game.util.gradient(
      //       0, "darkred",
      //       100, "darkred"
      //     )
      //   )
      // );
      this.autoSpawn(game.entity.enemyBase);
      this.autoSpawn(game.entity.enemyShooter);
    }

    autoSpawn(entityType) {
      if (!this.autoSpawners.includes(entityType.autoSpawner)) {
        this.autoSpawners.push(entityType.autoSpawner);
        if (game.state == this) {
          entityType.autoSpawner.start();
        }
      }
    }

    update(dt) {
      super.update(dt);
      let p = game.player;
      if (p) {
        if (!p.alive || p.health <= 0) {
          p.reset();
          game.setState("menu");
        } else {
          p.update?.(dt);
          this.healthBar.__layers[0].max = p.__max_health;
          this.healthBar.setLayerValue(0, p.health);
        }
      }
    }

    drawBG(bg, ox = 0, oy = 0, scale = 1) {
      let w = Math.max(bg.w * scale, 64);
      let h = Math.max(bg.h * scale, 64);
      let x0 = -w + (ox * w) % w;
      let y0 = -h + (oy * h) % h;
      for (let y = y0; y < game.cullbox.h; y += h) {
        for (let x = x0; x < game.cullbox.w; x += w) {
          game.graphics.draw(bg, x, y, 0, scale);
        }
      }
    }
    draw() {
      // Quick and dirty scrolling background
      let c = game.graphics.canvas;
      c.globalCompositeOperation = "lighter";
      c.globalAlpha = 0.25;
      this.drawBG(game.asset.assets["bg3"], 0.25, game.time / 20, 0.25);
      c.globalAlpha = 0.5;
      this.drawBG(game.asset.assets["bg2"], 0.5, game.time / 15, 1);
      c.globalAlpha = 1;
      this.drawBG(game.asset.assets["bg2"], 0, game.time / 10, 2);
      c.globalCompositeOperation = "source-over";
      super.draw();
    }
  })();
});