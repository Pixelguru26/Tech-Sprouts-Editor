const Geo = class Geo {
  /**
   * Returns the Euclidean distance between a pair\
   * of two-dimensional points, `a` and `b`.
   * @param {number} ax 
   * @param {number} ay 
   * @param {number} bx 
   * @param {number} by 
   * @returns {number}
   */
  static dist(ax, ay, bx, by) {
    return Math.hypot(bx - ax, by - ay);
  }

  /**
   * Returns the dot product of the vectors `a` and `b`.
   * @param {number} ax 
   * @param {number} ay 
   * @param {number} bx 
   * @param {number} by 
   * @returns {number}
   */
  static dot(ax, ay, bx, by) {
    return ax * bx + ay * by;
  }

  /**
   * Projects point `(ax, ay)` onto vector `(bx, by)`.\
   * Returns result as `[x, y]`
   * @param {number} ax 
   * @param {number} ay 
   * @param {number} bx 
   * @param {number} by 
   * @returns {[number, number]} [x, y]
   */
  static project(ax, ay, bx, by) {
    let dotprod = (ax * bx + ay * by) / (bx * bx + by * by);
    return [dotprod * bx, dotprod * by];
  }

  /**
   * Simple linear interpolation. `v*(b-a)+a`.
   * @param {number} v 
   * @param {number} a 
   * @param {number} b 
   * @returns {number}
   */
  static lerp(v, a, b) {
    return v * (b - a) + a;
  }

  /**
   * Returns point `(x, y)` along the line segment between the points `a` and `b`.\
   * `v` is the distance along this line, with `v=0` corresponding to `a`,\
   * and `v=1` corresponding to `b`.\
   * Technically a shortcut for `[lerp(v, x1, x2), lerp(v, y1, y2)]`.
   * @param {number} v Factor (0-1)
   * @param {number} ax 
   * @param {number} ay 
   * @param {number} bx 
   * @param {number} by 
   * @returns {[number, number]} [x, y]
   */
  static lineLerp(v, ax, ay, bx, by) {
    return [
      v * (bx - ax) + ax,
      v * (by - ay) + ay
    ];
  }

  /**
   * Inverse of lineLerp.\
   * This technically just returns the normalized dot product
   * of the point `(vx, vy)` onto the line segment between `a` and `b`.\
   * To get the full projection, you would use the formula
   * `result * (b-a)+a`, broken into the two appropriate components (x,y).
   * @param {number} vx 
   * @param {number} vy 
   * @param {number} ax 
   * @param {number} ay 
   * @param {number} bx 
   * @param {number} by 
   * @returns {number}
   */
  static lineDelerp(vx, vy, ax, ay, bx, by) {
    let dx = bx - ax;
    let dy = by - ay;
    return ((vx - ax) * dx + (vy - ay) * dy) / (dx * dx + dy * dy);
  }

  /**
   * Returns the so-called "2-dimensional cross product" of the vectors `a` and `b`.\
   * This can be thought of as the area of a parallelogram formed from
   * these two vectors. However, unlike that area, the cross product may be
   * negative.\
   * When `b` is on the "right" side of `a`, the area is positive.\
   * When `b` is on the "left" side of `a`, the area is negative.\
   * When `b` lies along `a`, the area is `0`.
   * @param {number} ax 
   * @param {number} ay 
   * @param {number} bx 
   * @param {number} by 
   * @returns {number}
   */
  static cross(ax, ay, bx, by) {
    return (ax * by) - (ay * bx);
  }

  /**
   * Rotates the point `(x,y)` 90 degrees clockwise about the origin `(ox,oy)`,
   * assuming x-right y-down coordinates, such as screens.
   * @param {number} ox 
   * @param {number} oy 
   * @param {number} x 
   * @param {number} y 
   * @returns {[number, number]} [x, y]
   */
  static rotate90(ox, oy, x, y) {
    return [ox - (y - oy), oy + (x - ox)];
  }

  /**
   * Rotates a point by the provided angle.
   * sin and cos can be precalculated and sent as an argument for optimization.
   * @param {number} x 
   * @param {number} y 
   * @param {number} angle Rotation angle in degrees
   * @param {number?} ox Origin x, Defaults to 0
   * @param {number?} oy Origin y, Defaults to 0
   * @param {number?} sin Precalculated sin value
   * @param {number?} cos Precalculated cos value
   * @returns {[number, number]} [x, y]
   */
  static rotatePoint(x, y, angle, ox = 0, oy = 0, sin = null, cos = null) {
    // Convert from degrees to radians
    angle *= Math.PI / 180;
    x -= ox;
    y -= oy;
    // Calculate trig values if not supplied
    sin ??= Math.sin(angle);
    cos ??= Math.cos(angle);
    // Apply rotation matrix and return
    return [x * cos - y * sin + ox, y * cos + x * sin + oy];
  }

  /**
   * Returns a vector in the same direction as `(x, y)`
   * with a magnitude of 1.
   * @param {number} x 
   * @param {number} y 
   * @returns {[number, number]} [x, y]
   */
  static normalize(x, y) {
    let l = Math.sqrt(x * x + y * y);
    return [x / l, y / l];
  }

  /**
   * Takes three points representing an angled corner,
   * and returns `true` if the corner is a clockwise turn.\
   * `b` is the vertex of the corner, while `a` and `c` are
   * the beginning and end of the test path, respectively.\
   * Straight lines return `true`.
   * @param {number} ax 
   * @param {number} ay 
   * @param {number} bx 
   * @param {number} by 
   * @param {number} cx 
   * @param {number} cy 
   * @returns {boolean}
   */
  static orient(ax, ay, bx, by, cx, cy) {
    return ((bx - ax) * (cy - ay) - (by - ay) * (cx - ax)) >= 0;
  }

  // ==========================================
  // Point inclusion tests
  // ==========================================

  /**
   * Returns `true` if point `(x, y)` lies within circle `a` or on its boundary.
   * @param {number} x x position of the test point
   * @param {number} y y position of the test point
   * @param {number} ax x position of the center of the circle
   * @param {number} ay y position of the center of the circle
   * @param {number} ar radius of the circle
   * @returns {boolean}
   */
  static pointInCircle(x, y, ax, ay, ar) {
    return Math.hypot(x - ax, y - ay) <= ar;
  }

  /**
   * Returns `true` if point `(x, y)` is within the axis-aligned
   * rectangle `a`.
   * @param {number} x x position of the test point
   * @param {number} y y position of the test point
   * @param {number} ax x position of point 0 on rectangle a
   * @param {number} ay y position of point 0 on rectangle a
   * @param {number} aw width of rectangle a
   * @param {number} ah height of rectangle a
   * @returns {boolean}
   */
  static pointInAABB(x, y, ax, ay, aw, ah) {
    return (x >= ax) && // x+
      (x <= ax + aw) && // x-
      (y >= ay) && // y+
      (y <= ay + ah); // y-
  }

  /**
   * Returns `true` if point `(x, y)` lies within triangle `abc`.\
   * @param {number} x x position of the test point
   * @param {number} y y position of the test point
   * @param {number} ax 
   * @param {number} ay 
   * @param {number} bx 
   * @param {number} by 
   * @param {number} cx 
   * @param {number} cy 
   * @returns {boolean}
   */
  static pointInTri(x, y, ax, ay, bx, by, cx, cy) {
    // Angle test
    // Each value indicates whether the relative point is to the right 
    // or left of a corresponding triangle side.
    let testA = Geo.cross(bx - ax, by - ay, x - ax, y - ay) > 0;
    let testB = Geo.cross(cx - bx, cy - by, x - bx, y - by) > 0;
    let testC = Geo.cross(ax - cx, ay - cy, x - cx, y - cy) > 0;
    return testA == testB && testB == testC;
  }

  /**
   * Returns `true` if the point `(x, y)` lies within the polygon
   * defined by the sequence of points provided.\
   * Every pair of numbers will define another point in the polygon.\
   * The final point will automatically connect back to the first point.\
   * An example of the format:\
   * `pointInConvex(x, y, 50,0, 100,100, 0,100)`\
   * The points should all be provided in clockwise order,
   * or all in counter-clockwise order. Either works, but it must be consistent.
   * @param {number} x x position of the test point
   * @param {number} y y position of the test point
   * @param  {...number} points A list of points, provided in pairs of x,y
   * @returns {boolean}
   */
  static pointInConvex(x, y, ...points) {
    // length = 6 corresponds to a triangle
    if (points.length < 6) return false;
    let ret = 0;
    let ax, ay, bx, by;
    bx = points[0];
    by = points[1];
    // Tests each side using [a,b] as a shift register.
    for (let i = 2; i < points.length - 1; i += 2) {
      ax = bx;
      ay = by;
      bx = points[i];
      by = points[i + 1];
      ret += Geo.cross(bx - ax, by - ay, x - ax, y - ay);
    }
    // Closing segment
    ax = points[0];
    ay = points[1];
    ret += Geo.cross(ax - bx, ay - by, x - bx, y - by);
    // Will return false if points.length is odd.
    return Math.abs(ret) == points.length / 2;
  }

  /**
   * Checks if a point is within the bounds of the provided parallelogram.
   * The parallelogram must have one point on the origin,
   * and be defined by two vectors corresponding to Origin->A and Origin-B.
   * Deprecated, use pointInConvex
   * @param {number} px 
   * @param {number} py 
   * @param {number} ax 
   * @param {number} ay 
   * @param {number} bx 
   * @param {number} by 
   * @returns {boolean}
   */
  // static intersectPointParallelogram(px, py, ax, ay, bx, by) {
  //   // Orthogonal vectors a' and b'
  //   let apx = -ay;
  //   let apy = ax;
  //   let bpx = -by;
  //   let bpy = by;

  //   // Oriented vectors a" and b" ((a) (d)ouble (p)rime)
  //   let adpsign = game.util.sign(Geo.dot(apx, apy, bx, by));
  //   let adpx = adpsign * apx;
  //   let adpy = adpsign * apy;
  //   adpsign = game.util.sign(Geo.dot(ax, ay, bpx, bpy));
  //   let bdpx = adpsign * bpx;
  //   let bdpy = adpsign * bpy;
  //   // Boundary check
  //   let check = Geo.dot(adpx, adpy, px, py);
  //   let bound = Geo.dot(adpx, adpy, bx, by);
  //   if (!(0 <= check && check <= bound)) return False;
  //   check = Geo.dot(bdpx, bdpy, px, py);
  //   bound = Geo.dot(ax, bx, bdpx, bdpy);
  //   return (0 <= check && check <= bound);
  // }

  // ==========================================
  // Intersection tests
  // ==========================================

  /** Algorithms specific to each pair of shapes provided for automatic selection */
  static intersectionTests = {};

  /**
   * Used internally to assemble methods for shape.intersect()
   * @param {Shape} shape1 
   * @param {Shape} shape2 
   * @param {function(Shape, Shape): boolean} test 
   */
  static setIntersectionTest(shape1, shape2, test) {
    Geo.intersectionTests[shape1.name] ??= {};
    Geo.intersectionTests[shape1.name][shape2.name] = test;
  }

  /**
   * Attempts to retrieve the appropriate test for either
   * (shape1, shape2) or (shape2, shape1) from the registry,
   * and executes it. If none can be found, returns `false` by default.
   * @param {Shape} shape1 
   * @param {Shape} shape2 
   * @returns {boolean} `true` if a test is found and returns `true`
   */
  static intersect(shape1, shape2) {
    if (!Geo.intersectBroadphase(shape1, shape2)) return false;
    let key1 = Object.getPrototypeOf(shape1).constructor.name;
    let key2 = Object.getPrototypeOf(shape2).constructor.name;
    let test;
    try {
      // Try in case users provide broken tests
      test = Geo.intersectionTests[key1];
    } catch(e) {
      // How do I even error from here??
      // Todo: low priority: read error to console
      return false;
    }
    if (test) {
      test = test[key2];
      if (test) return test(shape1, shape2);
    }
    test = Geo.intersectionTests[key2];
    if (test) {
      test = test[key1];
      if (test) return test(shape2, shape1);
    }
    return false;
  }

  /**
   * Tests two axis-aligned rectangles for intersection.
   * @param {number} ax 
   * @param {number} ay 
   * @param {number} aw 
   * @param {number} ah 
   * @param {number} bx 
   * @param {number} by 
   * @param {number} bw 
   * @param {number} bh 
   * @returns {boolean}
   */
  static intersectAABB(ax, ay, aw, ah, bx, by, bw, bh) {
    return (
      (bx <= (ax + aw)) &&
      ((bx + bw) >= ax) &&
      (by <= (ay + ah)) &&
      ((by + bh) >= ay)
    );
  }

  static intersectBroadphase(shape1, shape2) {
    return this.intersectAABB(...(shape1.bounds), ...(shape2.bounds));
  }

  /**
   * Attempts to convert the supplied shape to the target
   * type as sensibly as possible.\
   * Note: this is not always possible, let alone sensible.
   * @param {Shape} shape 
   * @param {"rec"|"line"|"circle"} type 
   */
  static convertShape(shape, type) {
    if (shape.type == type) return shape;
    switch (shape.type) {
      case "rec":
        switch (type) {
          case "circle":
            // Centered circle that fits inside the rectangle.
            return new this.Circle(shape.cx, shape.cy, shape.min / 2);
          case "line":
            // Line segment from tl to br
            return new this.LineSeg(shape.x, shape.y, shape.r, shape.d);
          default: break;
        }
      case "circle":
        switch (type) {
          case "rec":
            // Square containing the circle
            return new this.Rec(shape.x - shape.r, shape.y - shape.r, shape.r * 2, shape.r * 2);
          case "line":
            // This one doesn't make much sense.
            // Line segment from center to the right side of the circle.
            return new this.LineSeg(shape.x, shape.y, shape.x + shape.r, shape.y);
          default: break;
        }
      case "line":
        switch (type) {
          case "rec":
            // Bounding box of the line segment
            return new this.Rec(shape.minx, shape.miny, shape.w, shape.h);
          case "circle":
            // Bounding circle of the line segment
            return new this.Circle(shape.cx, shape.cy, shape.length / 2);
          default: break;
        }
      default: break;
    }
  }
}

