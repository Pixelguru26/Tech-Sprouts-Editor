import SproutCore
from pylib.entity import Entity
from pylib.autoutil import AutoUpdateUtil
from pylib.state import GameState

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
    # util
    this.entity = Entity
    this.player = None # Required due to playerweapon initialization
  
  def init(this):
    pass

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
      SproutCore.callback("exitState", old.name)
    else:
      SproutCore.callback("exitState", None)
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
    AutoUpdateUtil.updateAll(dt)
    if (this.state != None):
      this.state.update(dt)
  
  def draw(this):
    if (this.state != None):
      this.state.draw()

  def keydown(this, key):
    this.keyreg[key.lower()] = True
    if (this.state != None):
      this.state.keydown(key)

  def keyup(this, key):
    this.keyreg[key.lower()] = False
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
    key = key.lower()
    return (key in this.keyreg and this.keyreg[key])

  def scroll(this, x, y, dx, dy):
    if (this.state != None):
      this.state.scroll(x, y, dx, dy)

  def input(this, value):
    if (value == "cls"):
      SproutCore.cls()
