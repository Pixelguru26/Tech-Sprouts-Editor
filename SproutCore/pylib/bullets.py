from math import sin, cos, pi
from pylib import autoutil
from pylib.entity import Entity
import SproutCore

class BulletEntity(Entity):
  def __init__(this):
    super().__init__()
    this.lifetime = 1
    this.attack = 34
    this.speed = 1000
    this.sprite = SproutCore.Asset.ImageAsset.getImage("projectile/bullet_base.png")
    this.collision_type = "line"
    this.body.ax = 0
    this.body.ay = 0
    this.body.bx = 0
    this.body.by = 0
  
  def update(this, dt):
    super().update(dt)
    this.forward(this.speed * dt)
  
  def touch(this, other):
    if Entity.getRelationship(this.team, other.team) == "hostile" and this.parent != other:
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
  
  def right(this, distance = 1):
    rad = (this.angle + 90) / 180 * pi
    this.body.ax = this.body.bx
    this.body.ay = this.body.by
    this.body.bx += cos(rad) * distance
    this.body.by += sin(rad) * distance

class ExplosionEntity(Entity):
  """
  Similar to simpler bullets, but maintains a register of
  contacts to avoid damaging any target twice.
  """
  def __init__(this):
    super().__init__()
    this.attack = 300
    this.speed = 0
    this.sprite = SproutCore.Asset.getAsset("splode")
    this.lifetime = this.sprite.duration
    this.collision_type = "circle"
    # Extra trimming due to extra space in the sprite
    if this.sprite.width != None:
      this.body.r = this.sprite.width / 4
    else:
      # For some reason this sprite doesn't always load.
      # Need to look into that.
      this.body.r = 64
    this.reg = dict()
    this.reg[this.unitid] = True
  
  def touch(this, other):
    if Entity.getRelationship(this.team, other.team) == "hostile":
      if not (other.unitid in this.reg):
        this.reg[other.unitid] = True
        this.impact(other)
  
  def impact(this, other):
    other.damage(this.attack)

class ExplodingBulletEntity(BulletEntity):
  def __init__(this):
    super().__init__()
    this.sprite = SproutCore.Asset.ImageAsset.getImage("projectile/bullet_rocket.png")
  
  def impact(this, other):
    ent = ExplosionEntity()
    ent.team = this.team
    ent.x = this.x
    ent.y = this.y
    SproutCore.game.world.addBullet(ent)
    return super().impact(other)

class LanceEntity(ExplosionEntity):
  """
  A type of explosion designed to function more as a concentrated
  beam than a circular area.
  """
  def __init__(this):
    super().__init__()
    this.sprite = SproutCore.Asset.getAsset("lance")
    this.lifetime = this.sprite.duration
    # Division by 2 shouldn't be necessary, what's going on?
    this.body = SproutCore.Geo.LineSeg.new(0, 0, this.sprite.width / 2, 0)

  def impact(this, other):
    other.damage(this.attack)
  
  def __nop__(this): pass

  def __get_x__(this):
    return this.body.ax
  def __set_x__(this, v):
    this.body.bx = v + (this.body.bx - this.body.ax)
    this.body.ax = v
  x = property(__get_x__, __set_x__, __nop__)

  def __get_y__(this):
    return this.body.ay
  def __set_y__(this, v):
    this.body.by = v + (this.body.by - this.body.ay)
    this.body.ay = v
  y = property(__get_y__, __set_y__, __nop__)

  def __get_angle__(this):
    if hasattr(this, "body"):
      return this.body.angle
    return 0
  def __set_angle__(this, v):
    if hasattr(this, "body"):
      this.body.angle = v
  angle = property(__get_angle__, __set_angle__, __nop__)

class EntityWeapon():
  def __init__(
      this,
      power = 34, ammo = 10,
      rate = 10, auto = False,
      offsets = [[-10, 0, 0], [10, 0, 0]],
      bullet = BulletEntity, owner = None
    ):
    this.power = power
    this.ammo = ammo
    this.offsets = offsets
    this.barrel = 0
    this.bullet = bullet
    this.auto = auto
    this.timer = autoutil.AutoUpdateUtil.TimerUtil(this.tick, 1 / rate)
    # Avoid overwriting owner if not provided, in case it is set by a subclass
    if owner != None: this.owner = owner
    this.fixLag = True
    this.useAmmo = 1
  
  def __get_rate__(this):
    return 1 / this.timer.interval
  def __set_rate__(this, v):
    this.timer.interval = 1 / v
  def __nop__(this): pass
  rate = property(__get_rate__, __set_rate__, __nop__)

  def attemptUseAmmo(this):
    """
    Checks if enough ammunition remains to fire the weapon once.
    If there is, consumes the ammunition and returns True.
    Ammo consumption accounts for negative values
    and potentially negative ammo consumption values.
    Clamps ammo count when it crosses 0.
    Returns:
        bool: True if ammo consumed
    """
    if this.useAmmo != False and this.useAmmo != 0:
      if this.ammo == 0: return False
      else:
        prev = this.ammo
        this.ammo = this.ammo - this.useAmmo
        if prev * this.ammo < 0:
          this.ammo = 0
    return True
  
  def cycleBarrel(this):
    """
    Called during firing. Eases effects like the alternating
    left/right fire pattern of the player.
    Returns:
        [number, number]: current barrel offset
    """
    offset = this.offsets[this.barrel]
    this.barrel += 1
    if this.barrel >= len(this.offsets): this.barrel = 0
    return offset

  def fire(this, timer = None, time = 0, lag = 0):
    """
    Mostly intended for internal use, but not dangerous to call otherwise.
    Used as a timer callback and thus needs the same signature.

    Args:
        timer (Timer, optional): _description_. Defaults to None.
        time (number, optional): _description_. Defaults to 0.
        lag (number, optional): _description_. Defaults to 0.
    """
    if timer == None:
      timer = this.timer
    # Construct and fire bullet, cycle barrels
    if this.attemptUseAmmo():
      offset = this.cycleBarrel()
      bullet = this.owner.shoot(this.bullet, offset[0], offset[1], offset[2])
      bullet.attack = this.power
      if lag > 0:
        # Lag compensation
        bullet.update(lag)
      return bullet
    
  def tick(this, timer, time, lag):
    """
    Internal function for the timer to call.
    """
    this.fire(timer, time, lag)
  
  def sustain(this):
    """
    Used for fully automatic fire.
    """
    if this.auto:
      this.timer.sustain()

  def beginFire(this):
    """
    Fires once. Not necessary to call when using sustain().
    """
    return this.fire(this.timer)