// ==========================================
// Shape definitions
// ==========================================

export class Shape {
  static name = "shape";
  constructor() {
    this.type = "shape";
    this.x = 0;
    this.y = 0;
    this.w = 0;
    this.h = 0;
  }

  /**
   * @type {[number, number, number, number]}
   * Retrieves the axis aligned bounding box containing the shape,
   * in the format [left x, top y, width, height]
   */
  get bounds() { return [this.x, this.y, this.w, this.h] };
  /** @type {Rectangle | [number, number, number, number]} */
  set bounds(v) {
    // Compatible with both rectangles and arrays
    this.x = v.x ?? v[0];
    this.y = v.y ?? v[1];
    this.w = v.w ?? v[2];
    this.h = v.h ?? v[3];
  }

  /** @type {number} center x */
  get cx() { return this.x + this.w / 2; }
  /** @type {number} center x */
  set cx(x) { this.x = x - this.w / 2; }

  /** @type {number} center y */
  get cy() { return this.y + this.h / 2; }
  /** @type {number} center y */
  set cy(y) { this.y = y - this.h / 2; }

  /**
   * Rescales the shape by the factor provided
   * @param {number} sx Horizontal scale factor
   * @param {number?} sy Vertical scale factor - defaults to sx if not provided
   */
  scale(sx, sy = null) {
    sy ??= sx;
    this.w *= sx;
    this.h *= sy;
  }
  /**
   * Rescales the shape while maintaining the center point
   * @param {number} sx Horizontal scale factor
   * @param {number?} sy Vertical scale factor - defaults to sx if not provided
   */
  scaleCenter(sx, sy = null) {
    sy ??= sx;
    let oldcx = this.cx;
    let oldcy = this.cy;
    this.scale(sx, sy);
    this.cx = oldcx;
    this.cy = oldcy;
  }

