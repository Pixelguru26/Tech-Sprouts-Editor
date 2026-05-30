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

export default section("apiasset", "Assets",
  text("Accessed as: ", code("game.asset")),

  section("apiassetmembers", "Instance Variables",
    table(
      member("loaded", "boolean", "(read-only) an internal value indicating whether the asset value can be safely accessed"),
      member("value", "any", "(read-only) the current (safe) value of the asset, will be the default value until fully loaded"),
      member("path", "string", "(read-only) the URL or default asset path of the asset"),
      member("name", "string", "(read-only) shortcut name which can be used to access this asset in the registry")
    )
  ),

  section("apiimageasset", "ImageAsset",
    text("Accessed as: ", code("game.asset.ImageAsset")),
    section("apiimageassetmembers", "Instance Variables",
      table(
        member("src", "string", "The source URL of the image to load. Can also be a path to access default assets. Invalid paths will produce an error sprite."),
        member("width", "number", "(read-only) width of the image in pixels"),
        member("height", "number", "(read-only) height of the image in pixels")
      )
    )
  )
)