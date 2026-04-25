export default `
from random import random
import SproutCore
import JSLib
import pyodide
from pylib.bullets import BulletEntity, EntityWeapon, ExplodingBulletEntity, LanceEntity
from pylib.autoutil import AutoUpdateUtil, RandTimerUtil, SmoothUtil
from pylib.entity import Entity, LivingEntity
from pylib.game import GameClass
from pylib.state import GameState
from math import sin, cos, pi

game = SproutCore.game

class ShooterGame(GameClass):
  def __init__(this):
    super().__init__()
    this.__title = "Sprout Core Shooter"
    this.gamestates["menu"] = ShooterGame.StateMenu()
    this.gamestates["play"] = ShooterGame.StatePlay()
    this.gamestates["dead"] = ShooterGame.StateDead()
    this.player = ShooterGame.PlayerEntity()
  
  def addMenuButton(this, text, fn):
    this.gamestates["menu"].addMenuButton(text, fn)
  
  def init(this):
    this.bg0 = ShooterGame.Background(SproutCore.Asset.getAsset("bg0"))
    this.bg1 = ShooterGame.Background(SproutCore.Asset.getAsset("bg1"))
    this.bg0.ax = 10
    this.bg0.ay = 10
    this.bg0.sx = 1.2
    this.bg0.sy = 1.2
    this.bg1.ax = 20
    this.bg1.ay = 20
    this.bg1.sx = 0.4
    this.bg1.sy = 0.4
    super().init()

  def update(this, dt):
    this.bg0.update(dt)
    this.bg1.update(dt)
    super().update(dt)
  
  def draw(this):
    SproutCore.graphics.canvasContext.globalCompositeOperation = "lighter"
    this.bg0.draw()
    this.bg1.draw()
    SproutCore.graphics.canvasContext.globalCompositeOperation = "source-over"
    super().draw()

  # Simple automatic scrolling background renderer
  class Background():
    def __init__(this, sprite):
      this.sprite = sprite
      this.x = 0
      this.y = 0
      this.xutil = SmoothUtil(0, -10, 10, 100)
      this.yutil = SmoothUtil(0, -10, 10, 100)
      this.sx = 1
      this.sy = 1
      this.age = 0
      this.alternate = True
    
    def __nop__(this): pass

    def __get_ax__(this):
      return (this.xutil.max - this.xutil.min) / this.xutil.time
    def __set_ax__(this, v):
      this.xutil.time = v * (this.xutil.max - this.xutil.min)
    ax = property(__get_ax__, __set_ax__, __nop__)

    def __get_ay__(this):
      return (this.yutil.max - this.yutil.min) / this.yutil.time
    def __set_ay__(this, v):
      this.yutil.time = v * (this.yutil.max - this.yutil.min)
    ay = property(__get_ay__, __set_ay__, __nop__)

    def __get_dx__(this):
      return this.xutil.smoothed
    def __set_dx__(this, v):
      this.xutil.val = v
    def __get_dy__(this):
      return this.yutil.smoothed
    def __set_dy__(this, v):
      this.yutil.val = v
    dx = property(__get_dx__, __set_dx__, __nop__)
    dy = property(__get_dy__, __set_dy__, __nop__)

    def update(this, dt):
      this.x += this.dx * this.sprite.width * dt
      this.y += this.dy * this.sprite.height * dt
      this.age += dt
    
    def draw(this):
      alt = (this.y / (this.sprite.height * this.sy)) % 2 > 1
      x0 = (this.x % (this.sprite.width * this.sx)) - this.sprite.width * this.sx * 2
      y = (this.y % (this.sprite.height * this.sy)) - this.sprite.height * this.sy * 2
      while y < SproutCore.graphics.height:
        y += this.sprite.height * this.sy
        x = x0
        if this.alternate:
          alt = not alt
          if alt:
            x = x0 + (this.sprite.width * this.sx) / 2
        while x < SproutCore.graphics.width:
          x += this.sprite.width * this.sx
          SproutCore.graphics.draw(this.sprite, x, y, this.sx, this.sy)

  class PlayerWeapon(EntityWeapon):
    def __init__(this, power=34, ammo=10, rate=10, auto=False, offsets=..., bullet=..., owner=None):
      super().__init__(power, ammo, rate, auto, offsets, bullet, owner)
      this.key = " "
      this.owner = game.player
    
    def fire(this, timer=None, time=0, lag=0):
      return super().fire(timer, time, lag)

    def sustain(this):
      return super().sustain()

  class PlayerEntity(LivingEntity):
    def __init__(this):
      super().__init__()
      this.lifetime = -1
      this.sprite = game.asset.getAsset("player_base")
      this.collisionType = "circle"
      this.speed = 450
      this.body.r = 50
      this.body.x = 450
      this.body.y = 540
      this.angle = 270
      this.team = "player"
      this.autoscale = True
      this.scale = 1.5
      this.persistent = True
      this.score = 0
      this.weapons = []
      this.clamp = True
      this.addWeapon(" ", ShooterGame.PlayerWeapon(
        34, 1000, 10, True, [[-16, 0, 0], [16, 0, 0]], BulletEntity
      ))
      this.addWeapon("Shift", ShooterGame.PlayerWeapon(
        300, 20, 1, False, [[-24, -6, 0], [24, -6, 0]], ExplodingBulletEntity
      ))
    
    def __nop__(this): pass
    def __get_pwep__(this): return this.weapons[0]
    def __set_pwep__(this, v): this.weapons[0] = v
    def __get_swep__(this): return this.weapons[1]
    def __set_swep__(this, v): this.weapons[1] = v
    primaryWeapon = property(__get_pwep__, __set_pwep__, __nop__)
    secondaryWeapon = property(__get_swep__)

    def reset(this):
      this.alive = True
      this.health = 100
      this.score = 0
      this.body.x = 450
      this.body.y = 540
      this.angle = 270
    
    def update(this, dt):
      super().update(dt)
      # Movement
      if (game.keyState("ArrowUp") or game.keyState("w")):
        this.forward(this.speed * dt)
      if (game.keyState("ArrowDown") or game.keyState("s")):
        this.backward(this.speed * dt)
      if (game.keyState("ArrowLeft") or game.keyState("a")):
        this.left(this.speed * dt)
      if (game.keyState("ArrowRight") or game.keyState("d")):
        this.right(this.speed * dt)
      # Clamping
      if this.clamp:
        if (this.x < 0): this.x = 0
        if (this.x > 900): this.x = 900
        if (this.y < 0): this.y = 0
        if (this.y > 600): this.y = 600
      # Automatic fire
      for wep in this.weapons:
        if game.keyState(wep.key):
          wep.sustain()
    
    def keyDown(this, key):
      for wep in this.weapons:
        if wep.key == key: wep.beginFire()
    
    def addWeapon(this, keybind, weapon):
      weapon.key = keybind
      weapon.owner = this
      this.weapons.append(weapon)
    
    def delete(this, reason = None):
      game.setState("dead")
    
    def finalize(this):
      # This probably shouldn't happen
      # unless the entire game object is disposed
      super().finalize()
      game.player = None
  
  class BasicEnemyEntity(LivingEntity):
    def __init__(this):
      super().__init__()
      this.team = "enemy"
      this.sprite = SproutCore.Asset.ImageAsset.getImage("enemy/enemy_base.png")
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
      if Entity.getRelationship(this.team, other.team):
        this.impact(other)
    
    def impact(this, other):
      other.damage(this.attack)
      this.delete("impact")
    
    def delete(this, reason = None):
      if reason == "health":
        game.player.score += 10
      return super().delete(reason)
  
  class ShootingEnemyEntity(BasicEnemyEntity):
    def __init__(this):
      super().__init__()
      # Controls whether the entity fires aimlessly or only when facing the player
      this.responsive = True
      # Rays cannot (presently) be infinite, which is fine because neither is fire range.
      # This is the distance at which players will be detected if responsive is True.
      this.range = 1000
      this.ray = None
      this.__lastAngle = this.angle
      this.weapon = EntityWeapon(34, -1, 1, True, [[-10, 0, 0], [10, 0, 0]], BulletEntity, this)
  
    def __testTarget(this, other):
      if Entity.getRelationship(this.team, other.team) == "hostile":
        return True
      return False
    
    def enemySighted(this):
      rad = this.angle / 180 * pi
      if this.ray == None:
        this.ray = game.geo.LineSeg.new(this.x, this.y, cos(rad) * this.range, sin(rad) * this.range)
      else:
        if this.angle != this.__lastAngle:
          # Angle needs to be updated
          this.__lastAngle = this.angle
          this.ray.ax = this.x
          this.ray.ay = this.y
          this.ray.bx = cos(rad) * this.range
          this.ray.by = sin(rad) * this.range
        else:
          # No need to rotate
          this.ray.move(this.x - this.ray.ax, this.y - this.ray.ay)
      if game.world.testIntersection(this.ray, this.__testTarget):
        return True
      return True
    
    def update(this, dt):
      super().update(dt)
      if this.responsive:
        if this.enemySighted(): this.weapon.sustain()
      else:
        this.weapon.sustain()
    
    def delete(this, reason=None):
      this.weapon.timer.detach()
      return super().delete(reason)

  class HelicopterEnemyEntity(ShootingEnemyEntity):
    def __init__(this):
      super().__init__()
      this.sprite = game.asset.ImageAsset.getImage("enemy/enemy_helicopter.png")
      this.bladeSprite = game.asset.ImageAsset.getImage("enemy/heliblades_spin.png")
  
    def draw(this):
      super().draw()
      if this.autoscale:
        if this.collisionType == "circle":
          scale = (this.body.r * 2) / this.bladeSprite.width
          SproutCore.graphics.drawCentered(this.bladeSprite, this.x, this.y, scale, scale, this.angle + this.age * 360)
      else:
        SproutCore.graphics.drawCentered(this.bladeSprite, this.x, this.y, this.scalex, this.scaley, this.angle + this.age * 360)

  class StatePlay(GameState):
    def __init__(this):
      super().__init__()
      this.name = "play"
    def enter(this):
      # Allows better compatibility with
      # multiple play states later on
      this.world = game.world
      this.world.addEntity(game.player)
      # Scrolling backgrounds
      game.bg0.dy = 1/5
      game.bg1.dy = 1/10
      # Start enemy spawning
      if hasattr(ShooterGame.BasicEnemyEntity, "spawnTimer"):
        ShooterGame.BasicEnemyEntity.spawnTimer.start()
      if hasattr(ShooterGame.HelicopterEnemyEntity, "spawnTimer"):
        ShooterGame.HelicopterEnemyEntity.spawnTimer.start()
    def exit(this, nextState = None):
      if hasattr(ShooterGame.BasicEnemyEntity, "spawnTimer"):
        ShooterGame.BasicEnemyEntity.spawnTimer.stop()
      if hasattr(ShooterGame.HelicopterEnemyEntity, "spawnTimer"):
        ShooterGame.HelicopterEnemyEntity.spawnTimer.stop()
      game.bg0.dy = 0
      game.bg1.dy = 0
      game.world.clear()
      return super().exit(nextState)
    def update(this, dt):
      this.world.update(dt)
    def draw(this):
      this.world.draw()
    def keyDown(this, key):
      this.world.keyDown(key)
    def keyUp(this, key):
      this.world.keyUp(key)
    def mouseDown(this, b, x, y):
      this.world.mouseDown(b, x, y)
    def mouseUp(this, b, x, y):
      this.world.mouseUp(b, x, y)

  class StateMenu(GameState):
    def __init__(this):
      super().__init__()
      this.name = "menu"
      this.firstload = True

    def load(this):
      this.ui = pyodide.code.run_js(
      '''
      (jsl, title) => {
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
                textContent: title,
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
      ''')(JSLib, "Tech Sprouts Shooter")
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
      # Todo: make sure this actually works, I think querySelector returns a list.
      this.ui.querySelector("#game-menu-title").textContent = v
    
    def addMenuButton(this, text, fn):
      ret = pyodide.code.run_js(
        '''
        (core, jsl, text, fn) => {
          return jsl.build([
            "button", {
              textContent: text,
              onclick: (evt) => {
                core.callPyEvent("onButtonClick", evt.target, evt);
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

  class StateDead(GameState):
    def __init__(this):
      super().__init__()
      this.name = "dead"
    def load(this):
      return super().load()
    def enter(this):
      this.ui = pyodide.code.run_js(
        '''
        (jsl, core) => {
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
                  textContent: \`Score: \${core.game?.["player"]?.["score"] ?? 0}\`
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
        ''')(JSLib, SproutCore)
      this.buttonMenu = this.ui.querySelector("#game-dead-buttons")
      button = pyodide.code.run_js(
        '''
        (core, jsl, game) => {
          return jsl.build([
            "button", {
              textContent: "Menu",
              onclick: (evt) => {
                core.callPyEvent("onButtonClick", evt.target, evt);
                game?.["setState"]("menu");
              }
            }
          ]);
        }
      ''')(SproutCore, JSLib, pyodide.ffi.create_proxy(game))
      this.buttonMenu.append(button)
      super().enter()
    def exit(this, nextState):
      game.player.reset()
      super().exit(nextState)

ShooterGame.PlayerEntity.weapon = ShooterGame.PlayerWeapon
Entity.playerEntity = ShooterGame.PlayerEntity
Entity.shootingEnemyEntity = ShooterGame.ShootingEnemyEntity
Entity.helicopterEnemyEntity = ShooterGame.HelicopterEnemyEntity

def temp1(timer, time, lag):
  if (game.state == game.gamestates["play"]):
    x = random() * 500 + 50 # 50 pixels from either side
    ent = ShooterGame.BasicEnemyEntity()
    ent.x = x
    ent.y = -ent.r
    ent.angle = 90
    game.world.addEntity(ent)
    ent.update(lag)
ShooterGame.BasicEnemyEntity.spawnTimer = RandTimerUtil(temp1, 0.5, 4)

def temp2(timer, time, lag):
  if (game.state == game.gamestates["play"]):
    x = random() * 500 + 50
    ent = ShooterGame.HelicopterEnemyEntity()
    ent.x = x
    ent.y = -ent.r
    ent.angle = 90
    game.world.addEntity(ent)
    ent.update(lag)
ShooterGame.HelicopterEnemyEntity.spawnTimer = RandTimerUtil(temp2, 0.5, 4)

game = ShooterGame()
SproutCore.game = game
game.init()
`;