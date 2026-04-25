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

import rpsPy from "../pylib/games/rps.py.js";

export default section(
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
  section("tutorial5", "Level 5",
    html(`Rock, Paper, Scissors<br>
      Here is a full example script for a simple
      game of rock, paper, scissors.
      It can be copied into the editor,
      or simply used as reference material.
    `),
    codeblock(rpsPy)
  )
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
);