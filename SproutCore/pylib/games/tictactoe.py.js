export default `
# This is a demo script, it should be pasted into the editor directly.

board = [
  ' ', ' ', ' ',
  ' ', ' ', ' ',
  ' ', ' ', ' '
]

buttons = []

width = 90
height = 90
space = 10

for y in range(0, 3):
  for x in range(0, 3):
    xpos1 = x * (width + space)
    ypos1 = y * (width + space)
    xpos2 = xpos1 + width
    ypos2 = ypos1 + height

    button = game.entity.UIEntity(xpos1, ypos1, xpos2, ypos2, "#272822")
    game.world.addEntity(button)


`;