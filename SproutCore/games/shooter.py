class ShooterGame(GameClass):
  def __init__(this) -> None:
    super().__init__()
    this.__title = "Sprout Core Shooter"
  
  def init(this):
    super().init()
    this.bg0 = Background(game.asset.getAsset("bg0"))
    this.bg1 = Background(game.asset.getAsset("bg1"))
    this.bg0.ax = 10
    this.bg0.ay = 10
    this.bg0.sx = 1.2
    this.bg0.sy = 1.2
    this.bg1.ax = 20
    this.bg1.ay = 20
    this.bg1.sx = 0.4
    this.bg1.sy = 0.4
    this.player = ShooterGame.PlayerEntity()

  def update(this.dt):
    SproutCore.g.c.globalCompositeOperation = "lighter"
    this.bg0.draw()
    this.bg1.draw()
    SproutCore.g.c.globalCompositeOperation = "source-over"
    super.update(dt)

  class PlayerWeapon():
    def __init__(this, power = 34, ammo = 10, rate = 10, auto = False, offsets = [[-10, 0, 0], [10, 0, 0]], bullet = BulletEntity, owner = None):
      this.power = power
      this.ammo = ammo
      this.offsets = offsets
      this.barrel = 0
      this.bullet = bullet
      this.auto = auto
      this.timer = TimerUtil(this.tick, 1 / rate)
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
      # Stops and clamps ammo count from either direction
      # to 0 when count crosses 0.
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
      if timer == None: timer = this.timer
      if this.attemptUseAmmo():
        offset = this.cycleBarrel()
        bullet = this.owner.shoot(this.bullet, offset[0], offset[1], offset[2])
        bullet.attack = this.power
        if lag > 0:
          # Lag compensation
          bullet.update(lag)
        return bullet
    
    def tick(this, timer, time, lag):
      this.fire(timer, time, lag)
    
    def sustain(this):
      if this.auto: this.timer.sustain()
    
    def beginFire(this):
      return this.fire(this.timer)

  class PlayerEntity(Entity):
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
      this.autoscale = True
      this.scale = 1.5
      this.persistent = True
      this.score = 0
      this.weapons = []
      this.clamp = True
      this.addWeapon(" ", PlayerWeapon(
        34, 1000, 10, True, [[-16, 0, 0], [16, 0, 0]], BulletEntity
      ))
      this.addWeapon("Shift", PlayerWeapon(
        300, 20, 1, False, [[-24, -6, 0], [24, -6, 0]], LanceEntity
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
      global game
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
    
    def keydown(this, key):
      for wep in this.weapons:
        if wep.key == key: wep.beginFire()
    
    def addWeapon(this, keybind, weapon):
      weapon.key = keybind
      weapon.owner = this
      this.weapons.append(weapon)
    
    def delete(this, reason = None):
      this.reset()
      game.setState("dead")
    
    def finalize(this):
      # This probably shouldn't happen
      # unless the entire game object is disposed
      super().finalize()
      game.player = None
  
  class StatePlay(GameState):
    def __init__(this):
      super().__init__()
      this.name = "play"
    def enter(this):
      # Allows better compatibility with
      # multiple play states later on
      this.world = game.world
      this.world.addEntity(game.player)
      game.bg0.dy = 1/5
      game.bg1.dy = 1/10
      # Start enemy spawning
      if hasattr(BasicEnemyEntity, "spawnTimer"):
        BasicEnemyEntity.spawnTimer.start()
    def exit(this, nextState = None):
      if hasattr(BasicEnemyEntity, "spawnTimer"):
        BasicEnemyEntity.spawnTimer.stop()
      game.bg0.dy = 0
      game.bg1.dy = 0
    def update(this, dt):
      this.world.update(dt)
    def draw(this):
      this.world.draw()
    def keydown(this, key):
      this.world.keydown(key)
    def keyup(this, key):
      this.world.keyup(key)
    def mousedown(this, b, x, y):
      this.world.mousedown(b, x, y)
    def mouseup(this, b, x, y):
      this.world.mouseup(b, x, y)

ShooterGame.PlayerEntity.weapon = ShooterGame.PlayerWeapon
Entity.playerEntity = ShooterGame.PlayerEntity

game = ShooterGame()
game.init()