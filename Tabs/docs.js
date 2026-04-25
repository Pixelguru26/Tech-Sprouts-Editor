import JSLib from "../SproutCore/lib.js";
// Todo: move all docs content to new distributed model.
// For now, import some parts manually.
import tutorial from "../SproutCore/docs/main.js";
import apientity from "../SproutCore/docs/entity.js";

function uid(id) {
  let uid = id;
  let i = 0;
  while (document.getElementById(uid)) {
    uid = `${id}-${i++}`;
  }
  return uid;
}

export function subsection(header, ...children) {
  let ret = JSLib.buildElement("details", {
    // open: "true"
  });
  if (JSLib.isString(header)) {
    ret.appendChild(JSLib.buildElement("summary", {
      textContent: header
    }));
  } else {
    let summary = JSLib.buildElement("summary", {});
    summary.append(header);
    ret.appendChild(summary);
  }
  if (children.length > 0)
    ret.append(...children);
  return ret;
}

export function section(id, header, ...children) {
  let ret = subsection(header, ...children);
  ret.id = id;
  return ret;
};

export function argument(name, type, desc) {
  return JSLib.build([
    "tr", {}, [
      ["td", {}, [
        ["code", {}, name]
      ]],
      ["td", {}, ":", ["code", {}, type], ":"],
      ["td", {}, desc]
    ]
  ]);
};
export function text(...stuff) {
  let ret = JSLib.buildElement("span");
  ret.append(...stuff);
  return ret;
}
export function methodoc(id, returnType, signature, args, desc) {
  let ret = section(uid("method-"+id), id,
    text("Accessed as: ", code(signature), "; returns: ", code(returnType)),
    JSLib.build(["div", {}, desc]),
    JSLib.build(["table", {}, args])
  );
  return ret;
};
export function code(text) {
  return JSLib.buildElement("code", {
    textContent: text
  });
}
/**
 * 
 * @param {string} text 
 * @returns 
 */
export function codeblock(text) {
  // Clean up extra indentation from original code
  let tabCount = 0;
  let minCount = Number.MAX_SAFE_INTEGER;
  text = text.split('\n');
  for (let line of text) {
    tabCount = 0;
    for (let chr of line) {
      if (chr === " " || chr === "\t")
        tabCount++;
      else
        break;
    }
    if (tabCount < minCount && line.length > 1) minCount = tabCount;
  }
  for (let i = 0; i < text.length; i++) {
    if (text[i].length > 1) text[i] = text[i].substring(minCount);
  }
  if (text[0].length <= 1) text.shift();
  text = text.join("\n");
  let ret = JSLib.build([
    "code", {}, [
      ["pre", {textContent: text}]
    ]
  ]);
  ret.classList.add("codeblock");
  return ret;
}
export function html(code) {
  let ret = document.createElement("div");
  ret.innerHTML = code;
  return ret;
}
export function list(...items) {
  let ret = document.createElement("ul");
  items.forEach((item) => {
    ret.append(JSLib.build(["li", {}, item]));
  });
  return ret;
}
export function div(...items) {
  return JSLib.build("div", {}, ...items);
}
let br = () => document.createElement("br");
export function pre(text) {
  return JSLib.buildElement("pre", {textContent: text});
}
export function table(...items) {
  let ret = JSLib.build([
    "table", { class: "docs-members-table" },
    [
      "tr", {},
      [ "td", {}, "name" ],
      [ "td", {}, ":" ],
      [ "td", {}, "type" ],
      [ "td", {}, ":" ],
      [ "td", {}, "description" ]
    ],
    items
  ]);
  return ret;
}
export function member(signature, type, desc, meta = null) {
  let ret = JSLib.build([
    "tr", { class: "docs-member" },
    ["td", {}, ["code", {}, signature]],
    ["td", {}, ":"],
    ["td", {}, ["code", {}, type]],
    ["td", {}, ":"],
    ["td", {}, desc]
  ]);
  if (meta) {
    return [ret, JSLib.build([
      "tr", {class: "docs-member"},
      ["td", {}],
      ["td", {}],
      ["td", {}],
      ["td", {}],
      ["td", {}, meta]
    ])];
  }
  return ret;
}

