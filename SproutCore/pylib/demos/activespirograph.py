turtle = game.entity.TurtleEntity()
game.world.addEntity(turtle)

turtle.setPosition(200, 200)
turtle.penDown()
clock = 0
def update(dt):
  global clock
  # repeat a few times to make the spirograph faster
  for i in range(6):
    turtle.forward(2)
    turtle.turnRight(1)
    # Turn 10° every 360 frames (1 full rotation)
    if clock % 360 == 0:
      turtle.turnRight(10)
    clock += 1