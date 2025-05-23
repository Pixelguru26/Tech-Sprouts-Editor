SproutCore.registerLib("entitySplode", ["entity"], (game) => {
  game.entity.explosion = class Splode extends game.entity {
    static type = "explosion_base";
    static defaultAttack = 60;
    constructor(team, x, y, angle) {
      super();
      this.team = team;
      this.collisionType = "circle";
      this.x = x;
      this.y = y;
      this.angle = angle;
      this.sprite = game.asset.assets["splode"] ?? game.asset.assetImageAnimated.getOrLoadAutoSliced(
        "splode", "core//assets/image/projectile/splode.png",
        30, "single", 0, 0, 4, 4
      );
      this.r = 100;
      this.scale = 2;
      this.hitmem = {};
      this.attack = Splode.defaultAttack;
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
      if (this.age > this.sprite.duration) this.delete();
    }
  }
  game.entity.lance = class Lance extends game.entity.explosion {
    static defaultAttack = 120;
    constructor(team, x, y, angle, length = -1) {
      super(team, x, y, angle);
      this.collisionType = "line"
      this.body.ax = x;
      this.body.ay = y;
      this.body.bx = x + Math.abs(length);
      this.body.by = y;
      this.angle = angle;
      this.length = length;
      this.sprite = game.asset.assets["lance"] ?? game.asset.assetImageAnimated.getOrLoadAutoSliced(
        "lance", "core//assets/image/projectile/lance.png",
        30, "single", 0, 0, 4, 4
      );
      this.attack = Lance.defaultAttack;
    }
    draw() {
      let w = this.sprite?.w ?? this.sprite.naturalWidth ?? 1;
      let lengthScale = this.length / w;
      if (this.length < 0) lengthScale = -this.length;
      if (DEBUG) {
        // Used for debug rendering
        game.graphics.canvas.beginPath();
        game.graphics.canvas.lineWidth = 5;
        game.graphics.canvas.strokeStyle = "red";
        game.graphics.canvas.moveTo(this.body.ax, this.body.ay);
        game.graphics.canvas.lineTo(this.body.bx, this.body.by);
        game.graphics.canvas.stroke();
      }
      if (this.sprite instanceof game.asset.assetImageAnimated) {
        game.graphics.drawCentered(this.sprite, this.age, this.x, this.y, this.angle,
          (this.scalex ?? this.scale) * lengthScale,
          (this.scaley ?? this.scale) * lengthScale,
          0, 0.5
        );
      } else {
        game.graphics.drawCentered(this.sprite, this.x, this.y, this.angle,
          (this.scalex ?? this.scale) * lengthScale,
          (this.scaley ?? this.scale) * lengthScale,
          0, 0.5
        );
      }
    }
    onSetSprite(v) {
      if (this.length < 0) {
        this.body.length = (v.w ?? v.naturalWidth ?? 1) * (-this.length);
      }
    }
    set angle(v) {
      if (this.collisionType == "line") {
        let len = this.length;
        if (len < 0) len = this.sprite?.w ?? this.sprite?.naturalWidth ?? 1;
        this.body.bx = this.x + Math.cos(v * Math.PI / 180) * len;
        this.body.by = this.y + Math.sin(v * Math.PI / 180) * len;
      }
    }
    get angle() { return this.body.angle ?? 0; }
  }
});