const data = [
  tutorial,
  section(
    "api", "API",
    section("apigame", "Game",
      section("apiasset", "Assets",
        text("Accessed as:", code("game.asset")),
        section("apiimageasset", "ImageAsset",
          text("Accessed as:", code("game.asset.ImageAsset")),
          section("apiimageassetmembers", "Instance Members",
            table(
              member("src", "string", "the url of the source image to load, can also be a path to default assets."),
              member("width", "number", "(read-only) width of the image in pixels"),
              member("height", "number", "(read-only) height of the image in pixels")
            )
          ),
          section("apiimageassetfunctions", "Static Methods",
            methodoc("getImage", "game.asset.ImageAsset",
              "game.asset.ImageAsset.getImage(path, abs)",
              [
                argument("path", "string", "Path of the file relative to './Assets/'"),
                argument("abs", "bool", "if True, path is not relative and can potentially be a web url.")
              ],
              `
                Attempts to retrieve an image from the provided location.
                If the image has been loaded previously, reuses the original.
              `
            ),
            methodoc("new", "game.asset.ImageAsset",
              "game.asset.ImageAsset.new(path, name, abs)",
              [
                argument("path", "string", "Path of the file relative to './Assets/'"),
                argument("name", "string", "Registry name for the asset, used for easy access."),
                argument("abs", "bool", "if True, path is not relative and can potentially be a web url.")
              ],
              `
                Constructs a new image asset (if possible) from the provided source file.
                The asset is added to the registry for easy access via getAsset().
                Generally, you should prefer getImage() for this purpose.
              `
            ),
          )
        ),
        section("apianimimageasset", "AnimImageAsset",
          text("Accessed as:", code("game.asset.AnimImageAsset")),
          section("apianimimageassetmembers",
            table(
              member("src", "string", "the url of the source image to load"),
              member("width", "number", "(read-only) width of the widest frame in pixels"),
              member("height", "number", "(read-only) height of the tallest frame in pixels"),
              member("duration", "number", "(read-only) length of the animation in seconds"),
              member("frameRate", "number", "number of frames to display per second. Defaults to 30fps."),
              member("animStyle", "string", text("animation behavior type. Can be any of: ", code("loop"), ", ", code("single"), ", ", code("dynamic"))),
              member("frames", "array of game.geo.Rectangle", text("Rectangular sections of the original image to display for each frame of animation."))
            )
          ),
          section("apianimimageassetmethods",
            methodoc("onLoad", "void", "instance.onLoad()", [],
              text("This method is called when the image finishes loading and is ready to be sliced.")
            ),
            methodoc("addFrame", "game.geo.Rectangle", "instance.addFrame(x, y, w, h)",
              [
                argument("x", "number", "top left x position"),
                argument("y", "number", "top left y position"),
                argument("w", "number", "width"),
                argument("h", "number", "height")
              ],
              text("Adds a frame division as the last frame")
            ),
            methodoc("clear", "void", "instance.clear()", [], 
              text("Clears all frame divisions from the list.")
            ),
            methodoc("slice", "void", "instance.slice(x, y, w, h, dx, dy)",
              [
                argument("x", "number", "top left x position of first frame"),
                argument("y", "number", "top left y position of first frame"),
                argument("w", "number", "width of each frame"),
                argument("h", "number", "height of each frame"),
                argument("dx", "number", "empty horizontal space between frames"),
                argument("dy", "number", "empty vertical space between frames")
              ],
              text("Automatically generates a grid of frame divisions for the image.")
            ),
            methodoc("autoSlice", "void", "instance.autoSlice(x, y, hSlices, vSlices, dx, dy)",
              [
                argument("x", "number", "top left x position of first frame"),
                argument("y", "number", "top left y position of first frame"),
                argument("hSlices", "number", "Number of slices to generate columns of grid"),
                argument("vSlices", "number", "Number of slices to generate rows of grid"),
                argument("dx", "number", "empty horizontal space between frames"),
                argument("dy", "number", "empty vertical space between frames")
              ],
              text("Utility method for automatically slicing an image into a certain number of frames vertically and horizontally, automatically calculating frame dimensions.")
            ),
            methodoc("frameAt", "game.geo.Rectangle", "instance.frameAt(clock)", [
              argument("clock", "number", "Time to calculate frame at")
            ], text("Returns the frame that should be displayed at the given time.")),
            methodoc("draw", "void", "instance.draw(canvas, clock)", [
                argument("canvas", "CanvasRenderingContext2D", "Target canvas for rendering"),
                argument("clock", "number", "Current time of animation to render")
              ],
              text("Renders the appropriate frame for the supplied type at (0,0). To render in other locations, push a canvas transform first.")
            )
          )
        )
      ),
      
      apientity,

      section("apistate", "Game State",
        text("Accessed as:", code("game.gameState")),
        html(`
            The central system controlling what code the game executes is the <i>state machine</i>.
            The state machine acts like a switch, rerouting all inputs and outputs so that
            only one part of the game's code is active at any given time.
            For example, if the game is currently in the "menu" state, any code included in the "game" state will remain dormant.
            In some engines - such as Unity - the states are referred to as "stages."
            However, the principle is the same.
            Each state is a separate environment with its own collection of objects, like a level in an arcade game.
          `),
        section("apistatemembers", "Instance Members",
          table(
            member("name", "string", "Name of the gamestate. Used to identify it as a target for switching."),
            member("initialized", "boolean", "Becomes True as soon as the gamestate is loaded for the first time."),
            member("ui", "HTMLElement", "An HTML element loaded into the game's ui space for displaying information or containing buttons. These will always be displayed over game content.")
          )
        ),
        section("apistatemethods", "Instance Methods",
          methodoc("load", "void", "instance.load()", [], 
            `Called once the first time the game state is entered.`
          ),
          methodoc("enter", "void", "instance.enter()", [],
            `Called before the first update when the state becomes active.`
          ),
          methodoc("exit", "void", "instance.exit(nextState = None)", [
            argument("nextState", "string?", "The name of the new state the game is switching to.")
          ], `
            Called as the state is deactivating, before the next state activates.
          `),
          methodoc("update", "void", "instance.update(dt)", [
            argument("dt", "number", "Time in seconds since the last update call.")
          ], `
            Called every frame before rendering. Handles moment-to-moment game logic.
          `),
          methodoc("draw", "void", "instance.draw()", [],
            `Called every frame to render the current game state.`
          ),
          methodoc("keydown", "void", "instance.keydown(key)", [
            argument("key", "string", "Javascript ID of the new key being pressed.")
          ], `
            Called when a key is pressed down. Will not interrupt update or draw calls.
          `),
          methodoc("keyup", "void", "instance.keyup(key)", [
            argument("key", "string", "Javascript ID of the key being released.")
          ], `
            Called when a key is released. Will not interrupt update or draw calls.
          `),
          methodoc("mousedown", "void", "instance.mousedown(b, x, y)", [
            argument("b", "string", "Javascript ID of the mouse button being pressed."),
            argument("x", "number", "x position of the cursor when the button was pressed."),
            argument("y", "number", "y position of the cursor when the button was pressed.")
          ], `
            Called when the mouse is clicked. Will not interrupt update or draw calls.
          `),
          methodoc("mouseup", "void", "instance.mouseup(b, x, y)", [
            argument("b", "string", "Javascript ID of the mouse button being released."),
            argument("x", "number", "x position of the cursor when the button was released."),
            argument("y", "number", "y position of the cursor when the button was released.")
          ], `
            Called when a button on the mouse is released. Will not interrupt update or draw calls.
          `),
          methodoc("scroll", "void", "instance.scroll(x, y, dx, dy)", [
            argument("x", "number", "x position of the cursor when the mouse wheel was scrolled."),
            argument("y", "number", "y position of the cursor when the mouse wheel was scrolled."),
            argument("dx", "number", "How far the mouse wheel was scrolled horizontally. This is usually 0 except on touch pads."),
            argument("dy", "number", "How far the mouse wheel was scrolled down.")
          ], `
            Called repeatedly as the mouse wheel is scrolled.
          `)
        )
      ),
      section("apigeo", "Geometry",
        text("Accessed as:", code("game.geo")),
        section("apigeofunctions", "Static functions",
          methodoc("dist", "number", "game.geo.dist(ax, ay, bx, by)",
            [
              argument("ax", "number", "x coordinate of point a"),
              argument("ay", "number", "y coordinate of point a"),
              argument("bx", "number", "x coordinate of point b"),
              argument("by", "number", "y coordinate of point b")
            ],
            html(`
              Calculates the Euclidean distance between two points.
              <code>sqrt(dx*dx + dy*dy)</code>
            `)
          ),
          methodoc("dot", "number", "game.geo.dot(ax, ay, bx, by)",
            [
              argument("ax", "number", "x length of vector a"),
              argument("ay", "number", "y length of vector a"),
              argument("bx", "number", "x length of vector b"),
              argument("by", "number", "y length of vector b")
            ],
            html(`
              Calculates the dot product of the 2-dimensional vectors a and b.
            `)
          ),
          methodoc("project", "[number, number]", "game.geo.project(ax, ay, bx, by)",
            [
              argument("ax", "number", "x length of vector a"),
              argument("ay", "number", "y length of vector a"),
              argument("bx", "number", "x length of vector b"),
              argument("by", "number", "y length of vector b")
            ],
            html(`
              Projects vector a onto vector b and returns the resulting vector.
              Look up 'dot-product' and 'vector projection' to find explanations of what that means.
            `)
          ),
          methodoc("lerp", "number", "game.geo.lerp(fac, a, b)",
            [
              argument("fac", "number", "Blend factor, in range [0, 1]."),
              argument("a", "number", "Initial value. Returned when fac is 0."),
              argument("b", "number", "Final value. Returned when fac is 1.")
            ],
            `
              Interpolates (blends) between two numbers.
              As the factor increases, the return value approaches b.
              Outside of the range [0, 1], the value is extrapolated from a straight line.
            `
          ),
          methodoc("lineLerp", "[number, number]", "game.geo.lineLerp(fac, ax, ay, bx, by)",
            [
              argument("fac", "number", "Blend factor, in range [0, 1]."),
              argument("ax", "number", "x coordinate of point a"),
              argument("ay", "number", "y coordinate of point a"),
              argument("bx", "number", "x coordinate of point b"),
              argument("by", "number", "y coordinate of point b")
            ],
            html(`
              Returns point <code>(x, y)</code> along the line segment between the points a and b.
              <code>fac</code> is the distance along this line, with <code>fac=0</code> corresponding to point a,
              and <code>fac=1</code> corresponding to point b.
              Essentially a shortcut for <code>
              [game.geo.lerp(fac, ax, bx), game.geo.lerp(fac, ay, by)]
              </code>
            `)
          ),
          methodoc("lineDelerp", "number", "game.geo.lineDelerp(vx, vy, ax, ay, bx, by)",
            [
              argument("vx", "number", "x coordinate of the test point"),
              argument("vy", "number", "y coordinate of the test point"),
              argument("ax", "number", "x coordinate of point a"),
              argument("ay", "number", "y coordinate of point a"),
              argument("bx", "number", "x coordinate of point b"),
              argument("by", "number", "y coordinate of point b")
            ],
            html(`
              Can be thought of as the inverse of lineLerp.<br>
              Returns the normalized dot product of the point <code>(vx, vy)</code>
              onto theline segment between the points a and b.<br>
              To get the full projection, you would use the formula:<br>
              <code>[result * (bx - ax) + ax, result * (by - ay) + ay]</code>
            `)
          ),
          methodoc("cross", "number", "game.geo.cross(ax, ay, bx, by)",
            [
              argument("ax", "number", "x length of vector a"),
              argument("ay", "number", "y length of vector a"),
              argument("bx", "number", "x length of vector b"),
              argument("by", "number", "y length of vector b")
            ],
            html(`
              Returns the so-called "2-dimensional cross product" of the vectors a and b.
              In more standard terminology, this can be thought of as the area of a parallelogram
              formed from these vectors. However, the return value can be negative.<br>
              When b is on the "right" side of a, the "area" is positive.<br>
              When b is on the "left" side of a, the "area" is negative.<br>
              When b lies along a, the area is 0.
            `)
          ),
          methodoc("rotate90", "[number, number]", "game.geo.rotate90(ox, oy, x, y)",
            [
              argument("ox", "number", "x position of the origin"),
              argument("oy", "number", "y position of the origin"),
              argument("x", "number", "x position of the point to transform"),
              argument("y", "number", "y position of the point to transform")
            ],
            html(`
              Rotates the point <code>(x, y)</code> 90 degrees clockwise about
              the origin <code>(ox, oy)</code>,
              assuming an x-right, y-down coordinate system, such as a screen.
            `)
          ),
          methodoc("rotatePoint", "[number, number]", "game.geo.rotatePoint(x, y, angle, ox, oy, sin, cos)",
            [
              argument("x", "number", "x position of the point to transform"),
              argument("y", "number", "y position of the point to transform"),
              argument("angle", "number", "Rotation angle in degrees"),
              argument("ox", "number", "x position of the origin, defaults to 0"),
              argument("oy", "number", "y position of the origin, defaults to 0"),
              argument("sin", "number", "optional precalculated sine value"),
              argument("cos", "number", "optional precalculated cosine value")
            ],
            html(`
              Rotates a point by the provided angle about the provided origin.,
              Sine and cosine can be precalculated and passed as an argument
              for optimization.
            `)
          ),
          methodoc("normalize", "[number, number]", "game.geo.normalize(x, y)",
            [
              argument("x", "number", "x component of the vector"),
              argument("y", "number", "y component of the vector")
            ],
            html(`
              Returns a vector int he same direction as <code>(x, y)</code>
              with a magnitude of 1.
            `)
          ),
          methodoc("orient", "bool", "game.geo.orient(ax, ay, bx, by, cx, cy)",
            [
              argument("ax", "number"),
              argument("ay", "number"),
              argument("bx", "number"),
              argument("by", "number"),
              argument("cx", "number"),
              argument("cy", "number")
            ],
            html(`
              Takes three points representing an angled corner,
              and returns <code>True</code> if the corner is a clockwise turn.<br>
              b is the vertex of the corner, while a and c are
              the beginning and end of the test path, respectively.
              Straight lines return <code>True</code>
            `)
          ),
          methodoc("pointInCircle", "bool", "game.geo.pointInCircle(x, y, ax, ay, ar)",
            [
              argument("x", "number", "x component of the test point"),
              argument("y", "number", "y component of the test point"),
              argument("ax", "number", "x component of the circle's center"),
              argument("ay", "number", "y component of the circle's center"),
              argument("ar", "number", "radius of the circle")
            ],
            html(`
              Returns <code>True</code> if the point <code>(x, y)</code> lies within
              circle a or exactly on its boundary.
            `)
          ),
          methodoc("pointInAABB", "bool", "game.geo.pointInAABB(x, y, ax, ay, aw, ah)",
            [
              argument("x", "number", "x component of the test point"),
              argument("y", "number", "y component of the test point"),
              argument("ax", "number", "x coordinate of the top left corner of rectangle a"),
              argument("ay", "number", "y coordinate of the top left corner of rectangle a"),
              argument("aw", "number", "width of rectangle a"),
              argument("ah", "number", "height of rectangle a")
            ],
            html(`
              Returns <code>True</code> if point <code>(x, y)</code> lies within
              the axis-aligned rectangle a.
            `)
          ),
          methodoc("pointInTri", "bool", "game.geo.pointInTri(x, y, ax, ay, bx, by, cx, cy",
            [
              argument("x", "number", "x component of the test point"),
              argument("y", "number", "y component of the test point"),
              argument("ax", "number", "x coordinate of point a on the triangle"),
              argument("ay", "number", "y coordinate of point a on the triangle"),
              argument("bx", "number", "x coordinate of point b on the triangle"),
              argument("by", "number", "y coordinate of point b on the triangle"),
              argument("cx", "number", "x coordinate of point c on the triangle"),
              argument("cy", "number", "y coordinate of point c on the triangle")
            ],
            html(`
              Returns <code>True</code> if point <code>(x, y)</code> lies within
              triangle <code>abc</code>
            `)
          ),
          methodoc("pointInConvex", "bool", "game.geo.pointInConvex(x, y, ...points)",
            [
              argument("x", "number", "x coordinate of the test point"),
              argument("y", "number", "y coordinate of the test point"),
              argument("...points", "number[]", "The coordinates of each point in the convex shape, in the form (x0, y0, x1, y1, ..., xn, yn")
            ],
            html(`
              Returns <code>True</code> if the point <code>(x, y)</code> lies within the polygon
              defined by the sequence of points provided.<br>
              Every pair of numbers will define another point in the polygon.<br>
              The final point will automatically connect back to the first point.<br>
              The points should all be provided in clockwise order, or all in
              counter-clockwise order. Either works, but it must be consistent.
            `)
          ),
          methodoc("intersect", "bool", "game.geo.intersect(shape1, shape2)",
            [
              argument("shape1", "game.geo.Shape"),
              argument("shape2", "game.geo.Shape")
            ],
            html(`
              Attempts to retrieve the appropriate test for either (shape1, shape2) or (shape2, shape1)
              from the registry and executes it.
              If none can be found, returns <code>False</code> by default.
            `)
          ),
          methodoc("intersectAABB", "bool", "game.geo.intersectAABB(ax, ay, aw, ah, bx, by, bw, bh)",
            [
              argument("ax", "number", "x coordinate of the top left corner of rectangle a"),
              argument("ay", "number", "y coordinate of the top left corner of rectangle a"),
              argument("aw", "number", "width of rectangle a"),
              argument("ah", "number", "height of rectangle a"),
              argument("bx", "number", "x coordinate of the top left corner of rectangle b"),
              argument("by", "number", "y coordinate of the top left corner of rectangle b"),
              argument("bw", "number", "width of rectangle b"),
              argument("bh", "number", "height of rectangle b")
            ],
            html(`
              Returns <code>True</code> if the provided rectangles a and b intersect.
              Cannot test rotated rectangles, but is extremely efficient.
            `)
          ),
          methodoc("convertShape", "game.geo.Shape", "game.geo.convertShape(shape, type)",
            [
              argument("shape", "game.geo.Shape", "The input shape to convert"),
              argument("type", '"rec" or "line" or "circle"', "The desired result shape. Can only be one of three strings.")
            ],
            html(`
              Attempts to convert the supplied shape to the target type as sensibly as possible.
              Note: this is not always possible, let alone sensible.
            `)
          )
        ),
        section("apigeoshape", "Shape class",
          text("Accessed as:", code("game.geo.shape")),
          html(`<br>
            The shape class provides the utilities
            used for collision detection and geometric calculations
            of 2-dimensional shapes. All physics body shapes
            used by entities are derived from this class,
            and thus can use everything listed here.
          `),
          section("apigeoshapemembers", "Instance Members",
            table(
              member("x", "number", "x position of the shape. For rectangles, the top left corner, for circles, the center, etc."),
              member("y", "number", "y position of the shape."),
              member("w", "number", "Width of the shape"),
              member("h", "number", "Height of the shape"),
              member("bounds", "game.geo.shape.Rectangle", "The rectangular bounding box containing the entire shape."),
              member("cx", "number", "The x position of the center of the shape's bounding box."),
              member("cy", "number", "The y position of the center of the shape's bounding box."),
              member("area", "number", "The area of the shape. By default, the area of its bounding box.")
            )
          ),
          section("apigeoshapemethods", "Instance Methods",
            methodoc("scale", "void", "instance.scale(sx, [sy])", 
              [
                argument("sx", "number", "x axis scale factor"),
                argument("sy", "number", "optional y axis scale factor, defaults to sx")
              ],
              html(`
                Rescales the shape's width and height by the factor provided.
              `)
            ),
            methodoc("scaleCenter", "void", "instance.scaleCenter(sx, [sy])",
              [
                argument("sx", "number", "x axis scale factor"),
                argument("sy", "number", "optional y axis scale factor, defaults to sx")
              ],
              html(`
                Scales the shape's width and height,
                maintaining the original center position.
              `)
            ),
            methodoc("includesPoint", "bool", "instance.includesPoint(x, y)",
              [
                argument("x", "number", "x position of the point to test"),
                argument("y", "number", "y position of the point to test")
              ],
              html(`
                Returns True if the provided point lies within
                the shape. Returns False otherwise.
              `)
            ),
            methodoc("intersects", "bool", "instance.intersects(other)",
              [
                argument("other", "game.geo.shape", "target shape to test for intersection")
              ],
              html(`
                Returns True if the provided shape intersects with this one.
                Returns False otherwise.
              `)
            )
          )
        ),
        section("apigeorectangle", "Rectangle class",
          text("Accessed as:", code("game.geo.shape.Rectangle")),
          html(`<br>
            The rectangle class represents non-rotating rectangular
            regions or entities.
            It includes all the functionality of its parent Shape class.
          `),
          section("apigeorectanglemembers", "Instance Members",
            table(
              member("r", "number", "the x position of the right side"),
              member("d", "number", "the y position of the bottom side"),
              member("min", "number", "width or height, whichever is smaller"),
              member("max", "number", "width or height, whichever is larger")
            )
          ),
          section("apigeorectanglemethods", "Instance Methods",
            methodoc("intersectAABB", "bool", "instance.intersectAABB(other)",
              [
                argument("other", "game.geo.shape.Rectangle", "target rectangle to test for intersection")
              ],
              html(`
                Tests this Axis Aligned Bounding Box (hence AABB)
                for intersection with another.
              `)
            ),
            methodoc("expulsion", "[number, number]", "instance.expulsion(other)",
              [
                argument("other", "game.geo.shape.Rectangle", "the 'static' rectangle to expel from")
              ],
              html(`
                Returns the shortest distance vector for this rectangle
                to escape intersection with the other.
                Be sure to perform an intersection test first,
                otherwise you'll get weird results.
              `)
            ),
            methodoc("expelFrom", "[number, number]", "instance.expelFrom(other)",
              [ argument("other", "game.geo.shape.Rectangle", "the 'static' rectangle to expel from") ],
              html(`
                Moves this rectangle out of the other rectangle if they intersect.
                Returns the expulsion vector, which may then be used as a normal.
              `)
            ),
            methodoc("union", "game.geo.shape.Rectangle", "instance.union(other)",
              [ argument("other", "game.geo.shape.Rectangle", "the rectangle to expand to contain") ],
              html(`
                Returns a new rectangle containing both this and the other.
              `)
            ),
            methodoc("expandIncludePoint", "void", "instance.expandIncludePoint(x, y)",
              [
                argument("x", "number", "x position of the point to include"),
                argument("y", "number", "y position of the point to include")
              ],
              html(`
                Expands the rectangle bounds to include the provided point.
              `)
            ),
            methodoc("clip", "bool", "clip(other)",
              [ argument("other", "game.geo.shape.Rectangle", "containing rectangle") ],
              html(`
                Clips off any part of this rectangle that does not fit
                within the supplied rectangle and returns True.
                If they do not intersect, does nothing and returns False.
              `)
            )
          ),
          section("apigeorectanglestatic", "Static Methods",
            methodoc("rectnew", "game.geo.shape.Rectangle", "game.geo.shape.Rectangle.new(x, y, w, h)",
              [
                argument("x", "number", "x position of the top left corner"),
                argument("y", "number", "y position of the top left corner"),
                argument("w", "number", "width of the shape"),
                argument("h", "number", "height of the shape")
              ],
              html(`
                Constructs and returns a new rectangle with the provided parameters.
                Before the rectangle is returned, it is normalized
                to ensure width and height aren't negative, though it maintains
                the same actual shape.
              `)
            )
          )
        ),
        section("apigeocircle", "Circle class",
          text("Accessed as:", code("game.geo.shape.Circle")),
          html(`<br>
            The circle class represents a simple circle shape.
            It includes all the functionality of its parent Shape class.
            Other than that, it's not very different.
          `),
          section("apigeocirclemembers", "Instance Members",
            table(
              member("r", "number", "radius")
            )
          )
        ),
        section("apigeolineseg", "Line Segment class",
          text("Accessed as:", code("game.geo.shape.LineSeg")),
          html(`<br>
            The line segment class contains a start point
            and an end point.
            It is equally effective for representing
            segments, infinite lines, and rays.
          `),
          section("apigeolinesegmembers", "Instance Members",
            table(
              member("ax", "number", "x position of the line's starting point"),
              member("ay", "number", "y position of the line's starting point"),
              member("bx", "number", "x position of the line's end point"),
              member("by", "number", "y position of the line's end point"),
              member("cx", "number", "x position of the line's center"),
              member("cy", "number", "y position of the line's center"),
              member("dx", "number", "total width of the line segment (delta x)"),
              member("dy", "number", "total height of the line segment (delta y)"),
              member("a", "[number, number]", "position of the line's starting point, in the form [x, y]"),
              member("b", "[number, number]", "position of the line's end point, in the form [x, y]"),
              member("center", "[number, number]", "position of the line's center, in the form [x, y]"),
              member("delta", "[number, number]", "difference between the beginning and end of the line, ie b-a"),
              member("length", "number", "distance between the start and end of the line segment"),
              member("minx", "number", "the minimum x position of the line segment, regardless of direction"),
              member("miny", "number", "the minimum y position of the line segment, regardless of direction"),
              member("maxx", "number", "the maximum x position of the line segment, regardless of direction"),
              member("maxy", "number", "the maximum y position of the line segment, regardless of direction"),
              member("min", "[number, number]", "the minimum value position of the line segment's bounding box, regardless of direction"),
              member("max", "[number, number]", "the maximum value position of the line segment's bounding box, regardless of direction"),
              member("slope", "number", "the slope of the line, or NaN if the line is vertical.")
            )
          ),
          section("apigeolinesegmethods", "Instance Methods",
            methodoc("scaleFromCenter", "void", "instance.scaleFromCenter(factor)",
              [ argument("factor", "number", "scale factor") ],
              html(`
                Rescales the line segment without changing the position of its center.
              `)
            ),
            methodoc("xtoy", "number", "instance.xtoy(x)",
              [ argument("x", "number", "") ],
              html(`
                Returns the y value of the line at the provided x location.
              `)
            ),
            methodoc("ytox", "number", "instance.ytoy(y)",
              [argument("y", "number", "")],
              html(`
                Returns the x value of the line at the provided y location.
              `)
            ),
            methodoc("lerp", "[number, number]", "instance.lerp(fac)",
              [ argument("fac", "number", "parametric line factor in the range [0, 1]") ],
              html(`
                Interpolates across the line's length from point a to b.
                The factor is the fraction of the progress along the line.
              `)
            ),
            methodoc("delerp", "number", "instance.delerp(x, y)",
              [
                argument("x", "number", "x position of the test point"),
                argument("y", "number", "y position of the test point")
              ],
              html(`
                Retrieves the parametric factor of the
                test point projected onto the line.
                In other words, if you were to feed the result
                of instance.lerp back into this function,
                you would get the original fac.
              `)
            ),
            methodoc("setByCenter", "void", "instance.setByCenter(dax, day, dbx, dby, ox, oy)",
              [
                argument("dax", "number", "x position of the line's starting point relative to the center"),
                argument("day", "number", "y position of the line's starting point relative to the center"),
                argument("dbx", "number", "x position of the line's ending point relative to the center"),
                argument("dby", "number", "y position of the line's ending point relative to the center"),
                argument("ox", "number", "optional x position of the new center"),
                argument("oy", "number", "optional y position of the new center")
              ],
              html(`
                Sets the points of the line segment relative to its original center,
                or to a new provided origin point.
              `)
            ),
            methodoc("rotate90", "void", "instance.rotate90(ox, oy)",
              [
                argument("ox", "number", "optional x position of a new origin to rotate around"),
                argument("oy", "number", "optional y position of a new origin to rotate around")
              ],
              html(`
                Rotates the points of the line segment 90 degrees in the direction
                from +y to +x (clockwise on screens) around a provided origin point,
                or around the center of the line segment if none is provided.
              `)
            ),
            methodoc("quicknormal", "[number, number]", "instance.quicknormal()",
              [],
              html(`
                Returns a perpendicular vector with the same magnitude as the line's length.
              `)
            ),
            methodoc("normal", "[number, number]", "instance.normal()", [],
              html(`
                Returns a perpendicular vector with a magnitude of 1.
              `)
            ),
            methodoc("nearestPoint", "[number, number]", "instance.nearestPoint(x, y)",
              [
                argument("x", "number", "x position of the test point"),
                argument("y", "number", "y position of the test point")
              ],
              html(`
                Returns the nearest point along the line to the test point.
                Does not restrict the point to the line segment.
              `)
            )
          ),
          section("apigeolinesegstatic", "Static methods",
            methodoc("pointBehind", "bool", "game.geo.LineSeg.pointBehind(x, y, ax, ay, bx, by)",
              [
                argument("x", "number", "x position of the test point"),
                argument("y", "number", "y position of the test point"),
                argument("ax", "number", "x position of the line's starting point"),
                argument("ay", "number", "y position of the line's starting point"),
                argument("bx", "number", "x position of the line's ending point"),
                argument("by", "number", "y position of the line's ending point")
              ],
              html(`
                Returns True if the point is on the "left" side of the line
                (counter clockwise from the angle from the start to the end)
                and False otherwise.
              `)
            ),
            methodoc("intersectionPointUnbounded", "[number, number]", "game.geo.LineSeg.intersectionPointUnbounded(aax, aay, abx, aby, bax, bay, bbx, bby)",
              [
                argument("aax", "number", "x position of point a on line a"),
                argument("aay", "number", "y position of point a on line a"),
                argument("abx", "number", "x position of point b on line a"),
                argument("aby", "number", "y position of point b on line a"),
                argument("bax", "number", "x position of point a on line b"),
                argument("bay", "number", "y position of point a on line b"),
                argument("bbx", "number", "x position of point b on line b"),
                argument("bby", "number", "y position of point b on line b")
              ],
              html(`
                Returns the intersection point of the two infinite lines
                a and b defined by two points each.
                If the lines are parallel, returns [NaN, NaN].
              `)
            ),
            methodoc("intersect", "bool", "game.geo.LineSeg.intersect(aax, aay, abx, aby, bax, bay, bbx, bby)",
              [
                argument("aax", "number", "x position of point a on line a"),
                argument("aay", "number", "y position of point a on line a"),
                argument("abx", "number", "x position of point b on line a"),
                argument("aby", "number", "y position of point b on line a"),
                argument("bax", "number", "x position of point a on line b"),
                argument("bay", "number", "y position of point a on line b"),
                argument("bbx", "number", "x position of point b on line b"),
                argument("bby", "number", "y position of point b on line b")
              ],
              html(`
                Returns True if the line segments a and b intersect, False if they do not.
              `)
            )
          )
        )
      ),
      section("apigraphics", "Graphics",
        text("Accessed as:", code("game.graphics")),
        html(`Provides lower level support for direct rendering operation. For most purposes, graphics are best handled through entities.`),
        section("apigraphicsfunctions", "Functions",
          methodoc("draw", "void", "game.graphics.draw(img, x, y, sx, sy, r, cx, cy, clock)", [

          ], `
            Transforms and renders an image to the canvas similar to many other 2d game engines.
          `),
          methodoc("drawCentered", "void", "game.graphics.drawCentered(img, x, y, sx, sy, r, cx, cy, clock)", [

          ], `
            Transforms and renders an image to the canvas centered at the provided coordinates.
          `),
          methodoc("drawRect", "void", "game.graphics.drawRect(img, x, y, w, h, r, cx, cy, clock)", [

          ], `
            Renders an image to the canvas fitted to the provided rectangle. (before rotation)
          `),
          methodoc("transformRaw", "void", "game.graphics.transformRaw(scaleX = 1, skewVert = 0, skewHoriz = 0, scaleY = 1, dx = 0, dy = 0)", [

          ], `
            Passthrough for canvasContext2D.transform(...).
            Parameters correspond exactly to the first 6 entries in the
            3x3 transform matrix, and are named roughly in correspondence to
            what role that entry performs if modified in isolation.
          `),
          methodoc("transform", "void", "game.graphics.transform(dx, dy, sx, sy, r, cx, cy)", [

          ], `
            Applies a common image drawing transform of rotation, position, and scale.
          `),
          methodoc("debugRect", "void", "game.graphics.debugRect(x, y, w, h)", [

          ], `
            Renders an unfilled red rectangle for debugging purposes.
          `),
          methodoc("debugCRect", "void", "game.graphics.debugCRect(x, y, w, h)", [

          ], `
            Renders an unfilled red rectangle centered on the provided coordinates.
          `),
          methodoc("debugCircle", "void", "game.graphics.debugCircle(x, y, r)", [

          ], `
            Renders an unfilled red circle centered on the provided coordinates for debugging purposes.
          `),
          methodoc("debugLine", "void", "game.graphics.debugLine(x1, y1, x2, y2", [

          ], `
            Renders a red line segment between the provided coordinates for debugging purposes.
          `),
          methodoc("debugDot", "void", "game.graphics.debugDot(x, y)", [

          ], `
            Renders a small red circle at the provided coordinates for debugging purposes.
          `)
        ),
        section("apigraphicsmembers", "Members",
          member("c", "CanvasRenderingContext2D", "The target canvas of the game.")
        )
      ),
      section("apiutil", "Utilities",
        text("Accessed as:", code("game.util")),
        section("apiutilmethods", "Methods",
          methodoc("lerp", "number", "game.util.lerp(fac, a, b)",
            [
              argument("fac", "number", "Blend factor, in range [0, 1]."),
              argument("a", "number", "Initial value. Returned when fac is 0."),
              argument("b", "number", "Final value. Returned when fac is 1.")
            ],
            `
              Interpolates (blends) between two numbers.
              As the factor increases, the return value approaches b.
              Outside of the range [0, 1], the value is extrapolated from a straight line.
            `
          ),
          methodoc("clamp", "number", "game.util.clamp(v, a, b)",
            [
              argument("v", "number", "The number to clamp"),
              argument("a", "number", "The minimum value to return"),
              argument("b", "number", "The maximum value to return")
            ],
            html(`
              Returns v limited to the range of <code>[a, b]</code>
            `)
          ),
          methodoc("wrap", "number", "game.util.wrap(v, a, b)",
            [
              argument("v", "number", "The number to wrap"),
              argument("a", "number", "The (inclusive) minimum value to return"),
              argument("b", "number", "The (non-inclusive) maximum value to return")
            ],
            html(`
              An advanced wrapping function which accounts for negative
              and floating point values.
              Returns v wrapped within the range <code>[a, b)</code>, 0-1 by default.
            `)
          ),
          methodoc("sign", "number", "game.util.sign(v)",
            html(`
              Safely extracts the sign (-1, 0, or 1) of the supplied value.
              Invalid types return 0.
              Boolean values return 0 (False) or 1 (True).
            `)
          ),
          methodoc("signsOpposite", "number", "game.util.signsOpposite(a, b)",
            html(`
              Utility function for intersection tests.
              Returns True if and only if a and b are numbers
              with opposite signs, counting 0 as positive.
              If both are 0, returns False.
            `)
          )
        ),

        section("apiauto", "AutoUpdateUtil",
          html(`Be warned that these utilities are prone to errors due to memory management mismatches between Javascript and Pyodide.`),
          section("apismooth", "SmoothUtil",
            "Todo"
          ),
          section("apiverlet", "VerletUtil",
            "Todo"
          ),
          section("apitimer", "TimerUtil",
            "Todo"
          ),
          section("apirandtimer", "RandTimerUtil",
            "Todo"
          )
        )
      ),
      section("apiworld", "Game World",
        text("Current world instance accessed as:", code("game.world")),
        section("apiworldmethods", "Instance Methods",
          methodoc("testIntersection", "boolean", "instance.testIntersection(testEnt, condition)", [
            argument("testEnt", "game.Entity", "Entity to test collisions for."),
            argument("condition", "function(ent): boolean", "An optional check which the entity must also pass for the function to return True.")
          ], html(`
            Tests all other entities and bullets in the world for intersection
            with the provided test entity.<br />
            Returns True if one intersects, unless a condition function is provided.
            In that case, returns true if an entity intersects for which that function also returns True.
          `)),
          methodoc("update", "void", "instance.update(dt)", [
            argument("dt", "number", "Time in seconds since the last update call.")
          ], `
            Updates the world and all entities in it. Intended to be called once every frame before rendering.
          `),
          methodoc("draw", "void", "instance.draw()", [], `
            Renders all entities and bullets in the world.
          `),
          methodoc("addEntity", "void", "instance.addEntity(ent)", [
            argument("ent", "game.Entity", "New entity to add to the game world.")
          ], `
            If the entity is not already present in the world, adds it to the world before the next update tick.
          `),
          methodoc("addBullet", "void", "instance.addBullet(bul)", [
            argument("bul", "game.Entity", "New bullet to add to the game world.")
          ], `
            If a bullet is not already present in the world, adds it as a bullet before the next update tick.
          `),
          methodoc("clear", "void", "instance.clear()", [], `
            Attempts to finalize and delete all entities and bullets.
            Warning: in order to ensure success, this will not perform callbacks other than finalize.
          `),
          methodoc("keydown", "void", "instance.keydown(k)", [
            argument("k", "string", "Javascript ID of the key being pressed.")
          ], `
            Calls keydown callbacks on all entities and bullets in the world.
          `),
          methodoc("keyup", "void", "instance.keyup(k)", [
            argument("k", "string", "Javascript ID of the key being released.")
          ], `
            Calls keyup callbacks on all entities and bullets in the world.
          `),
          methodoc("mousedown", "void", "instance.mousedown(b, x, y)", [
            argument("b", "string", "Javascript ID of the button being pressed."),
            argument("x", "number", "x coordinate of the cursor when the mouse button was pressed."),
            argument("y", "number", "y coordinate of the cursor when the mouse button was pressed.")
          ], `
            Calls mousedown callbacks on all entities and bullets in the world.
          `),
          methodoc("mouseup", "void", "instance.mouseup(b, x, y)", [
            argument("b", "string", "Javascript ID of the button being released."),
            argument("x", "number", "x coordinate of the cursor when the mouse button was released."),
            argument("y", "number", "y coordinate of the cursor when the mouse button was released.")
          ], `
            Calls mouseup callbacks on all entities and bullets in the world.
          `),
          methodoc("scroll", "void", "instance.scroll(x, y, dx, dy)", [
            argument("x", "number", "x coordinate of the cursor when the mouse wheel was scrolled."),
            argument("y", "number", "y coordinate of the cursor when the mouse wheel was scrolled."),
            argument("dx", "number", "horizontal distance the mouse wheel was scrolled."),
            argument("dy", "number", "distance the mouse wheel was scrolled down.")
          ], `
            Calls scroll callbacks on all entities and bullets in the world.
          `)
        ),
        section("apiworldmembers", "Instance Members",

        )
      )
    )
  ),
  section(
    "resources", "External Resources",
    list(
      html(`
        <a href="https://www.w3schools.com/python/default.asp">
        W3Schools Python Course
        </a>: A modern and interactive way to learn Python.
      `),
      html(`
        <a href="https://openbookproject.net/thinkcs/python/english3e/">
        How to Think Like a Computer Scientist - 
        Peter Wentworth, Jeffrey Elkner, Allen B. Downey, and Chris Meyers
        </a>: an excellent book for learning Python.
      `),
      html(`
        <a href="https://github.com/Pixelguru26/Tech-Sprouts-Editor">
        Tech Sprouts Editor Github Repository
        </a>: The entire source code for this tool! No secrets!
      `),
      html(`
        <a href="https://pyodide.org/en/stable/">Pyodide Website</a>:
        An advanced reference for the specific Python environment
        used in this project. Mostly only necessary for esoteric nonsense.
      `),
      html(`
        <a href="https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values">Mozilla Developer Network</a>:
        A reference table for the ids of keys in keydown/keyup events.
      `)
    )
  )
];

export default data;