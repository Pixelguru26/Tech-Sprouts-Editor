import * as lib from "./util.js";
const html = lib.html;
const section = lib.section;
const subsection = lib.subsec;
const code = lib.code;
const codeblock = lib.codeblock;
const str = lib.str;
const list = lib.list;
const div = lib.div;
const br = lib.br;
const methodoc = lib.methodoc;
const argument = lib.argument;
const member = lib.member;
const table = lib.table;

export default section("apiasset", "Asset",
  str("Accessed as: ", code("SproutCore.Asset")),

  section("apiassetmembers", "Instance Variables",
    table(
      member("loaded", "boolean", "(read-only) an internal value indicating whether the asset value can be safely accessed"),
      member("value", "any", "(read-only) the current (safe) value of the asset, will be the default value until fully loaded"),
      member("path", "string", "(read-only) the URL or default asset path of the asset"),
      member("name", "string", "(read-only) shortcut name which can be used to access this asset in the registry")
    )
  ),

  section("apiassetmethods", "Instance Methods",
    methodoc("addcallback", "void", "instance.addCallback(fn)", [
      argument("fn", "function(Asset): void", "Executable function which takes the asset as its only argument.")
    ], "Adds a function to be executed as soon as this object finishes loading. If this object is already loaded, it is executed immediately.")
  ),

  section("apiassetfunctions", "Class Functions",
    methodoc("getAsset", "Asset", "SproutCore.Asset.getAsset(src)", [
      argument("src", "string", "Registry name of the asset to be retrieved.")
    ], "Retrieves a named asset from the registry, if it exists.")
  ),

  section("apiimageasset", "ImageAsset",
    str("Accessed as: ", code("SproutCore.Asset.ImageAsset")), br(),
    str("Subclass of ", code("SproutCore.Asset")),
    section("apiimageassetmembers", "Instance Variables",
      table(
        member("src", "string", "The source URL of the image to load. Can also be a path to access default assets. Invalid paths will produce an error sprite."),
        member("width", "number", "(read-only) width of the image in pixels"),
        member("height", "number", "(read-only) height of the image in pixels")
      )
    ),
    section("apiimageassetmethods", "Instance Methods",
      methodoc("draw", "void", "isntance.draw(canvas, clock = 0)", [
        argument("canvas", "CanvasContext2d", "Target canvas object this will be rendered to."),
        argument("clock", "number", "Time of rendering, used if this is an animated image.")
      ])
    ),
    section("apiimageassetfunctions", "Class Functions",
      methodoc("getImage", "ImageAsset", "SproutCore.Asset.ImageAsset.getImage(src, name, abs)",[
        argument("src", "string", "Either a URL or a path (including extension) to a local image."),
        argument("name", "string", "Registry name of the image, can be used to access it later."),
        argument("abs", "bool", str("If ", code("True"), ", attempts to load the asset without the local path prefix. Use this when loading from a URL."))
      ])
    ),
    str("Examples: "),
    codeblock(`
      entity = game.entity()

      # An example of retrieving an image from the web.
      # If you get an error like 'passed-in image is "broken"',
      # the URL doesn't support sharing images and you'll need to find a different website to get it from.
      entity.sprite = SproutCore.Asset.ImageAsset.getImage("https://upload.wikimedia.org/wikipedia/commons/6/63/Earth_From_the_Perspective_of_Artemis_II.jpg", "erf", True)

      entity.x = 100
      entity.y = 100
      entity.r = 100
      entity.autoscale = True
      game.world.addEntity(entity)
    `)
  ),

  section("apianimimageasset", "AnimImageAsset",
    str("Accessed as: ", code("SproutCore.Asset.AnimImageAsset")), br(),
    str("Subclass of ", code("SproutCore.Asset.ImageAsset")),
    section("apianimimageassetmembers", "Instance Variables",
      table(
        member("width", "number", "Width of the widest frame division."),
        member("height", "number", "Height of the tallest frame division."),
        member("duration", "number", "(readonly) Duration of the animation, in seconds."),
        member("frameRate", "number", "Number of frames to advance every second. Defaults to 30."),
        member("animStyle", "string", str("Looping style of the animation. Can be any of ", code("loop"), ", ", code("single"), ", or ", code("random"), ". Defaults to ", code("loop"), "."))
      )
    ),
    section("apianimimageassetmethods", "Instance Methods",
      methodoc("addFrame", "Rectangle", "instance.AddFrame(x, y, w, h)", [
        argument("x", "number", "Top left x position of the new frame division in pixels."),
        argument("y", "number", "Top left y position of the new frame division in pixels."),
        argument("w", "number", "Width of the new frame division in pixels."),
        argument("h", "number", "Height of the new frame division in pixels.")
      ]),
      methodoc("clear", "void", "instance.clear()", [], "Clears all frame divisions from the list."),
      methodoc("slice", "void", "instance.slice(x, y, w, h, dx, dy)", [
        argument("x", "number", "Top left x position of the first frame column."),
        argument("y", "number", "Top left y position of the first frame row."),
        argument("w", "number", "Width of each frame in pixels."),
        argument("h", "number", "Height of each frame in pixels."),
        argument("dx", "number", "Blank horizontal space between frame columns in pixels. Defaults to 0."),
        argument("dy", "number", "Blank vertical space between frame rows in pixels. Defaults to 0.")
      ], "Slices the image into a grid with the specified cell width and height and adds each cell as a frame division."),
      methodoc("autoSlice", "void", "instance.autoSlice(x, y, hFrames, vFrames, dx, dy)", [
        argument("x", "number", "Top left x position of the first frame column."),
        argument("y", "number", "Top left y position of the first frame row"),
        argument("hFrames", "number", "Number of frame columns to divide the image into."),
        argument("vFrames", "number", "Number of frame rows to divide the image into."),
        argument("dx", "number", "Distance between each frame column in pixels. Defaults to 0."),
        argument("dy", "number", "Distance between each frame row in pixels. Defaults to 0."),
      ], "Slices the image into a grid with the specified number of columns and rows and adds each cell as a frame division."),
      methodoc("frameAt", "number", "instance.frameAt(clock)", [
        argument("clock", "number", "Time since start of animation in seconds.")
      ], "Calculates the index of the frame that should be displayed at the provided clock time.")
    ),
    str("Example: "),
    codeblock(`
      entity = game.entity()

      sprite = SproutCore.Asset.AnimImageAsset.getImage("shield.png", "shield", False)
      sprite.autoSlice(0, 0, 10, 9, 0, 0)
      sprite.animStyle = "loop"
      entity.sprite = sprite

      entity.x = 100
      entity.y = 100
      entity.r = 100
      entity.autoscale = True
      game.world.addEntity(entity)
    `)
  ),

  section("apisubimageasset", "SubImageAsset",
    str("Accessed as: ", code("SproutCore.Asset.SubImageAsset")), br(),
    str("Subclass of ", code("SproutCore.Asset.ImageAsset")),
    section("apisubimageassetmembers", "Instance Variables",
      table(
        member("subRect", "Rectangle", "Rectangular section of the image that will be displayed.")
      )
    ),
    section("apisubimageassetfunctions", "Class Functions",
      methodoc("getImage", "SubImageAsset", "SproutCore.Asset.SubImageAsset.getImage(src, name, abs, x, y, w, h)", [
        argument("src", "string", "Source string for the asset. Same as base class."),
        argument("name", "string", "Registry name of the asset. Same as base class."),
        argument("abs", "bool", "Is path absolute. Same as base class."),
        argument("x", "number", "Top left x position of the rectangle the image will be cropped to, in pixels."),
        argument("y", "number", "Top left y position of the rectangle the image will be cropped to, in pixels."),
        argument("w", "number", "Width of the rectangle the image will be cropped to, in pixels."),
        argument("h", "number", "Height of the rectangle the image will be cropped to, in pixels.")
      ], "Creates a new SubImageAsset with the provided parameters. Does not check the registry to see if one already exists."),
      methodoc("slice", "SubImageAsset[]", "SproutCore.Asset.SubImageAsset.slice(src, name, abs, x, y, w, h, dx, dy)", [
        argument("src", "string", "Source path of the image to be sliced."),
        argument("name", "string", str("Base registry name. Each frame will have its index appended like so ", code("name_0"))),
        argument("abs", "bool", "Is path absolute. Same as base class."),
        argument("x", "number", "Top left x position of the first image column in pixels."),
        argument("y", "number", "Top left y position of the first image row in pixels."),
        argument("totalWidth", "number", "Width of the full image to slice, in pixels. Required due to loading constraints."),
        argument("totalHeight", "number", "Height of the full image to slice, in pixels. Required due to loading constraints."),
        argument("w", "number", "Width of frame column in pixels."),
        argument("h", "number", "Height of frame row in pixels."),
        argument("dx", "number", "Space between frame columns, in pixels."),
        argument("dy", "number", "Space between frame rows, in pixels.")
      ])
    ),
    str("Example: "),
    codeblock(`
      rock = SproutCore.Asset.SubImageAsset.getImage("rpssprites.png", "rock", False, 0, 0, 128, 128)
      paper = SproutCore.Asset.SubImageAsset.getImage("rpssprites.png", "paper", False, 128, 0, 128, 128)
      scissors = SproutCore.Asset.SubImageAsset.getImage("rpssprites.png", "scissors", False, 0, 128, 128, 128)
    `)
  )
)