  /** @type {number} Retrieves the area of the shape (bounding box by default) */
  get area() {
    return this.w * this.h;
  }
  /**
   * @type {number}
   * Thoroughly unnecessary setter which resizes the
   * bounding box to match the provided area while maintaining
   * the same aspect ratio and center point.
   */
  set area(v) {
    let ratio = this.w / this.h;
    let w = Math.sqrt(ratio * v);
    this.scaleCenter(w / this.w);
  }

  /**
   * Should return `true` if and only if the point `(x, y)` lies within
   * or upon this shape's boundary.
   * Root implementation is an AABB test on the `bounds` property of the shape,
   * suitable for broad phase.
   * @param {number} x 
   * @param {number} y 
   * @returns {boolean}
   */
  includesPoint(x, y) {
    return Geo.pointInAABB(x, y, ...this.bounds);
  }

  /**
   * Tests another shape for intersection
   * using the Geo.intersectionTests registry.
   * @param {Shape} other 
   * @returns {boolean}
   */
  intersects(other) {
    return Geo.intersect(this, other);
  }
}
Geo.Shape = Shape;

export class Rectangle extends Shape {
  static name = "rec";
  constructor(x, y, w, h) {
    super();
    this.type = "rec";
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.normalize();
  }
  new(x = 0, y = 0, w = 0, h = 0) { return new Rec(x, y, w, h); }

  /**
   * Flips the rectangle when necessary to ensure that
   * dimensions are positive, without moving or resizing it.
   */
  normalize() {
    if (this.w < 0) {
      this.x += this.w;
      this.w = -this.w;
    }
    if (this.h < 0) {
      this.y += this.h;
      this.h = -this.h;
    }
  }

