import SproutCore
from pylib.entity import Entity
from pylib.uientity import UIEntity
from pylib.autoutil import AutoUpdateUtil
from pylib.state import GameState

class GameClass:
  def __init__(this):
    this.__title = "Default Game"
    this.gamestate = GameState
    this.gamestates = dict()
    this.state = None
    this.graphics = SproutCore.graphics
    this.world = SproutCore.GameWorld.new()
    this.asset = SproutCore.Asset
    this.geo = SproutCore.Geo
    this.entity = Entity
    this.keyreg = dict()
    this.player = None # Required due to playerweapon initialization
    this.playerEntity = GameClass.PlayerEntity
  
  def init(this):
    if (this.state == None and "menu" in this.gamestates):
      this.setState("menu")

  def __nop__(this): pass
  def __get_title__(this):
    return this.__title
  def __set_title__(this, v):
    temp = this.gamestates["menu"]
    if (temp != None):
      temp = temp.setTitle
      if (temp != None):
        temp(v)
    this.__title = v
  title = property(__get_title__, __set_title__, __nop__)

  def setState(this, targetState):
    old = this.state
    if (not (targetState in this.gamestates)): return
    tgt = this.gamestates[targetState]
    if (tgt == old): return
    if (old != None):
      old.exit(targetState)
      SproutCore.callPyEvent("exitState", old.name)
    else:
      SproutCore.callPyEvent("exitState", None)
    this.state = tgt
    if (not tgt.initialized):
      tgt.load()
      SproutCore.callPyEvent("loadState", targetState)
    tgt.enter()
    SproutCore.callPyEvent("enterState", targetState)
  
  def exit(this, nextState):
    SproutCore.setui()

  def load(this):
    if (this.state == None):
      this.world.clear()
    else:
      this.state.load()
  
  def update(this, dt):
    AutoUpdateUtil.updateAll(dt)
    if (this.state == None):
      this.world.update(dt)
    else:
      this.state.update(dt)
  
  def draw(this):
    if (this.state == None):
      this.world.draw()
    else:
      this.state.draw()

  def keyDown(this, key):
    this.keyreg[key.lower()] = True
    if (this.state == None):
      this.world.keyDown(key)
    else:
      this.state.keyDown(key)

  def keyUp(this, key):
    this.keyreg[key.lower()] = False
    if (this.state == None):
      this.world.keyUp(key)
    else:
      this.state.keyUp(key)

  def mouseDown(this, b, x, y):
    this.keyreg["mouse" + str(b)] = True
    if (this.state == None):
      this.world.mouseDown(b, x, y)
    else:
      this.state.mouseDown(b, x, y)

  def mouseUp(this, b, x, y):
    this.keyreg["mouse" + str(b)] = False
    if (this.state == None):
      this.world.mouseUp(b, x, y)
    else:
      this.state.mouseUp(b, x, y)

  def resetKeys(this):
    for key in this.keyreg:
      if this.keyreg[key]:
        if key.startswith("mouse"):
          this.mouseup(key, 0, 0)
        else:
          this.keyup(key)
    this.keyreg.clear
    
  def keyState(this, key):
    key = key.lower()
    return (key in this.keyreg and this.keyreg[key])

  def scroll(this, x, y, dx, dy):
    if (this.state == None):
      this.world.scroll(x, y, dx, dy)
    else:
      this.state.scroll(x, y, dx, dy)

  def input(this, value):
    if (value == "cls" or value == "clear"):
      SproutCore.clear()
  
  class PlayerEntity(Entity):
    def __init__(this):
      super().__init__()
      this.lifetime = -1
      this.sprite = SproutCore.game.asset.getAsset("player_base")
      this.collisionType = "circle"
      this.autoscale = True
      this.team = "player"
      this.body.r = 50
      this.persistent = True
      this.clamp = True
      this.score = 0
    
    def reset(this):
      this.alive = True
      this.health = 100
      this.score = 0
      this.body.x = 450
      this.body.y = 540
      this.angle = 0
    
    def update(this, dt):
      super().update(dt)
      # Clamping
      if this.clamp:
        if (this.x < 0): this.x = 0
        if (this.x > 900): this.x = 900
        if (this.y < 0): this.y = 0
        if (this.y > 600): this.y = 600
    
    def keydown(this, key):
        pass #todo
