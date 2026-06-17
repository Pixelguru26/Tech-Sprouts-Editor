export default `
turtle = game.entity.TurtleEntity()
game.world.addEntity(turtle)

turtle.setPosition(100, 100)
turtle.penDown()
turtle.forward(100)
turtle.turnRight(90)
turtle.forward(100)
turtle.turnRight(90)
turtle.forward(100)
turtle.turnRight(90)
turtle.forward(100)

turtle.delete()
`;