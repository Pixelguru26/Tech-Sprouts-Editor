SproutCore.registerLib("state", [], (game) => {
  game.setState = function(targetState) {
    let tgt = game.gameStates[targetState];
    if (tgt) {
      let old = game.state;
      if (tgt === old) return;
      old?.exit?.(tgt);
      SproutCore.callback("exitState", old?.name); // todo: fix magic string
      game.state = tgt;
      if (!tgt.initialized) {
        tgt.load();
        SproutCore.callback("loadState", targetState); // todo: fix magic string
      }
      tgt.enter();
      SproutCore.callback("enterState", targetState); // todo: fix magic string
    }
  }

  game.gameState = class GameState {
    showPlayer = true;
    enablePlayer = true;
    clearBulletsEntry = true;
    clearEntitiesEntry = true;
    clearBulletsExit = true;
    clearEntitiesExit = true;
    constructor(name) {
      this.name = name;
      this.uiElements = [];
      this.initialized = false;
    }

    load() {
      game.time = 0;
      this.initialized = true;
    }

    enter() {
      game.time = 0;
      this.uiElements.forEach(element => {
        game.uiElement.appendChild(element);
      });
      if (this.clearBulletsEntry) {
        if (this.clearEntitiesEntry) {
          game.forceClearEntities();
        } else {
          game.forceClearBullets();
        }
      } else if (this.clearEntitiesEntry) {
        game.forceClearEntities();
      }
    }
    exit(targetState) {
      // game.uiElement.textContent = '';
      game.uiElement.replaceChildren();
      if (this.clearBulletsExit) {
        if (this.clearEntitiesExit) {
          game.forceClearEntities();
        } else {
          game.forceClearBullets();
        }
      } else if (this.clearEntitiesExit) {
        game.forceClearEntities();
      }
    }

    update(dt) {
      // Add new entities
      for (let i = 0; i < game.entityque.length; i++) {
        game.entities.push(game.entityque[i]);
        game.entityque[i] = null;
      }
      game.entityque.length = 0;

      // Add new bullets
      for (let i = 0; i < game.bulletque.length; i++) {
        game.bullets.push(game.bulletque[i]);
        game.bulletque[i] = null;
      }
      game.bulletque.length = 0;

      // Player update takes precedence
      if (this.enablePlayer) game.player?.update?.(dt);

      // Bullet update phase
      // Collisions handled in entity phase
      for (let bullet of game.bullets) {
        bullet.update(dt);
      }

      // Entity update phase
      for (let entity of game.entities) {
        entity.update(dt);
        if (!entity.alive) continue;
  
        // Offscreen culling
        if (entity.intersects(game.cullbox)) {
          entity.hasBeenInBounds = true;
        } else {
          if (entity.hasBeenInBounds) entity.delete("outOfBounds");
          continue;
        }

        // Bullet collisions
        for (let bullet of game.bullets)
          if (bullet.intersects(entity))
            bullet.touch(entity);
        for (let bullet of game.bullets)
          if (bullet.intersects(game.player))
            bullet.touch(game.player);
        if (!entity.alive) continue;

        // Entity-player collision
        if (entity.intersects(game.player)) entity.touch(game.player);
        if (!entity.alive) continue;
        // Entity-entity collisions
        for (let other of game.entities) {
          if (entity == other) continue;
          if (entity.intersects(other)) entity.touch(other);
          if (!entity.alive) break;
        }
      }

      // Cull offscreen bullets
      for (let bullet of game.bullets) {
        if (bullet.intersects(game.cullbox)) {
          bullet.hasBeenInBounds = true;
        } else {
          if (bullet.hasBeenInBounds) {
            bullet.delete("outOfBounds"); // todo: fix magic string
          }
        }
      }

      // Clean up dead entities
      for (let i = game.entities.length - 1; i > -1; i--) {
        if (!game.entities[i].alive) {
          game.entities.splice(i, 1);
        }
      }
      // Clean up dead bullets
      for (let i = game.bullets.length - 1; i > -1; i--) {
        if (!game.bullets[i].alive) {
          game.bullets.splice(i, 1);
        }
      }
    };
    draw() {
      // todo: add z ordering
      for (let bullet of game.bullets)
        bullet.draw();
      for (let entity of game.entities)
        entity.draw();
      if (this.showPlayer && game.player?.alive)
        game.player.draw?.();
      for (let i = 0; i < game.graphics.transformDepth; i++) game.graphics.pop();
      game.graphics.canvas.resetTransform();
    };

    keydown(key) {
      game.player?.keydown?.(key);
      for (let entity of game.entities) entity.keydown?.(key);
      for (let bullet of game.bullets) bullet.keydown?.(key);
    };
    keyup(key) {
      game.player?.keyup?.(key);
      for (let entity of game.entities) entity.keyup?.(key);
      for (let bullet of game.bullets) bullet.keyup?.(key);
    };
    mousedown(b, x, y) {
      game.player?.mousedown?.(b, x, y);
      for (let entity of game.entities) entity.mousedown?.(b, x, y);
      for (let bullet of game.bullets) bullet.mousedown?.(b, x, y);
    };
    mouseup(b, x, y) {
      game.player?.mouseup?.(b, x, y);
      for (let entity of game.entities) entity.mouseup?.(b, x, y);
      for (let bullet of game.bullets) bullet.mouseup?.(b, x, y);
    };
    scroll(x, y, dx, dy) {
      game.player?.scroll?.(x, y, dx, dy);
      for (let entity of game.entities) entity.scroll?.(x, y, dx, dy);
      for (let bullet of game.bullets) bullet.scroll?.(x, y, dx, dy);
    };
  }
});