SproutCore.registerLib("entityEnemy", ["entity", "utilTimer"], (game) => {
  game.entity.enemy = class Enemy extends game.entity.livingEntity {
    static type = "enemy";
    static diesOnContact = true;
    static contactDamage = 25;
    static variants = {};
    constructor(x = 0, y = 0, angle = 0) {
      super();
      this.team = "enemy";
      this.sprite = "enemy_base";
      this.collisionType = "circle";
      this.r = 50;
      this.x = x;
      this.y = y;
      this.angle = angle;
      this.contactDamage = JSLib2.getStaticDefault(this, "contactDamage");
    }

    /**
     * Checks the target entity and impacts it if conditions are met.
     * Called whenever this entity intersects another.
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
        target.damage(this.contactDamage, this.team);
        if (JSLib2.getStaticDefault(this, "diesOnContact")) this.delete("contactDeath");
      }
    }
    delete(reason = null) {
      switch (reason) {
        case "outOfBounds":
        case "delete":
          return super.delete(reason);
        default:
          let explosion = new game.entity.explosion("all", this.cx, this.cy, 0);
          game.entityque.push(explosion);
      }
      super.delete(reason);
    }
    static autoSpawn(timer, time, lag) {
      let e = game.addEnemy(new Enemy(Math.random() * game.cullbox.w, Math.random() * game.cullbox.h));
      e.update(lag);
      return e;
    }
    static autoSpawner = new game.timer.randomTimer(1, 4, Enemy.autoSpawn);
  }
  game.entity.enemyBase = class EnemyBase extends game.entity.enemy {
    static type = "enemy_base";
    static launchSpeed = 4096;
    static launchAttenuation = 0.1;
    static defaultSpeed = 256;
    constructor(x = 0, y = 0, angle = 90) {
      super(x, y, angle);
      this.speed = JSLib2.getStaticDefault(this, "defaultSpeed");
      this.scale = 1.5
    }

    update(dt) {
      super.update(dt);
      let launchAttenuation = JSLib2.getStaticDefault(this, "launchAttenuation");
      let launchSpeed = JSLib2.getStaticDefault(this, "launchSpeed");
      if (launchAttenuation && this.age < launchAttenuation) {
        this.forward(launchSpeed * (launchAttenuation - this.age) * dt);
      }
      this.forward(this.speed * dt);
    }

    static autoSpawn(timer, time, lag) {
      let e = game.addEnemy(new EnemyBase(Math.random() * game.cullbox.w, -50, 90));
      e.update(lag);
      return e;
    }
    static autoSpawner = new game.timer.randomTimer(1, 4, EnemyBase.autoSpawn);
  }
  game.entity.enemy.variants["base"] = game.entity.enemyBase;
  game.entity.enemyShooter = class EnemyShooter extends game.entity.enemyBase {
    static type = "enemy_shooter";
    static defaultSpeed = 128;
    static aim = false;
    static range = 500;
    constructor(x = 0, y = 0, angle = 90) {
      super(x, y, angle);
      this.weapon = new game.timer.randomTimer(0.2, 1, this.attemptFire);
      this.weapon.owner = this;
      this.weapon.start();
      this.sprite = "enemy_helicopter";
    }

    attemptFire(timer, time, lag) {
      if (JSLib2.getStaticDefault(timer.owner, "aim")) {
        if (Math.hypot(timer.owner.x - game.player.x, timer.owner.y - game.player.y) <= JSLib2.getStaticDefault(timer.owner, "range")) {
          // todo: shoot at player
        }
      } else {
        let bullet = timer.owner.shoot("base", 10, 10);
        bullet.update(lag);
      }
    }
    delete(reason = null) {
      if (this.alive) {
        this.weapon.stop();
      }
      super.delete(reason);
    }

    draw() {
      super.draw();
      game.graphics.canvas.globalAlpha = 0.5;
      game.graphics.drawCentered(game.asset.assets["heliblades_spin"], this.cx, this.cy, this.age*360*10, this.scale/10, this.scale/10);
      game.graphics.canvas.globalAlpha = 1;
    }
    static autoSpawn(timer, time, lag) {
      let e = game.addEnemy(new EnemyShooter(Math.random() * game.cullbox.w, -50, 90));
      e.update(lag);
      return e;
    }
    static autoSpawner = new game.timer.randomTimer(1, 4, EnemyShooter.autoSpawn);
  }
  game.entity.enemy.variants["shooter"] = game.entity.enemyShooter;
  game.addEnemy = (enemy) => {
    if (enemy instanceof game.entity) {
      game.entityque.push(enemy);
    } else if (JSLib2.isString(enemy)) {
      enemy = game.enemy.variants[enemy]?.autoSpawn?.(null, game.time, 0);
    } else if (enemy.autoSpawn) {
      enemy = enemy.autoSpawn(null, game.time, 0);
    } else {
      enemy = new enemy();
    }
    return enemy;
  }
});