  /**
   * @type {number} x location of the rectangle's (r)ight side\
   * When set, moves the rectangle without resizing.
   */
  get r() { return this.x + this.w; }
  /**
   * @type {number} x location of the rectangle's (r)ight side\
   * When set, moves the rectangle without resizing.
   */
  set r(v) { this.x = v - this.w; }

  /**
   * @type {number} y location of the rectangle's bottom ("(d)ownward") side\
   * When set, moves the rectangle without resizing.
   */
  get d() { return this.y + this.h; }
  /**
   * @type {number} y location of the rectangle's bottom ("(d)ownward") side\
   * When set, moves the rectangle without resizing.
   */
  set d(v) { this.y = v - this.h; }

  /**
   * @type {number} Width or height, whichever is smaller.
   */
  get min() { return Math.min(this.w, this.h); }
  /**
   * @type {number} Determines which dimension (width or height)
   * is smaller, then replaces it with the supplied value.
   */
  set min(v) {
    if (this.h < this.w)
      this.h = v;
    else
      this.w = v;
  }

  /**
   * @type {number} Width or height, whichever is greater.
   */
  get min() { return Math.max(this.w, this.h); }
  /**
   * @type {number} Determines which dimension (width or height)
   * is greater, then replaces it with the supplied value.
   */
  set min(v) {
    if (this.h > this.w)
      this.h = v;
    else
      this.w = v;
  }

  /**
   * Tests this axis aligned rectangle for intersection with another
   * axis aligned rectangle.
   * @param {Rectangle} other
   * @returns {boolean}
   */
  intersectAABB(other) {
    return Geo.intersectAABB(this.x, this.y, this.w, this.h, other.x, other.y, other.w, other.h);
  }

  /**
   * Returns the intersection area of two rectangle objects
   * as a new rectangle, if it exists.
   * @param {Rectangle} other 
   * @returns {Rectangle}
   */
  intersection(other) {
    if (!this.intersectAABB(other)) return null;
    let x = Math.max(this.x, other.x);
    let y = Math.max(this.y, other.y);
    return new Rectangle(x, y, Math.min(this.r, other.r) - x, Math.min(this.d, other.d) - y);
  }

  /**
   * 
   * @param {Rectangle} other 
   * @returns 
   */
  union(other) {
    let x = Math.min(this.x, other.x);
    let y = Math.min(this.y, other.y);
    return new Rectangle(x, y, Math.max(this.r, other.r) - x, Math.max(this.d, other.d) - y);
  }

  /**
   * Expands the rectangle bounds to include the provided point.
   * If the point is already contained, does nothing.
   * @param {number} x 
   * @param {number} y 
   */
  expandIncludePoint(x, y) {
    if (x < this.x) {
      this.w += this.x - x;
      this.x = x;
    } else if (x > this.x + this.w) {
      this.w = x - this.x;
    }
    if (y < this.y) {
      this.h += this.y - y;
      this.y = y;
    } else if (y > this.y + this.h) {
      this.h = y - this.y;
    }
  }

  /**
   * Clips off any part of this rectangle that does not fit
   * within the supplied rectangle. If they do not intersect,
   * does nothing and returns false.
   * @param {Rectangle} other
   * @returns {boolean} `true` if clipping succeeded
   */
  clip(other) {
    if (!this.intersectAABB(other.x, other.y, other.w, other.h)) return false;
    this.x = Math.max(this.x, other.x);
    this.y = Math.max(this.y, other.y);
    this.w = Math.min(this.r, other.r) - this.x;
    this.h = Math.min(this.d, other.d) - this.y;
    this.normalize();
    return true;
  }

  /**
   * @todo: The hell was I thinking? This doesn't do anything
   * Clips a line segment to only the portion that fits within
   * the bounds of this rectangle.
   * @param {Geo.LineSeg} lineSeg
   * @returns {Geo.LineSeg}
   */
  clipLine(lineSeg) {
    let box = new game.rec(...lineSeg.bounds);
    box = this.intersection(box);
    if (!box) return null;
    if (lineSeg.dx > 0) {
      if (lineSeg.dy > 0)
        return new Geo.LineSeg(box.x, box.y, box.r, box.d);
      else
        return new Geo.LineSeg(box.x, box.d, box.r, box.y);
    } else {
      if (lineSeg.dy > 0)
        return new Geo.LineSeg(box.r, box.y, box.x, box.d);
      else
        return new Geo.LineSeg(box.r, box.d, box.x, box.y);
    }
  }
}
Geo.Rectangle = Rectangle

export class Circle extends Shape {
  static name = "circle";
  constructor(a, b = null, c = null) {
    super();
    this.type = "circle";
    if (b && c) {
      this.r = c;
      this.x = a;
      this.y = b;
    } else {
      this.r = a;
    }
    // w and h are left as 0, which allows the inherited properties cx and cy
    // to continue working properly.
  }
  new(a, b = null, c = null) { return new Circle(a, b, c); }

  get bounds() { return [this.x - this.r, this.y - this.r, this.r * 2, this.r * 2]; }
  set bounds(v) {
    if (Array.isArray(v)) {
      if (v.length < 4) {
        // Parameter array
        this.x = v[0] ?? this.x;
        this.y = v[1] ?? this.y;
        this.r = v[2] ?? this.r;
        return;
      }
    }
    if (v.r) {
      // Circle passed as bounds,
      // copy dimensions
      this.x = v.x;
      this.y = v.y;
      this.r = v.r;
      return;
    }
    // Rectangle or rectangular bounds array
    let x = v.x ?? v[0];
    let y = v.y ?? v[1];
    let w = v.w ?? v[2];
    let h = v.h ?? v[3];
    // Move to center
    this.x = x + w / 2;
    this.y = y + h / 2;
    // Fit to minimum dimension of bounding box
    this.r = Math.min(w, h) / 2;
  }

