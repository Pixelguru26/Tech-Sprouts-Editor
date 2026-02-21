import js
import SproutCore

class GameState:
  """
  """
  def __init__(this):
    this.name = None
    this.initialized = False
    this.ui = None
  
  def load(this):
    """
    Called once when this state is first loaded.
    """
    this.initialized = True
  
  def enter(this):
    """
    Called when switching to this state.
    Unlike load, this can be called many times
    during a game's lifespan.
    Base behavior is to apply this.ui.
    """
    if this.ui != None:
      this.setui(this.ui)
  
  def exit(this, nextState = None):
    """
    Called when switching to another state.
    Should perform necessary cleanup and leave the game
    clean and ready.
    Base behavior is to clear ui.
    """
    this.setui()
  
  def setui(this, *children):
    """
    Completely replaces the contents of the game ui container
    with the provided elements.
    """
    # uiContainer = js.document.getElementById("game-ui")
    # if uiContainer != None:
    #   uiContainer.replaceChildren(*children)
    SproutCore.setUI(*children)
  
  def update(this, dt):
    """
    Called each frame to update world and content.
    By default, timestep is not fixed.
    """
    pass
  def draw(this):
    """
    Called each frame after update to render active game content.
    Must also draw the game world for it to display.
    """
    pass
  
  def keydown(this, key):
    """
    Called whenever a key is first pressed.
    Provides lowercase versions of JS key ids.
    """
    pass
  def keyup(this, key):
    """
    Called whenever a key is released.
    Provides lowercase versions of JS key ids.
    """
    pass
  def mousedown(this, b, x, y):
    """
    Called whenever the mouse is clicked.
    Provides a lowercase version of the JS button id as b.
    """
    pass
  def mouseup(this, b, x, y):
    """
    Called whenever the mouse click is released.
    Provides a lowercase version of the JS button id as b.
    """
    pass
  def scroll(this, x, y, dx, dy):
    """
    Called repeatedly as the mouse wheel is scrolled.
    """
    pass
    
