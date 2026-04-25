from pylib.entity import Entity
import SproutCore

class UIEntity(Entity):
  def __init__(this, x1, y1, x2, y2, color, text = None):
    super().__init__()
    this.collision_type = "rectangle"
    this.color = color
    this.outlineColor = "transparent"
    this.outlineWidth = 4
    this.text = text
    this.textFont = "16px sans-serif"
    this.textAlignHoriz = "center"
    this.textAlignVert = "center"
    this.textFit = "none"
    this.textColor = "#ffffff"
    this.textOutlineColor = "#000000"
    this.textOutlineWidth = 1.5
    this.lifetime = -1
    this.body.ax = x1
    this.body.ay = y1
    this.body.bx = x2
    this.body.by = y2

  def draw(this):
    if (this.outlineColor != "transparent" and this.outlineWidth > 0):
      SproutCore.graphics.fillRect(
        this.body.ax - this.outlineWidth, this.body.ay - this.outlineWidth,
        (this.body.bx - this.body.ax) + 2 * this.outlineWidth, (this.body.by - this.body.ay) + 2 * this.outlineWidth,
        this.outlineColor
      )
    if (this.color != "transparent"):
      SproutCore.graphics.fillRect(
        this.body.ax, this.body.ay,
        this.body.bx - this.body.ax, this.body.by - this.body.ay,
        this.color
      )
    if this.text != None:
      SproutCore.graphics.drawText(
        this.text,
        this.body.ax, this.body.ay,
        this.body.bx - this.body.ax, this.body.by - this.body.ay,
        this.textFont, this.textColor, this.textOutlineColor, this.textOutlineWidth,
        this.textFit, this.textAlignHoriz, this.textAlignVert
      )

Entity.UIEntity = UIEntity