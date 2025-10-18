import JSLib from "./lib.js";

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
    open: "true"
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
      ["td", {}, ":", ["code", {}, type, ":"]],
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
    ["div", {}, desc],
    ["table", {}, args]
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
  section(
    "tutorial", "Tutorials",
    section("tutorial0", "Introduction",
      codeblock(`
        DEV NOTE - OUTLINE:
        - Ensure system is in working order ("Setup")
        - Hello world ("Hello World")
        - Print expression ("Fancy Calculator")
        - Assign variable ("Memories")
        - Strings & concatenation ("Python ssStrings")
      `),
      section("tutorial01", "000: Setup",
        html(`
          Welcome to the SproutCore Python development environment!<br>
          With this system, you will learn important programming fundamentals
          and best practices by modifying a game with the Python language.<br>
          This is a "batteries-included" environment, meaning setup
          should be as simple as loading the webpage.<br>
          Should you encounter problems at any point,
          use the following link to report them directly to the developer
          so they can be fixed:<br>
          <a href="https://github.com/Pixelguru26/Tech-Sprouts-Editor/issues/new">
          https://github.com/Pixelguru26/Tech-Sprouts-Editor/issues/new</a><br>
        `),
        html(`
          With that out of the way, let us begin with basic usage of the environment.<br>
          At the top left of the page, you should have four tabs.
          Just like browser tabs, this allows you to switch between subpages
          of the tool.<br>
        `),
        list(
          html(`
            The first, Documentation, is the default page.<br>
            Here, as well as the tutorials, you can find a comprehensive
            reference for the entire game's program
            and all the tools it provides for using in Python.
            Later on when you have more independence, this will become vital.
          `),
          html(`
            Second, you have the Game tab.<br>
            Here, you can try out your modifications in a real working game!
            For now, this is a relatively simple "spaceship shooter,"
            a traditional first project for game developers which allows
            plenty of room to try things out.
          `),
          html(`
            Third is the Code tab.<br>
            This offers a text editor with access to a special file called "main.py";
            whenever the game is started, this file runs once as soon as everything is
            ready to begin. From here, you can modify any part of the game,
            or even rebuild it entirely!<br>
            As you work, the editor will automatically save changes,
            so that even if something happens you should never lose
            more than 10 seconds of progress.
          `),
          html(`
            The final tab is the Console.<br>
            When programming, it's often necessary to display information
            either to the user or yourself, in the form of a text output.
            To do this, you have access to a tool called <code>print()</code>.
            All output from this tool is recorded in the console,
            allowing you to scroll through it at your leisure.<br>
            Included by default is a short internal history which
            captures any messages repeated too frequently and collapses
            them all to a single entry with a number next to it.
          `),
          html(`
            The last thing to note is the reload icon on the far right.<br>
            Until you reload the game, changes to your code won't affect anything.
            When you click this icon, the computer forgets most of the game
            and starts rebuilding it from scratch. Once the game is
            ready to run, your code will also be loaded and run,
            applying your changes.
          `)
        )
      ),
      section("tutorial02", "001: Hello World",
        html(`
          It's time to jump right into your (probably) first program!<br>
          We'll begin modifying the game later, but first
          it's important that you understand the tools you have.
          The tradition when trying out a new programming tool is
          to write some variation of this as an initial test,
          to ensure the basics are all working properly.
          Python, the language we will be using, has one of the
          simplest versions of any language.<br>
          Try opening the Code tab and pasting the following text:
        `),
        codeblock(`print("Hello, world!")`),
        html(`
          Now, click the reload button on the top right -
          it's the two circling white arrows.
          Once it's finished, you can open the Console tab
          to see the result, which should look something like
          this:
        `),
        codeblock(`0| [8:26:21 PM]: 	Hello, world!`),
        html(`
          Congratulations, you're done!<br>
          Anything between the quotation marks (") will be
          written out to the console automatically, in order.
        `)
      ),
      section("tutorial03", "010: Fancy Calculator",
        html(`
          On its own, the ability to write out
          the same text you put in isn't exactly useful.
          The next step will be to make your computer actually do something.
          As I always like to say, programming is great because
          you make the computer do all the hard math for you!<br>
          In Python, this is really easy.
          Simply take an expression and replace the text in your print:
        `),
        codeblock(`print(6 * 7)`),
        html(`
        `)
      ),
      section("tutorial04", "011: Memories",

      ),
      section("tutorial05", "100: Python ssStrings",

      ),
    ),
    section("tutorial1", "Level 1",
      codeblock(`
        DEV NOTE - OUTLINE:
        Characterized by assigning simple variables and performing basic math
        - Cheats
          - Bonus health (game.player.health)
          - Super speed (game.player.speed)
        - Goofery
          - Increase/decrease player size (game.player.r)
          - Change player skin (todo)
          - Momentum (enable verlet mode) (game.player.verlet = True)
      `),
      code(`game.player.speed = 999`), br(),
      "Other player variables to play with include:",
      list(
        code("game.player.health"),
        code("game.player.scale"),
        code("game.player.speed"),
        code("game.player.angle")
      ), br(),
      code("game.player.health = 100 * 100"), br(),
      code("game.player.speed = game.player.speed * 10"), br(),
      list(
        div(code("game.player.r"), "(the player's collision radius)")
      )
    ),
    section("tutorial2", "Level 2",
      codeblock(`
        DEV NOTE - OUTLINE:
        Characterized by assignment with more complex access
        - Modify player weapon characteristics
        - Overdrive enemy spawn rate
        - Infinite ammo
        - Hacked score
      `),
      codeblock(`
        weapon = game.player.primaryWeapon
        weapon.rate = 20
        weapon.power = 128
      `)
    ),
    section("tutorial3", "Level 3",
      codeblock(`
        DEV NOTE - OUTLINE:
        Characterized by flow control and simple algorithms
        - While loop intro - replicate a for loop
        - For loop intro - an easier way to do what we did before
        - Geometry printing (triangle, square, checkerboard)
      `)
    ),
    section("tutorial3", "Level 3",
      codeblock(`
        DEV NOTE - OUTLINE:
        Characterized by game interactivity and callbacks
        - First function
        - Console input (todo)
        - Custom "hello world" menu button
        - Speeeeen! (player rotation)
      `),
      codeblock(`
        # Custom menu button
        def clicky(target, event):
          print("Hello, world!")
        game.addMenuButton("Hello, world!", clicky)
      `),
      codeblock(`
        # Speeeeen!
        def update(dt):
          game.player.angle = game.player.angle + 100 * dt
      `)
    ),
    section("tutorial4", "Level 4",
      codeblock(`
        DEV NOTE - OUTLINE:
        Characterized by dynamic access and minor static alterations
        - Statically weaken enemies
        - Create a unique player weapon
      `)
    ),
    section("tutorial5", "Level 5",
      codeblock(`
        DEV NOTE - OUTLINE:
        Characterized by class structures and behavioral alterations
        - Custom entity (singleton)
        - Spawner api
        - Helicopter enemy aiming
        - Hacky entity-based ui
      `)
    ),
    section("tutorialwow", "Level ???",
      codeblock(`
        DEV NOTE - OUTLINE:
        elite
         - Reconstruction of base game
         - Flappy Jet
      `)
    )
  ),
  section(
    "api", "API",
    section("apigame", "Game",
      section("apiasset", "Assets",
        text("Accessed as:", code("game.asset")),
        section("apiimageasset", "ImageAsset",
          text("Accessed as:", code("game.asset.ImageAsset")),
          subsection("Static methods",
            methodoc("getImage", "game.asset.ImageAsset",
              "game.asset.ImageAsset.getImage(path)",
              [
                argument("path", "string", "Path of the file relative to './Assets/'")
              ],
              `
                Attempts to retrieve an image from the provided location.
                If the image has been loaded previously, reuses the original.
              `
            ),
            methodoc("new", "game.asset.ImageAsset",
              "game.asset.ImageAsset.new(path, name)",
              [
                argument("path", "string", "Path of the file relative to './Assets/'"),
                argument("name", "string", "Registry name for the asset, used for easy access.")
              ],
              `
                Constructs a new image asset (if possible) from the provided source file.
                The asset is added to the registry for easy access via getAsset().
                Generally, you should prefer getImage() for this purpose.
              `
            ),
          )
        )
      ),
      section("apientity", "Entity",
        section("apientityfunctions", "Static Methods",
          table(
            methodoc("setRelationship", "None",
              "game.entity.setRelationship(team1, team2, relationship)",
              [
                argument("team1", "string", 'Name of a team, such as "player", "enemy", "all", or "none"'),
                argument("team2", "string", 'Name of a team, such as "player", "enemy", "all", or "none"'),
                argument("relationship", "string", 'can be: None, "friendly", or "hostile"')
              ],
              `
                Sets the two-way relationship between two entity teams.
                If the relationship is "friendly," their projectiles will pass through without doing harm.
                If the relationship is "hostile," their projectiles and contact damage will harm one another.
                Entity teams with a "none" relationship may or may not interact depending on their code.
              `
            ),
            methodoc("setFriendly", "None",
              "game.entity.setFriendly(team1, team2)",
              [
                argument("team1", "string", 'Name of a team, such as "player", "enemy", "all", or "none"'),
                argument("team2", "string", 'Name of a team, such as "player", "enemy", "all", or "none"')
              ],
              `
                Sets the relationship between two entity teams to "friendly"
              `
            ),
            methodoc("setHostile", "None",
              "game.entity.setHostile(team1, team2)",
              [
                argument("team1", "string", 'Name of a team, such as "player", "enemy", "all", or "none"'),
                argument("team2", "string", 'Name of a team, such as "player", "enemy", "all", or "none"')
              ],
              `
                Sets the relationship between two entity teams to "hostile"
              `
            ),
            methodoc("remRelationship", "None",
              "game.entity.setNeutral(team1, team2)",
              [
                argument("team1", "string", 'Name of a team, such as "player", "enemy", "all", or "none"'),
                argument("team2", "string", 'Name of a team, such as "player", "enemy", "all", or "none"')
              ],
              `
                Sets the relationship between two entity teams to "none"
              `
            )
          )
        ),
        section("apientitystatic", "Static Members",
          table(
            member("")
          )
        ),
        section("apientitymethods", "Instance Methods",

        ),
        section("apientitymembers", "Instance Members",

        )
      ),
      section("apistate", "Game State",
        html(`
            The central system controlling what code the game executes is the <i>state machine</i>.
            The state machine acts like a switch, rerouting all inputs and outputs so that
            only one part of the game's code is active at any given time.
            For example, if the game is currently in the "menu" state, any code included in the "game" state will remain dormant.
            In some engines - such as Unity - the states are referred to as "stages."
            However, the principle is the same.
            Each state is a separate environment with its own collection of objects, like a level in an arcade game.
          `)
      ),
      section("apigeo", "Geometry",
        
      ),
      section("apigraphics", "Graphics",

      ),
      section("apiutil", "Utilities",
        section("apiutilmethods", "Methods",
          methodoc("lerp", "number")
        ),

        section("apiauto", "AutoUpdateUtil",
          section("apismooth", "SmoothUtil",

          ),
          section("apiverlet", "VerletUtil",

          ),
          section("apitimer", "TimerUtil",

          ),
          section("apirandtimer", "RandTimerUtil",

          )
        )
      ),
      section("apiworld", "Game World",
        
      )
    ),
    section("apipyodide", "Pyodide",

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
        used in this project. Only necessary for esoteric nonsense.
      `)
    )
  )
];

export default data;