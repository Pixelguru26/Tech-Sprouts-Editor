import SproutCore
from entity import Entity

class TurtleEntity(Entity):
  def __init__(this):
    super().__init__()
    this.lineColor = "FFFFFF"
    this.fillColor = "FFFFFF"
    this.isPenDown = True
    this.isFilling = False
    this.penWidth = 1
    this.history = []

  def drawLine(this, x0, y0, x1, y1):
    SproutCore.graphics.backCanvasContext.strokeStyle = this.lineColor
    SproutCore.graphics.backCanvasContext.lineWidth = this.penWidth
    SproutCore.graphics.backCanvasContext.beginPath()
    SproutCore.graphics.backCanvasContext.moveTo(x0, y0)
    SproutCore.graphics.backCanvasContext.lineTo(x1, y1)
    SproutCore.graphics.backCanvasContext.stroke()

  def penDown(this):
    this.isPenDown = True
  def penUp(this):
    this.isPenDown = False
  
  def forward(this, distance=1):
    x0 = this.x
    y0 = this.y
    super().forward(distance)
    x1 = this.x
    y1 = this.y
    if this.isPenDown:
      this.drawLine(x0, y0, x1, y1)
      if this.isFilling:
        this.history.append((this.x, this.y))
  
  def right(this, distance=1):
    x0 = this.x
    y0 = this.y
    super().right(distance)
    x1 = this.x
    y1 = this.y
    if this.isPenDown:
      this.drawLine(x0, y0, x1, y1)
      if this.isFilling:
        this.history.append((this.x, this.y))
  
  def move(this, x=0, y=0):
    x0 = this.x
    y0 = this.y
    super().move(x, y)
    x1 = this.x
    y1 = this.y
    if this.isPenDown:
      this.drawLine(x0, y0, x1, y1)
      if this.isFilling:
        this.history.append((this.x, this.y))

  def beginFill(this, color):
    this.fillColor = color
    this.isFilling = True
    this.history = [(this.x, this.y)]
  
  def endFill(this):
    if len(this.history) > 1:
      SproutCore.graphics.backCanvasContext.fillStyle = this.fillColor
      SproutCore.graphics.backCanvasContext.beginPath()
      SproutCore.graphics.backCanvasContext.moveTo(this.history[0][0], this.history[0][1])
      for point in this.history[1:]:
        SproutCore.graphics.backCanvasContext.lineTo(point[0], point[1])
      SproutCore.graphics.backCanvasContext.closePath()
      SproutCore.graphics.backCanvasContext.fill()
    this.isFilling = False
  
  """_summary_
  """
  def setPosition(this, x, y):
    if (this.isPenDown):
      this.drawLine(this.x, this.y, x, y)
      if this.isFilling:
        this.history.append((x, y))
    this.x = x
    this.y = y
  
  def setHeading(this, angle):
    this.angle = angle % 360
  