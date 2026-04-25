# This is a demo script, it should be pasted into the editor directly.
import random

rockButtonEntity = game.entity()
paperButtonEntity = game.entity()
scissorsButtonEntity = game.entity()

# Set up the buttons for the user's options
rockButtonEntity.sprite = game.asset.getAsset("rock")
paperButtonEntity.sprite = game.asset.getAsset("paper")
scissorsButtonEntity.sprite = game.asset.getAsset("scissors")
rockButtonEntity.x = 100
rockButtonEntity.y = 100
rockButtonEntity.r = 50
paperButtonEntity.x = 100
paperButtonEntity.y = 300
paperButtonEntity.r = 50
scissorsButtonEntity.x = 100
scissorsButtonEntity.y = 500
scissorsButtonEntity.r = 50
# Entities don't do anything until they're in the game world
game.world.addEntity(rockButtonEntity)
game.world.addEntity(paperButtonEntity)
game.world.addEntity(scissorsButtonEntity)

# Set up a place to display the computer's choice
computerOutputEntity = game.entity()
computerOutputEntity.x = 700
computerOutputEntity.y = 300

# Add a visual divider between the user's options and the computer's choice
block = game.entity.UIEntity(400, 0, 550, 600, "#272822")
game.world.addEntity(block)

# This function runs whenever the user clicks on an entity
def entityClick(entity, button, x, y):
    # Read the user's choice, or stop the function if there isn't one
    userChoice = "unknown"
    if (entity.unitid == rockButtonEntity.unitid):
        userChoice = "rock"
        print("You chose to rock on!")
    elif (entity.unitid == paperButtonEntity.unitid):
        userChoice = "paper"
        print("You chose paper, fair and square!")
    elif (entity.unitid == scissorsButtonEntity.unitid):
        userChoice = "scissors"
        print("You chose scissors, real snippy!")
    else:
        # User must have just clicked some other entity like the divider
        # In that case, we don't want to do anything, so we just return early
        return
    
    # Make a choice for the computer
    # randChoice can be any decimal between 0 and 3
    randChoice = random.uniform(0, 3)
    computerChoice = "unknown"
    # Check each third of the range one at a time
    # Doing this in reverse order so that ranges don't overlap
    if randChoice > 2:
        computerChoice = "scissors"
    elif randChoice > 1:
        computerChoice = "paper"
    else:
        computerChoice = "rock"
    
    # Display the computer's choice
    computerOutputEntity.sprite = game.asset.getAsset(computerChoice)
    game.world.addEntity(computerOutputEntity) # In case this is the first match
    print("Computer chose " + computerChoice + "!")
    
    # Display results of the match
    if userChoice == computerChoice:
        print("It's a draw!")
    elif userChoice == "rock":
        # Computer must not have chosen rock
        if computerChoice == "paper":
            print("Computer wins!")
        else:
            # Computer must have chosen scissors
            print("You win!")
    elif userChoice == "paper":
        # Computer must not have chosen paper
        if computerChoice == "rock":
            print("You win!")
        else:
            # Computer must have chosen scissors
            print("Computer wins!")
    else:
        # User must have chosen scissors
        # Computer must not have chosen scissors
        if computerChoice == "rock":
            print("Computer wins!")
        else:
            # Computer must have chosen paper
            print("You win!")
