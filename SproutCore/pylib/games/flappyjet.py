# from pylib.games.shooter import game
import random

# game.player.sprite = game.asset.ImageAsset.getImage("https://upload.wikimedia.org/wikipedia/commons/2/22/Earth_Western_Hemisphere_transparent_background.png", "earf", True)

game.player = game.playerEntity()
game.player.x = 100
game.player.verlet = True
game.player.gravity = True
game.world.addEntity(game.player)

game.clock = 0

def update(dt):
    game.clock = game.clock + dt
    if game.clock > 5:
        game.clock = 0
        slot = random.uniform(0, 500)
        slotHeight = random.uniform(50, 200)
        
        ent = game.entity()
        ent.team = "enemy"
        ent.body = game.geo.Rectangle.new(900, slot - 500, 50, 500)
        ent.autoscale = True
        ent.drawdebug = True
        game.world.addEntity(ent)
        
        ent = game.entity()
        ent.team = "enemy"
        ent.body = game.geo.Rectangle.new(900, slot + slotHeight, 50, 500)
        ent.autoscale = True
        ent.drawdebug = True
        game.world.addEntity(ent)
    
    for ent in game.world.entities:
        if ent != game.player:
            ent.x = ent.x - 100 * dt

def entityCollision(a, b):
    SproutCore.running = False
    
def keyDown(key):
    if key == " ":
        game.player.vy = -100