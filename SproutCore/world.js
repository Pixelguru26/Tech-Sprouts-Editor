let Engine = Matter.Engine;
let Render = Matter.Render;
let Runner = Matter.Runner;
let Bodies = Matter.Bodies;
let Body = Matter.Body;
let Composite = Matter.Composite;

export default class GameWorld {
  static SproutCore = null;

  constructor() {
    this.entities = [];
    this.bullets = [];
    this.entityque = [];
    this.bulletque = [];
    this.engine = Engine.create();
    this.engine.enableSleeping = true;
    // Gravity in px/(s^2)
    this.gravityX = 0;
    this.gravityY = 100;
    this.isUpdating = false;
  }

  get gravityX() {return this.engine.world.gravity.x;}
  get gravityY() {return this.engine.world.gravity.y;}
  set gravityX(g) {this.engine.world.gravity.x = g;}
  set gravityY(g) {this.engine.world.gravity.y = g;}

  new() { return new GameWorld(); }

  /**
   * Test all other entities and bullets in the world
   * for intersection with the test entity.
   * Returns true if one intersects.
   * If a condition function is provided, 
   * returns true if an entity intersects
   * for which that function returns true.
   * @param {Entity|Shape} testEnt 
   * @param {function(Entity): boolean} condition 
   * @returns {boolean} true if the condition is met on an intersecting entity.
   */
  testIntersection(testEnt, condition = null) {
    let ents = this.entities;
    let ent, body;
    // This is needed to allow intersection tests
    // between raw shapes and the world entities.
    testEnt = testEnt["body"] ?? testEnt;
    // Test entities
    for (let i = 0; i < ents.length; i++) {
      ent = ents[i];
      if (ent["alive"]) {
        if ((body = ent["body"]) && testEnt["intersects"](body)) {
          if (condition === null || condition(ent)) return true;
        }
      }
    }
    // Test bullets
    ents = this.bullets;
    for (let i = 0; i < ents.length; i++) {
      ent = ents[i];
      if (ent["alive"]) {
        if (ent["body"] && testEnt["intersects"](ent["body"])) {
          if (condition === null || condition(ent)) return true;
        }
      }
    }
    return false;
  }

  update(dt) {
    this.isUpdating = true;
    Engine.update(this.engine, dt * 1000);

    let entq = this.entityque;
    let bulq = this.bulletque;
    let ents = this.entities;
    let buls = this.bullets;
    // Move all items from queue to active
    for (let i = 0; i < entq.length; i++) {
      entq[i].world = this;
      ents.push(entq[i]);
      // if (entq[i].body instanceof Body) {
      //   Composite.add(this.engine.world, entq[i].body);
      // }
    }
    for (let i = 0; i < bulq.length; i++) {
      bulq[i].world = this;
      buls.push(bulq[i]);
      // if (entq[i].body instanceof Body) {
      //   Composite.add(this.engine.world, bulq[i].body);
      // }
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
        console.log("BROKEN BULLET", bul);
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
        console.log("BROKEN ENTITY", ent)
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
          if (bul["alive"] && ent["intersects"]?.(bul)) {
            bul["touch"]?.(ent);
            GameWorld.SproutCore.callPyEvent("entityCollision", ent, bul);
          }
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
          if (bul["alive"] && ent["intersects"](bul)) {
            ent["touch"]?.(bul);
            GameWorld.SproutCore.callPyEvent("entityCollision", ent, bul);
          }
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
          // if (ent.body instanceof Body) {
          //   Composite.remove(this.engine.world, ent.body);
          // }
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
          // if (bul.body instanceof Body) {
          //   Composite.remove(this.engine.world, bul.body);
          // }
        }
        if (!bul["persistent"]) bul["finalize"]?.();
      } catch (e) {
        GameWorld.SproutCore.error(e);
        throw new Error(`Error on disposal of bullet #${i}`, { cause: e });
      }
    }
    this.isUpdating = false;
  }

  draw() {
    this.isUpdating = true;
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
    this.isUpdating = false;
  }

  addEntity(ent) {
    ent = ent["getProxy"]?.();
    let id = ent["unitid"];
    let ents = this.entities;
    for (let i = 0; i < ents.length; i++) {
      if (ents[i]["unitid"] == id) return;
    }
    ents = this.entityque;
    for (let i = 0; i < ents.length; i++) {
      if (ents[i]["unitid"] == id) return;
    }
    if (this.isUpdating) {
      this.entityque.push(ent);
    } else {
      this.entities.push(ent);
      // if (ent.body instanceof Body) {
      //   Composite.add(this.engine.world, ent.body);
      // }
    }
  }
  addBullet(bul) {
    bul = bul["getProxy"]?.();
    let id = bul["unitid"];
    let buls = this.bullets;
    for (let i = 0; i < buls.length; i++) {
      if (buls[i]["unitid"] == id) return;
    }
    buls = this.bulletque;
    for (let i = 0; i < buls.length; i++) {
      if (buls[i]["unitid"] == id) return;
    }
    if (this.isUpdating) {
      this.bulletque.push(bul);
    } else {
      this.bullets.push(bul);
      // if (ent.body instanceof Body) {
      //   Composite.add(this.engine.world, bul.body);
      // }
    }
  }

  /**
   * Attempts to finalize and delete all entities and bullets.
   * Warning: this will not respect callbacks, in order to ensure success.
   */
  clear() {
    for (let ent of this.entities) try {
      ent["world"] = null;
      if (!ent["persistent"]) ent["finalize"]?.();
    } catch (e) {
      // Todo
      console.warn("Failed to finalize: ", ent, " Error: ", e);
    }
    this.entities.length = 0;
    for (let bul of this.bullets) try {
      bul["world"] = null;
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
    Composite.clear(this.engine.world, false);
  }

  keyDown(k) {
    this.isUpdating = true;
    for (let ent of this.entities) ent["keyDown"]?.(k);
    for (let bul of this.bullets) bul["keyDown"]?.(k);
    this.isUpdating = false;
  }
  keyUp(k) {
    this.isUpdating = true;
    for (let ent of this.entities) ent["keyUp"]?.(k);
    for (let bul of this.bullets) bul["keyUp"]?.(k);
    this.isUpdating = false;
  }
  mouseDown(b, x, y) {
    this.isUpdating = true;
    for (let ent of this.entities) {
      // Separated check because Pyodide
      if (ent["body"]["includesPoint"]?.(x, y)) {
        GameWorld.SproutCore?.callPyEvent("entityClick", ent, b, x, y);
      }
      ent["mouseDown"]?.(b, x, y);
    }
    for (let bul of this.bullets) bul["mouseDown"]?.(b, x, y);
    this.isUpdating = false;
  }
  mouseUp(b, x, y) {
    this.isUpdating = true;
    for (let ent of this.entities) ent["mouseUp"]?.(b, x, y);
    for (let bul of this.bullets) bul["mouseUp"]?.(b, x, y);
    this.isUpdating = false;
  }
  scroll(x, y, dx, dy) {
    this.isUpdating = true;
    for (let ent of this.entities) ent["scroll"]?.(x, y, dx, dy);
    for (let bul of this.bullets) bul["scroll"]?.(x, y, dx, dy);
    this.isUpdating = false;
  }
}