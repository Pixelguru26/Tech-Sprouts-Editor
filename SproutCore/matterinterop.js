export default class MatterInterop {
  // static intersectMatterBody(ax, ay, bx, by, body) {
  //   let retT = 1;
  //   let bodyX, bodyY, bodyW, bodyH;
  //   let part;
  //   let t = Infinity;
  //   let tax, tay, tbx, tby;
  //   for (let i = 0; i < body.parts.length; i++) {
  //     part = body.parts[i];
  //     bodyX = part.bounds.min.x;
  //     bodyY = part.bounds.min.y;
  //     bodyW = part.bounds.max.x - bodyX;
  //     bodyH = part.bounds.max.y - bodyY;
  //     if (Geo.intersectAABB(ax, ay, bx - ax, by - ay, bodyX, bodyY, bodyW, bodyH)) {
  //       let [tmpt, tmpax, tmpay, tmpbx, tmpby] = this.intersectMatterPart(ax, ay, bx, by, part);
  //       if (tmpt && tmpt < t) {
  //         t = tmpt;
  //         tax = tmpax;
  //         tay = tmpay;
  //         tbx = tmpbx;
  //         tby = tmpby;
  //       }
  //     }
  //   }
  //   if (t <= 1) {
  //     return [t, tax, tay, tbx, tby];
  //   }
  // }
  // static pointInMatterVertices(vertices, x, y) {
  //   let l = vertices.length;
  //   let a = vertices[l - 1];
  //   let b;
  //   for (let i = 0; i < l; i++) {
  //     b = vertices[i];
  //     if (
  //       (x - a.x) * (b.y - a.y) +
  //       (y - a.y) * (a.x - b.x) > 0
  //     ) return false;
  //     a = b;
  //   }
  //   return true;
  // }
  // static intersectMatterPart(ax, ay, bx, by, part) {
  //   let retT = Infinity;
  //   let retax, retay, retbx, retby;
  //   let backT = Infinity;
  //   let backax, backay, backbx, backby;
  //   let t;
  //   let l = part.vertices.length;
  //   let vertX = part.vertices[l - 1].x;
  //   let vertY = part.vertices[l - 1].y;
  //   let nVertX, nVertY;
  //   for (let i = 1; i < l; i++) {
  //     nVertX = part.vertices[i].x;
  //     nVertY = part.vertices[i].y;
  //     if (this.intersect(ax, ay, bx, by, vertX, vertY, nVertX, nVertY)) {
  //       t = this.intersectTRaw(ax, ay, bx, by, vertX, vertY, nVertX, nVertY);
  //       if (t < 0) {
  //         if (t < backT) {
  //           backT = t;
  //           backax = vertX; backay = vertY;
  //           backbx = nVertX; backby = nVertY;
  //         }
  //       } else {
  //         if (t < retT) {
  //           retT = t;
  //           retax = vertX; retay = vertY;
  //           retbx = nVertX; retby = nVertY;
  //         }
  //       }
  //     }
  //   }
  //   if (retT >= 0 && retT <= 1) return [retT, retax, retay, retbx, retby];
  //   // Test for point inclusion
  //   if (
  //     Vertices.contains(part.vertices, { x: ax, y: ay }) ||
  //     Vertices.contains(part.vertices, { x: bx, y: by })
  //   ) {
  //     return [backT, backax, backay, backbx, backby];
  //   }
  //   return [null];
  // }
  // /**
  //  * Returns the intersection fo the provided lines as a single parametric value.\
  //  * The intersection point is `t*ab+(1-t)*aa`, where `t` is the return value,
  //  * `aa` is the first point of line segment a,
  //  * and `ab` is the last point of line segment a.\
  //  * If the lines are colinear, returns `NaN`.\
  //  * If the lines are parallel and do not intersect, returns `Infinity`.\
  //  * Credit: https://stackoverflow.com/a/565282
  //  * @param {number} aax x position of first point in line segment a
  //  * @param {number} aay y position of first point in line segment a
  //  * @param {number} abx x position of last point in line segment a
  //  * @param {number} aby y position of last point in line segment a
  //  * @param {number} bax x position of first point in line segment b
  //  * @param {number} bay y position of first point in line segment b
  //  * @param {number} bbx x position of last point in line segment b
  //  * @param {number} bby y position of last point in line segment b
  //  * @returns {number} t
  //  */
  // static intersectTRaw(aax, aay, abx, aby, bax, bay, bbx, bby) {
  //   let adx = abx - aax;
  //   let ady = aby - aay;
  //   let bdx = bbx - bax;
  //   let bdy = bby - bay;
  //   let dox = bbx - aax;
  //   let doy = bby - aay;
  //   let rxs = Geo.cross(adx, ady, bdx, bdy);
  //   if (rxs === 0) {
  //     // Colinear, may or may not intersect
  //     if (Geo.cross(dox, doy, adx, ady) === 0) return NaN;
  //     // Parallel, non-intersecting
  //     return Infinity;
  //   }
  //   // Lines intersect, bounds still need to be checked.
  //   return Geo.cross(dox, doy, bdx, bdy) / rxs;
  // }

  // static convertMatterShape(shape, type) {
  //   if (shape.label == type) return shape;
  //   switch (shape.label) {
  //     case "Circle Body":
  //       switch (type) {
  //         case "rec":
  //           let r = shape.circleRadius;
  //           return this.MatterRectangle(
  //             shape.position.x - r, shape.position.y - r,
  //             r * 2, r * 2
  //           );
  //         case "line":
  //           return new this.LineSeg(
  //             shape.position.x, shape.position.y,
  //             shape.position.x + shape.circleRadius, shape.position.y
  //           );
  //         default: break;
  //       }
  //     case "Rectangle Body":
  //       switch (type) {
  //         case "circle":
  //       }
  //     default: break;
  //   }
  // }
}