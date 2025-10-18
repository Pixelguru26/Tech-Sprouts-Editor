
export default class GameWorld {
  static SproutCore = null;

  constructor() {
    this.entities = [];
    this.bullets = [];
    this.entityque = [];
    this.bulletque = [];
  }

  new() { return new GameWorld(); }

  update(dt) {
    let entq = this.entityque;
    let bulq = this.bulletque;
    let ents = this.entities;
    let buls = this.bullets;
    // Move all items from queue to active
    for (let i = 0; i < entq.length; i++) {
      ents.push(entq[i]);
    }
    for (let i = 0; i < bulq.length; i++) {
      buls.push(bulq[i]);
    }
    entq.length = 0;
    bulq.length = 0;

    // Update bullets
    let ent;
    let bul;
    for (let i = 0; i < buls.length; i++) {
      bul = buls[i];
      try {
        bul["update"]?.(dt);
      } catch (e) {
        GameWorld.SproutCore.error(e);
        throw new Error(`Error on update of bullet #${i}`, { cause: e });
      }
    }

    // Update entities
    for (let i = 0; i < ents.length; i++) {
      ent = ents[i];
      try {
        ent["update"]?.(dt);
      } catch (e) {
        GameWorld.SproutCore.error(e);
        throw new Error(`Error on update of entity #${i}`, { cause: e });
      }
    }

    // Handle collisions and interactions
    for (let i = 0; i < ents.length; i++) {
      ent = ents[i];
      if (!ent["alive"]) continue;
      // Bullet collisions
      for (let j = 0; j < buls.length; j++) {
        bul = buls[j];
        try {
          if (bul["alive"] && ent["intersects"]?.(bul)) bul["touch"]?.(ent);
        } catch (e) {
          GameWorld.SproutCore.error(e);
          throw new Error(`Error on intersection between entity #${i} and bullet #${j}`, { cause: e });
        }
      }
      if (!ent.alive) continue;
      // Entity collisions
      for (let j = 0; j < ents.length; j++) {
        bul = ents[j];
        try {
          if (ent == bul) continue;
          if (bul["alive"] && ent["intersects"](bul)) ent["touch"]?.(bul);
        } catch (e) {
          GameWorld.SproutCore.error(e);
          throw new Error(`Error on intersection between entity #${i} and #${j}`, { cause: e });
        }
        if (!ent["alive"]) break;
      }
      if (!ent["alive"]) continue;
    }

    // Clean up dead entities
    for (let i = ents.length - 1; i > -1; i--) {
      ent = ents[i];
      try {
        if (!ent.alive) {
          ents.splice(i, 1);
          if (!ent["persistent"]) ent["finalize"]?.();
        }
      } catch (e) {
        GameWorld.SproutCore.error(e);
        throw new Error(`Error on disposal of entity #${i}`, { cause: e });
      }
    }
    // Clean up dead bullets
    for (let i = buls.length - 1; i > -1; i--) {
      bul = buls[i];
      try {
        if (!bul["alive"]) {
          buls.splice(i, 1);
        }
        if (!bul["persistent"]) bul["finalize"]?.();
      } catch (e) {
        GameWorld.SproutCore.error(e);
        throw new Error(`Error on disposal of bullet #${i}`, { cause: e });
      }
    }
  }

  draw() {
    let ents = this.entities;
    let buls = this.bullets;
    for (let i = 0; i < buls.length; i++) try {
      buls[i]["draw"]();
    } catch (e) {
      GameWorld.SproutCore.error(e);
      throw new Error(`Failed to render bullet #${i}`, { cause: e });
    }
    for (let i = 0; i < ents.length; i++) try {
      ents[i]["draw"]();
    } catch (e) {
      GameWorld.SproutCore.error(e);
      throw new Error(`Failed to render entity #${i}`, { cause: e });
    }
  }

  addEntity(ent) {
    ent = ent["getProxy"]?.();
    if (this.entities.includes(ent) || this.entityque.includes(ent)) return;
    this.entityque.push(ent);
  }
  addBullet(bul) {
    bul = bul["getProxy"]?.();
    if (this.bullets.includes(bul) || this.bulletque.includes(bul)) return;
    this.bulletque.push(bul);
  }

  /**
   * Attempts to finalize and delete all entities and bullets.
   * Warning: this will not respect callbacks, in order to ensure success.
   */
  clear() {
    for (let ent of this.entities) try {
      if (!ent["persistent"]) ent["finalize"]?.();
    } catch (e) {
      // Todo
      console.warn("Failed to finalize: ", ent, " Error: ", e);
    }
    this.entities.length = 0;
    for (let bul of this.bullets) try {
      if (!bul["persistent"]) bul["finalize"]?.();
    } catch (e) {
      // Todo
      console.warn("Failed to finalize: ", bul, " Error: ", e);
    }
    this.bullets.length = 0;
    for (let ent of this.entityque) try {
      if (!ent["persistent"]) ent["finalize"]?.();
    } catch (e) {
      // Todo
      console.warn("Failed to finalize: ", ent, " Error: ", e);
    }
    this.entityque.length = 0;
    for (let bul of this.bulletque) try {
      if (!bul["persistent"]) bul["finalize"]?.();
    } catch (e) {
      // Todo
      console.warn("Failed to finalize: ", bul, " Error: ", e);
    }
    this.bulletque.length = 0;
  }

  keydown(k) {
    for (let ent of this.entities) ent["keydown"]?.(k);
    for (let bul of this.bullets) bul["keydown"]?.(k);
  }
  keyup(k) {
    for (let ent of this.entities) ent["keyup"]?.(k);
    for (let bul of this.bullets) bul["keyup"]?.(k);
  }
  mousedown(b, x, y) {
    for (let ent of this.entities) ent["mousedown"]?.(b, x, y);
    for (let bul of this.bullets) bul["mousedown"]?.(b, x, y);
  }
  mouseup(b, x, y) {
    for (let ent of this.entities) ent["mouseup"]?.(b, x, y);
    for (let bul of this.bullets) bul["mouseup"]?.(b, x, y);
  }
  scroll(x, y, dx, dy) {
    for (let ent of this.entities) ent["scroll"]?.(x, y, dx, dy);
    for (let bul of this.bullets) bul["scroll"]?.(x, y, dx, dy);
  }
}