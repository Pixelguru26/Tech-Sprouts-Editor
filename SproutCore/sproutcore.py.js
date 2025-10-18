export default `
import SproutCore
import js
import JSLib
import pyodide
from math import pi, sin, cos
from random import random
import weakref

global game
game = None

class GameState:
  def __init__(this):
    this.name = None
    this.initialized = False
    this.ui = None

  def load(this):
    this.initialized = True
  def enter(this):
    if this.ui != None:
      this.setui(this.ui)
  def exit(this, nextState = None):
    this.setui()
  def setui(this, *children):
    uiContainer = js.document.getElementById("game-ui")
    if uiContainer != None:
      uiContainer.replaceChildren(*children)

  def update(this, dt):
    pass
  def draw(this):
    pass

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

class Util:
  @staticmethod
  def clamp(v, min = 0, max = 1):
    if v < min: return min
    elif v > max: return max
    else: return v
  
  @staticmethod
  def lerp(v, a, b):
    return v * (b - a) + a

class AutoUpdateUtil:
  """
  Root class which allows independent subscription to
  the game's core update function.
  """
  __reg__ = []
  __regids__ = []

  def __init__(this, attach = True):
    if attach:
      this.attach()

  def attach(this):
    if not (this in AutoUpdateUtil.__reg__):
      AutoUpdateUtil.__reg__.append(this)
  def detach(this):
    AutoUpdateUtil.__reg__.remove(this)

  def update(this, dt):
    pass

  @staticmethod
  def updateAll(dt):
    for item in AutoUpdateUtil.__reg__:
      if item != None:
        item.update(dt)
Util.autoupdate = AutoUpdateUtil

class SmoothUtil(AutoUpdateUtil):
  """
  An abstraction for a number that approaches a target value
  over time at a constant speed.\n
  \`val\` is the target at any given time.\n
  \`smoothed\` is the output value.
  """
  def __init__(this, val, min, max, time = 1, attach=True):
    super().__init__(attach)
    this.val = val
    this.smoothed = val
    this.prevSmoothed = val
    this.prev = val
    this.min = min
    this.max = max
    this.time = time
    this.clamp = True
  
  def update(this, dt):
    # Clamping
    if this.clamp:
      this.val = Util.clamp(this.val)
    this.prevSmoothed = this.smoothed
    # Decreasing value
    if this.val < this.smoothed:
      this.smoothed -= dt * (this.max - this.min) / this.time
      # Catch up
      if this.val > this.smoothed:
        this.smoothed = this.val
    # Increasing value
    elif this.val > this.smoothed:
      this.smoothed += dt * (this.max - this.min) / this.time
      # Catch up
      if this.val < this.smoothed:
        this.smoothed = this.val
    this.prev = this.val
Util.autoupdate.smooth = SmoothUtil

class VerletUtil(AutoUpdateUtil):
  """
  An attempt to abstract away physics integration properly.\n
  Handles integration of one independent axis entirely.\n
  To apply force on this axis, set the instance \`accel\` value
  to the appropriate acceleration. In the next update step,
  \`this.accel\` will be applied.\n
  Additionally, \`this.vel\` exposes the velocity of this
  value, which can be set to apply a velocity instantaneously
  (equivalent to infinite acceleration) or read as a
  simulation output.
  """
  def __init__(this, val, attach=True):
    super().__init__(attach)
    this.val = val
    this.accel = 0
    this.vel = 0
  def update(this, dt):
    this.val += (this.vel + 0.5 * this.accel * dt) * dt
    this.vel += this.accel * dt
Util.autoupdate.verlet = VerletUtil

class TimerUtil(AutoUpdateUtil):
  def __init__(this, fn, interval = 1, attach=True):
    super().__init__(attach)
    this.alive = False
    this.interval = interval
    this.internal_clock = 0
    this.internal_last = 0
    this.running = False
    this.function = fn
    this.repeats = True
    this.sustain_mode = False
    this.internal_sustained = False
    this.resultQue = []
    this.keepResults = False
    this.callWhenStopped = False
  
  def hasResults(this, count = 1):
    return len(this.resultQue) >= count
  def popResult(this):
    if len(this.resultQue) > 0:
      return this.resultQue.pop(0)
  def pushResult(this, time, lag, values):
    this.resultQue.append([time, lag, values])
  def internal_function(this, time, lag):
    ret = this.function(this, time, lag)
    if this.keepResults:
      this.pushResult(time, lag, ret)
    return ret
  def update(this, dt):
    if this.sustain_mode:
      if this.internal_sustained:
        this.internal_sustained = False
      else:
        this.sustain_mode = False
        if this.keepResults:
          return this.pushResult(this.internal_clock + dt, 0, this.stop(this.callWhenStopped, this.internal_clock + dt, 0))
        else:
          return this.stop(this.callWhenStopped, this.internal_clock + dt, 0)
    if this.running:
      this.internal_clock += dt
      while (this.internal_clock - this.internal_last >= this.interval):
        this.internal_last += this.interval
        lag = this.internal_clock - this.internal_last
        this.internal_function(this.internal_last, lag)
        if not this.repeats:
          if this.keepResults:
            return this.pushResult(this.internal_clock + dt, 0, this.stop(this.callWhenStopped, this.internal_clock + dt, 0))
          else:
            return this.stop(this.callWhenStopped, this.internal_clock + dt, 0)
  def stop(this, call = False, time = 0, lag = 0):
    ret = None
    if this.running:
      if call:
        ret = this.internal_function(time, lag)
      this.detach()
    this.running = False
    return ret
  def start(this, call = False, time = 0, lag = 0):
    this.reset()
    return this.resume(call, time, lag)
  def resume(this, call = False, time = 0, lag = 0):
    this.attach()
    this.running = True
    if call:
      return this.internal_function(time, lag)
  def reset(this):
    this.internal_clock = 0
    this.internal_last = 0
    this.sustain_mode = False
    this.internal_sustained = False
  def sustain(this, call = False, time = 0, lag = 0):
    ret = None
    if not this.sustain_mode:
      if not this.running:
        ret = this.start(call, time, lag)
      this.sustain_mode = True
    this.internal_sustained = True
    return ret
Util.autoupdate.timer = TimerUtil   

class RandTimerUtil(TimerUtil):
  def __init__(this, fn, intervalMin = 0, intervalMax = 1, attach=True):
    super().__init__(fn, random() * (intervalMax - intervalMin) + intervalMin, attach)
    this.intervalMin = intervalMin
    this.intervalMax = intervalMax
  def internal_function(this, time, lag):
    this.interval = random() * (this.intervalMax - this.intervalMin) + this.intervalMin
    return super().internal_function(time, lag)
  def reset(this):
    this.interval = random() * (this.intervalMax - this.intervalMin) + this.intervalMin
    return super().reset()
Util.autoupdate.randTimer = RandTimerUtil

class Graphics:
  def __init__(this, g):
    this.g = g
  
  def draw(img, x, y, sx, sy, r, cx, cy):
    pass

class Entity:
  # Maintains python refs to entities, preventing garbage collection
  # because JS references are uncounted
  entities = []

  def __init__(this):
    # Acquires pooled unit id to maintain a python ref,
    # preventing premature garbage collection
    this.unitid = SproutCore.Entity.requestID()
    if (this.unitid == len(Entity.entities)):
      Entity.entities.append(this)
    else:
      Entity.entities[this.unitid] = this
    this.team = "none"
    this.angle = 0
    this.scalex = 1
    this.scaley = 1
    this.autoscale = False
    this.alive = True
    this.age = 0
    this.lifetime = 30
    this.verlet = False
    this.vx = 0
    this.vy = 0
    this.ax = 0
    this.ay = 0
    this.body = game.geo.Circle.new(0, 0, 0)
    this.sprite = game.asset.ImageAsset.getImage("error")
    this.drawdebug = False
    this.__proxy = None
  def __nop__(this): pass

  # Physics passthroughs
  def __get_x__(this):
    return this.body.x
  def __set_x__(this, v):
    this.body.x = v
  x = property(
    __get_x__, __set_x__, __nop__,
    "Passthrough for the x position of the physics body of this object."
  )
  def __get_y__(this):
    return this.body.y
  def __set_y__(this, v):
    this.body.y = v
  y = property(
    __get_y__, __set_y__, __nop__,
    "Passthrough for the y position of the physics body of this object."
  )
  def __get_w__(this):
    return this.body.w
  def __set_w__(this, v):
    this.body.w = v
  w = property(
    __get_w__, __set_w__, __nop__,
    "Passthrough for the width of the physics body of this object."
  )
  def __get_h__(this):
    return this.body.h
  def __set_h__(this, v):
    this.body.h = v
  h = property(
    __get_h__, __set_h__, __nop__,
    "Passthrough for the height of the physics body of this object."
  )
  def __get_r__(this):
    return this.body.r
  def __set_r__(this, v):
    this.body.r = v
  r = property(
    __get_r__, __set_r__, __nop__,
    "Passthrough for the radius of the physics body of this object."
  )

  relationships = dict()
  @staticmethod
  def setRelationship(team1, team2, relationship):
    if not (team1 in Entity.relationships):
      Entity.relationships[team1] = dict()
    if not (team2 in Entity.relationships):
      Entity.relationships[team2] = dict()
    Entity.relationships[team1][team2] = relationship
    Entity.relationships[team2][team1] = relationship
  
  @staticmethod
  def setHostile(team1, team2): Entity.setRelationship(team1, team2, "hostile")
  @staticmethod
  def setFriendly(team1, team2): Entity.setRelationship(team1, team2, "friendly")
  @staticmethod
  def setNeutral(team1, team2): Entity.setRelationship(team1, team2, "neutral")
  @staticmethod
  def remRelationship(team1, team2): Entity.setRelationship(team1, team2, None)
  @staticmethod
  def getRelationship(team1, team2):
    if team1 in Entity.relationships:
      l1 = Entity.relationships[team1]
      if l1 == None: return "none"
      if team2 in l1:
        return l1[team2]
    if team1 == "all" or team2 == "all":
      return "friendly"
    if team1 == "none" or team2 == "none":
      return "hostile"
    return "none"

  def getProxy(this):
    return this
    if this.__proxy != None:
      return this.__proxy
    else:
      this.__proxy = pyodide.ffi.create_proxy(this)
      return this.__proxy

  def __get_collision_type__(this):
    return this.body.type
  def __set_collision_type__(this, v):
    old = this.__get_collision_type__()
    if (v == old): return
    newShape = game.geo.convertShape(this.body, v)
    # Todo: check if null
    this.body = newShape
  collisionType = property(
    __get_collision_type__,
    __set_collision_type__,
    __nop__,
    "String indicating which shape is used for physical interactions."
  )

  def __get_scale__(this):
    return min(this.scalex, this.scaley)
  def __set_scale__(this, v):
    aspect = this.scaley / this.scalex
    if this.scaley < this.scalex:
      this.scaley = v
      this.scalex = v / aspect
    else:
      this.scalex = v
      this.scaley = v * aspect
  scale = property(
    __get_scale__,
    __set_scale__,
    __nop__,
    "Sets the scale of the entity's sprite. Maintains aspect ratio of scalex and scaley."
  )
  
  def draw(this):
    SproutCore.Entity.draw(this)

  def update(this, dt):
    this.age = this.age + dt
    if (this.age > this.lifetime and this.lifetime > 0):
      this.delete("lifetime")

  # Input callbacks, used for player
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

  def touch(this, other):
    pass
  def delete(this, reason = None):
    this.alive = False
  def intersects(this, other):
    return this.body.intersects(other.body)
  
  # Frees up reference id to be used by other entities
  # while allowing this one to be recycled
  # This is internal, for most purposes use delete instead.
  def finalize(this):
    if (this.unitid != None):
      Entity.entities[this.unitid] = None
      SproutCore.Entity.recycleID(this.unitid)
      this.unitid = None
      if this.__proxy != None:
        this.__proxy.destroy()
        this.__proxy = None
  
  # Turtle functions

  # Moves the entity forward by the specified number of pixels.
  def forward(this, distance = 1):
    rad = this.angle / 180 * pi
    if (this.collisionType == "line"):
      this.body.ax += cos(rad) * distance
      this.body.ay += sin(rad) * distance
      this.body.bx += cos(rad) * distance
      this.body.by += sin(rad) * distance
    else:
      this.x += cos(rad) * distance
      this.y += sin(rad) * distance
  
  def backward(this, distance = 1):
    this.forward(-distance)
  
  def right(this, distance = 1):
    rad = (this.angle + 90) / 180 * pi
    if (this.collisionType == "line"):
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
  
  def shoot(this, bulletType, dx = 0, dy = 0, dtheta = 0):
    if bulletType == None: bulletType = Entity.bulletEntity
    ret = bulletType()
    ret.team = this.team
    ret.parent = this
    ret.angle = this.angle + dtheta
    ret.x = this.x
    ret.y = this.y
    ret.move(dx, dy)
    game.world.addBullet(ret)
    return ret

Entity.setHostile("player", "enemy")

class BulletEntity(Entity):
  def __init__(this):
    super().__init__()
    this.lifetime = 1
    this.attack = 34
    this.speed = 1000
    this.sprite = game.asset.ImageAsset.getImage("projectile/bullet_base.png")
    this.collisionType = "line"
    this.body.ax = 0
    this.body.ay = 0
    this.body.bx = 0
    this.body.by = 0
  def update(this, dt):
    super().update(dt)
    this.forward(this.speed * dt)
  
  def touch(this, other):
    if Entity.getRelationship(this.team, other.team) == "hostile":
      this.impact(other)

  def impact(this, other):
    other.damage(this.attack)
    this.delete("impact")

  def __nop__(this): pass

  def __get_x__(this):
    return this.body.bx
  def __set_x__(this, v):
    this.body.ax = v
    this.body.bx = v
  x = property(__get_x__, __set_x__, __nop__)
  
  def __get_y__(this):
    return this.body.by
  def __set_y__(this, v):
    this.body.ay = v
    this.body.by = v
  y = property(__get_y__, __set_y__, __nop__)
  
  def forward(this, distance = 1):
    rad = this.angle / 180 * pi
    this.body.ax = this.body.bx
    this.body.ay = this.body.by
    this.body.bx += cos(rad) * distance
    this.body.by += sin(rad) * distance
  def right(this, distance=1):
    rad = (this.angle + 90) / 180 * pi
    this.body.ax = this.body.bx
    this.body.ay = this.body.by
    this.body.bx += cos(rad) * distance
    this.body.by += sin(rad) * distance
Entity.bulletEntity = BulletEntity

class LivingEntity(Entity):
  def __init__(this):
    super().__init__()
    this.speed = 300
    this.health = 100
    this.attack = 10
    this.contained = False
  def damage(this, amt):
    this.health -= amt
    if this.health < 0:
      this.health = 0
      this.delete("health")
Entity.livingEntity = LivingEntity

class PlayerWeapon():
  def __init__(this, ammo = 10, rate = 10, auto = False, offsets = [[-10, 0, 0], [10, 0, 0]], bullet = BulletEntity, owner = None):
    this.ammo = ammo
    this.offsets = offsets
    this.barrel = 0
    this.bullet = bullet
    this.auto = auto
    this.timer = TimerUtil(this.tick, 1/rate)
    if owner != None:
      this.owner = owner
    else:
      this.owner = game.player
    this.fixlag = True
    this.useammo = 1
    this.key = " "
  
  def __get_rate__(this):
    return 1 / this.timer.interval
  def __set_rate__(this, v):
    this.timer.interval = 1 / v
  def __nop__(this): pass
  rate = property(__get_rate__, __set_rate__, __nop__)

  def attemptUseAmmo(this):
    # Ammo consumption accounts for negative ammo values
    # and potentially negative ammo consumption values.
    # Regardless, stops and clamps ammo count to 0
    # when ammo count crosses 0.
    if this.useammo != False and this.useammo != 0:
      if this.ammo == 0: return False
      else:
        prev = this.ammo
        this.ammo = this.ammo - this.useammo
        if prev * this.ammo < 0:
          this.ammo = 0
    return True
  def cycleBarrel(this):
    offset = this.offsets[this.barrel]
    this.barrel = (this.barrel + 1) % len(this.offsets)
    return offset

  def fire(this, timer = None, time = 0, lag = 0):
    if timer == None:
      timer = this.timer
    # Construct and fire bullet
    # Cycle barrels
    if this.attemptUseAmmo():
      offset = this.cycleBarrel()
      bullet = this.owner.shoot(this.bullet, offset[0], offset[1], offset[2])
      if lag > 0:
        # Lag compensation
        bullet.update(lag)
      return bullet

  def tick(this, timer, time, lag):
    this.fire(timer, time, lag)
  def sustain(this):
    if this.auto:
      this.timer.sustain()
  def beginFire(this):
    return this.fire(this.timer)

class PlayerEntity(LivingEntity):
  def __init__(this):
    super().__init__()
    this.lifetime = -1
    this.team = "player"
    this.sprite = game.asset.ImageAsset.getImage("player/player_base.png")
    this.collisionType = "circle"
    this.speed = 450
    this.body.r = 50
    this.body.x = 450
    this.body.y = 540
    this.angle = 270
    this.autoscale = True
    this.scale = 1.5
    this.persistent = True
    this.score = 0
    this.weapons = []
    this.addWeapon(" ", PlayerWeapon(
      1000, 10, True, [[-16, 0, 0], [16, 0, 0]], BulletEntity
    ))
    this.addWeapon("Shift", PlayerWeapon(
      20, 1, False, [[-24, -6, 0], [24, -6, 0]], BulletEntity
    ))
  def reset(this):
    this.alive = True
    this.health = 100
    this.score = 0
    this.body.x = 450
    this.body.y = 540
    this.angle = 270
  def update(this, dt):
    global game
    super().update(dt)
    if (game.keyState("ArrowUp") or game.keyState("w")):
      this.forward(this.speed * dt)
    if (game.keyState("ArrowDown") or game.keyState("s")):
      this.backward(this.speed * dt)
    if (game.keyState("ArrowLeft") or game.keyState("a")):
      this.left(this.speed * dt)
    if (game.keyState("ArrowRight") or game.keyState("d")):
      this.right(this.speed * dt)
    if (game.keyState("q")):
      this.turnLeft(360 * dt)
    if (game.keyState("e")):
      this.turnRight(360 * dt)
    # Todo: restrict to screen bounds
    for wep in this.weapons:
      if game.keyState(wep.key):
        wep.sustain()
  def keydown(this, key):
    for wep in this.weapons:
      if wep.key == key:
        wep.beginFire()
    # if (key == " "):
    #   bullet = BulletEntity()
    #   bullet.x = this.x
    #   bullet.y = this.y
    #   print(bullet.x, bullet.y)
    #   bullet.team = "player"
    #   bullet.angle = this.angle
    #   game.world.addBullet(bullet)
  def addWeapon(this, keybind, weapon):
    weapon.key = keybind
    weapon.owner = this
    this.weapons.append(weapon)
  def delete(this, reason = None):
    this.reset()
    game.setState("dead")
  def finalize(this):
    # This probably shouldn't happen
    super().finalize()
    game.player = None
PlayerEntity.weapon = PlayerWeapon
Entity.playerEntity = PlayerEntity

class BasicEnemyEntity(LivingEntity):
  def __init__(this):
    super().__init__()
    this.team = "enemy"
    this.sprite = game.asset.ImageAsset.getImage("enemy/enemy_base.png")
    this.collisionType = "circle"
    this.body.r = 50
    this.scale = 1.5
    this.autoscale = True
    this.attack = 34
  def update(this, dt):
    super().update(dt)
    this.forward(this.speed * dt)
  def touch(this, other):
    if not this.alive: return
    r = Entity.getRelationship(this.team, other.team)
    if r == "hostile":
      this.impact(other)
  def impact(this, other):
    other.damage(this.attack)
    this.delete("impact")

Entity.basicEnemyEntity = BasicEnemyEntity

def temp(timer, time, lag):
  if (game.state == game.gamestates["play"]):
    x = random() * 500 + 50 # 50 pixels from either side
    ent = BasicEnemyEntity()
    ent.x = x
    ent.y = -ent.r
    ent.angle = 90
    game.world.addEntity(ent)
    ent.update(lag)
BasicEnemyEntity.spawnTimer = RandTimerUtil(temp, 0.5, 4)

class StateMenu(GameState):
  def __init__(this):
    super().__init__()
    this.name = "menu"
    this.firstload = True
  
  def load(this):
    this.ui = pyodide.code.run_js(
      '''
      (jsl, game) => {
        return jsl.build([
          "div", {style: {
            width: "100%",
            height: "100%",
            display: "flex"
          }}, [
            ["div", {style:{flexGrow:1}}],
            ["div", {style:{display:"flex",flexDirection:"column"}},
              ["h1",{
                id:"game-menu-title",
                textContent: game["title"],
                style: {
                  paddingTop: "100px",
                  paddingBottom: "100px"
                }
              }],
              ["div", {
                id: "game-menu-buttons",
                style: {
                  flexGrow: 1,
                  marginBottom: "10px",
                  overflow: "scroll",
                  display: "flex",
                  flexDirection: "column"
                }
              }]
            ],
            ["div", {style:{flexGrow:1}}]
          ]
        ]);
      }
      ''')(JSLib, game)
    this.buttonMenu = this.ui.querySelector("#game-menu-buttons")
    game.addMenuButton("Play", this.setPlay)
    return super().load()
  def enter(this):
    if this.firstload:
      this.firstload = False
    else:
      game.player.reset()
    
    return super().enter()
  def setTitle(this, v):
    this.ui.querySelector("#game-menu-title").textContent = v
  def addMenuButton(this, text, fn):
    ret = pyodide.code.run_js(
      '''
      (core, jsl, text, fn) => {
        return jsl.build([
          "button", {
            textContent: text,
            onclick: (evt) => {
              core.callback("onButtonClick", evt.target, evt);
              fn?.(evt.target, evt);
            }
          }
        ]);
      }
    ''')(SproutCore, JSLib, text, pyodide.ffi.create_proxy(fn))
    this.buttonMenu.append(ret)
    return ret
  def setPlay(this, tgt, evt):
    game.setState("play")


class StatePlay(GameState):
  def __init__(this):
    super().__init__()
    this.name = "play"
  def enter(this):
    print("Game entered")
    game.world.addEntity(game.player)
    if hasattr(BasicEnemyEntity, "spawnTimer"):
      BasicEnemyEntity.spawnTimer.start()
  def exit(this, nextState=None):
    if hasattr(BasicEnemyEntity, "spawnTimer"):
      BasicEnemyEntity.spawnTimer.stop()
    return super().exit(nextState)
  def update(this, dt):
    game.world.update(dt)
  def draw(this):
    game.world.draw()
  def keydown(this, key):
    game.world.keydown(key)
  def keyup(this, key):
    game.world.keyup(key)
  def mousedown(this, b, x, y):
    game.world.mousedown(b, x, y)
  def mouseup(this, b, x, y):
    game.world.mouseup(b, x, y)


class StateDead(GameState):
  def __init__(this):
    super().__init__()
    this.name = "dead"
  def load(this):
    this.ui = pyodide.code.run_js(
      '''
      (jsl, game) => {
        return jsl.build([
          "div", {style: {
            width: "100%",
            height: "100%",
            display: "flex"
          }}, [
            ["div", {style:{flexGrow:1}}],
            ["div", {style:{display:"flex",flexDirection:"column"}},
              ["h1",{
                textContent: "Game Over",
                style: {
                  paddingTop: "100px",
                  paddingBottom: "100px"
                }
              }],
              ["div", {
                textContent: \`Score: \${ game?.["player"]?.["score"] ?? 0 }\`
              }],
              ["div", {
                id: "game-dead-buttons",
                style: {
                  flexGrow: 1,
                  marginBottom: "10px",
                  overflow: "scroll",
                  display: "flex",
                  flexDirection: "column"
                }
              }]
            ],
            ["div", {style:{flexGrow:1}}]
          ]
        ]);
      }
      ''')(JSLib, pyodide.ffi.create_proxy(game))
    this.buttonMenu = this.ui.querySelector("#game-dead-buttons")
    button = pyodide.code.run_js(
      '''
      (core, jsl, game) => {
        return jsl.build([
          "button", {
            textContent: "Menu",
            onclick: (evt) => {
              core.callback("onButtonClick", evt.target, evt);
              game?.["setState"]("menu");
            }
          }
        ]);
      }
    ''')(SproutCore, JSLib, pyodide.ffi.create_proxy(game))
    this.buttonMenu.append(button)
    return super().load()

# Reinstantiated every time the game is restarted
class GameClass:
  def __init__(this):
    this.__title = "Sprout Core Shooter"
    this.gamestate = GameState
    this.gamestates = dict()
    this.state = None
    this.graphics = SproutCore.g
    this.world = SproutCore.GameWorld.new()
    this.asset = SproutCore.Asset
    this.geo = SproutCore.Geo
    this.keyreg = dict()
    this.util = Util
    this.entity = Entity
    this.player = None # Required due to playerweapon initialization
    this.gamestate.StateMenu = StateMenu
    this.gamestate.StatePlay = StatePlay
    this.gamestate.StateDead = StateDead
  def init(this):
    this.gamestates["menu"] = StateMenu()
    this.addMenuButton = this.gamestates["menu"].addMenuButton
    this.gamestates["play"] = StatePlay()
    this.gamestates["dead"] = StateDead()
    this.player = PlayerEntity()
    this.gamestates["menu"].load() # preload for adding buttons

  def __get_title__(this):
    return this.__title
  def __set_title__(this, v):
    this.gamestates["menu"].setTitle(v)
    this.__title = v
  def __nop__(this):
    pass
  title = property(__get_title__, __set_title__, __nop__)

  def setState(this, targetState):
    old = this.state
    if (not (targetState in this.gamestates)): return
    tgt = this.gamestates[targetState]
    if (tgt == old): return
    if (old != None):
      old.exit(targetState)
      SproutCore.callback("exitState", old.name)
    else: SproutCore.callback("exitState", None)
    this.state = tgt
    if (not tgt.initialized):
      tgt.load()
      SproutCore.callback("loadState", targetState)
    tgt.enter()
    SproutCore.callback("enterState", targetState)
  
  def load(this):
    if (this.state != None):
      this.state.load()
  
  def update(this, dt):
    this.util.autoupdate.updateAll(dt)
    if (this.state != None):
      this.state.update(dt)
  def draw(this):
    if (this.state != None):
      this.state.draw()

  def keydown(this, key):
    this.keyreg[key] = True
    if (this.state != None):
      this.state.keydown(key)
  def keyup(this, key):
    this.keyreg[key] = False
    if (this.state != None):
      this.state.keyup(key)
  def mousedown(this, b, x, y):
    this.keyreg["mouse" + b] = True
    if (this.state != None):
      this.state.mousedown(b, x, y)
  def mouseup(this, b, x, y):
    this.keyreg["mouse" + b] = False
    if (this.state != None):
      this.state.mouseup(b, x, y)
  def resetKeys(this):
    for key in this.keyreg:
      if this.keyreg[key]:
        if key.startswith("mouse"):
          this.mouseup(key, 0, 0)
        else:
          this.keyup(key)
    this.keyreg.clear
  def keyState(this, key):
    return (key in this.keyreg and this.keyreg[key])
  def scroll(this, x, y, dx, dy):
    if (this.state != None):
      this.state.scroll(x, y, dx, dy)

game = GameClass()
game.init()
`;