gameData.libs.push(() => {
  let entity = game.entity = class Entity {
    // Entity type used to distinguish subclasses
    static type = "entity";
    static __OPENIDS = [];
    static __IDLAST = -1;

    /** Registry of default teams for reference */
    static teams = [
      "player", "enemy", "all", "none"
    ];

    /**
     * Required initialization for any entity instance.
     * @param {string} team Defines which other entities this will interact with and how.
     * @param {Number} x 
     * @param {Number} y
     * x, y indicate the position of the entity from the top left corner (0,0) to the bottom right (w, h)\
     * When the collisionType is circle, this is the center coordinate.\
     * When the collisionType is aabb, this is the top left coordinate.\
     * When the collisionType is line, this is the coordinate of the first point.
     * @param {Number} angle Visual rotation of this entity in degrees. Does not affect physics body.
     * @param {Number} scale Visual scale factor of the entity. Does not affect physics body.
     * @param {string} collisionType Defines what calculations will be used to determine
     * intersections with other entities. Can be any of:\
     *    "circle": a is read as radius, (x, y) is read as center.\
     *    "aabb": non-rotating rectangle. (x, y) is read as top left. a and b are read as width and height, respectively.\
     *    "line": line segment. (x, y) is read as the initial point, (a, b) is read as the end point.
     * @param {Number} a Context-dependent dimension (width, radius, or x2)
     * @param {Number} b Context-dependent dimension (height or y2)
     */
    constructor(team = "none", x = 0, y = 0, angle = 0, scale = 1, collisionType = "circle", a = 0, b = 0) {
      this.unitid = Entity.__OPENIDS.shift() ?? (++Entity.__IDLAST);
      this.team = team;
      this.angle = angle;
      this.scale = scale;
      this.autoscale = true; // Only applies to circular entities.
      // Each collision type has its own dimension argument overload.
      this.internal_collisionType = collisionType;
      switch (collisionType) {
        case "circle":
          this.body = new game.geo.circle(x, y, a);
          break;
        case "aabb":
          this.body = new game.geo.rec(x, y, a, b);
          break;
        case "line":
          this.body = new game.geo.lineseg(x, y, a, b);
          break;
        default:
          this.body = {
            x: x,
            y: y,
            a: a,
            b: b
          };
          break;
      }
      this.alive = true;
      this.age = 0;
      // Typically this should be an asset image, but raw images usually work as well.
      this.__sprite = game.Asset.AssetImage.default;
    }

    set collisionType(v) {
      let oldtype = this.internal_collisionType;
      this.internal_collisionType = v;
      let old = this.body;
      if (!oldtype || !old) return;
      switch (v) {
        case "circle":
          if (old instanceof game.geo.rec) {
            this.body = new game.geo.circle(old.x + old.w / 2, old.y + old.h / 2, game.geo.dist(0, 0, old.w, old.h) / 2);
          } else if (old instanceof game.geo.lineseg) {
            this.body = new game.geo.circle(old.cx, old.cy, old.length / 2);
          } else {
            this.body = new game.geo.circle(this.x ?? 0, this.y ?? 0, 1);
          }
          break;
        case "aabb":
          if (old instanceof game.geo.circle) {
            this.body = new game.geo.rec(old.x - old.r, old.y - old.r, old.r * 2, old.r * 2);
          } else if (old instanceof game.geo.lineseg) {
            this.body = new game.geo.rec(old.minx, old.miny, Math.abs(old.dx), Math.abs(old.dy));
          } else {
            this.body = new game.geo.rec(this.x ?? 0, this.y ?? 0, 1, 1);
          }
          break;
        case "line":
          if (old instanceof game.geo.circle) {
            this.body = new game.geo.lineseg(old.x, old.y, old.r, 0);
          } else if (old instanceof game.geo.rec) {
            this.body = new game.geo.lineseg(old.x, old.y, old.r, old.d);
          } else {
            this.body = new game.geo.lineseg(this.x ?? 0, this.y ?? 0, 1, 0);
          }
          break;
      }
    }
    get collisionType() {
      return this.internal_collisionType
    };

    /**
     * Allows sprites to be set in multiple intuitive ways.
     * This variable accepts assets, raw images, and path strings.
     * When the sprite is loaded, the onSetSprite(sprite) callback is executed.
     * This happens immediately if the sprite is already loaded.
     * Note that for now the raw element is treated as always loaded.
     */
    set sprite(v) {
      if (v instanceof game.Asset) {
        this.__sprite = v;
        if (v.loaded) {
          this.onSetSprite(v);
        } else {
          let src = this;
          v.addCallback((sprite) => {
            src.onSetSprite(sprite);
          })
        }
      } else if (v instanceof Element) {
        this.__sprite = v;
        this.onSetSprite(v);
      } else {
        let src = this;
        let newsprite = game.Asset.assets[v];
        if (!newsprite) {
          newsprite = new game.Asset.AssetImage(v);
        }
        this.__sprite = newsprite;
        if (newsprite.loaded) {
          src.onSetSprite(newsprite);
        } else {
          this.__sprite.addCallback((sprite) => {
            src.onSetSprite(sprite);
          });
        }
      }
    }
    get sprite() {
      return this.__sprite;
    }

    onSetSprite(v) {
      if (this.collisionType == "circle" && this.autoscale) {
        // If autoscale is a number, use its value. Otherwise, use radius.
        this.scale = v.radiusToScale((this.autoscale === true) ? this.r : this.autoscale);
      }
    }

    // Passthroughs for physics body.
    // Maintains backwards compatibility with direct geometry attribute system.
    get x() { return this.body.x ?? this.body.ax; }
    get y() { return this.body.y ?? this.body.ay; }
    get w() { return this.body.w; }
    get h() { return this.body.h; }
    get r() { return this.body.r; }
    get x2() { return this.body.bx; }
    get y2() { return this.body.by; }

    set x(v) {
      if (this.collisionType === "line") {
        this.body.ax = v;
      } else {
        this.body.x = v;
      }
    }
    set y(v) {
      if (this.collisionType === "line") {
        this.body.ay = v;
      } else {
        this.body.y = v;
      }
    }
    set w(v) { this.body.w = v; }
    set h(v) { this.body.h = v; }
    set r(v) { this.body.r = v; }
    set x2(v) { this.body.bx = v; }
    set y2(v) { this.body.by = v; }

    get cx() {
      return this.body.cx;
    }
    get cy() {
      return this.body.cy;
    }
    set cx(x) {
      this.body.cx = x;
    }
    set cy(y) {
      this.body.cy = y;
    }

    update(dt) {
      this.age += dt;
    }

    draw(canvas = null) {
      if (this.internal_collisionType == "circle") {
        if (this.sprite instanceof game.Asset.AssetImageAnimated) {
          game.graphics.draw_centered(this.sprite, this.age, this.x, this.y, this.angle, this.scalex ?? this.scale, this.scaley ?? this.scale);
        } else {
          game.graphics.draw_centered(this.sprite, this.x, this.y, this.angle, this.scalex ?? this.scale, this.scaley ?? this.scale);
        }
      } else if (this.internal_collisionType == "line") {
        if (this.sprite instanceof game.Asset.AssetImageAnimated) {
          game.graphics.draw_centered(this.sprite, this.age, this.body.cx, this.body.cy, this.angle, this.scalex ?? this.scale, this.scaley ?? this.scale);
        } else {
          game.graphics.draw_centered(this.sprite, this.body.cx, this.body.cy, this.angle, this.scalex ?? this.scale, this.scaley ?? this.scale);
        }
      } else {
        if (this.sprite instanceof game.Asset.AssetImageAnimated) {
          game.graphics.draw(this.sprite, this.age, this.x, this.y, this.angle, this.scalex ?? this.scale, this.scaley ?? this.scale);
        } else {
          game.graphics.draw(this.sprite, this.x, this.y, this.angle, this.scalex ?? this.scale, this.scaley ?? this.scale);
        }
      }
    }

    // Can be overridden for death animations
    // Name chosen to alarm fewer parents
    delete(reason = null) {
      if (this.alive) {
        game.entity.__OPENIDS.push(this.unitid);
        this.unitid = null;
        this.alive = false;
      }
    }

    equals(other) {
      return (other instanceof Entity) && (other.unitid == this.unitid);
    }

    touch(other) {
      // Abstract
    }

    // ==========================================
    // Geometry
    // ==========================================

    intersects(other) {
      // switch (this.collisionType) {
      //   case "circle":
      //     switch (other.collisionType) {
      //       case "circle":
      //         return game.geo.intersectCircle(this.x, this.y, this.r, other.x, other.y, other.r);
      //       case "aabb":
      //         return game.geo.intersectAABBCircle(other.x, other.y, other.w, other.h, this.x, this.y, this.r);
      //       case "line":
      //         return other.body.intersectCircle(this.x, this.y, this.r);
      //       default: break;
      //     }
      //   case "aabb":
      //     switch (other.collisionType) {
      //       case "circle":
      //         return game.geo.intersectAABBCircle(this.x, this.y, this.w, this.h, other.x, other.y, other.r);
      //       case "aabb":
      //         return game.geo.broadphaseAABBAABB(this.x, this.y, this.w, this.h, other.x, other.y, other.w, other.h);
      //       case "line":
      //         return other.body.intersectAABB(this.x, this.y, this.w, this.h);
      //       default: break;
      //     }
      //   case "line":
      //     switch (other.collisionType) {
      //       case "circle":
      //         return this.body.intersectCircle(other.x, other.y, other.r);
      //       case "aabb":
      //         return this.body.intersectAABB(other.x, other.y, other.w, other.h);
      //       case "line":
      //         return this.body.intersectLine(other.body);
      //       default: break;
      //     }
      //   default: break;
      // }
      return this.body.intersects(other.body);
    }

    // ==========================================
    // Turtle capabilities
    // ==========================================

    // Moves the entity forward by the specified number of pixels.
    forward(distance = 1) {
      let rad = this.angle / 180 * Math.PI;
      if (this.collisionType == "line") {
        this.x2 += Math.cos(rad) * distance;
        this.y2 += Math.cos(rad) * distance;
      }
      this.x += Math.cos(rad) * distance;
      this.y += Math.sin(rad) * distance;
    }

    // Moves the entity backward by the specified number of pixels.
    // Equivalent to this.forward(-distance)
    backward(distance = 1) {
      return this.forward(-distance);
    }

    // Moves the entity along the vector 90 degrees clockwise to its angle.
    right(distance = 1) {
      let rad = (this.angle + 90) / 180 * Math.PI;
      if (this.collisionType == "line") {
        this.x2 += Math.cos(rad) * distance;
        this.y2 += Math.sin(rad) * distance;
      }
      this.x += Math.cos(rad) * distance;
      this.y += Math.sin(rad) * distance;
    }

    // Moves the entity along the vector 90 degrees counter-clockwise to its angle.
    // Equivalent to this.right(-distance)
    left(distance = 1) {
      return this.right(-distance);
    }

    // Rotates the entity clockwise by the specified number of degrees, 90 by default.
    rotate(theta = 90) {
      this.angle += theta;
      return this.angle;
    }

    // Rotates the entity clockwise by the specified number of degrees, 90 by default.
    // Equivalent to this.rotate(theta)
    turnRight(theta = 90) {
      return this.rotate(theta);
    }

    // Rotates the entity counter-clockwise by the specified number of degrees, 90 by default.
    // Equivalent to this.turnRight(-theta)
    turnLeft(theta = 90) {
      return this.rotate(-theta);
    }

    // Moves an entity by the offset vector
    // Positive y moves the entity forward
    // Positive x moves the entity to its right
    // (x,y) can be provided separately or as a vector object
    move(x, y) {
      if (x instanceof Victor) {
        y = x.y;
        x = x.x;
      } else if (x instanceof Array) {
        y = x[1];
        x = x[0];
      }
      this.forward(y);
      this.right(x);
    }

    static relationships = {
      "player": {
        "enemy": "hostile"
      },
      "enemy": {
        "player": "hostile"
      }
    }
    static relationship(a, b) {
      if (a instanceof Entity) a = a.team;
      if (b instanceof Entity) b = b.team;
      if (a == "all") return "friendly";
      if (b == "all") return "friendly";
      return game.entity.relationships[a]?.[b] ?? "neutral";
    }
  }

  /** 
   * Shared class between player and enemies, slightly more advanced than bullets.
   * Higher overhead than base.
   */
  game.entity.livingEntity = class LivingEntity extends game.entity {
    static type = "entity_living";
    constructor(...params) {
      super(...params);
      this.speed = 100;
      this.__health = new game.util.smoothVal(100, 0, 100);
      this.__health.clamp = false;
    }
    set health(v) {
      if (this.__health)
        this.__health.val = v;
      super.health = v;
    }
    get health() {
      if (this.__health)
        return this.__health.val;
      return super.health;
    }
    set __max_health(v) {
      if (this.__health)
        this.__health.max = v;
    }
    get __max_health() {
      if (this.__health)
        return this.__health.max;
    }
    get health_lost() {
      if (this.__health)
        return this.health - this.__health.smoothed;
      return 0;
    }
    get health_smooth() {
      if (this.__health)
        return this.__health.smoothed;
      return this.health;
    }
    damage(amt, src = null) {
      if (this.alive) {
        this.health -= amt;
        if (this.health <= 0) {
          this.delete(src);
        }
      }
    }
    indicateBar(canvas, val, max, secondary = 0, tier = 0, span = 45) {
      const center = 0.5 * Math.PI;
      span *= Math.PI / 180;
      let radius = Math.max(this.autoscale, 50);
      radius += tier * 7;
      if (secondary > 0) {
        let halfspan = (secondary / max) * span / 2;
        canvas.beginPath();
        canvas.lineWidth = 5;
        canvas.strokeStyle = "red";
        canvas.arc(this.cx, this.cy, radius, center - halfspan, center + halfspan);
        canvas.stroke();
      }
      let halfspan = (val / max) * span / 2;
      canvas.beginPath();
      canvas.lineWidth = 5;
      canvas.strokeStyle = "white";
      canvas.arc(this.cx, this.cy, radius, center - halfspan, center + halfspan);
      canvas.stroke();
    }
    drawHealth(canvas = null) {
      this.indicateBar(canvas ?? game.graphics.canvas, this.health, this.__max_health, this.health_smooth);
    }
  }

  game.player = null;
  game.entity.player = class Player extends game.entity.livingEntity {
    constructor(x = 450, y = 500) {
      super("player", x, y, 270, 1, "circle", 50);
      this.weaponKeybinds = {};
      this.reset();
    }

    reset() {
      this.alive = true;
      this.age = 0;
      this.__max_health = 100;
      this.health = this.__max_health;
      this.__health.smoothed = this.health;
      this.x = game.cullbox.w / 2;
      this.y = game.cullbox.h / 2;
      this.speed = 450;
      this.score = 0;
      this.weapons = [];
      this.addWeapon(" ", new game.entity.player.weapon(
        1000, 10, true, [[-16, 0], [16, 0]], "base"
      ));
      this.addWeapon("Shift", new game.entity.player.weapon(
        20, 1, false, [[-24, -6], [24, -6]], "lance"
      ));
    }

    static weapon = class PlayerWeapon {
      constructor(ammo = 10, rate = 10, auto = false, offsets = [[-10, 0], [10, 0]], fire = "base", owner = null) {
        this.ammo = ammo;
        this.offsets = offsets;
        this.barrel = 0;
        this.fire_fn = fire;
        this.rate = rate;
        this.auto = auto;
        this.timer = new game.timer(1 / rate, (timer, time, lag) => {
          this.tick(timer, time, lag);
        });
        this.owner = owner ?? game.player;
        this.timer.owner = this;
        this.compensate_lag = true;
        this.consume_ammo = 1;
      }

      sustain() {
        if (this.auto) {
          this.timer.sustain();
        }
      }

      beginfire() {
        this.fire(this.timer);
      }

      default_fire(timer, time, lag, offset) {
        return timer.owner.owner.shoot(this.fire_fn, offset[0], offset[1]);
      }

      fire(timer = null, time = 0, lag = 0) {
        timer ??= this.timer;
        // Ammo consumption accounts for negative ammo values
        // and potentially negative ammo consumption values.
        // Regardless, stops and clamps ammo count to 0
        // when ammo count crosses 0.
        if (this.consume_ammo) {
          if (this.ammo == 0) {
            return;
          } else {
            let prev = this.ammo;
            this.ammo -= this.consume_ammo;
            if (prev * this.ammo < 0) {
              this.ammo = 0;
            }
          }
        }
        let bullet;
        if (this.fire_fn in game.entity.bullet.variants) {
          bullet = this.default_fire(timer, time, lag, this.offsets[this.barrel]);
        } else {
          bullet = this.fire_fn(timer, time, lag, this.offsets[this.barrel]);
        }
        this.barrel = (this.barrel + 1) % (this.offsets.length);
        if (bullet instanceof game.entity && this.compensate_lag && lag) {
          bullet.update(lag);
        }
      }

      tick(timer, time, lag) {
        this.fire(timer, time, lag);
        this.timer.interval = 1 / this.rate;
      }
    }

    addWeapon(keybind, weapon) {
      weapon.owner = this;
      this.weaponKeybinds[keybind] = this.weapons.length;
      this.weapons.push(weapon);
    }

    update(dt) {
      super.update(dt);
      for (const key in this.weaponKeybinds) {
        if (Object.prototype.hasOwnProperty.call(this.weaponKeybinds, key)) {
          const id = this.weaponKeybinds[key];
          if (game.keystates[key]) {
            this.weapons[id].sustain();
          }
        }
      }
    }

    keydown(key) {
      for (const keybind in this.weaponKeybinds) {
        if (Object.prototype.hasOwnProperty.call(this.weaponKeybinds, keybind)) {
          const id = this.weaponKeybinds[keybind];
          if (key == keybind) {
            this.weapons[id].beginfire();
          }
        }
      }
    }
  }

  game.entity.bullet = class Bullet extends game.entity {
    static type = "bullet_base";
    static default_speed = 1024;
    static default_damage = 34;
    static variants = {};

    constructor(team, x, y, angle) {
      super(team, x, y, angle, 1, "line", x, y);
      this.autoscale = false;
      this.sprite = game.Asset.assets["bullet_base"];
      this.attack = game.entity.bullet.default_damage;
      this.speed = game.entity.bullet.default_speed;
    }
    update(dt) {
      this.age += dt;
      this.x = this.x2;
      this.y = this.y2;
      let rad = this.angle / 180 * Math.PI;
      let dist = this.speed * dt;
      let sin = Math.sin(rad) * dist;
      let cos = Math.cos(rad) * dist;
      this.x2 += cos;
      this.y2 += sin;
    }

    draw(canvas = null) {
      if (DEBUG) {
        canvas ??= game.graphics.canvas;
        canvas.beginPath();
        canvas.moveTo(this.body.ax, this.body.ay);
        canvas.lineTo(this.body.bx, this.body.by);
        canvas.stroke();
      } else {
        if (this.sprite instanceof game.Asset.AssetImageAnimated) {
          game.graphics.draw_centered(this.sprite, this.age, this.x2, this.y2, this.angle, this.scalex ?? this.scale, this.scaley ?? this.scale);
        } else {
          game.graphics.draw_centered(this.sprite, this.x2, this.y2, this.angle, this.scalex ?? this.scale, this.scaley ?? this.scale);
        }
      }
    }

    touch(target) {
      if (game.entity.relationship(this.team, target.team) == "hostile")
        this.impact(target);
    }
    impact(target) {
      if (this.alive) {
        target.damage(this.attack, this.team);
        this.delete(this.team);
      }
    }
  }
  game.entity.bullet.variants["base"] = game.entity.bullet;

  game.entity.exploding_bullet = class Boltshell extends game.entity.bullet {
    static type = "bullet_exploding";
    static default_explosion_attack = 60;

    constructor(team, x, y, angle, radius = -1) {
      super(team, x, y, angle);
      this.radius = radius;
      this.explosionAttack = game.entity.exploding_bullet.default_explosion_attack;
      this.overrideConstructor = null;
    }

    impact(target) {
      if (this.alive) {
        let splode = new (this.overrideConstructor ?? game.entity.explosion)(this.team, this.x2, this.y2, this.radius);
        splode.attack = this.explosionAttack;
        game.entityque.push(splode);
      }
      return super.impact(target);
    }
  }

  game.entity.rocket = class Rocket extends game.entity.exploding_bullet {
    static type = "bullet_rocket";
    static default_speed = 2048; // Top speed in the case of rockets
    static default_damage = 50;
    static default_launch_velocity = new Victor(0, 500);
    static default_launch_attenuation = 200; // Constant because it's mostly the rocket, not air resistance
    static default_acceleration = 2048;

    constructor(team, x, y, angle, radius = 1) {
      super(team, x, y, angle);
      this.sprite = game.Asset.assets["bullet_rocket"];
      this.vel = game.entity.rocket.default_launch_velocity.clone();
      this.speed = 0;
    }

    update(dt) {
      let rocket = game.entity.rocket;
      this.speed += rocket.default_acceleration * dt;
      if (this.speed > rocket.default_speed) this.speed = rocket.default_speed;
      if (this.speed < -rocket.default_speed) this.speed = -rocket.default_speed;
      if (Math.abs(this.vel.x) > 1 || Math.abs(this.vel.y) > 1) {
        let drag = this.vel.clone().invert().norm();
        this.vel.x += drag.x * rocket.default_launch_attenuation * dt;
        this.vel.y += drag.y * rocket.default_launch_attenuation * dt;
        if (Math.abs(this.vel.x) < 1) {
          this.vel.x = 0;
        } else {
          this.x2 += this.vel.x * dt;
        }
        if (Math.abs(this.vel.y) < 1) {
          this.vel.y = 0;
        } else {
          this.y2 += this.vel.y * dt;
        }
      }
      super.update(dt);
    }
  }
  game.entity.bullet.variants["rocket"] = game.entity.rocket;

  // All entities are able to fire bullets.
  // Creates a new bullet of the given variant
  // (variant can either be named or a direct class reference)
  // adds it to the bullet queue, and returns it.
  game.entity.prototype.shoot = function (variant = "base", offsetx = 0, offsety = 0) {
    let ret = null;
    if (variant instanceof game.entity) {
      ret = variant;
      ret.move(offsetx, offsety);
      game.bulletque.push(ret);
    } else if (typeof variant === "string" || variant instanceof String) {
      variant = game.entity.bullet.variants[variant] ?? game.entity.bullet;
      return this.shoot(new variant(this.team, this.x, this.y, this.angle), offsetx, offsety);
    } else {
      ret = new variant(this.team, this.x, this.y, this.angle);
      ret.move(offsetx, offsety);
      game.bulletque.push(ret);
    }
    return ret;
  }

  game.entity.enemy = class Enemy extends game.entity.livingEntity {
    static type = "enemy_base";
    // Enemies appear as if decelerating from warp speed for visual appeal.
    static boost_decay = 5000;

    constructor(x, y, angle = 90, visradius = 64, radius = 32, speed = 200, boost = 1000) {
      super("enemy", x, y, angle, 1, "circle", radius);
      // this.health = 100;
      this.speed = speed;
      this.boost = boost;
      // this.__max_health = this.health;
      this.attack = 5;
      this.score = 2;
      this.autoscale = visradius;
      this.sprite = "enemy_base";
    }
    update(dt) {
      super.update(dt);
      this.forward(this.speed * dt);
      // Speed boost decays until 0, then snaps to 0 exactly.
      if (this.boost < 0) {
        this.boost = 0;
      } else {
        this.forward(this.boost * dt);
        this.boost -= game.entity.enemy.boost_decay * dt;
      }
    }

    draw(canvas = null) {
      super.draw(canvas);
      this.drawHealth(canvas);
    }

    delete(reason = null) {
      if (reason == "player") {
        game.player.score += this.score;
      }
      super.delete(reason);
    }
  }

  game.entity.explosion = class Explosion extends game.entity {
    static type = "explosion_base";
    constructor(team, x, y, angle = 0, radius = -1) {
      let sprite = game.Asset.assets["splode"];
      let scale = sprite.w / 2;
      if (radius != -1) {
        scale = radius / (sprite.w / 2);
      }
      super(team, x, y, angle, scale, "circle", radius == -1 ? sprite.w / 2 : radius);
      this.sprite = sprite;
      this.hitmem = {};
      this.attack = 60;
      this.speed = 0;
    }

    touch(target) {
      if (game.entity.relationship(this.team, target.team) == "hostile") {
        if (!(target.unitid in this.hitmem)) {
          this.hitmem[target.unitid] = game.time;
          return this.impact(target);
        }
      }
    }

    impact(target) {
      if (this.alive) {
        target.damage(this.attack, this.team);
      }
    }

    update(dt) {
      super.update(dt);
      if (this.age > this.sprite.duration) {
        this.delete();
      }
    }
  }
  game.entity.bullet.variants["explosion"] = game.entity.explosion;

  game.entity.lance = class Lance extends game.entity.explosion {
    constructor(team, x, y, angle = 270, scale = 1) {
      super(team, x, y, 0);
      let sprite = game.Asset.assets["lance"];
      this.sprite = sprite;
      this.collisionType = "line";
      this.angle = angle;
      let sin = Math.sin(angle / 180 * Math.PI);
      let cos = Math.cos(angle / 180 * Math.PI);
      this.x2 = this.x + cos * sprite.w * scale;
      this.y2 = this.y + sin * sprite.w * scale;
      this.scale = scale;
      this.attack = 120;
    }
  }
  game.entity.bullet.variants["lance"] = game.entity.lance;
});