  includesPoint(x, y) {
    return super.includesPoint(x, y) && Math.hypot(x - this.x, y - this.y) <= this.r;
  }

  convex(vertCount) {
    // Start at screen East/angle 0
    let verts = [this.x + this.r, this.y];
    for (let i = 1; i < vertCount; i++) {
      verts.push(Math.cos(Math.PI * (2 * i / vertCount)) * this.r);
      verts.push(Math.sin(Math.PI * (2 * i / vertCount)) * this.r);
    }
    return new Geo.convex(...verts);
  }

  /**
   * Returns an iterator for points around the circle's perimeter.
   * @param {number} vertCount Number of points to divide the circle into
   * @param {boolean?} close If true, returns the starting point again at the end of iteration to close the loop.
   * @returns {[number, number, number]} [index, x, y]
   */
  *ring(vertCount, close = false) {
    // Start at screen East/angle 0
    yield [0, this.x + this.r, this.y];
    for (let i = 1; i < vertCount; i++) {
      yield [i, Math.cos(Math.PI * (2 * i / vertCount)) * this.r, Math.sin(Math.PI * (2 * i / vertCount)) * this.r];
    }
    if (close) {
      yield [vertCount, this.x + this.r, this.y];
    }
  }
}
Geo.Circle = Circle;

export class LineSeg extends Shape {
  static name = "line";
  constructor(ax, ay, bx, by) {
    super();
    this.type = "line";
    this.ax = ax;
    this.ay = ay;
    this.bx = bx;
    this.by = by;
  }
  new(ax = 0, ay = 0, bx = 0, by = 0) { return new LineSeg(ax, ay, bx, by); }

  /** @type {[number, number]} Position of the first point*/
  get a() { return [this.ax, this.ay]; }
  /** @type {[number, number]} Position of the first point*/
  set a(v) {
    this.ax = v.x ?? v[0] ?? v;
    this.ay = v.y ?? v[1] ?? v;
  }

  /** @type {[number, number]} Position of the second point*/
  get b() { return [this.bx, this.by]; }
  /** @type {[number, number]} Position of the second point*/
  set b(v) {
    this.bx = v.x ?? v[0] ?? v;
    this.by = v.y ?? v[1] ?? v;
  }

  /** @type {number} Center of the line. When set, moves the line, does not change its dimensions. */
  get cx() { return (this.ax + this.bx) / 2; }
  /** @type {number} Center of the line. When set, moves the line, does not change its dimensions. */
  get cy() { return (this.ay + this.by) / 2; }

  /** @type {number} Center of the line. When set, moves the line, does not change its dimensions. */
  set cx(x) {
    let cx = this.cx;
    this.ax = x + (this.ax - cx);
    this.bx = x + (this.bx - cx);
  }

  /** @type {number} Center of the line. When set, moves the line, does not change its dimensions. */
  set cy(y) {
    let cy = this.cy;
    this.ay = y + (this.ay - cy);
    this.by = y + (this.by - cy);
  }

  get center() { return [this.cx, this.cy]; }
  set center(v) {
    this.cx = v.x ?? v[0] ?? v;
    this.cy = v.y ?? v[1] ?? v;
  }

  /** @type {number} Distance between start and end of the line segment. Setting the length moves point b to match the provided distance. */
  get length() { return Geo.dist(this.ax, this.ay, this.bx, this.by); }
  /** @type {number} Distance between start and end of the line segment. Setting the length moves point b to match the provided distance. */
  set length(v) {
    let len = this.length;
    this.bx = (this.bx - this.ax) / len * v + this.ax;
    this.by = (this.by - this.ay) / len * v + this.ay;
  }

  get dx() { return this.bx - this.ax; }
  set dx(v) { this.bx = this.ax + v; }

  get dy() { return this.by - this.ay; }
  set dy(v) { this.by = this.ay + v; }

  get delta() { return [this.bx - this.ax, this.by - this.ay] }
  set delta(v) {
    this.dx = v.x ?? v[0] ?? v;
    this.dy = v.y ?? v[1] ?? v;
  }

  /** @type {number} Angle between the x axis and the delta vector of this line segment, in degrees. */
  get angle() { return Math.atan2(this.dy, this.dx) * 180 / Math.PI; }
  /** @type {number} Angle between the x axis and the delta vector of this line segment, in degrees. */
  set angle(v) {
    v *= Math.PI / 180;
    let l = this.length;
    this.dx = Math.cos(v) * l;
    this.dy = Math.sin(v) * l;
  }

  /** @type {number} the minimum x position on the line segment */
  get minx() { return Math.min(this.ax, this.bx); }
  /** @type {number} the minimum x position on the line segment */
  set minx(v) {
    if (this.bx < this.ax) this.bx = v;
    else this.ax = v;
  }

  /** @type {number} the maximum y position on the line segment */
  get miny() { return Math.min(this.ay, this.by); }
  /** @type {number} the maximum y position on the line segment */
  set miny(v) {
    if (this.by < this.ay) this.by = v;
    else this.ay = v;
  }

  /** @type {number} the maximum x position on the line segment */
  get maxx() { return Math.max(this.ax, this.bx); }
  /** @type {number} the maximum x position on the line segment */
  set maxx(v) {
    if (this.ax > this.bx) this.ax = v;
    else this.bx = v;
  }

  /** @type {number} the minimum y position on the line segment */
  get maxy() { return Math.max(this.ay, this.by); }
  /** @type {number} the minimum y position on the line segment */
  set maxy(v) {
    if (this.ay > this.by) this.by = v;
    else this.by = v;
  }

  /** @type {[number, number]} the minimum x and y positions included in the line segment, independently */
  get min() { return [this.minx, this.miny]; }
  /** @type {[number, number]} the minimum x and y positions included in the line segment, independently */
  set min(v) {
    this.minx = v.x ?? v[0] ?? v;
    this.miny = v.y ?? v[1] ?? v;
  }

