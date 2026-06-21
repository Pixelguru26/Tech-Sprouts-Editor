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
const table = lib.table;
const member = lib.member;
const methodoc = lib.methodoc;
const arg = lib.argument;

export default section("apiturtleentity", "Turtle Entity",
  str("Accessed as:", code("game.entity.TurtleEntity")), br(),

  str(`
    TurtleEntity is a subclass of entity used to draw simple shapes
    and patterns on the screen that persist across frames.
  `),

  methodoc(
    "Constructor", "TurtleEntity",
    "game.entity.TurtleEntity()", []
  ),

  section("apiturtleentitymembers", "Instance Members", table(
    member("lineColor", "hexadecimal string", html(`Color of lines drawn as a hexadecimal color string, like "#272822". There are many websites that provide valid color codes, such as <a href="https://www.w3schools.com/colors/colors_picker.asp">https://www.w3schools.com/colors/colors_picker.asp</a>`)),
    member("fillColor", "hexadecimal string", `Shape fill color as a hexadecimal color string. "#ffffff" by default.`),
    member("isPenDown", "boolean", `Whether the pen is currently down, meaning that movement will draw lines. False initially.`),
    member("penWidth", "number", `Width of lines drawn in pixels. 1 by default.`),
    member("delay", "number", `Delay between turtle actions, in seconds. When delay > 0, basic turtle actions are queued instead of executing immediately. Be warned that this includes changes to delay itself.`)
  )),

  section("apiturtleentitymethods", "Instance Methods",
    methodoc(
      "forward", "void",
      "instance.forward(distance)", [
        arg("distance", "number", "Distance to move the turtle forward in pixels. Can be negative to move backward.")
      ], str(`
        Moves the turtle forward by the specified distance in the direction of its current heading.
        If the pen is down, this will draw a line as it moves.
      `)
    ),
    methodoc(
      "backward", "void",
      "instance.backward(distance)", [
        arg("distance", "number", "Distance to move the turtle backward in pixels. Can be negative to move forward.")
      ], str(`
        Moves the turtle backward by the specified distance opposite the direction of its current heading.
        If the pen is down, this will draw a line as it moves.
      `)
    ),
    methodoc(
      "turnRight", "void",
      "instance.turnRight(angle)", [
        arg("angle", "number", "Angle to turn the turtle right (clockwise) in degrees. Can be negative to turn left.")
      ], str(`
        Turns the turtle to the right (clockwise) by the specified angle in degrees.
        This changes the turtle's heading, which determines the direction it will move when it moves forward or backward.
        It also determines the orientation of any images drawn by the turtle.
      `)
    ),
    methodoc(
      "turnLeft", "void",
      "instance.turnLeft(angle)", [
        arg("angle", "number", "Angle to turn the turtle left (counterclockwise) in degrees. Can be negative to turn right.")
      ], str(`
        Turns the turtle to the left (counterclockwise) by the specified angle in degrees.
        This changes the turtle's heading, which determines the direction it will move when it moves forward or backward.
        It also determines the orientation of any images drawn by the turtle.
      `)
    ),
    methodoc(
      "penDown", "void",
      "instance.penDown()", [], str(`
        Puts the turtle's pen down. When the pen is down,
        the turtle will draw lines as it moves.
      `)
    ),
    methodoc(
      "penUp", "void",
      "instance.penUp()", [], str(`
        Lifts the turtle's pen up. When the pen is up,
        the turtle will not draw lines as it moves.
      `)
    ),
    methodoc(
      "beginFill", "void",
      "instance.beginFill(color)", [
        arg("color", "hexadecimal string", `Optional fill color as a hexadecimal color string. Sets the turtle's fillColor.`)
      ], str(`
        Begins a fill region. The turtle will record the path it takes
        until endFill is called, and will fill the interior of that path with the turtle's fillColor.
      `)
    ),
    methodoc(
      "endFill", "void",
      "endFill()", [], str(`
        Ends a fill region, filling the interior of the path taken since
        beginFill was called with the turtle's fillColor.
      `)
    ),
    methodoc(
      "setPosition", "void",
      "instance.setPosition(x, y)", [
        arg("x", "number", "New x position for the turtle in pixels."),
        arg("y", "number", "New y position for the turtle in pixels.")
      ], str(`
        Sets the turtle's position to the specified coordinates.
        The turtle will draw a line from its current position to the new position if the pen is down.
      `)
    ),
    methodoc(
      "setHeading", "void",
      "instance.setHeading(angle)", [
        arg("angle", "number", "New angle to set the turtle's heading to, in degrees. 0 is to the right, and angles increase clockwise.")
      ], str(`
        Sets the turtle's heading to the specified angle.
        The turtle's heading is the direction it is facing,
        and determines which way it will move when it moves forward or backward.
        It also determines the orientation of any images drawn by the turtle.
      `)
    ),
    methodoc(
      "drawImage", "void",
      "instance.drawImage(image, sx = 1, sy = 1, clock = 0)", [
        arg("image", "game.asset.ImageAsset", "The image to draw with the turtle. The image will be centered on the turtle's position."),
        arg("sx", "number", "Optional horizontal scale factor for the image. Defaults to 1."),
        arg("sy", "number", "Optional vertical scale factor for the image. Defaults to 1."),
        arg("clock", "number", "Optional clock value for animated images, used to determine which frame to draw. Defaults to 0.")
      ], str(`
        Draws the specified image at the turtle's position with its orientation.
        The image will be rotated according to the turtle's heading, and scaled by the optional scale factors.
        If the image is an animated sprite sheet, the clock value can be used to determine which frame of the animation to draw.
      `)
    )
  ),
  str(`For examples using turtle, check the tutorials section.`)
);