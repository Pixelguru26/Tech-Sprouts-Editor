import SproutCore
import pyodide
from math import sin, cos, pi

class Entity:

  # Maintains python refs to entities, preventing garbage collection
  # because JS references are uncounted.
  entities = []

  def __init__(this):
    # Acquires pooled unit id to maintain a python ref,
    # preventing premature garbage collection.
    this.unitid = SproutCore.Entity.requestID()
    if (this.unitid == len(Entity.entities)):
      Entity.entities.append(this)
    else:
      Entity.entities[this.unitid] = this
    this.drawdebug = False
    this.scalex = 1
    this.scaley = 1
    this.autoscale = False
    this.age = 0
    this.lifetime = -1
    # Included in base entity rather than living entity
    # because even bullets have a team
    this.team = "none"
    # Physics value section
    this.verlet = False
    this.gravity = False
    this.angle = 0
    this.lastX = None
    this.lastY = None
    this.vx = 0
    this.vy = 0
    this.ax = 0
    this.ay = 0
    this.world = None
    this.hidden = False

    this.body = SproutCore.Geo.Circle.new(0, 0, 0)
    # this.body = SproutCore.Geo.MatterRectangle(0, 0, 100, 100)
    this.sprite = SproutCore.Asset.ImageAsset.getImage("error.png")
    this.__proxy = None
    this.alive = True
  
  def __nop__(this):
    pass

  # Physics passthroughs
  def __get_x__(this):
    # return this.body.position.x
    return this.body.x
  def __set_x__(this, value):
    # this.body.position.x = value
    this.body.x = value
  x = property(__get_x__, __set_x__, __nop__,
    "Passthrough for the x position of the physics body of this object."
  )

  def __get_y__(this):
    # return this.body.position.y
    return this.body.y
  def __set_y__(this, value):
    # this.body.position.y = value
    this.body.y = value
  y = property(__get_y__, __set_y__, __nop__,
    "Passthrough for the y position of the physics body of this object."
  )

  # def __get_angle__(this):
  #   return this.body.angle * 180 / pi
  # def __set_angle__(this, value):
  #   this.body.angle = value / 180 * pi
  # angle = property(__get_angle__, __set_angle__, __nop__,
  #   "Passthrough for the angle of the physics body of this object, in degrees."
  # )

  def __get_w__(this):
    return this.body.w
  def __set_w__(this, value):
    this.body.w = value
  w = property(__get_w__, __set_w__, __nop__,
    "Passthrough for the width of the physics body of this object."
  )

  def __get_h__(this):
    return this.body.h
  def __set_h__(this, value):
    this.body.h = value
  h = property(__get_h__, __set_h__, __nop__,
    "Passthrough for the height of the physics body of this object."
  )

  def __get_r__(this):
    return this.body.r
  def __set_r__(this, value):
    this.body.r = value
  r = property(__get_r__, __set_r__, __nop__,
    "Passthrough for the radius of the physics body of this object."
  )

  # ====

  # Static variable
  relationships = dict()
  @staticmethod
  def setRelationship(team1, team2, relationship):
    """
    Sets an entity team relationship both ways.
    While this seems redundant, it improves
    lookup time and simplicity at a minimal cost.
    Args:
        team1 (string): The name of one of the teams.
        team2 (string): The name of the other team.
        relationship (string): The relationship between the teams. Can be "hostile", "friendly", or "neutral".
    """
    if not (team1 in Entity.relationships):
      Entity.relationships[team1] = dict()
    if not (team2 in Entity.relationships):
      Entity.relationships[team2] = dict()
    Entity.relationships[team1][team2] = relationship
    Entity.relationships[team2][team1] = relationship
  @staticmethod
  def getRelationship(team1, team2):
    """
    Gets the relationship between two entity teams.
    Includes support for the "all" and "none" teams.
    Args:
        team1 (string): The name of one of the teams.
        team2 (string): The name of the other team.
    Returns:
        string: The relationship between the teams. Can be "hostile", "friendly", or "neutral".
    """
    if team1 in Entity.relationships:
      if team2 in Entity.relationships[team1]:
        return Entity.relationships[team1][team2]
    if team1 == "all" or team2 == "all":
      return "friendly"
    if team1 == "none" or team2 == "none":
      return "hostile"
    return "neutral"

  # ====

  def getProxy(this):
    """
    Gets a JS proxy for this entity to prevent disposal.
    Creates one if it does not already exist.
    Returns:
        pyodide.ffi.JsProxy: A JS proxy for this entity.
    """
    if this.__proxy == None:
      this.__proxy = pyodide.ffi.create_proxy(this)
    return this.__proxy
  
  # ====

  def __get_collision_type__(this):
    # return this.body.label
    return this.body.type
  def __set_collision_type__(this, value):
    # old = this.body.label
    old = this.body.type
    if (value == old):
      return
    newShape = SproutCore.Geo.convertShape(this.body, value)
    if (newShape != None):
      this.body = newShape
  collision_type = property(
    __get_collision_type__, __set_collision_type__, __nop__,
    "String indicating which shape is used for physical interactions."
  )

  def __get_scale__(this):
    return min(this.scalex, this.scaley)
  def __set_scale__(this, value):
    aspect = this.scaley / this.scalex
    if this.scaley < this.scalex:
      this.scaley = value
      this.scalex = value / aspect
    else:
      this.scalex = value
      this.scaley = value * aspect
  scale = property(
    __get_scale__, __set_scale__, __nop__,
    "Sets the scale of the entity's sprite. Maintains aspect ratio."
  )

  # ====

  def draw(this):
    """
    Called each frame after update to render this entity.
    """
    if not this.hidden:
      SproutCore.Entity.draw(this)
      # SproutCore.graphics.draw(this.sprite, this.x, this.y, 1, 1, this.angle)
  
  def update(this, dt):
    """
    Called each frame before draw to update this entity's state.
    The base includes verlet integration and lifetime handling.
    Args:
        dt (number): Time since last update, in seconds.
    """
    if this.verlet:
      if this.lastX == None: this.lastX = this.x
      if this.lastY == None: this.lastY = this.y
      tempx = this.x
      tempy = this.y
      
      ax = this.ax
      ay = this.ay
      if this.gravity and this.world != None:
        ax += this.world.gravityX
        ay += this.world.gravityY

      this.x += this.vx * dt + 0.5 * ax * dt * dt
      this.vx += ax * dt
      this.y += this.vy * dt + 0.5 * ay * dt * dt
      this.vy += ay * dt

      this.lastX = tempx
      this.lastY = tempy
    this.age = this.age + dt
    if (this.age > this.lifetime and this.lifetime > 0):
      this.delete("lifetime")

  def touch(this, other):
    """
    Called whenever this entity comes into contact with another.
    Args:
        other (Entity): The other entity involved in the collision.
    """
    pass
  def delete(this, reason = None):
    """
    Marks this entity for deletion.
    Args:_
        reason (string, optional): Reason for the entity's deletion. Useful in certain cases for responding differently to death vs culling. Defaults to None.
    """
    this.alive = False
  def intersects(this, other):
    """
    Checks whether this entity is intersecting with another. Used as condition for calling touch().
    Args:
        other (Entity): The other entity to test against.
    Returns:
        bool: True if the entities are intersecting, False otherwise.
    """
    return this.body.intersects(other.body)
  # ====
  # Turtle functions

  

  # Moves the entity forward by the specified number of pixels.
  def forward(this, distance = 1):
    rad = this.angle / 180 * pi
    if (this.collision_type == "line"):
      # The default implementation for line segments
      # moves the entire line segment. Projectiles use a custom override.
      this.body.ax += cos(rad) * distance
      this.body.ay += sin(rad) * distance
      this.body.bx += cos(rad) * distance
      this.body.by += sin(rad) * distance
    else:
      this.x += cos(rad) * distance
      this.y += sin(rad) * distance
  
  def backward(this, distance = 1):
    this.forward(-distance)
  
  # Moves the entity 90° clockwise from its facing direction by the specified number of pixels.
  def right(this, distance = 1):
    rad = (this.angle + 90) / 180 * pi
    if (this.collision_type == "line"):
      # The default implementation for line segments
      # moves the entire line segment. Projectiles use a custom override.
      this.body.ax += cos(rad) * distance
      this.body.ay += sin(rad) * distance
      this.body.bx += cos(rad) * distance
      this.body.by += sin(rad) * distance
    else:
      this.x += cos(rad) * distance
      this.y += sin(rad) * distance
  
  def left(this, distance = 1):
    this.right(-distance)
  
  def move(this, x = 0, y = 0):
    this.forward(y)
    this.right(x)
  
  def rotate(this, theta = 90):
    this.angle += theta
    return this.angle
  
  def turnRight(this, theta = 90):
    this.angle += theta
    return this.angle
  
  def turnLeft(this, theta = 90):
    this.angle -= theta
    return this.angle
  
  # ====
  
  # Input callbacks used for player-controlled entities
  def keydown(this, key):
    pass
  def keyup(this, key):
    pass
  def mousedown(this, b, x, y):
    pass
  def mouseup(this, b, x, y):
    pass
  def scroll(this, x, y, dx, dy):
    pass

class LivingEntity(Entity):
  """
  Includes some more specialized information (such as health)
  than a basic entity.
  """
  def __init__(this):
    super().__init__()
    this.speed = 300
    this.health = 100
    this.attack = 10
    this.contained = False

  def damage(this, amt):
    """
    Reduces health and destroys this entity if it drops below zero.
    Args:
        amt (number): amount of health to remove
    """
    this.health -= amt
    if not (this.health > 0):
      this.health = 0
      this.delete("health")

  def shoot(this, bulletType, dx = 0, dy = 0, dtheta = 0):
    if bulletType == None: bulletType = Entity.BulletEntity
    ret = bulletType()
    ret.team = this.team
    ret.parent = this
    ret.angle = this.angle + dtheta
    ret.x = this.x
    ret.y = this.y
    ret.move(dx, dy)
    SproutCore.game.world.addBullet(ret)
    return ret

Entity.setRelationship("player", "enemy", "hostile")

Entity.LivingEntity = LivingEntity