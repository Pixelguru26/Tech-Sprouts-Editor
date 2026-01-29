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
  section(
    "tutorial", "Tutorials",
    section("tutorial0", "Introduction",
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
          Simply take the expression and replace the text in your print:
        `),
        codeblock(`print(6 * 7)`),
        html(`
          When this runs, you should see the result in the
          console tab of the editor.
          This is what we call an <b>expression</b>:
          any math that can be performed in a single exact way to produce a result.<br>
          As you might guess, this means expressions can do a lot
          more than a simple pocket calculator:
        `),
        codeblock(`print(3 + 4/(2*3*4) - 4/(4*5*6) + 4/(6*7*8) - 4/(8*9*10) + 4/(10*11*12))`),
        html(`
          Yep, that sure is some <b>math</b>. Luckily for us, we don't have
          to touch it. If you run this, you'll see the computer calculate
          all of that in less than the blink of an eye to give you the result:
          a number close to π.<br/>
        `)
      ),
      section("tutorial04", "011: Memories",
        html(`
          In the previous tutorial, we plugged in values to make
          the code do basic math for us.
          For basic formulas, this is fine, but it doesn't let you
          store values for later, or react to different information.
          For this, we're going to need variables, which is really
          just a five dollar word for actually naming stuff.<br/>
          In Python, using variables is really simple:
        `),
        codeblock(`
          apples = 10
          print(apples)
        `),
        html(`
          Easy as that!<br/>
          What we've done here is basically take the number 10
          and name it "apples." Every line below that one can now
          use that variable instead of the literal number.<br/>
          More importantly, we can now use that variable as a blank space
          where we can put anything we want.
          This means we can write a program to do something,
          and feed it whatever number we want without rewriting the whole thing
          by hand.<br/>
          Let's say, for example, that you want to avoid some geometry homework.
          The assignment wants you to calculate the area of a bunch of circles.
          If you do that by hand, it'll make you put in a whole bunch of numbers
          just to do the same thing over and over again.
          Instead, let's teach the computer how to do it with a simple program:
        `),
        codeblock(`
          radius = 10
          pi = 3.141592
          area = pi * radius * radius
          print(area)
        `),
        html(`
          Now calculating the area of a different circle is as easy as changing
          the number assigned to the "radius" variable.<br/>
          When the computer runs this program, it will step through one line at a time,
          performing whatever action that line tells it to, from top to bottom.
          For this program, the computer will perform the following steps in order:
        `),
        list(
          `Store the value "10" in the variable "radius."`,
          `Store the value "3.141592" in the variable "pi."`,
          div(`Calculate the result of`, code("3.141592 * 10 * 10"), `and store the result in the variable "area."`),
          `Print the value of the variable "area" to the console for the user to read.`
        )
      ),
      section("tutorial05", "100: Python ssStrings",
        html(`
          It's time to connect these new capabilities with the very first
          tutorial exercise. In Python, there's no rule restricting expressions
          to numbers. A variable can be just about anything, including text:
        `),
        codeblock(`
          text = "Hello, world!"
          print(text)
        `),
        html(`
          This is what we call a "string," because it is a string of
          characters in order.
        `)
      ),
      section("tutorial06", "101: Misc",
        html(`
          To run the base game, write the following code at the top of
          the editor:
        `),
        codeblock(`
          from pylib.games.shooter import game
        `),
        html(`
          The console has an input at the very bottom. <br/>
          To clear the console while code is running, type the
          following command into the input and press enter:
        `),
        codeblock(`
          cls
        `),
        html(`
          To use console inputs in your code, you must define
          a function to run whenever something is entered.
          SproutCore looks for a function in the game object
          and in the global user code environment called "input".
          Here is a simple demonstration:
        `),
        codeblock(`
          def input(value):
            print("Received command", value)
        `),
        html(`
          By default, SproutCore's asset system searches
          its built-in content directory whenever an image
          is requested. However, since it uses the browser
          to retrieve image data, it is capable of
          retrieving linked images from almost anywhere on
          the web. To make use of this, simply retrieve
          images with the "absolute" tag enabled by passing
          True as the third argument. 
          `),
        codeblock(`
          game.player.sprite = game.Asset.ImageAsset.getImage("https://upload.wikimedia.org/wikipedia/commons/2/22/Earth_Western_Hemisphere_transparent_background.png", "earth", True)
        `),
        html(`
          Due to the unreliability of internet connections,
          this may not work 100% of the time as websites
          restrict access, servers go down, etc.
          It usually isn't a bug in SproutCore itself.
        `)
      )
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
      html(`
        The SproutCore engine provides a wide variety of variables to play with.
        To keep them organized, many of these variables are nested into
        groups, which are themselves named variables.
        In Python, we use dot notation to access such nested variables.
        Generally that takes the form of <code>container.thing</code>.
        Since this can be used on any kind of container, you can even
        chain these to access more and more specific pieces of data.<br/>
        It'll make more sense as you get used to it, for now you can
        just think of some variables having dots in their name.
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
      html(`
        Sometimes, data in a game can be nested very deeply.<br/>
        <code>game.player.primaryWeapon.ammo = -1</code><br/>
        In these cases, it can be beneficial to use variables
        to store parts along the way that you'll be using often.<br/>
        It will help you keep your code clean, and make it easier
        to expand on later as you develop your program.
      `),
      codeblock(`
        weapon = game.player.primaryWeapon
        weapon.ammo = -1
        weapon.rate = 20
        weapon.power = 128
      `)
    ),
    section("tutorial3", "Level 3",
      html(`
        So far, our programs have only run one line at a time in the
        exact same order they appear on screen.
        For more complex programs, however, we will obviously
        want to go back and run previous lines again.
        For that purpose, Python includes "loops."<br/>
        Loops are blocks of code which run normally until
        the computer reaches the end, at which point it will
        return to the beginning of that block.<br/>
        Since we rarely want code to repeat forever,
        the most basic form of loop in Python checks a condition
        before it starts executing the block. This is a structure
        known as a "while" loop, because it repeats the code
        inside <b>while</b> the condition is <code>True</code>.
        Have a look:
      `),
      codeblock(`
        i = 0
        while i < 10:
          print(i)
          i = i + 1
      `),
      html(`
        If you run this code, you'll see that it prints out the numbers
        from 0 to 9 in the console.
        While loops can use any expression that produces a
        Boolean (True or False) value.
        In fact, at the very heart of this engine, a while loop
        controls the entire process of updating the game each frame.<br/>
        Loops like this aren't just a way to avoid excessive copying, though.
        They allow the computer to respond appropriately to any length
        of input data.<br/>
        Loops can even run inside other loops.
        For example, if you wanted to run some function on every
        block in a voxel world, you might use something like this:
      `),
      codeblock(`
        worldSizeX = 2
        worldSizeY = 2
        worldSizeZ = 2
        z = 0
        while z < worldSizeZ:
          y = 0
          while y < worldSizeY:
            x = 0
            while x < worldSizeX:
              print("Updating block:", x, y, z)
              x = x + 1
            y = y + 1
          z = z + 1
      `),
      html(`
        As you can see, this gets unwieldy pretty fast.
        Luckily, loops like this are so common that Python
        includes a shortcut to do exactly the same thing.
        This is called a "for" loop, and it looks like this:
      `),
      codeblock(`
        for i in range(0, 10):
          print(i)
      `),
      html(`
        This is a lot quicker to write, and a lot easier to read.
        With this new tool, our world update code might look
        like this:
      `),
      codeblock(`
        worldSizeX = 2
        worldSizeY = 2
        worldSizeZ = 2
        for z in range(0, worldSizeZ):
          for y in range(0, worldSizeY):
            for x in range(0, worldSizeX):
              print("Updating block:", x, y, z)
      `),
      html(`
        That's a <i>lot</i> easier to work with, isn't it?
        For loops are everywhere in programming, so it's important
        to play around with them until you understand them
        very well.<br/>
        Once you think you've got the hang of them, try
        some of these exercises.<br/>
        We'll start by drawing some shapes in the console.
        The same process is used at a much larger scale
        to display everything you see on screen.
        Without looking at the answer, try to come up with
        a solution to the puzzle on your own.<br/><br/>

        The most basic - and most important - shape we can
        draw is the simple square.
        Try writing a program which prints a square of <code>#</code>,
        5 characters wide and 5 characters tall.
      `),
      subsection("Solution",
        codeblock(`
          # The intended solution
          for i in range(0, 5):
            print("#" * 5)
        `),
        codeblock(`
          # Another possible solution
          print("#####")
          print("#####")
          print("#####")
          print("#####")
          print("#####")
        `),
        html(`
          Of course, the second solution here
          only works if this is the only square you want to ever display.
          While it technically works and may seem at first
          the simplest solution, it can end up being even more work in the end.
          The first solution is more compact and adaptable,
          saving you effort in the long run.
        `),
        codeblock(`
          # An example to demonstrate how the width and height can change.
          width = 10
          height = 10
          for i in range(0, height):
            print("#" * width)
        `)
      ),
      html(`
        Another important shape we might want to draw is the triangle.
        See if you can write a program to print a triangle like this,
        but 10 characters wide and 10 characters tall:
      `),
      codeblock(`
        #
        ##
        ###
        ####
        #####
      `),
      subsection("Solution",
        codeblock(`
          # The intended solution
          for i in range(0, 10):
            print("#" * i)
        `),
        codeblock(`
          # A poor solution
          for i in range(0, 10):
            if i == 0:
              print("#")
            elif i == 1:
              print("##")
            elif i == 2:
              print("###")
            # ... etc
        `),
        html(`
          The second solution here is an example of code which
          makes the programmer work hard instead of making use of the
          computer's capabilities.
          In general, solutions like this are a compromise
          when a far simpler and more elegant solution exists
          that the programmer failed to think of.
        `)
      ),
      html(`
        A useful trick to know which often shows up in
        loops like this is how to perform something on
        even values only:
      `),
      codeblock(`
        for i in range(0, 10):
          if i % 2 == 0:
            print(i)
      `),
      html(`
        This operator - % - can be used to check if the left
        hand side is divisible by the right hand side.
        If it is, the result is zero.
      `)
    ),
    section("tutorial4", "Level 4",
      // codeblock(`
      //   DEV NOTE - OUTLINE:
      //   Characterized by game interactivity and callbacks
      //   - First function
      //   - Console input (todo)
      //   - Custom "hello world" menu button
      //   - Speeeeen! (player rotation)
      // `),
      html(`
        Often, program flow needs more advanced control than simple
        loops can provide, or just need to do the same thing many
        times in many places. Instead of writing the same code over and over,
        Python allows you to save chunks of code to use later.<br/>
        This is called a "function," and it looks like this:
      `),
      codeblock(`
        def hello():
          print("Hello, world!")
      `),
      html(`
        Now that we've created our function, we can reuse it anywhere
        further down the program.
        To do that, you "call" the function like this:
      `),
      codeblock(`
        hello()
      `),
      html(`
        In the parentheses, we can add variables which can be set
        each time you use the function. These are called "arguments."
      `),
      codeblock(`
        def sparkle(text):
          print("*Xx" + text + "xX*")
        sparkle("Alan")
      `),
      html(`
        Arguments allow us to send information into the function,
        but what if we need to get information out?
        For this, we use the return statement.
      `),
      codeblock(`
        def sparkle(text):
          return "*Xx" + text + "xX*"
        print("Hello, " + sparkle("Turing"))
      `),
      codeblock(`
        def isEven(num):
          return num % 2 == 0
        def isOdd(num):
          return !isEven(num)
      `),
      codeblock(`
        def factorial(num):
          if num > 2:
            return num * factorial(num - 1)
          else:
            return 1
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
    // section("tutorial5", "Level 5",
    //   codeblock(`
    //     DEV NOTE - OUTLINE:
    //     Characterized by dynamic access and minor static alterations
    //     - Statically weaken enemies
    //     - Create a unique player weapon
    //   `)
    // ),
    // section("tutorial6", "Level 6",
    //   codeblock(`
    //     DEV NOTE - OUTLINE:
    //     Characterized by class structures and behavioral alterations
    //     - Custom entity (singleton)
    //     - Spawner api
    //     - Helicopter enemy aiming
    //     - Hacky entity-based ui
    //   `)
    // ),
    // section("tutorialwow", "Level ???",
    //   codeblock(`
    //     DEV NOTE - OUTLINE:
    //     elite
    //      - Reconstruction of base game
    //      - Flappy Jet
    //   `)
    // )
  ),
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
      section("apientity", "Entity",
        text("Accessed as:", code("game.entity")),
        section("apientitymembers", "Instance Members",
          table(
            member("x", "number", "x position of the entity's physical bounds"),
            member("y", "number", "y position of the entity's physical bounds"),
            member("w", "number", "width of the entity's physical bounds"),
            member("h", "number", "height of the entity's physical bounds"),
            member("r", "number", "radius of the entity's physical body, if it is a circle"),
            member("collisionType", "string", "sets the type of collision used by the entity, can be either circle, rec, or line"),
            member("team", "string", "a string indicating the relationship to other entities"),
            member("angle", "number", "angle of the entity in degrees clockwise from screen East"),
            member("scalex", "number", "horizontal visual scale factor. 1 by default."),
            member("scaley", "number", "vertical visual scale factor. 1 by default."),
            member("scale", "number", "visual scale factor. Sets both scalex and scaley."),
            member("autoscale", "bool", "if True, the entity's visuals will scale to reflect its physical dimensions"),
            member("alive", "bool", "the entity is only active and capable of interaction while this is True"),
            member("age", "number", "time since the entity was created, in seconds"),
            member("lifetime", "number", "the time in seconds the entity is allowed to live for. If -1, the entity has no time limit."),
            member("verlet", "bool", "(currently experimental) if True, the entity has momentum"),
            member("vx", "number", "horizontal velocity in pixels per second"),
            member("vy", "number", "vertical velocity in pixels per second"),
            member("ax", "number", "horizontal acceleration in pixels per second per second"),
            member("ay", "number", "vertical acceleration in pixels per second per second"),
            member("body", "game.geo.shape", "the physical collision bound of the entity, includes its location"),
            member("sprite", "game.asset.ImageAsset", "todo"),
            member("drawdebug", "bool", "if True, a debug outline is drawn around the entity's bounds")
          )
        ),
        section("apientitymethods", "Instance Methods",
          methodoc("draw", "void", "instance.draw()",
            [],html(`
              This method is called every frame to draw the entity to the screen.
            `)
          ),
          methodoc("update", "void", "instance.update(dt)",
            [ argument("dt", "number", "time since the last frame (delta time) in seconds") ],
            html(`
              This method is called every frame on every entity.
              This is where movement, ai, and moment-to-moment control occurs.
            `)
          ),
          methodoc("keydown", "void", "instance.keydown(key)",
            [ argument("key", "string", "the id of the key pressed") ],
            html(`
              Called once when a key is first pressed.
            `)
          ),
          methodoc("keyup", "void", "instance.keyup()",
            [ argument("key", "string", "the id of the key released") ],
            html(`
              Called once when a key is released.
            `)
          ),
          methodoc("mousedown", "void", "instance.mousedown(b, x, y)",
            [
              argument("b", "number", "which mouse button was pressed"),
              argument("x", "number", "the horizontal position of the cursor when the mouse was clicked"),
              argument("y", "number", "the vertical position of the cursor when the mouse was clicked")
            ],
            html(`
              Called once when the mouse is first clicked.
              May not always match up with a mouseup event appropriately due to window interactions.
            `)
          ),
          methodoc("mouseup", "void", "instance.mouseup(b, x, y)",
            [
              argument("b", "number", "which mouse button was released"),
              argument("x", "number", "the horizontal position of the cursor when the button was released"),
              argument("y", "number", "the vertical position of the cursor when the button was released")
            ],
            html(`
              Called once when a button is released on the mouse.
              May not always match up with a mousedown event appropriately due to window interactions.
              Will also not be called if the button is released outside of the window.
            `)
          ),
          methodoc("scroll", "void", "instance.scroll(x, y, dx, dy)",
            [
              argument("x", "number", "the horizontal position of the cursor when the mouse was scrolled"),
              argument("y", "number", "the vertical position of the cursor when the mouse was scrolled"),
              argument("dx", "number", "the horizontal distance of the scroll movement"),
              argument("dy", "number", "the vertical distance of the scroll movement")
            ],
            html(`
              Called when the mouse wheel is scrolled, or when the touchpad is swiped to scroll the page.
            `)
          ),
          methodoc("Touch", "void", "instance.Touch(other)",
            [ argument("other", "game.entity", "the other entity this one has come into contact with") ],
            html(`
              Called when an entity comes into contact with another, before team testing has occurred.
              Used to trigger interactions such as contact damage, detonation, and ricochet.
            `)
          ),
          methodoc("delete", "void", "instance.delete(reason)",
            [ argument("reason", "any", "the general reason for deleting the entity")]
          ),
          methodoc("intersects", "bool", "instance.intersects(other)",
            [ argument("other", "game.entity", "the other entity to test for intersection") ],
            html(`
              Returns True if the physical bounds of the entities are intersecting.
            `)
          ),
          methodoc("finalize", "void", "instance.finalize()",
            [], html(`
              Recycles the unit's id and destroys internal persistence references.
              Do not override unless you know what you're doing.
            `)
          ),
          methodoc("forward", "void", "instance.forward(distance)",
            [ argument("distance", "number", "distance to move in pixels") ],
            html(`
              Moves the entity in the direction it's facing (based on angle)
              by the specified distance.
            `)
          ),
          methodoc("backward", "void", "instance.backward(distance)",
            [ argument("distance", "number", "distance to move in pixels") ],
            html(`
              Moves the entity back from the direction it's facing
              by the specified distance.
              Equivalent to <code>instance.forward(-distance)</code>
            `)
          ),
          methodoc("right", "void", "instance.right(distance)",
            [ argument("distance", "number", "distance to move in pixels") ],
            html(`
              Causes the entity to strafe right from the direction it's pointing.
              Can be thought of as a shortcut for<br>
              <code class="codeblock">
              instance.turnRight(90)<br>
              instance.forward(distance)<br>
              instance.turnLeft(90)
              </code>
            `)
          ),
          methodoc("left", "void", "instance.left(distance)",
            [ argument("distance", "number", "distance to move in pixels") ],
            html(`
              Causes the entity to strafe left from the direction it's pointing.
              Equivalent to <code>instance.right(-distance)</code>
            `)
          ),
          methodoc("move", "void", "instance.move(dx, dy)",
            [
              argument("dx", "number", "distance to strafe right in pixels"),
              argument("dy", "number", "distance to move forward in pixels")
            ],
            html(`
              Moves the entity in the direction it's facing and strafes
              at the same time. Shortcut for<br>
              <code class="codeblock">
              instance.forward(y)
              instance.right(x)
              </code>
            `)
          ),
          methodoc("rotate", "number", "instance.rotate(theta)",
            [ argument("theta", "number", "angle, in degrees clockwise") ],
            html(`
              Rotates the entity by the specified number of degrees clockwise
              and returns the entity's new angle.
              Rotation affects visuals and the direction of movement for
              "turtle" functions (forward, left, backward, etc.)
            `)
          ),
          methodoc("turnRight", "number", "instance.turnRight(theta)",
            [ argument("theta", "number", "angle, in degrees clockwise") ],
            html(`
              Rotates the entity by the specified number of degrees clockwise
              and returns the entity's new angle.
              Alias for <code>instance.rotate(theta)</code>
            `)
          ),
          methodoc("turnLeft", "number", "instance.turnLeft(theta)",
            [ argument("theta", "number", "angle, in degrees counter-clockwise") ],
            html(`
              Rotates the entity by the specified number of degrees
              counter-clockwise and returns its new angle.
              Equivalent to <code>instance.turnRight(-theta)</code>
            `)
          ),
          methodoc("shoot", "game.entity.bulletEntity", "instance.shoot(bulletType, dx, dy, dtheta)",
            [
              argument("bulletType", "class", "type of bullet to instantiate, or None for default"),
              argument("dx", "number", "lateral offset of the bullet (see <code>instance.move(dx, dy)</code>)"),
              argument("dy", "number", "parallel offset of the bullet (see <code>instance.move(dx, dy)</code>)"),
              argument("dtheta", "number", "difference in angle from the parent entity, in degrees")
            ],
            html(`
              Creates a new bullet at the instance's position with matching team and angle,
              adds it to the world, and returns a reference to it.
              By default, fires a default <code>game.entity.bulletEntity</code>,
              but passing another class as the bulletType argument
              (such as <code>game.entity.explosiveBulletEntity</code>)
              will use that instead.
            `)
          )
        ),
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
        )
      ),
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