  /** @type {[number, number]} the maximum x and y positions included in the line segment, independently */
  get max() { return [this.maxx, this.maxy]; }
  /** @type {[number, number]} the maximum x and y positions included in the line segment, independently */
  set max(v) {
    this.maxx = v.x ?? v[0] ?? v;
    this.maxy = v.y ?? v[1] ?? v;
  }

  /** @type {number} the normalized width of the line segment */
  get w() { return this.maxx - this.minx; }
  /** @type {number} the normalized width of the line segment */
  set w(v) { this.maxx = v - this.minx; }

  /** @type {number} the normalized width of the line segment */
  get h() { return this.maxy - this.miny; }
  /** @type {number} the normalized width of the line segment */
  set h(v) { this.maxy = v - this.miny; }

  get bounds() {
    return [this.minx, this.miny, Math.abs(this.dx), Math.abs(this.dy)];
  }
  set bounds(v) {
    // Todo
  }

  /**
   * Rescales this line segment while maintaining the center position
   * @param {number} scalar 
   */
  scaleFromCenter(scalar) {
    let cx = this.cx;
    let cy = this.cy;
    this.ax = (this.ax - cx) * scalar + cx;
    this.ay = (this.ay - cy) * scalar + cy;
    this.bx = (this.bx - cx) * scalar + cx;
    this.by = (this.by - cy) * scalar + cy;
  }

  /**
   * x to y: calculates y value at the given x position on the line
   * defined by this segment.
   * @param {number} xtest 
   * @returns {number} y
   */
  xtoy(xtest) {
    // Trivial cases
    if (this.ax == this.bx) return NaN;
    if (this.ay == this.by) return this.ay;
    return (xtest - this.ax) / this.dx * this.dy + this.ay;
  }

  /**
   * y to x: calculates x value at the given y position on the line
   * defined by this segment.
   * @param {number} ytest 
   * @returns {number} x
   */
  ytox(ytest) {
    // Trivial cases
    if (this.ax == this.bx) return this.ax;
    if (this.ay == this.by) return NaN;
    return (ytest - this.ay) / this.dy * this.dx + this.ay;
  }

  /**
   * 
   * @param {number} v 0-1
   * @returns {[number, number]} [x, y]
   */
  lerp(v) {
    return [
      v * this.dx + this.ax,
      v * this.dy + this.ay
    ];
  }

  /**
   * 
   * @param {number} x 
   * @param {number} y 
   * @returns {number} factor
   */
  delerp(x, y) { return Geo.lineDelerp(x, y, this.ax, this.ay, this.bx, this.by); }

  /** @type {number} Returns the slope of the line, or `NaN` if the line is vertical. */
  get slope() { return (this.ax == this.bx) ? NaN : this.dy / this.dx; }

  /**
   * Sets the points of a line segment relative to its original center,
   * or to a provided origin point. The vector `da` defines
   * the relative location of the beginning point, and `db` the end.
   * @param {number} dax 
   * @param {number} day 
   * @param {number} dbx 
   * @param {number} dby 
   * @param {number?} ox 
   * @param {number?} oy 
   */
  setByCenter(dax, day, dbx, dby, ox = null, oy = null) {
    ox ??= this.cx;
    oy ??= this.cy;
    this.ax = ox + dax;
    this.ay = oy + day;
    this.bx = ox + dbx;
    this.by = oy + dby;
  }

  /**
   * Rotates the points of the line segment 90 degrees
   * in the direction from +y to +x (clockwise on screens)
   * around a provided origin point, or around the center of
   * the line segment if none is provided.
   * @param {number?} ox 
   * @param {number?} oy 
   */
  rotate90(ox = null, oy = null) {
    ox ??= this.cx;
    oy ??= this.cy;
    let dax = this.ax - ox;
    let day = this.ay - oy;
    let dbx = this.bx - ox;
    let dby = this.by - oy;
    this.ax = ox - (day - oy);
    this.ay = oy + (dax - ox);
    this.bx = ox - (dby - oy);
    this.by = oy + (dbx - ox);
  }

  /**
   * Returns a perpendicular vector with the same magnitude
   * as the line segment's length.
   * @returns {[number, number]} [dx, dy]
   */
  quicknormal() {
    return [this.ay - this.by, this.bx - this.ax];
  }
  /**
   * Returns a vector of magnitude 1 with an angle perpendicular to this line.\
   * If magnitude is unimportant, prefer `quicknormal()`.
   * @returns {[number, number]} [dx, dy]
   */
  normal() {
    return Geo.normalize(this.ay - this.by, this.bx - this.ax);
  }

  /**
   * Returns the nearest point along the line.
   * Does not account for line segment endpoints.
   * @param {number} x 
   * @param {number} y 
   * @returns {[number, number]} [x, y]
   */
  nearestPoint(x, y) {
    let [px, py] = Geo.project(x - this.ax, y - this.ay, this.dx, this.dy);
    return [px + this.ax, py + this.ay];
  }

  /**
   * Checks if a point is within range of the line,
   * though it can extend past the ends.
   * @param {number} x 
   * @param {number} y 
   * @param {number?} range Defaults to `0.001`
   * @returns {boolean}
   */
  includesPoint(x, y, range = 0.001) {
    let [px, py] = this.nearestPoint(x, y);
    return Math.hypot(px - x, py - y) <= range;
  }

  /**
   * Returns `true` if the provided point is on the "left" side
   * of this line.\
   * @param {number} x 
   * @param {number} y 
   * @returns {boolean}
   */
  pointBehind(x, y) {
    return Geo.cross(this.dx, this.dy, x - this.ax, y - this.ay) <= 0;
  }

