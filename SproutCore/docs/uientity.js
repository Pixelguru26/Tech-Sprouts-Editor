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

export default section("apiuientity", "UI Entity",
  str("Accessed as:", code("game.entity.UIEntity")), br(),

  str(`
    UIEntity is a subclass of entity designed to easily add static
    colored blocks and text to the screen that do not interact with
    the rest of the game world. 
  `),

  methodoc(
    "uientityconstructor", "UIEntity",
    "game.entity.UIEntity(x1, y1, x2, y2, color, text)", [
      arg("x1", "number", "left side x position of the block in pixels"),
      arg("y1", "number", "top side y position in pixels down from the top of the screen"),
      arg("x2", "number", "right side x position of the block in pixels"),
      arg("y2", "number", "bottom side y position in pixels down from the top of the screen"),
      arg("color", "hexadecimal string", html(`flat color of the block as a hexadecimal color string, like "#272822". There are many websites that provide valid color codes, such as <a href="https://www.w3schools.com/colors/colors_picker.asp">https://www.w3schools.com/colors/colors_picker.asp</a>`)),
      arg("text", "string", "text to be displayed on the color block")
    ]
  ),

  section("apiuientitymembers", "Instance Members", table(
    member("color", "hexadecimal string", html(`Flat color of the block as a hexadecimal color string, like "#272822". There are many websites that provide valid color codes, such as <a href="https://www.w3schools.com/colors/colors_picker.asp">https://www.w3schools.com/colors/colors_picker.asp</a>`)),
    member("outlineColor", "hexadecimal string", `Color of the block outline, "transparent" by default.`),
    member("outlineWidth", "number", `Width of the block outline in pixels, be sure to set outlineColor. Defaults to 4.`),
    member("text", "string", `Text to be displayed on this block.`),
    member("textFont", "font string", str(`A CSS font string including size and family. Defaults to `, code("16px sans-serif"))),
    member("textAlignHoriz", "enum string", str(`Defines where to anchor the text horizontally. Can be any of `, code("left"), ", ", code("center"), ", or ", code("right"), ". Defaults to ", code("center"))),
    member("textAlignVert", "enum string", str(`Defines where to anchor the text vertically. Can be any of `, code("top"), ", ", code("center"), ", or ", code("bottom"), ". Defaults to ", code("center"))),
    member("textFit", "enum string", str(`Defines how to automatically resize text to fit the bounds of the entity, if desired. Can be any of `, code("none"), ", ", code("fit"), ", or ", code("stretch"), ". Defaults to ", code("none"))),
    member("textColor", "hexadecimal string", `Color of the text as a hexadecimal color string. "#ffffff" by default.`),
    member("textOutlineColor", "hexadecimal string", `Color of the outline on the text, useful to improve readability on complex scenes. "#000000" by default.`),
    member("textOutlineWidth", "number", `Rough width of the text outline in pixels, not always exact. Defaults to 1.5`)
  ))
);