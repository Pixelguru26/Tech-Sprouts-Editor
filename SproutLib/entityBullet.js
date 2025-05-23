SproutCore.registerLib("entityBullet", ["entity", "entitySplode"], (game) => {
  game.entity.bullet = class Bullet extends game.entity {
    static type = "bullet_base";
    static defaultSpeed = 1024;
    static defaultDamage = 34;
    static variants = {
      base: Bullet,
      explosion: game.entity.explosion,
      lance: game.entity.lance
    };

    constructor(team, x, y, angle) {
      super();
      this.team = team;
      this.angle = angle;
      this.autoscale = false;
      this.sprite = game.asset.assets["bullet_base"];
      this.attack = Bullet.defaultDamage;
      this.speed = Bullet.defaultSpeed;
      this.setCollision("line", x, y, x, y);
    }

    update(dt) {
      super.update(dt);
      this.x2 = this.x;
      this.y2 = this.y;
      let rad = this.angle / 180 * Math.PI;
      let dist = this.speed * dt;
      let sin = Math.sin(rad) * dist;
      let cos = Math.cos(rad) * dist;
      this.x += cos;
      this.y += sin;
    }

    draw() {
      if (false) {
        // Used for debug rendering
        game.graphics.canvas.beginPath();
        game.graphics.canvas.moveTo(this.body.bx, this.body.by);
        game.graphics.canvas.lineTo(this.body.ax, this.body.ax);
        game.graphics.canvas.stroke();
      }
      if (this.sprite instanceof game.asset.assetImageAnimated) {
        game.graphics.drawCentered(this.sprite, this.age, this.x, this.y, this.angle, this.scalex ?? this.scale ?? 1, this.scaley ?? this.scale ?? 1);
      } else {
        game.graphics.drawCentered(this.sprite, this.x, this.y, this.angle, this.scalex ?? this.scale ?? 1, this.scaley ?? this.scale ?? 1);
      }
    }

    /**
     * Checks the target entity and impacts it if conditions are met.
     * @param {game.entity} target 
     */
    touch(target) {
      if (game.entity.relationship(this.team, target.team) == "hostile")
        this.impact(target);
    }
    /**
     * Attacks the target entity if still alive.
     * @param {game.entity.livingEntity} target 
     */
    impact(target) {
      if (this.alive) {
        target.damage(this.attack, this.team);
        this.delete(this.team);
      }
    }
  }
  game.entity.explodingBullet = class BoltShell extends game.entity.bullet {
    static type = "bullet_exploding";
    static defaultExplosionAttack = 60;

    constructor(team, x, y, angle) {
      super(team, x, y, angle);
      this.explosionAttack = BoltShell.defaultExplosionAttack;
      this.radius = -1;
      this.fn = "base";
    }

    impact(target) {
      if (this.alive) {
        let splode = new (this.overrideConstructor ?? game.entity.explosion)(this.team, this.x, this.y, 0);
        if (this.radius > 0) splode.r = this.radius;
        splode.attack = this.explosionAttack;
        game.entityque.push(splode);
      }
      return super.impact(target);
    }
  }
});