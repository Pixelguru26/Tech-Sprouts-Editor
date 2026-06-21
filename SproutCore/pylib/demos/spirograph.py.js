export default `
turtle = game.entity.TurtleEntity()
game.world.addEntity(turtle)

turtle.delay = 1/6000
turtle.setPosition(200, 200)
turtle.penDown()
for i in range(36):
  for j in range(360):
    turtle.forward(1)
    turtle.turnRight(1)
  turtle.turnRight(10)
`;