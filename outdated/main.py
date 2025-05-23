import game

global test
test = None

def load():
  global test
  # testButton = game.menu.addButton("Hello")
  # test = game.ui.circleDisplay.new(8, 100)
  # game.gameStates.game.addElement(test)

def enterState(state):
  pass

def onButtonClick(this, evt):
  print("help")

def update(dt, idk):
  global test
  if not (test == None):
    test.value += 1
    test.value %= 101

def draw(canvas):
  pass

