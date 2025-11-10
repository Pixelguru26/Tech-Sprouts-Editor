import Graphics from "./graphics.js";
import { Shape } from "./geometry.js";

/**
 * Only exists as a helper to the Python class.
 */
let Entity = class Entity {
  /** @type {CanvasRenderingContext2D} */
  static SproutCore = null; // Provided during initialization

  static teams = [
    "player", "enemy", "all", "none"
  ];

  static __OPENIDS = [];
  static __IDLAST = -1;
  static requestID() {
    return this.__OPENIDS.shift() ?? (++this.__IDLAST);
  }
  static recycleID(id) {
    this.__OPENIDS.push(id);
  }
  static clearIDs() {
    this.__OPENIDS = [];
    this.__IDLAST = -1;
  }

  static relationships = {};
  static setRelationship(team1, team2, relationship) {
    this.relationships[team1] ??= {};
    this.relationships[team1][team2] = relationship;
    this.relationships[team2] ??= {};
    this.relationships[team2][team1] = relationship;
  }
  static setHostile(team1, team2) { this.setRelationship(team1, team2, "hostile"); }
  static setFriendly(team1, team2) { this.setRelationship(team1, team2, "friendly"); }
  static setNeutral(team1, team2) { this.setRelationship(team1, team2, "neutral"); }
  static remRelationship(team1, team2) { this.setRelationship(team1, team2, null); }
  static relationship(team1, team2) {
    let r = this.relationships[team1]?.[team2];
    if (r) return r;
    if (team1 == "all" || team2 == "all") return "friendly";
    if (team1 == "none" || team2 == "none") return "hostile";
    return "none";
  }

  static draw(entity) {
    /** @type {Graphics} */
    const g = this.SproutCore.g;
    /** @type {Shape} */
    let body = entity["body"];
    let x = body.x;
    let y = body.y;
    let w = body.w;
    let h = body.h;
    let cx = body.cx;
    let cy = body.cy;
    let img = entity["sprite"];
    let sx = entity["scalex"];
    let sy = entity["scaley"];
    let a = entity["angle"];
    switch (entity["collisionType"]) {
      case "circle":
        if (entity["autoscale"]) {
          // Should scale to fit in bounding circle
          let sm = Math.max(img.width, img.height);
          let scale = (body.r * 2) / sm;
          g.drawCentered(img, cx, cy, sx * scale, sy * scale, a, cx, cy, entity["age"]);
        } else {
          g.drawCentered(img, cx, cy, sx, sy, a, cx, cy, entity["age"]);
        }
        if (entity["drawdebug"]) g.debugCircle(cx, cy, body.r);
        break;
      case "rec":
        if (entity["autoscale"]) {
          g.drawRect(img, x, y, w, h, a, cx, cy, entity["age"]);
        } else {
          g.draw(img, x, y, sx, sy, a, cx, cy, entity["age"]);
        }
        if (entity["drawdebug"]) g.debugRect(x, y, w, h);
        break;
      case "line":
        if (entity["autoscale"]) {
          let l = body.length;
          a = body.angle;
          let scale = l / img.width;
          g.drawCentered(img, cx, cy, scale * sx, scale * sy, a, cx, cy, entity["age"]);
        } else {
          x = body.ax
          y = body.ay
          cx = body.bx
          cy = body.by
          g.drawCentered(img, cx, cy, sx, sy, a, cx, cy, entity["age"]);
        }
        if (entity["drawdebug"]) g.debugLine(body.ax, body.ay, body.bx, body.by);
        break;
      default:
        if (entity["drawdebug"]) g.debugRect(x, y, w, h);
        break;
    }
    if (entity["drawdebug"]) {
      g.debugDot(x, y);
      g.debugDot(x + w, y);
      g.debugDot(cx, cy);
      g.debugDot(x, y + h);
      g.debugDot(x + w, y + h);
    }
  }
}

export default Entity;