  /**
   * Returns the intersection of the provided lines as parametric values.\
   * `this` is represented as a function of `t`, where `0 <= t <= 1`;\
   * `other` is represented as a function of `u`, where `0 <= u <= `.\
   * If the lines are colinear, returns `[NaN, NaN]`.\
   * If the lines are parallel and do not intersect, returns `[Infinity, Infinity]`.
   * Credit: https://stackoverflow.com/a/565282
   * @param {geo.LineSeg} other 
   * @returns {[number|NaN|Infinity, number|NaN|Infinity]} [t, u]
   */
  intersectTU(other) {
    let adx = a.dx;
    let ady = a.dy;
    let bdx = b.dx;
    let bdy = b.dy;
    let dox = b.bx - a.ax;
    let doy = b.by - a.ay;

    let rxs = Geo.cross(adx, ady, bdx, bdy);
    if (rxs === 0) {
      // Colinear, may or may not intersect
      if (Geo.cross(dox, doy, adx, ady) === 0) return [NaN, NaN];
      // Parallel, non-intersecting
      return [Infinity, Infinity];
    }
    // Lines intersect, bounds still need to be checked.
    return [
      Geo.cross(dox, doy, bdx, bdy) / rxs,
      Geo.cross(dox, doy, adx, ady) / rxs
    ];
  }

  /**
   * Returns the intersection point of the lines constructed from the provided segments.
   * If the lines do not intersect at all, returns [NaN, NaN]
   * @param {geo.lineSeg} other 
   * @returns {[number|NaN, number|NaN]} [x, y]
   */
  intersectionPointUnbounded(other) {
    let [t, u] = this.intersectTU(other);
    if (isFinite(t) && !isNaN(t))
      return this.lerp(t);
    return [NaN, NaN];
  }

  /**
   * the intersection point of the two lines constructed from the line segments
   * and a boolean indicating whether it is a valid intersection of the segments.\
   * If the lines do not intersect at all,
   * the intersection point is returned as [NaN, NaN].
   * @param {geo.lineSeg} other 
   * @returns {[boolean, number|NaN, number|NaN]} [doesIntersect, x, y]
   */
  intersectionPoint(other) {
    let [t, u] = this.intersectTU(other);
    // No intersection
    if (!isFinite(t) || isNaN(t)) return [false, t, u];
    // Intersection is out of bounds
    if (t < 0 || t > 1 || u < 0 || u > 1) return [false, NaN, NaN];
    // Intersection
    let [x, y] = this.lerp(t);
    return [true, x, y];
  }

  static pointBehind(x, y, ax, ay, bx, by) {
    return Geo.cross(bx - ax, by - ay, x - ax, y - ay) <= 0;
  }

  /**
   * Tests two line segments for intersection.
   * Same as instance test, but does not create or require new objects.
   * @param {number} aax 
   * @param {number} aay 
   * @param {number} abx 
   * @param {number} aby 
   * @param {number} bax 
   * @param {number} bay 
   * @param {number} bbx 
   * @param {number} bby 
   * @returns {boolean}
   */
  static intersect(aax, aay, abx, aby, bax, bay, bbx, bby) {
    // Broad phase intersection
    if (!Geo.intersectAABB(
      Math.min(aax, abx),
      Math.min(aay, aby),
      Math.abs(abx - aax),
      Math.abs(aby - aay),
      Math.min(bax, bbx),
      Math.min(bay, bby),
      Math.abs(bbx - bax),
      Math.abs(bby - bay)
    )) return false;
    // Returns true if lines are crossing
    return (
      LineSeg.pointBehind(bax, bay, aax, aay, abx, aby) != LineSeg.pointBehind(bbx, bby, aax, aay, abx, aby) &&
      LineSeg.pointBehind(aax, aay, bax, bay, bbx, bby) != LineSeg.pointBehind(abx, aby, bax, bay, bbx, bby)
    );
  }
}
Geo.LineSeg = LineSeg;

/**
 * Object for arbitrary convex polygons.
 * Concave polygons are invalid and will not work properly.
 */
class Convex extends Shape {
  static name = "convex";
  /**
   * Point coordinates must be passed in pairs of numbers
   * in clockwise order. No checking is done to prevent
   * unordered points or concave shapes, but they will not
   * work properly.\
   * An example of a rectangle:\
   * new convex(0,0, 10,0, 10,5, 0,5);
   * @param  {...number} points
   */
  constructor(...points) {
    super();
    this.points = [];
    for (let i = 0; i < points.length - 1; i += 2) {
      this.addPoint(points[i], points[i + 1]);
    }
  }



  get r() { return this.x + this.w; }
  set r(v) { this.x = v - this.w; }
  get d() { return this.y + this.h; }
  set d(v) { this.y = v - this.h; }

  /**
   * Moves x without changing the right position of the bounding box
   * @param {number} x 
   */
  resizeBoundX(x) {
    this.w = this.r - x;
    this.x = x;
  }
  /**
   * Moves y without changing the bottom position of the bounding box
   * @param {number} y 
   */
  resizeBoundY(y) {
    this.h = this.d - y;
    this.y = y;
  }
  /**
   * Moves the right position without affecting the x position of the bounding box
   * @param {number} x 
   */
  resizeBoundR(x) {
    this.w = x - this.x;
  }
  /**
   * Moves the bottom position without affecting the y position of the bounding box
   * @param {number} y 
   */
  resizeBoundD(y) {
    this.h = y - this.y;
  }
  boundFit(x, y) {
    if (x < this.x) this.resizeBoundX(x);
    else if (x > this.r) this.resizeBoundR(x);
    if (y < this.y) this.resizeBoundY(y);
    else if (y > this.d) this.resizeBoundD(y);
  }

  getPoint(i) {
    let sin = this.sin;
    let cos = this.cos;
    return [
      this.points[i][0] + this.x,
      this.points[i][1] + this.y
    ];
  }

  addPoint(x, y) {
    this.boundFit(x, y);
    this.points.push([x, y]);
  }

  /**
   * Sorts points into correct clockwise order.
   * Extremely expensive operation, use sparingly.
   */
  sortPoints() {
    this.points.sort((a, b) => {
      return Math.atan2(a[1], a[0]) - Math.atan2(b[1], b[0]);
    });
  }

