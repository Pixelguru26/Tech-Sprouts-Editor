# This is a demo script, it should be pasted into the editor directly.

board = [
  ' ', ' ', ' ',
  ' ', ' ', ' ',
  ' ', ' ', ' '
]

width = 90
height = 90
space = 10

buttons = []
for y in range(0, 3):
  buttons[y] = []
  for x in range(0, 3):
    xpos1 = x * (width + space)
    ypos1 = y * (width + space)
    xpos2 = xpos1 + width
    ypos2 = ypos1 + height

    button = game.entity.UIEntity(xpos1, ypos1, xpos2, ypos2, "#272822")
    game.world.addEntity(button)
    buttons[x][y] = button

running = True
turn = 'X'

def entityClick(entity, button, x, y):
  if running:
    for y in range(0, 3):
      for x in range(0, 3):
        if entity.unitid == buttons[x][y].unitid:
          if board[x][y] == ' ':
            board[x][y] = turn
            entity.text = turn
            if turn == 'X':
              turn = 'O'
            else:
              turn = 'X'
    win = "none"
    # Check each possible win scenario
    # X
    # Horizontal
    if board[0][0]+board[1][0]+board[2][0] == 'XXX': win = 'X'
    if board[0][1]+board[1][1]+board[2][1] == 'XXX': win = 'X'
    if board[0][2]+board[1][2]+board[2][2] == 'XXX': win = 'X'
    # Vertical
    if board[0][0]+board[0][1]+board[0][2] == 'XXX': win = 'X'
    if board[1][0]+board[1][1]+board[1][2] == 'XXX': win = 'X'
    if board[2][0]+board[2][1]+board[2][2] == 'XXX': win = 'X'
    # Diagonal
    if board[0][0]+board[1][1]+board[2][2] == 'XXX': win = 'X'
    if board[0][2]+board[1][1]+board[2][0] == 'XXX': win = 'X'
    # O
    # Horizontal
    if board[0][0]+board[1][0]+board[2][0] == 'OOO': win = 'O'
    if board[0][1]+board[1][1]+board[2][1] == 'OOO': win = 'O'
    if board[0][2]+board[1][2]+board[2][2] == 'OOO': win = 'O'
    # Vertical
    if board[0][0]+board[0][1]+board[0][2] == 'OOO': win = 'O'
    if board[1][0]+board[1][1]+board[1][2] == 'OOO': win = 'O'
    if board[2][0]+board[2][1]+board[2][2] == 'OOO': win = 'O'
    # Diagonal
    if board[0][0]+board[1][1]+board[2][2] == 'OOO': win = 'O'
    if board[0][2]+board[1][1]+board[2][0] == 'OOO': win = 'O'
    if win != "none":
      print(win + " wins!")
      # End game
      running = False