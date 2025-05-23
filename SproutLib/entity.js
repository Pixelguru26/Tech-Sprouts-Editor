SproutCore.registerLib("entity", ["util"], (game) => {
  game.entity = class Entity {
    static __OPENIDS = [];
    static __IDLAST = -1;

    /** Registry of default teams */
    static teams = [
      "player", "enemy", "all", "none"
    ];
    static relationships = {};
    static setRelationship(team1, team2, relationship) {
      this.relationships[team1] ??= {};
      this.relationships[team1][team2] = relationship;
      this.relationships[team2] ??= {};
      this.relationships[team2][team1] = relationship;
    }
    static setHostile(team1, team2) {this.setRelationship(team1, team2, "hostile");}
    static setFriendly(team1, team2) {this.setRelationship(team1, team2, "friendly");}
    static setNeutral(team1, team2) {this.setRelationship(team1, team2, "neutral");}
    static remRelationship(team1, team2) {this.setRelationship(team1, team2, null);}
    static relationship(team1, team2) {
      let r = this.relationships[team1]?.[team2];
      if (r) return r;
      if (team1 == "all" || team2 == "all") return "friendly";
      if (team1 == "none" || team2 == "none") return "hostile";
    }

    constructor() {
      this.unitid = Entity.__OPENIDS.shift() ?? (++Entity.__IDLAST);
      this.team = "none";
      this.autoScale = true; // Only applies to circular entities
      this.setCollision("rec", 0, 0, 0, 0);
      this.angle = 0;
      this.scale = 1;
      this.alive = true;
      this.age = 0;
      this.verlet = false;
      this.vx = 0;
      this.vy = 0;
      this.ax = 0;
      this.ay = 0;
      this.renderedSprite = game.asset.assetImage.default;
      /** @type {boolean} Allows entities to enter from offscreen without being instantly despawned. */
      this.hasBeenInBounds = false;
    }

    /** @type {string} */
    get collisionType() {
      if (!this.body) return;
      // Returns the static "name" property of the shape class
      return Object.getPrototypeOf(this.body)?.constructor?.name;
    }
    set collisionType(id) {
      this.setCollision(id, ...this.body.bounds);
    }
    
    setCollision(type, x, y, a, b, ...params) {
      if (game.geo.shapeRegistry[type]) {
        this.body = new game.geo.shapeRegistry[type](x, y, a, b, ...params);
      }
    }

    set sprite(v) {
      if (v instanceof game.asset) {
        this.renderedSprite = v;
        // If not yet loaded, defer callback. Otherwise execute.
        if (v.loaded) {
          this.onSetSprite(v);
        } else {
          let src = this;
          v.addCallback((sprite) => {src.onSetSprite(sprite)});
        }
      } else if (v instanceof HTMLElement) {
        // Raw element
        this.renderedSprite = v;
        if (v.complete && v.naturalWidth !== 0) {
          this.onSetSprite(v);
        } else {
          let e = this;
          v.addEventListener("load", () => {
            e.renderedSprite = v;
            e.onSetSprite(v);
          });
        }
      } else {
        // Assumed to be a path string
        let src = this;
        let newsprite = game.asset.assets[v]; // Default to reusing existing assets
        if (!newsprite) {
          newsprite = new game.asset.assetImage(v); // Otherwise load new one (automatically registers to assets too)
          game.asset.assets[v] = newsprite;
        }
        if (newsprite instanceof game.asset)
          this.sprite = newsprite; // Switch to non-string cases
        else
          this.renderedSprite = newsprite;
      }
    }
    get sprite() { return this.renderedSprite; }
    get spriteW() {
      if (this.renderedSprite instanceof game.asset) {
        return this.renderedSprite.w;
      } else {
        return this.renderedSprite?.naturalWidth ?? game.asset.assetImage.default.w;
      }
    }
    get spriteH() {
      if (this.renderedSprite instanceof game.asset) {
        return this.renderedSprite.h;
      } else {
        return this.renderedSprite?.naturalHeight ?? game.asset.assetImage.default.h;
      }
    }

    onSetSprite(v) {}

    // ==========================================
    // Passthroughs for physics body
    // ==========================================

    /** @type {number?} x position, specifics dependent on body type */
    get x() { return this.body?.ax ?? this.body?.x; }
    /** @type {number?} y position, specifics dependent on body type */
    get y() { return this.body?.ay ?? this.body?.y; }
    /** @type {number?} width */
    get w() { return this.body?.w; }
    /** @type {number?} height */
    get h() { return this.body?.h; }
    /** @type {number?} Radius (if circle) */
    get r() { return this.body?.r; }
    /** @type {number?} x position of the second point on a line segment */
    get x2() { return this.body?.bx; }
    /** @type {number?} y position of the second point on a line segment */
    get y2() { return this.body?.by; }

    /** @type {number?} x position, dependent on body type */
    set x(v) {
      if (!this.body) return;
      if (this.collisionType === "line") {
        this.body.ax = v;
      } else {
        this.body.x = v;
      }
    }
    /** @type {number?} y position, dependent on body type */
    set y(v) {
      if (!this.body) return;
      if (this.collisionType === "line") {
        this.body.ay = v;
      } else {
        this.body.y = v;
      }
    }
    /** @type {number?} width */
    set w(v) {
      if (!this.body) return;
      this.body.w = v;
    }
    /** @type {number?} height */
    set h(v) {
      if (!this.body) return;
      this.body.h = v;
    }
    /** @type {number?} Radius (if circle) */
    set r(v) {
      if (!this.body) return;
      this.body.r = v;
    }
    /** @type {number?} x position of the second point on a line segment */
    set x2(v) {
      if (!this.body) return;
      this.body.bx = v;
    }
    /** @type {number?} y position of the second point on a line segment */
    set y2(v) {
      if (!this.body) return; 
      this.body.by = v;
    }

    /** @type {number?} Center x position */
    get cx() { return this.body?.cx; }
    /** @type {number?} Center y position */
    get cy() { return this.body?.cy; }
    /** @type {number?} Center x position */
    set cx(x) {
      if (!this.body) return;
      this.body.cx = x;
    }
    /** @type {number?} Center y position */
    set cy(y) {
      if (!this.body) return;
      this.body.cy = y;
    }

    // ==========================================
    // Core functionality
    // ==========================================

    /**
     * Should be called each frame with dt (delta time) in seconds.
     * @param {number} dt Time since last frame, in seconds
     */
    update(dt) {
      this.age += dt;
      if (this.verlet) {
        this.x += (this.vx + 0.5 * this.ax * dt) * dt;
        this.y += (this.vy + 0.5 * this.ay * dt) * dt;
        this.vx += this.ax * dt;
        this.vy += this.ay * dt;
      }
    }

    /**
     * Should be called each frame to render the entity to the canvas.
     */
    draw() {
      let sx = this.scaleX ?? this.scale;
      let sy = this.scaleY ?? this.scale;
      switch (this.collisionType) {
        case "circle": {
          if (this.autoScale) {
            let max = Math.max(this.spriteW, this.spriteH);
            sx *= this.r * 2 / max;
            sy *= this.r * 2 / max;
          } else {
            if (this.autoScaleX) sx *= this.r * 2 / this.spriteW;
            if (this.autoScaleY) sy *= this.r * 2 / this.spriteH;
          }
          if (this.sprite instanceof game.asset.assetImageAnimated) {
            game.graphics.drawCentered(this.sprite, this.age, this.x, this.y, this.angle, sx, sy);
          } else {
            game.graphics.drawCentered(this.sprite, this.x, this.y, this.angle, sx, sy);
          }
          if (DEBUG) {
            game.graphics.canvas.beginPath();
            game.graphics.canvas.lineWidth = 5;
            game.graphics.canvas.strokeStyle = "red";
            game.graphics.canvas.arc(this.x, this.y, this.r, 0, 2*Math.PI);
            game.graphics.canvas.stroke();
          }
          break;
        }
        case "line": {
          if (this.autoScale) {
            // Todo: cache length or factor
            let fac = this.body.length / this.spriteW;
            sx *= fac;
            sy *= fac;
          } // Todo: add use of autoScaleX and autoScaleY
          if (this.sprite instanceof game.asset.assetImageAnimated) {
            game.graphics.drawCentered(this.sprite, this.age, this.body.bx, this.body.by, this.angle, sx, sy, 0, 0.5);
          } else {
            game.graphics.drawCentered(this.sprite, this.body.bx, this.body.by, this.angle, sx, sy, 0, 0.5);
          }
          if (DEBUG) {
            // Used for debug rendering
            game.graphics.canvas.beginPath();
            game.graphics.canvas.lineWidth = 5;
            game.graphics.canvas.strokeStyle = "red";
            game.graphics.canvas.moveTo(this.body.ax, this.body.ay);
            game.graphics.canvas.lineTo(this.body.bx, this.body.by);
            game.graphics.canvas.stroke();
          }
          break;
        }
        default: {
          let w = this.spriteW;
          let h = this.spriteH;
          let minScale, maxScale;
          if (h > w) {
            minScale = this.w / w;
            maxScale = this.h / h;
          } else {
            minScale = this.h / h;
            maxScale = this.w / w;
          }
          if (this.autoScale || this.autoScaleMax) {
            sx *= maxScale;
            sy *= maxScale;
          } else if (this.autoScaleMin) {
            sx *= minScale;
            sy *= minScale;
          } else {
            if (this.autoScaleX) sx *= this.w / w;
            if (this.autoScaleY) sy *= this.h / h;
          }
          if (this.sprite instanceof game.asset.assetImageAnimated) {
            game.graphics.drawCentered(this.sprite, this.age, this.x, this.y, this.angle, sx, sy);
          } else {
            game.graphics.drawCentered(this.sprite, this.x, this.y, this.angle, sx, sy);
          }
          break;
        }
      }
    }

    /**
     * Kills the entity and recycles its id.
     * May trigger animations or side effects if reason is not null.
     * Original MUST be called in derived class overloads.
     * @param {*} reason 
     */
    delete(reason = null) {
      if (this.alive) {
        Entity.__OPENIDS.push(this.unitid);
        this.unitid = null;
        this.alive = false;
      }
    }

    equals(other) {
      return (other instanceof Entity) && (other.unitid === this.unitid);
    }

    // ==========================================
    // Geometry
    // ==========================================

    touch(other) {}

    intersects(other) {
      return this.body?.intersects(other.body);
    }

    // ==========================================
    // Turtle functions
    // ==========================================

    /**
     * Moves the entity forward by the specified number of pixels.
     * @param {number} distance 
     */
    forward(distance = 1) {
      let rad = this.angle / 180 * Math.PI;
      if (this.collisionType == "line") {
        this.x2 += Math.cos(rad) * distance;
        this.y2 += Math.sin(rad) * distance;
      }
      this.x += Math.cos(rad) * distance;
      this.y += Math.sin(rad) * distance;
    }

    /**
     * Moves the entity backward by the specified number of pixels.\
     * Equivalent to `this.forward(-distance);`
     * @param {number} distance 
     */
    backward(distance = 1) {
      return this.forward(-distance);
    }

    /**
     * Moves the entity directly to the right (strafing)
     * by the specified number of pixels.
     * @param {number} distance 
     */
    right(distance = 1) {
      let rad = (this.angle + 90) / 180 * Math.PI;
      if (this.collisionType == "line") {
        this.x2 += Math.cos(rad) * distance;
        this.y2 += Math.sin(rad) * distance;
      }
      this.x += Math.cos(rad) * distance;
      this.y += Math.sin(rad) * distance;
    }

    /**
     * Moves the entity directly to the left (strafing)
     * by the specified number of pixels.\
     * Equivalent to `this.right(-distance);`
     * @param {number} distance 
     */
    left(distance = 1) {
      return this.right(-distance);
    }

    /**
     * Combines both parallel and perpendicular movement
     * into the same function.\
     * Equivalent to `this.forward(y); this.right(x);`
     * @param {number} x 
     * @param {number} y 
     */
    move(x = 0, y = 0) {
      this.forward(y);
      this.right(x);
    }

    // Rotates the entity clockwise by the specified number of degrees, 90 by default.
    /**
     * Rotates the entity clockwise by the specified number of degrees, 90 by default.
     * @param {number?} theta Degrees clockwise
     * @returns {number} The new angle of the entity
     */
    rotate(theta = 90) {
      this.angle += theta;
      return this.angle;
    }

    // Rotates the entity clockwise by the specified number of degrees, 90 by default.
    // Equivalent to this.rotate(theta)
    /**
     * Rotates the entity clockwise by the specified number of degrees, 90 by default.\
     * Equivalent to `this.rotate(theta);`
     * @param {number} theta Degrees clockwise
     * @returns {number} The new angle of the entity
     */
    turnRight(theta = 90) {
      return this.rotate(theta);
    }

    /**
     * Rotates the entity counter-clockwise by the specified number of degrees, 90 by default.\
     * Equivalent to `this.turnRight(-theta);`
     * @param {number} theta Degrees counter-clockwise
     * @returns {number} The new angle of the entity
     */
    turnLeft(theta = 90) {
      return this.rotate(-theta);
    }

    /**
     * Constructs a bullet if necessary, then fires it
     * from the location of this entity with the given offset.
     * @param {string | Entity} variant 
     * @param {number?} offsetX Lateral offset, perpendicular to entity direction
     * @param {number?} offsetY Forward offset, parallel to entity direction
     * @param {number?} offsetAngle Rotates the projectile by this many degrees from the source entity's angle
     * @returns {Entity.bullet}
     */
    shoot(variant, offsetX = 0, offsetY = 0, offsetAngle = 0) {
      if (variant instanceof Entity) {
        variant.angle = this.angle + offsetAngle;
        variant.move(offsetX, offsetY);
        game.bulletque.push(variant);
        return variant;
      } else if (JSLib2.isString(variant)) {
        variant = new (game.entity.bullet.variants[variant] ?? game.entity.bullet)(this.team, this.x, this.y, this.angle + offsetAngle);
        return this.shoot(variant, offsetX, offsetY, offsetAngle);
      } else {
        variant = new variant(this.team, this.x, this.y, this.angle + offsetAngle);
        variant.team = this.team;
        variant.angle = this.angle;
        variant.cx = this.cx;
        variant.cy = this.cy;
        variant.move(offsetX, offsetY);
        game.bulletque.push(variant);
        return variant;
      }
    }
  }
  game.entity.setHostile("player", "enemy");
  game.entity.livingEntity = class LivingEntity extends game.entity {
    speed = 100;
    constructor() {
      super();
      this.__health = new game.smoothVal(100, 0, 100);
      this.__health.clamp = false;
    }

    /** @type {number} Note: setting to <=0 will not properly kill the entity. For that, call `entity.damage()`. */
    set health(v) {
      // Check necessary to prevent preemptive access bug
      if (this.__health) this.__health.val = v;
      super.health = v;
    }
    /** @type {number} Note: setting to <=0 will not properly kill the entity. For that, call `entity.damage()`. */
    get health() { return this.__health?.val ?? super.health; }

    /** @type {number} */
    set __max_health(v) { if (this.__health) this.__health.max = v; }
    /** @type {number} */
    get __max_health() { return this.__health?.max; }

    /** @type {number} Health recently lost, approaches 0 over time. */
    get healthLost() {
      // Check necessary to prevent preemptive access bug
      if (this.__health) return this.health - this.__health.smoothed;
      return 0;
    }
    /** @type {number} A value which smoothly approaches the current health value over time. */
    get healthSmooth() {
      // Check necessary to prevent preemptive access bug
      if (this.__health) return this.__health.smoothed;
      return this.health;
    }

    /**
     * Damages this entity's health and, if it drops below 0,
     * automatically deletes it.\
     * If provided, the `src` parameter may alter behavior;
     * for example, adding to the player's score or preventing animations on culling.
     * @param {number} amt 
     * @param {*?} src 
     */
    damage(amt, src = null) {
      if (this.alive) {
        this.health -= amt;
        if (this.health <= 0) this.delete(src);
      }
    }
    /**
     * Renders a fancy value indicator bar below this entity.
     * Generalized form of health indicator.
     * @param {CanvasRenderingContext2D} canvas 
     * @param {number} val Value represented in the white bar
     * @param {number} max Maximum possible value in the white bar
     * @param {number?} secondary Red indicator bar behind the white bar, for indicating health bar loss. Defaults to none.
     * @param {number?} tier Multiplier for the radius of the indicator. Defaults to 0.
     * @param {number?} span Angular span of the indicator, in degrees. Defaults to `45°`.
     */
    indicateBar(canvas, val, max, secondary = 0, tier = 0, span = 45) {
      const center = 0.5 * Math.PI;
      span *= Math.PI / 180; // convert to degrees
      let radius = Math.max(this.autoscale, 50);
      radius += tier * 7;
      // Secondary red indicator bar for health recently lost
      if (secondary > 0) {
        let halfspan = (secondary / max) * span / 2;
        canvas.beginPath();
        canvas.lineWidth = 5;
        canvas.strokeStyle = "red";
        canvas.arc(this.cx, this.cy, radius, center - halfspan, center + halfspan);
        canvas.stroke();
      }
      // Main indicator bar
      let halfspan = (val / max) * span / 2;
      canvas.beginPath();
      canvas.lineWidth = 5;
      canvas.strokeStyle = "white";
      canvas.arc(this.cx, this.cy, radius, center - halfspan, center + halfspan);
      canvas.stroke();
    }
    /**
     * Renders a fancy health bar below this entity.
     * @param {CanvasRenderingContext2D} canvas 
     */
    drawHealth(canvas = null) {
      this.indicateBar(canvas ?? game.graphics.canvas, this.health, this.__maxHealth, this.healthSmooth);
    }
  }
});