  /**
   * Rotates all points in the polygon by a specified amount
   * around the provided origin.
   * @param {number} deg Rotation in degrees clockwise
   * @param {number?} ox Origin of rotation, cx by default
   * @param {number?} oy Origin of rotation, cy by default
   */
  rotate(deg = 90, ox = null, oy = null) {
    let theta = deg / 180 * Math.PI;
    let sin = Math.sin(theta);
    let cos = Math.cos(theta);
    ox ??= this.cx;
    oy ??= this.cy;
    let x, y;
    for (let i = 0; i < this.points.length; i++) {
      [x, y] = this.points[i];
      x -= ox;
      y -= oy;
      this.points[i][0] = x * cos - y * sin + ox;
      this.points[i][1] = y * cos + x * sin + oy;
    }
  }

  /**
   * Returns an iterator for each side of the polygon.
   * The polygon must have at least 3 points, otherwise it immediately terminates.
   * Sides are returned in the form `[index, ax, ay, bx, by]`,
   * where `a` and `b` are the beginning and end points, respectively.
   * @returns {[number, number, number, number, number]} [index, ax, ay, bx, by]
   */
  *sides() {
    if (this.points.length > 3) {
      for (let i = 0; i < this.points.length - 1; i++) {
        yield [i, ...this.points[i], ...this.points[i + 1]];
      }
      yield [this.points.length - 1, ...this.points.last, ...this.points.first];
    }
  }

  /**
   * Checks two convex objects for intersection
   * using the separating axis theorem.
   * Returns `true` if they are intersecting.
   * @param {Convex} shape1 
   * @param {Convex} shape2 
   * @returns {boolean}
   */
  static satCheck(shape1, shape2) {
    let interiorPoints;
    let cx, cy;
    // Iterate over all sides of shape 1
    for (let [i, ax, ay, bx, by] of shape1.sides()) {
      interiorPoints = 0;
      // Check the side each point of shape 2 is on
      for (let j = 0; j < shape2.points.length; j++) {
        [cx, cy] = shape2.points[j];
        // If at least one is interior, this side is valid
        if (Geo.cross(bx - ax, by - ay, cx - ax, cy - ay) >= 0) {
          interiorPoints++;
          break;
        }
      }
      // Fully separating axis found
      if (interiorPoints < 1) return false;
    }
    // No separating axis found, shapes must be intersecting
    // as long as they are convex
    return true;
  }
}

// ==========================================
// Intersection tests
// ==========================================

// circle-circle intersection
Geo.setIntersectionTest(Geo.Circle, Geo.Circle, (a, b) => {
  return Math.hypot(b.y - a.y, b.x - a.x) <= a.r + b.r;
});

// line-line intersection
Geo.setIntersectionTest(Geo.LineSeg, Geo.LineSeg, (a, b) => {
  return a.pointBehind(b.ax, b.ay) != a.pointBehind(b.bx, b.by) &&
    b.pointBehind(a.ax, a.ay) != b.pointBehind(a.bx, a.by);
});

// axis aligned rectangle intersection
Geo.setIntersectionTest(Geo.Rectangle, Geo.Rectangle, (a, b) => {
  // Broadphase intersection test is equivalent to full intersection.
  // This only gets called if broadphase succeeds.
  return true;
});

// aabb-circle intersection
Geo.setIntersectionTest(Geo.Rectangle, Geo.Circle, (a, b) => {
  // Wide AABB
  if (Geo.pointInAABB(b.x, b.y, a.x - b.r, a.y, a.w + b.r + b.r, a.h)) return true;
  // Tall AABB
  if (Geo.pointInAABB(b.x, b.y, a.x, a.y - b.r, a.w, a.h + b.r + b.r)) return true;
  // Corner test
  if (b.x < a.x + a.w / 2) {
    // Left side
    if (b.y < b.y + b.h / 2) {
      // Top left
      return Geo.pointInCircle(b.x, b.y, a.x, a.y, b.r);
    } else {
      // Bottom left
      return Geo.pointInCircle(b.x, b.y, a.x, a.y, b.r);
    }
  } else {
    // Right side
    if (b.y < b.y + b.h / 2) {
      // Top right
      return Geo.pointInCircle(b.x, b.y,)
    }
  }
});

// aabb-line intersection
Geo.setIntersectionTest(Geo.Rectangle, Geo.LineSeg, (a, b) => {
  // If one or both line endpoints are in the rectangle, intersection is true.
  if (Geo.pointInAABB(b.ax, b.ay, a.x, a.y, a.w, a.h)) return true;
  if (Geo.pointInAABB(b.bx, b.by, a.x, a.y, a.w, a.h)) return true;
  // Otherwise, the line MUST be intersecting one of the sides for intersection to be true.
  // Top
  if (Geo.LineSeg.intersect(b.ax, b.ay, b.bx, b.by, a.x, a.y, a.r, a.y)) return true;
  // Right
  if (Geo.LineSeg.intersect(b.ax, b.ay, b.bx, b.by, a.r, a.y, a.r, a.d)) return true;
  // Bottom
  if (Geo.LineSeg.intersect(b.ax, b.ay, b.bx, b.by, a.r, a.d, a.x, a.d)) return true;
  // Left
  if (Geo.LineSeg.intersect(b.ax, b.ay, b.bx, b.by, a.x, a.d, a.x, a.y)) return true;
  return false;
});

// line-circle intersection
Geo.setIntersectionTest(Geo.LineSeg, Geo.Circle, (a, b) => {
  let dotProd = a.delerp(b.x, b.y);
  if (dotProd < 0) return Geo.pointInCircle(a.ax, a.ay, b.x, b.y, b.r);
  if (dotProd > 1) return Geo.pointInCircle(a.bx, a.by, b.x, b.y, b.r);
  let projX = dotProd * a.dx + a.ax;
  let projY = dotProd * a.dy + a.ay;
  return Math.hypot(projX - b.x, projY - b.y) <= b.r;
});

export default Geo;