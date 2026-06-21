import SproutCore
from pylib.entity import Entity

class TurtleAction():

  def __init__(this, id, *args):
    this.id = id
    this.clock = 0
    this.args = args

class TurtleEntity(Entity):
  def __init__(this):
    super().__init__()
    this.__lineColor = "#FFFFFF"
    this.__fillColor = "#FFFFFF"
    this.__isPenDown = False
    this.__isFilling = False
    this.__penWidth = 1
    this.history = []
    this.sprite = SproutCore.Asset.ImageAsset.getImage("turtle")
    this.__delay = 0
    this.clock = 0
    this.que = []

  tweenable = [
    "forward", "right", "move",
    "rotate", "turnRight", "turnLeft",
    "setPosition", "setHeading"
  ]

  def __nop__(this):
    return super().__nop__()
  
  def __get_lineColor__(this):
    return this.__lineColor
  def __set_lineColor__(this, val):
    if this.delay > 0:
      this.que.append(TurtleAction("lineColor", val))
    else:
      this.__lineColor = val
  lineColor = property(__get_lineColor__, __set_lineColor__, __nop__,
    "The color used when the pen is down."
  )
  
  def __get_fillColor__(this):
    return this.__fillColor
  def __set_fillColor__(this, val):
    if this.delay > 0:
      this.que.append(TurtleAction("fillColor", val))
    else:
      this.__fillColor = val
  fillColor = property(__get_fillColor__, __set_fillColor__, __nop__,
    "The color used to fill in solid shapes."
  )
  
  def __get_penDown__(this):
    return this.__isPenDown
  def __set_penDown__(this, val):
    if this.delay > 0:
      this.que.append(TurtleAction("penDown", val))
    else:
      this.__isPenDown = val
  isPenDown = property(__get_penDown__, __set_penDown__, __nop__,
    "Lines are only drawn while the pen is down."
  )
  
  def __get_filling__(this):
    return this.__isFilling
  def __set_filling__(this, val):
    if this.delay > 0:
      this.que.append(TurtleAction("filling", val))
    else:
      this.__isFilling = val
  isFilling = property(__get_filling__, __set_filling__, __nop__,
    "While True, positions are recorded as vertices on a shape to fill. Should not be set directly under most circumstances."
  )
  
  def __get_penWidth__(this):
    return this.__penWidth
  def __set_penWidth__(this, val):
    if this.delay > 0:
      this.que.append("penWidth", val)
    else:
      this.__penWidth = val
  penWidth = property(__get_penWidth__, __set_penWidth__, __nop__,
    "Sets the width of lines drawn with the pen, in pixels."
  )

  def __get_delay__(this):
    return this.__delay
  def __set_delay__(this, val):
    if (this.delay > 0):
      this.que.append("delay", val)
    else:
      this.__delay = val
  delay = property(__get_delay__, __set_delay__, __nop__,
    "Sets the delay between operations, in seconds. When greater than zero, operations are queued rather than executed immediately. Be warned that as soon as a delay is set, even setting the delay will be queued."
  )

  def __drawLine(this, x0, y0, x1, y1):
    SproutCore.graphics.lineBack(x0, y0, x1, y1, this.lineColor, this.penWidth)
  def drawLine(this, x0, y0, x1, y1):
    if this.delay > 0:
      this.que.append(TurtleAction("drawLine", x0, y0, x1, y1))
    else:
      this.__drawLine(x0, y0, x1, y1)

  def penDown(this):
    this.isPenDown = True
  def penUp(this):
    this.isPenDown = False
  
  def __forward(this, distance=1):
    x0 = this.x
    y0 = this.y
    super().forward(distance)
    x1 = this.x
    y1 = this.y
    if this.isPenDown:
      this.__drawLine(x0, y0, x1, y1)
    if this.isFilling:
      this.history.append((this.x, this.y))
  def forward(this, distance=1):
    if this.delay > 0:
      this.que.append(TurtleAction("forward", distance))
    else:
      this.__forward(distance)
  
  def __right(this, distance=1):
    x0 = this.x
    y0 = this.y
    super().right(distance)
    x1 = this.x
    y1 = this.y
    if this.isPenDown:
      this.__drawLine(x0, y0, x1, y1)
    if this.isFilling:
      this.history.append((this.x, this.y))
  def right(this, distance=1):
    if this.delay > 0:
      this.que.append(TurtleAction("right", distance))
    else:
      this.__right(distance)
  
  def __move(this, x=0, y=0):
    x0 = this.x
    y0 = this.y
    super().move(x, y)
    x1 = this.x
    y1 = this.y
    if this.isPenDown:
      this.__drawLine(x0, y0, x1, y1)
    if this.isFilling:
      this.history.append((this.x, this.y))
  def move(this, x=0, y=0):
    if this.delay > 0:
      this.que.append(TurtleAction("move", x, y))
    else:
      this.__move(x, y)

  def __beginFill(this, color=None):
    if color != None:
      this.__fillColor = color
    this.__isFilling = True
    this.history = [(this.x, this.y)]
  def beginFill(this, color=None):
    if this.delay > 0:
      this.que.append(TurtleAction("beginFill", color))
    else:
      this.__beginFill(color)
  
  def __endFill(this):
    if len(this.history) > 1:
      SproutCore.graphics.backCanvasContext.fillStyle = this.fillColor
      SproutCore.graphics.backCanvasContext.beginPath()
      SproutCore.graphics.backCanvasContext.moveTo(this.history[0][0], this.history[0][1])
      for point in this.history[1:]:
        SproutCore.graphics.backCanvasContext.lineTo(point[0], point[1])
      SproutCore.graphics.backCanvasContext.closePath()
      SproutCore.graphics.backCanvasContext.fill()
      this.history.clear()
    this.__isFilling = False
  def endFill(this):
    if this.delay > 0:
      this.que.append(TurtleAction("endFill"))
    else:
      this.__endFill()
  
  def __setPosition(this, x, y):
    if (this.isPenDown):
      this.__drawLine(this.x, this.y, x, y)
    if this.isFilling:
      this.history.append((x, y))
    this.x = x
    this.y = y
  def setPosition(this, x, y):
    if this.delay > 0:
      this.que.append(TurtleAction("setPosition", x, y))
    else:
      this.__setPosition(x, y)
  
  def __setHeading(this, angle):
    this.angle = angle % 360
  def setHeading(this, angle):
    if this.delay > 0:
      this.que.append(TurtleAction("setHeading", angle))
    else:
      this.__setHeading(angle)

  def __drawImage(this, image, sx = 1, sy = 1, clock = 0):
    SproutCore.graphics.drawBack(image, this.x, this.y, sx, sy, this.angle, None, None, clock)
  def drawImage(this, image, sx=1, sy=1, clock=0):
    if this.delay > 0:
      this.que.append(TurtleAction("drawImage", image, sx, sy, clock))
    else:
      this.__drawImage(image, sx, sy, clock)
  
  def __rotate(this, theta=90):
    this.angle += theta
  def rotate(this, theta=90):
    if this.delay > 0:
      this.que.append(TurtleAction("rotate", theta))
    else:
      this.__rotate(theta)
  def __turnRight(this, theta=90):
    this.angle += theta
  def turnRight(this, theta=90):
    if this.delay > 0:
      this.que.append(TurtleAction("turnRight", theta))
    else:
      this.__turnRight(theta)
  def __turnLeft(this, theta=90):
    this.angle -= theta
  def turnLeft(this, theta=90):
    if this.delay > 0:
      this.que.append(TurtleAction("turnLeft", theta))
    else:
      this.__turnLeft(theta)

  def performAction(this, action):
    if action.id == "lineColor":
      this.__lineColor = action.args[0]
    elif action.id == "fillColor":
      this.__fillColor = action.args[0]
    elif action.id == "penDown":
      this.__isPenDown = action.args[0]
    elif action.id == "filling":
      this.__isFilling = action.args[0]
    elif action.id == "penWidth":
      this.__penWidth = action.args[0]
    elif action.id == "delay":
      this.__delay = action.args[0]
    elif action.id == "drawLine":
      this.__drawLine(*(action.args))
    elif action.id == "forward":
      this.__forward(*(action.args))
    elif action.id == "right":
      this.__right(*(action.args))
    elif action.id == "move":
      this.__move(*(action.args))
    elif action.id == "beginFill":
      this.__beginFill(action.args[0])
    elif action.id == "endFill":
      this.__endFill()
    elif action.id == "setPosition":
      this.__setPosition(*(action.args))
    elif action.id == "setHeading":
      this.__setHeading(action.args[0])
    elif action.id == "drawImage":
      this.__drawImage(*(action.args))
    elif action.id == "turnRight":
      this.__turnRight(action.args[0])
    elif action.id == "turnLeft":
      this.__turnLeft(action.args[0])
    else:
      print(action.id)
      getattr(this, "_" + action.id)(*(action.args))
  
  # def performNext(this, dt):
  #   if len(this.que) > 0:
  #     next = this.que[0]
  #     if next.id in TurtleEntity.tweenable:
  #       if next.clock == 0:
  #         this.clock -= this.delay
  #       last = next.clock
  #       next.clock = min(this.clock, this.delay)
  #       next.x0 = this.x
  #       next.y0 = this.y
  #       next.a0 = this.angle
  #       # todo
  #     else:
  #       this.clock -= this.delay
  #       this.performAction(next)

  
  def update(this, dt):
    super().update(dt)
    this.clock += dt
    while this.clock > this.delay:
      if (len(this.que) > 0):
        this.clock -= this.delay
        this.performAction(this.que.pop(0))
      else:
        if this.delay == 0:
          this.clock = 0
        else:
          this.clock = this.clock % this.delay
        break

Entity.TurtleEntity = TurtleEntity