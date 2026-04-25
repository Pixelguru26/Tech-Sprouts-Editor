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

import uientity from "./uientity.js";

export default section("apientity", "Entity",
  str("Accessed as:", code("game.entity")),

  // Members
  section("apientitymembers", "Instance Variables",
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
      member("drawdebug", "bool", "if True, a debug outline is drawn around the entity's bounds"),
      member("world", "SproutCore.GameWorld", "a reference to the game world this entity is in")
    )
  ),

  // Methods
  section("apientitymethods", "Instance Methods",
    methodoc("draw", "void", "instance.draw()", [],
      html(`
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

  // Static methods
  section("apientityfunctions", "Class Functions",
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
  ),

  // Subclass documentation
  uientity
);