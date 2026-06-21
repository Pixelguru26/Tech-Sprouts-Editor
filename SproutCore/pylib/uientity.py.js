export default `
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
    this.body = SproutCore.Geo.Rectangle.new(x1, y1, x2 - x1, y2 - y1)

  def draw(this):
    if (this.outlineColor != "transparent" and this.outlineWidth > 0):
      SproutCore.graphics.fillRect(
        this.body.x - this.outlineWidth, this.body.y - this.outlineWidth,
        this.body.w + 2 * this.outlineWidth, this.body.h + 2 * this.outlineWidth,
        this.outlineColor
      )
    if (this.color != "transparent"):
      SproutCore.graphics.fillRect(
        this.body.x, this.body.y,
        this.body.w, this.body.h,
        this.color
      )
    if this.text != None:
      SproutCore.graphics.drawText(
        this.text,
        this.body.x, this.body.y,
        this.body.w, this.body.h,
        this.textFont, this.textColor, this.textOutlineColor, this.textOutlineWidth,
        this.textFit, this.textAlignHoriz, this.textAlignVert
      )

Entity.UIEntity = UIEntity
`;